import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Parse uploaded Excel/CSV file into gym plan format.
 *
 * Expected columns:
 *   Day | Label | Warmup | Section | Exercise | Sets | Rest
 *
 * Example rows:
 *   Tuesday | Chest & Triceps | 5 min elliptical | Strength Training | Bench Press | 3 x 12 | 60s
 *   Tuesday | Chest & Triceps | 5 min elliptical | Strength Training | Incline Press | 3 x 10 | 60s
 *   Tuesday | Chest & Triceps | 5 min elliptical | Core Circuit | Plank | 30 sec | -
 */

const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const generateId = () => Math.random().toString(36).substring(2, 9);

// Normalize column header names to handle variations
const normalizeHeader = (header) => {
  const h = (header || '').toString().trim().toLowerCase().replace(/[^a-z]/g, '');
  if (['day', 'dayname', 'dayofweek', 'weekday'].includes(h)) return 'day';
  if (['label', 'daylabel', 'focus', 'musclegroup', 'target'].includes(h)) return 'label';
  if (['warmup', 'warmuproutine', 'warmupexercise'].includes(h)) return 'warmup';
  if (['section', 'sectionname', 'group', 'category', 'block'].includes(h)) return 'section';
  if (['exercise', 'exercisename', 'name', 'movement'].includes(h)) return 'exercise';
  if (['sets', 'setsreps', 'setsxreps', 'reps', 'volume', 'duration'].includes(h)) return 'sets';
  if (['rest', 'resttime', 'restperiod', 'recovery'].includes(h)) return 'rest';
  return h;
};

// Capitalize first letter of each word
const titleCase = (str) =>
  (str || '')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

// Parse raw rows into plan structure
const rowsToPlan = (rows) => {
  const plan = {};
  let errors = [];
  let rowCount = 0;

  for (const row of rows) {
    const dayRaw = (row.day || '').toString().trim();
    if (!dayRaw) continue; // skip empty rows

    const dayLower = dayRaw.toLowerCase();
    // Find matching valid day
    const matchedDay = VALID_DAYS.find(
      (d) => d === dayLower || d.startsWith(dayLower.slice(0, 3))
    );

    if (!matchedDay) {
      errors.push(`Row ${rowCount + 1}: Invalid day "${dayRaw}". Expected: Monday-Sunday`);
      continue;
    }

    const dayName = titleCase(matchedDay);
    const label = (row.label || '').toString().trim();
    const warmup = (row.warmup || '').toString().trim();
    const sectionName = (row.section || 'General').toString().trim();
    const exerciseName = (row.exercise || '').toString().trim();
    const sets = (row.sets || '-').toString().trim();
    const rest = (row.rest || '-').toString().trim();

    if (!exerciseName) {
      errors.push(`Row ${rowCount + 1}: Missing exercise name for ${dayName}`);
      continue;
    }

    // Initialize day if needed
    if (!plan[dayName]) {
      plan[dayName] = {
        label: label || dayName,
        warmup: warmup || '',
        sections: [],
      };
    } else if (label && !plan[dayName].label) {
      plan[dayName].label = label;
    }
    if (warmup && !plan[dayName].warmup) {
      plan[dayName].warmup = warmup;
    }

    // Find or create section
    let section = plan[dayName].sections.find((s) => s.name === sectionName);
    if (!section) {
      section = { name: sectionName, exercises: [] };
      plan[dayName].sections.push(section);
    }

    // Add exercise
    section.exercises.push({
      id: generateId(),
      name: exerciseName,
      sets: sets,
      rest: rest,
    });

    rowCount++;
  }

  return { plan, errors, rowCount };
};

// Parse CSV string
export const parseCSV = (csvString, isTSV = false) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      ...(isTSV ? { delimiter: '\t' } : {}),
      complete: (results) => {
        if (results.errors.length > 0) {
          const errs = results.errors.map((e) => `Row ${e.row}: ${e.message}`);
          reject(new Error(`CSV parsing errors:\n${errs.join('\n')}`));
          return;
        }
        const { plan, errors, rowCount } = rowsToPlan(results.data);
        resolve({ plan, errors, rowCount });
      },
      error: (err) => reject(err),
    });
  });
};

// Parse Excel file (ArrayBuffer)
export const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with raw headers
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  // Normalize headers
  const normalizedData = rawData.map((row) => {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeHeader(key)] = value;
    }
    return normalized;
  });

  const { plan, errors, rowCount } = rowsToPlan(normalizedData);
  return { plan, errors, rowCount };
};

// Main parse function - handles both CSV and Excel
export const parseUploadedFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const ext = file.name.split('.').pop().toLowerCase();

    reader.onload = async (e) => {
      try {
        let result;
        if (ext === 'csv' || ext === 'tsv') {
          result = await parseCSV(e.target.result, ext === 'tsv');
        } else if (['xlsx', 'xls', 'xlsm'].includes(ext)) {
          result = parseExcel(e.target.result);
        } else {
          throw new Error(`Unsupported file type: .${ext}. Please upload .csv, .xlsx, or .xls`);
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    if (ext === 'csv' || ext === 'tsv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

// Generate a template CSV string for download
export const generateTemplateCSV = () => {
  const headers = 'Day,Label,Warmup,Section,Exercise,Sets,Rest\n';
  const sampleRows = [
    'Tuesday,Chest & Triceps,5 min elliptical + arm circles,Strength Training,Flat Bench Press,3 x 10-12,60-90s',
    'Tuesday,Chest & Triceps,5 min elliptical + arm circles,Strength Training,Incline Dumbbell Press,3 x 10-12,60-90s',
    'Tuesday,Chest & Triceps,5 min elliptical + arm circles,Strength Training,Dumbbell Flyes,3 x 12,60s',
    'Tuesday,Chest & Triceps,5 min elliptical + arm circles,Core Circuit (2 rounds),Crunches,15 reps,-',
    'Tuesday,Chest & Triceps,5 min elliptical + arm circles,Core Circuit (2 rounds),Plank Hold,30-45 sec,-',
    'Tuesday,Chest & Triceps,5 min elliptical + arm circles,Cardio Finisher,Stationary Bike moderate pace,20 min,-',
    'Wednesday,Back & Biceps,5 min treadmill walk + band pull-aparts,Strength Training,Lat Pulldowns (wide grip),3 x 10-12,60-90s',
    'Wednesday,Back & Biceps,5 min treadmill walk + band pull-aparts,Strength Training,Seated Cable Rows,3 x 10-12,60-90s',
    'Wednesday,Back & Biceps,5 min treadmill walk + band pull-aparts,Strength Training,Dumbbell Bicep Curls,3 x 12,60s',
    'Thursday,Steady Cardio + Core,5 min easy cycling,Cardio Rotation,Incline Treadmill Walk,10 min,-',
    'Thursday,Steady Cardio + Core,5 min easy cycling,Core Session,Crunches,15 reps,-',
    'Friday,Quads Calves & Shoulders,5 min stationary bike + leg swings,Strength Training,Goblet Squats,3 x 10-12,60-90s',
    'Friday,Quads Calves & Shoulders,5 min stationary bike + leg swings,Strength Training,Leg Press,3 x 12,60-90s',
    'Saturday,Full Body Circuit,5 min elliptical + dynamic stretches,Full Body Circuit (3 rounds),Goblet Squats (light),12 reps,15-20s',
    'Saturday,Full Body Circuit,5 min elliptical + dynamic stretches,Cardio,Cycling intervals,20 min,-',
    'Sunday,Cardio Hamstrings & Glutes,5 min treadmill + hip circles,Cardio Block,Elliptical intervals,20-25 min,-',
    'Sunday,Cardio Hamstrings & Glutes,5 min treadmill + hip circles,Strength Training,Hamstring Curls,3 x 12,60s',
    'Monday,Rest & Recovery,,Recovery,Light walk or yoga,10-15 min,-',
    'Monday,Rest & Recovery,,Recovery,Foam rolling,10 min,-',
  ];
  return headers + sampleRows.join('\n');
};

// Export plan to CSV string for sharing
export const planToCSV = (plan) => {
  const headers = 'Day,Label,Warmup,Section,Exercise,Sets,Rest\n';
  const rows = [];
  for (const [day, data] of Object.entries(plan)) {
    for (const section of data.sections) {
      for (const ex of section.exercises) {
        rows.push(
          [day, data.label, data.warmup, section.name, ex.name, ex.sets, ex.rest]
            .map((v) => `"${(v || '').replace(/"/g, '""')}"`)
            .join(',')
        );
      }
    }
  }
  return headers + rows.join('\n');
};

// ─── MEAL PLAN PARSING ─────────────────────────────────────

// Helper to normalize meal header variations
const normalizeMealHeader = (header) => {
  const h = (header || '').toString().trim().toLowerCase().replace(/[^a-z]/g, '');
  if (['day', 'dayname', 'weekday'].includes(h)) return 'day';
  if (['time', 'mealtime', 'slot', 'timeslot'].includes(h)) return 'time';
  if (['mealname', 'name', 'meal', 'dish', 'food', 'item'].includes(h)) return 'name';
  if (['ingredients', 'ingredient', 'items', 'contents'].includes(h)) return 'ingredients';
  if (['calories', 'cal', 'cals', 'kcal', 'energy'].includes(h)) return 'calories';
  if (['prep', 'prepinstructions', 'preparation', 'instructions', 'recipe', 'howto', 'howtoprepare'].includes(h)) return 'prep';
  return h;
};

// Simple CSV line parser that handles quoted fields
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
};

// Parse CSV text into meal plan structure
export const parseMealCSV = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { mealPlan: {}, errors: ['File is empty or has no data rows'], rowCount: 0 };

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => normalizeMealHeader(h));

  const mealPlan = {};
  const errors = [];
  let rowCount = 0;
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => !v.trim())) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });

    const dayRaw = row.day || '';
    if (!dayRaw) continue;

    const dayLower = dayRaw.toLowerCase();
    const matchedDay = validDays.find(d => d === dayLower || d.startsWith(dayLower.slice(0, 3)));
    if (!matchedDay) {
      errors.push(`Row ${i}: Invalid day "${dayRaw}". Expected: Monday-Sunday`);
      continue;
    }

    const dayName = matchedDay.charAt(0).toUpperCase() + matchedDay.slice(1);
    const mealName = row.name || '';
    if (!mealName) {
      errors.push(`Row ${i}: Missing meal name for ${dayName}`);
      continue;
    }

    if (!mealPlan[dayName]) mealPlan[dayName] = { meals: [] };
    mealPlan[dayName].meals.push({
      id: generateId(),
      time: row.time || '',
      name: mealName,
      ingredients: row.ingredients || '',
      calories: row.calories || '',
      prep: row.prep || '',
    });
    rowCount++;
  }

  return { mealPlan, errors, rowCount };
};

// Parse uploaded meal CSV file
export const parseMealUploadedFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = parseMealCSV(e.target.result);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Generate a template CSV string for meal plans
export const generateMealTemplateCSV = () => {
  const headers = 'Day,Time,Meal Name,Ingredients,Calories,Prep Instructions\n';
  const sampleRows = [
    'Tuesday,7:00 AM,Oats with Banana,"Rolled oats (50g), banana, almonds, honey",380,"Cook oats in milk. Top with banana and almonds."',
    'Tuesday,1:00 PM,Paneer Wrap,"Whole wheat roti (2), paneer (150g), veggies",520,"Grill paneer. Wrap in roti with chutney."',
    'Wednesday,7:00 AM,Moong Dal Cheela,"Moong dal (1 cup), onion, tomato, curd",320,"Soak dal. Make thin crepes with veggies."',
    'Wednesday,1:00 PM,Rajma Chawal,"Rajma (1 cup), brown rice (1 cup), salad",480,"Pressure cook rajma. Serve with rice and salad."',
  ];
  return headers + sampleRows.join('\n');
};

// Export meal plan to CSV string
export const mealPlanToCSV = (mealPlan) => {
  const headers = 'Day,Time,Meal Name,Ingredients,Calories,Prep Instructions\n';
  const rows = [];
  for (const [day, data] of Object.entries(mealPlan)) {
    for (const meal of (data.meals || [])) {
      rows.push(
        [day, meal.time, meal.name, meal.ingredients, meal.calories, meal.prep]
          .map((v) => `"${(v || '').replace(/"/g, '""')}"`)
          .join(',')
      );
    }
  }
  return headers + rows.join('\n');
};
