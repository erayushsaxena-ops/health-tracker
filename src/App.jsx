import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_PLAN, DAYS, DAY_COLORS, DEFAULT_MEAL_PLAN, SAMPLE_MEAL_PLAN, EMPTY_MEAL_PLAN } from './defaultPlan';
import { parseMealCSV, mealPlanToCSV, planToCSV } from './parseUpload';

const getWeekInfo = (offset = 0) => {
  const now = new Date();
  // Get Tuesday of this week (our week starts on Tuesday)
  const dayOfWeek = now.getDay(); // 0=Sun
  const diffToTue = (dayOfWeek < 2 ? dayOfWeek + 5 : dayOfWeek - 2); // days since last Tue
  const tue = new Date(now);
  tue.setDate(now.getDate() - diffToTue + (offset * 7));
  tue.setHours(0, 0, 0, 0);
  const mon = new Date(tue);
  mon.setDate(tue.getDate() + 6);

  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const key = `${tue.getFullYear()}-${String(tue.getMonth()+1).padStart(2,'0')}-${String(tue.getDate()).padStart(2,'0')}`;
  const label = `${fmt(tue)} - ${fmt(mon)}`;
  const isCurrentWeek = offset === 0;

  return { key, label, isCurrentWeek, startDate: tue };
};

const generateId = () => `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
const getToday = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

// Deep clone plan with new IDs to avoid shared state
const clonePlanWithNewIds = (plan) => {
  const cloned = JSON.parse(JSON.stringify(plan));
  for (const day of Object.keys(cloned)) {
    if (cloned[day].sections) {
      cloned[day].sections.forEach(sec => {
        sec.exercises.forEach(ex => { ex.id = generateId(); });
      });
    }
  }
  return cloned;
};

const cloneMealPlanWithNewIds = (mealPlan) => {
  const cloned = JSON.parse(JSON.stringify(mealPlan));
  for (const day of Object.keys(cloned)) {
    if (cloned[day].meals) {
      cloned[day].meals.forEach(m => { m.id = generateId(); });
    }
  }
  return cloned;
};

// ─── STYLES ───────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", paddingBottom: 80 },
  header: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', padding: '20px 16px 16px' },
  container: { maxWidth: 600, margin: '0 auto' },
  toast: { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: '#fff', padding: '10px 24px', borderRadius: 8, zIndex: 1000, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modalBottom: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 500 },
  modalB: { background: '#fff', borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxWidth: 600 },
  btn: (bg, c = '#fff') => ({ padding: '10px 16px', background: bg, color: c, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }),
  btnSm: (bg, c = '#fff') => ({ padding: '6px 12px', background: bg, color: c, border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }),
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  card: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 8 },
};

const getMealTimeColor = (time) => {
  const hour = parseInt(time||'');
  if (hour >= 6 && hour < 10) return '#f59e0b';
  if (hour >= 10 && hour < 12) return '#10b981';
  if (hour >= 12 && hour < 15) return '#3b82f6';
  if (hour >= 15 && hour < 18) return '#10b981';
  return '#8b5cf6';
};

// ─── APP ──────────────────────────────────────────────
export default function App() {
  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekArchive, setWeekArchive] = useState(() => {
    // Initialize current week with default data
    const w0 = getWeekInfo(0);
    return { [w0.key]: {
      gymPlan: JSON.parse(JSON.stringify(DEFAULT_PLAN)),
      mealPlan: JSON.parse(JSON.stringify(SAMPLE_MEAL_PLAN)),
      exercisesCompleted: {},
      mealsCompleted: {},
    }};
  });

  const weekInfo = getWeekInfo(weekOffset);
  const weekData = weekArchive[weekInfo.key] || null;

  // Active data for current viewed week
  const plan = weekData?.gymPlan || null;
  const mealPlan = weekData?.mealPlan || null;
  const completed = weekData?.exercisesCompleted || {};
  const mealsCompleted = weekData?.mealsCompleted || {};

  // Helper to update weekArchive for the current viewed week
  const updateWeek = useCallback((updater) => {
    setWeekArchive(prev => {
      const key = getWeekInfo(weekOffset).key;
      const current = prev[key] || {
        gymPlan: JSON.parse(JSON.stringify(DEFAULT_PLAN)),
        mealPlan: JSON.parse(JSON.stringify(EMPTY_MEAL_PLAN)),
        exercisesCompleted: {},
        mealsCompleted: {},
      };
      return { ...prev, [key]: updater(current) };
    });
  }, [weekOffset]);

  // UI state
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = getToday();
    return DAYS.includes(today) ? today : 'Tuesday';
  });
  const [view, setView] = useState('tracker');
  const [toast, setToast] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTarget, setAddTarget] = useState({ day: '', sectionIdx: 0 });
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', rest: '60s', desc: '', tips: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', sets: '', rest: '', desc: '', tips: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState({ time: '', name: '', ingredients: '', calories: '', prep: '' });
  const [editingMealId, setEditingMealId] = useState(null);
  const [editMealValues, setEditMealValues] = useState({ time: '', name: '', ingredients: '', calories: '', prep: '' });
  const [confirmMealDelete, setConfirmMealDelete] = useState(null);
  const [expandedMealId, setExpandedMealId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const mealFileRef = useRef(null);

  // Clear transient state on day/week change
  useEffect(() => {
    setEditingId(null); setExpandedId(null); setConfirmDelete(null);
    setEditingMealId(null); setExpandedMealId(null); setConfirmMealDelete(null);
  }, [selectedDay, weekOffset]);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        else if (showAddMealModal) setShowAddMealModal(false);
        else if (showShareModal) setShowShareModal(false);
        else if (editingId) setEditingId(null);
        else if (editingMealId) setEditingMealId(null);
        else if (expandedId) setExpandedId(null);
        else if (expandedMealId) setExpandedMealId(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showAddModal, showAddMealModal, showShareModal, editingId, editingMealId, expandedId, expandedMealId]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // ─── WEEK NAVIGATION ──────────────────────────────
  const goToPrevWeek = () => setWeekOffset(o => o - 1);
  const goToNextWeek = () => setWeekOffset(o => o + 1);
  const goToCurrentWeek = () => setWeekOffset(0);

  // ─── COPY LAST WEEK ───────────────────────────────
  const copyLastWeek = () => {
    const prevKey = getWeekInfo(weekOffset - 1).key;
    const prevData = weekArchive[prevKey];
    if (!prevData) {
      showToast('No data from previous week to copy');
      return;
    }
    const newGym = clonePlanWithNewIds(prevData.gymPlan);
    const newMeals = cloneMealPlanWithNewIds(prevData.mealPlan);
    updateWeek(() => ({
      gymPlan: newGym,
      mealPlan: newMeals,
      exercisesCompleted: {},
      mealsCompleted: {},
    }));
    showToast('Copied last week\'s plan! Progress reset.');
  };

  // Initialize current week from defaults if needed
  const initializeWeekWithDefaults = () => {
    updateWeek(() => ({
      gymPlan: JSON.parse(JSON.stringify(DEFAULT_PLAN)),
      mealPlan: JSON.parse(JSON.stringify(EMPTY_MEAL_PLAN)),
      exercisesCompleted: {},
      mealsCompleted: {},
    }));
    showToast('Week initialized with default plan');
  };

  // ─── EXERCISE TRACKING ─────────────────────────────
  const toggleExercise = (id) => updateWeek(w => ({ ...w, exercisesCompleted: { ...w.exercisesCompleted, [id]: !w.exercisesCompleted[id] } }));

  const getDayProgress = useCallback((day) => {
    if (!plan || !plan[day]) return { done: 0, total: 0, pct: 0 };
    let total = 0, done = 0;
    plan[day].sections.forEach(sec => sec.exercises.forEach(e => { total++; if (completed[e.id]) done++; }));
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [plan, completed]);

  const getWeekProgress = useCallback(() => {
    let total = 0, done = 0;
    DAYS.forEach(day => { const p = getDayProgress(day); total += p.total; done += p.done; });
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [getDayProgress]);

  const getMealDayProgress = useCallback((day) => {
    if (!mealPlan || !mealPlan[day]?.meals?.length) return { done: 0, total: 0, pct: 0 };
    const total = mealPlan[day].meals.length;
    const done = mealPlan[day].meals.filter(m => mealsCompleted[m.id]).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [mealPlan, mealsCompleted]);

  // ─── EXERCISE CRUD ─────────────────────────────────
  const addExercise = () => {
    if (!newExercise.name.trim()) return;
    const { day, sectionIdx } = addTarget;
    updateWeek(w => {
      const u = JSON.parse(JSON.stringify(w.gymPlan));
      u[day].sections[sectionIdx].exercises.push({ id: generateId(), name: newExercise.name, sets: newExercise.sets || '-', rest: newExercise.rest || '-', desc: newExercise.desc || '', tips: newExercise.tips || '' });
      return { ...w, gymPlan: u };
    });
    setNewExercise({ name: '', sets: '', rest: '60s', desc: '', tips: '' });
    setShowAddModal(false);
    showToast('Exercise added!');
  };

  const removeExercise = (day, sIdx, exId) => {
    updateWeek(w => {
      const u = JSON.parse(JSON.stringify(w.gymPlan));
      u[day].sections[sIdx].exercises = u[day].sections[sIdx].exercises.filter(e => e.id !== exId);
      const c = { ...w.exercisesCompleted }; delete c[exId];
      return { ...w, gymPlan: u, exercisesCompleted: c };
    });
    setConfirmDelete(null);
    showToast('Exercise removed');
  };

  const startEdit = (ex) => { setEditingId(ex.id); setEditValues({ name: ex.name, sets: ex.sets, rest: ex.rest, desc: ex.desc||'', tips: ex.tips||'' }); setExpandedId(null); };

  const saveEdit = (day, sIdx, exId) => {
    if (!editValues.name.trim()) return;
    updateWeek(w => {
      const u = JSON.parse(JSON.stringify(w.gymPlan));
      const ex = u[day].sections[sIdx].exercises.find(e => e.id === exId);
      if (ex) Object.assign(ex, editValues);
      return { ...w, gymPlan: u };
    });
    setEditingId(null); showToast('Updated!');
  };

  // ─── MEAL CRUD ─────────────────────────────────────
  const toggleMeal = (id) => updateWeek(w => ({ ...w, mealsCompleted: { ...w.mealsCompleted, [id]: !w.mealsCompleted[id] } }));

  const addMeal = () => {
    if (!newMeal.name.trim()) return;
    updateWeek(w => {
      const u = JSON.parse(JSON.stringify(w.mealPlan));
      if (!u[selectedDay]) u[selectedDay] = { meals: [] };
      u[selectedDay].meals.push({ id: generateId(), ...newMeal });
      u[selectedDay].meals.sort((a, b) => (a.time||'').localeCompare(b.time||''));
      return { ...w, mealPlan: u };
    });
    setNewMeal({ time: '', name: '', ingredients: '', calories: '', prep: '' });
    setShowAddMealModal(false);
    showToast('Meal added!');
  };

  const removeMeal = (day, mealId) => {
    updateWeek(w => {
      const u = JSON.parse(JSON.stringify(w.mealPlan));
      if (u[day]) u[day].meals = u[day].meals.filter(m => m.id !== mealId);
      const c = { ...w.mealsCompleted }; delete c[mealId];
      return { ...w, mealPlan: u, mealsCompleted: c };
    });
    setConfirmMealDelete(null); showToast('Meal removed');
  };

  const startMealEdit = (meal) => { setEditingMealId(meal.id); setEditMealValues({ time: meal.time, name: meal.name, ingredients: meal.ingredients||'', calories: meal.calories||'', prep: meal.prep||'' }); setExpandedMealId(null); };

  const saveMealEdit = (day, mealId) => {
    if (!editMealValues.name.trim()) return;
    updateWeek(w => {
      const u = JSON.parse(JSON.stringify(w.mealPlan));
      if (u[day]) {
        const m = u[day].meals.find(m => m.id === mealId);
        if (m) Object.assign(m, editMealValues);
        u[day].meals.sort((a, b) => (a.time||'').localeCompare(b.time||''));
      }
      return { ...w, mealPlan: u };
    });
    setEditingMealId(null); showToast('Meal updated!');
  };

  // ─── MEAL UPLOAD ───────────────────────────────────
  const handleMealFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus(null); setUploadErrors([]);
    if (file.size > 5 * 1024 * 1024) { setUploadStatus('error'); setUploadErrors(['File too large (max 5MB)']); if (mealFileRef.current) mealFileRef.current.value=''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = parseMealCSV(ev.target.result);
        setUploadResult(result); setUploadErrors(result.errors||[]);
        if (result.rowCount === 0) { setUploadStatus('error'); setUploadErrors(['No valid meals found']); }
        else setUploadStatus('preview');
      } catch(err) { setUploadStatus('error'); setUploadErrors([err.message]); }
    };
    reader.readAsText(file);
    if (mealFileRef.current) mealFileRef.current.value='';
  };

  const applyUploadedMealPlan = () => {
    if (!uploadResult?.mealPlan) return;
    const merged = JSON.parse(JSON.stringify(EMPTY_MEAL_PLAN));
    for (const [day, data] of Object.entries(uploadResult.mealPlan)) merged[day] = data;
    updateWeek(w => ({ ...w, mealPlan: merged, mealsCompleted: {} }));
    setUploadStatus('success');
    showToast(`${uploadResult.rowCount} meals loaded for this week!`);
  };

  const downloadMealTemplate = () => {
    const csv = 'Day,Time,Meal Name,Ingredients,Calories,Prep Instructions\nTuesday,7:00 AM,Oats with Banana,"Oats (50g), banana, almonds",380,"Cook oats in milk"\nTuesday,1:00 PM,Paneer Wrap,"Roti (2), paneer (150g), veggies",520,"Grill paneer, wrap in roti"';
    const b = new Blob([csv], { type: 'text/csv' }); const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = 'meal_plan_template.csv'; a.click(); URL.revokeObjectURL(u);
    showToast('Template downloaded!');
  };

  // ─── SHARE/EXPORT ──────────────────────────────────
  const copyPlanText = () => {
    if (!plan) return;
    let text = `HEALTH TRACKER - ${weekInfo.label}\n${'='.repeat(40)}\n\n--- WORKOUT ---\n\n`;
    DAYS.forEach(day => { const d = plan[day]; if (!d) return; text += `${day.toUpperCase()} - ${d.label}\n`; if (d.warmup) text += `  Warm-up: ${d.warmup}\n`; d.sections.forEach(sec => { text += `  ${sec.name}:\n`; sec.exercises.forEach(e => { text += `    - ${e.name} | ${e.sets} | Rest: ${e.rest}\n`; }); }); text += '\n'; });
    if (mealPlan) { text += '\n--- MEALS ---\n\n'; DAYS.forEach(day => { const d = mealPlan[day]; if (!d?.meals?.length) return; text += `${day.toUpperCase()}\n`; d.meals.forEach(m => { text += `  ${m.time} - ${m.name} (${m.calories} cal)\n`; }); text += '\n'; }); }
    try { if (navigator.clipboard) navigator.clipboard.writeText(text); else { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); } showToast('Copied!'); } catch { showToast('Copy failed'); }
  };

  const exportCSV = (type) => {
    const csv = type === 'gym' ? planToCSV(plan) : mealPlanToCSV(mealPlan);
    const b = new Blob([csv], { type: 'text/csv' }); const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = `${type}_plan_${weekInfo.key}.csv`; a.click(); URL.revokeObjectURL(u);
    showToast(`${type === 'gym' ? 'Workout' : 'Meal'} plan exported!`);
  };

  // ─── CONSISTENCY SCORING ─────────────────────────────
  const getWeekScore = useCallback((weekKey) => {
    const wd = weekArchive[weekKey];
    if (!wd) return null;
    let exTotal = 0, exDone = 0, mealTotal = 0, mealDone = 0;
    DAYS.forEach(day => {
      if (wd.gymPlan?.[day]?.sections) {
        wd.gymPlan[day].sections.forEach(sec => sec.exercises.forEach(e => { exTotal++; if (wd.exercisesCompleted?.[e.id]) exDone++; }));
      }
      if (wd.mealPlan?.[day]?.meals) {
        wd.mealPlan[day].meals.forEach(m => { mealTotal++; if (wd.mealsCompleted?.[m.id]) mealDone++; });
      }
    });
    const exPct = exTotal === 0 ? 0 : Math.round((exDone / exTotal) * 100);
    const mealPct = mealTotal === 0 ? 0 : Math.round((mealDone / mealTotal) * 100);
    const overall = exTotal + mealTotal === 0 ? 0 : Math.round(((exDone + mealDone) / (exTotal + mealTotal)) * 100);
    const daysWithWorkout = DAYS.filter(day => {
      if (!wd.gymPlan?.[day]?.sections) return false;
      let t = 0, d = 0;
      wd.gymPlan[day].sections.forEach(sec => sec.exercises.forEach(e => { t++; if (wd.exercisesCompleted?.[e.id]) d++; }));
      return t > 0 && d / t >= 0.5; // day counts if at least 50% done
    }).length;
    return { exPct, mealPct, overall, exDone, exTotal, mealDone, mealTotal, daysWithWorkout };
  }, [weekArchive]);

  const getConsistencyHistory = useCallback(() => {
    const history = [];
    for (let i = 0; i >= -4; i--) { // Current + last 4 weeks (5 total)
      const wi = getWeekInfo(i);
      const score = getWeekScore(wi.key);
      if (score) history.push({ ...wi, ...score, offset: i });
    }
    return history;
  }, [getWeekScore]);

  const getScoreGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', color: '#16a34a', label: 'Excellent' };
    if (pct >= 80) return { grade: 'A', color: '#22c55e', label: 'Great' };
    if (pct >= 70) return { grade: 'B', color: '#84cc16', label: 'Good' };
    if (pct >= 55) return { grade: 'C', color: '#f59e0b', label: 'Fair' };
    if (pct >= 35) return { grade: 'D', color: '#f97316', label: 'Needs Work' };
    return { grade: 'F', color: '#ef4444', label: 'Keep Pushing' };
  };

  // ─── RENDER ─────────────────────────────────────────
  const week = plan ? getWeekProgress() : { done: 0, total: 0, pct: 0 };
  const dayData = plan?.[selectedDay];
  const dayProgress = getDayProgress(selectedDay);
  const dayColor = DAY_COLORS[selectedDay] || '#1a1a2e';
  const mealDayData = mealPlan?.[selectedDay];
  const mealProgress = getMealDayProgress(selectedDay);
  const hasWeekData = weekData !== null;
  const prevKey = getWeekInfo(weekOffset - 1).key;
  const hasPrevWeekData = !!weekArchive[prevKey];

  return (
    <div style={s.page}>
      {toast && <div role="status" aria-live="polite" style={s.toast}>{toast}</div>}

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Health Tracker</h1>
            <div style={{ display: 'flex', gap: 4 }}>
              {['tracker', 'meals', 'stats', 'upload'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ background: view === v ? 'rgba(233,69,96,0.9)' : 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', padding: '7px 8px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: view === v ? 600 : 400 }}>
                  {v === 'tracker' ? 'Workout' : v === 'meals' ? 'Meals' : v === 'stats' ? 'Stats' : 'Upload'}
                </button>
              ))}
            </div>
          </div>

          {/* WEEK NAVIGATOR */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={goToPrevWeek} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;</button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{weekInfo.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                {weekInfo.isCurrentWeek ? 'This Week' : weekOffset > 0 ? `${weekOffset} week${weekOffset > 1 ? 's' : ''} ahead` : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
                {!weekInfo.isCurrentWeek && <span onClick={goToCurrentWeek} style={{ marginLeft: 8, cursor: 'pointer', textDecoration: 'underline', opacity: 0.9 }}>Go to today</span>}
              </div>
            </div>
            <button onClick={goToNextWeek} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&gt;</button>
          </div>

          {/* Progress bars */}
          {hasWeekData && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span>Workout</span><span style={{ fontWeight: 600 }}>{week.done}/{week.total}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: '#e94560', height: '100%', width: `${week.pct}%`, borderRadius: 6, transition: 'width 0.5s' }} />
                </div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span>Meals</span><span style={{ fontWeight: 600 }}>{mealProgress.done}/{mealProgress.total}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: '#4ade80', height: '100%', width: `${mealProgress.pct}%`, borderRadius: 6, transition: 'width 0.5s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...s.container, padding: '0 12px' }}>

        {/* ══════════ EMPTY WEEK STATE ══════════ */}
        {!hasWeekData && (
          <div style={{ ...s.card, padding: 32, textAlign: 'center', marginTop: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#333' }}>No Plan for This Week</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888' }}>
              {weekInfo.label} doesn't have a plan yet. You can copy last week's plan or start fresh.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300, margin: '0 auto' }}>
              {hasPrevWeekData && (
                <button onClick={copyLastWeek} style={s.btn('#e94560')}>
                  Copy Last Week's Plan
                </button>
              )}
              <button onClick={initializeWeekWithDefaults} style={s.btn('#0f3460')}>
                Start with Default Plan
              </button>
              <button onClick={() => setView('upload')} style={{ ...s.btn('#fff', '#666'), border: '1px solid #ddd' }}>
                Upload from CSV
              </button>
            </div>
          </div>
        )}

        {/* DAY TABS */}
        {hasWeekData && ['tracker', 'meals', 'stats'].includes(view) && (
          <div style={{ display: 'flex', gap: 4, padding: '12px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {DAYS.map(day => {
              const p = view === 'meals' ? getMealDayProgress(day) : getDayProgress(day);
              const sel = day === selectedDay;
              const isToday = getToday() === day && weekInfo.isCurrentWeek;
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  style={{ flex: '0 0 auto', padding: '8px 12px', minWidth: 58, border: sel ? '2px solid #e94560' : '2px solid transparent', borderRadius: 10, background: sel ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', textAlign: 'center', position: 'relative', boxShadow: sel ? '0 2px 8px rgba(233,69,96,0.2)' : 'none' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: sel ? '#e94560' : '#666' }}>{day.slice(0, 3)}</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{p.pct}%</div>
                  {isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', position: 'absolute', top: 4, right: 4 }} />}
                  {p.pct === 100 && p.total > 0 && <div style={{ fontSize: 10, marginTop: 1 }}>✓</div>}
                </button>
              );
            })}
          </div>
        )}

        {/* ══════════ WORKOUT TRACKER VIEW ══════════ */}
        {hasWeekData && view === 'tracker' && dayData && (
          <>
            <div style={{ background: dayColor, color: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{selectedDay}</h2><p style={{ margin: '2px 0 0', fontSize: 13, opacity: 0.85 }}>{dayData.label}</p></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 26, fontWeight: 700 }}>{dayProgress.pct}%</div><div style={{ fontSize: 11, opacity: 0.8 }}>{dayProgress.done}/{dayProgress.total}</div></div>
              </div>
              {dayData.warmup && <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}><strong>Warm-up:</strong> {dayData.warmup}</div>}
            </div>

            {dayData.sections.map((section, sIdx) => (
              <div key={sIdx} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: dayColor }}>{section.name}</h3>
                  <button onClick={() => { setAddTarget({ day: selectedDay, sectionIdx: sIdx }); setShowAddModal(true); }} style={s.btnSm('transparent', '#666')}>+ Add</button>
                </div>
                {section.exercises.map(ex => (
                  <div key={ex.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 10, opacity: completed[ex.id] ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                      <div onClick={() => toggleExercise(ex.id)} style={{ width: 24, height: 24, minWidth: 24, borderRadius: 6, border: completed[ex.id] ? 'none' : '2px solid #ddd', background: completed[ex.id] ? dayColor : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {completed[ex.id] && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
                      </div>
                      {editingId === ex.id ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <input autoFocus value={editValues.name} onChange={e => setEditValues({ ...editValues, name: e.target.value })} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <input value={editValues.sets} onChange={e => setEditValues({ ...editValues, sets: e.target.value })} placeholder="Sets" style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
                            <input value={editValues.rest} onChange={e => setEditValues({ ...editValues, rest: e.target.value })} placeholder="Rest" style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
                          </div>
                          <textarea value={editValues.desc} onChange={e => setEditValues({ ...editValues, desc: e.target.value })} placeholder="How to do it" rows={2} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 11, resize: 'vertical', fontFamily: 'inherit' }} />
                          <textarea value={editValues.tips} onChange={e => setEditValues({ ...editValues, tips: e.target.value })} placeholder="Watch out" rows={1} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 11, resize: 'vertical', fontFamily: 'inherit' }} />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => saveEdit(selectedDay, sIdx, ex.id)} style={s.btnSm(dayColor)}>Save</button>
                            <button onClick={() => setEditingId(null)} style={s.btnSm('#eee', '#333')}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ flex: 1 }}>
                          <span onClick={() => startEdit(ex)} style={{ fontSize: 13, fontWeight: 500, textDecoration: completed[ex.id] ? 'line-through' : 'none', color: '#333', cursor: 'pointer' }}>{ex.name}</span>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{ex.sets}{ex.rest !== '-' ? ` \u00b7 Rest: ${ex.rest}` : ''}</div>
                        </div>
                      )}
                      {editingId !== ex.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {(ex.desc || ex.tips) && <button onClick={e => { e.stopPropagation(); setExpandedId(expandedId === ex.id ? null : ex.id); }} style={{ background: expandedId === ex.id ? dayColor : 'none', border: expandedId === ex.id ? 'none' : '1px solid #ddd', color: expandedId === ex.id ? '#fff' : '#888', cursor: 'pointer', fontSize: 11, padding: '3px 7px', borderRadius: 5, fontWeight: 600 }}>i</button>}
                          {confirmDelete === ex.id ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => removeExercise(selectedDay, sIdx, ex.id)} style={s.btnSm('#ef4444')}>Yes</button>
                              <button onClick={() => setConfirmDelete(null)} style={s.btnSm('#eee', '#333')}>No</button>
                            </div>
                          ) : <button onClick={() => setConfirmDelete(ex.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>{'\u00d7'}</button>}
                        </div>
                      )}
                    </div>
                    {expandedId === ex.id && (ex.desc || ex.tips) && (
                      <div style={{ padding: '0 14px 12px 48px' }}>
                        {ex.desc && <div style={{ background: '#f8f9ff', borderRadius: 8, padding: '10px 12px', marginBottom: ex.tips ? 6 : 0 }}><div style={{ fontSize: 11, fontWeight: 700, color: dayColor, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>How to do it</div><div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>{ex.desc}</div></div>}
                        {ex.tips && <div style={{ background: '#fff8e1', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #f59e0b' }}><div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Watch out</div><div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{ex.tips}</div></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, padding: '8px 0 20px' }}>
              <button onClick={() => updateWeek(w => ({ ...w, exercisesCompleted: {} }))} style={{ ...s.btn('#fff', '#666'), border: '1px solid #ddd' }}>Reset Week</button>
              <button onClick={() => setShowShareModal(true)} style={s.btn('#1a1a2e')}>Share</button>
            </div>
          </>
        )}

        {/* ══════════ MEALS VIEW ══════════ */}
        {hasWeekData && view === 'meals' && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{selectedDay} Meals</h2><p style={{ margin: '2px 0 0', fontSize: 13, opacity: 0.85 }}>{mealDayData?.meals?.length || 0} meals</p></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 26, fontWeight: 700 }}>{mealProgress.pct}%</div><div style={{ fontSize: 11, opacity: 0.8 }}>{mealProgress.done}/{mealProgress.total}</div></div>
              </div>
            </div>

            {(!mealDayData?.meals?.length) ? (
              <div style={{ ...s.card, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4 }}>No meals for {selectedDay}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Add meals or upload a meal plan CSV</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowAddMealModal(true)} style={{ ...s.btn('#10b981'), flex: 1 }}>+ Add Meal</button>
                  <button onClick={() => setView('upload')} style={{ ...s.btn('#0f3460'), flex: 1 }}>Upload Plan</button>
                </div>
              </div>
            ) : (
              <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#059669' }}>Today's Meals</h3>
                  <button onClick={() => setShowAddMealModal(true)} style={s.btnSm('transparent', '#666')}>+ Add</button>
                </div>
                {mealDayData.meals.map(meal => {
                  const mc = getMealTimeColor(meal.time);
                  return (
                    <div key={meal.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 10, opacity: mealsCompleted[meal.id] ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                        <div onClick={() => toggleMeal(meal.id)} style={{ width: 24, height: 24, minWidth: 24, borderRadius: 6, border: mealsCompleted[meal.id] ? 'none' : '2px solid #ddd', background: mealsCompleted[meal.id] ? '#10b981' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {mealsCompleted[meal.id] && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
                        </div>
                        {editingMealId === meal.id ? (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input value={editMealValues.time} onChange={e => setEditMealValues({ ...editMealValues, time: e.target.value })} placeholder="Time" style={{ width: 100, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
                              <input autoFocus value={editMealValues.name} onChange={e => setEditMealValues({ ...editMealValues, name: e.target.value })} style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} />
                            </div>
                            <textarea value={editMealValues.ingredients} onChange={e => setEditMealValues({ ...editMealValues, ingredients: e.target.value })} placeholder="Ingredients" rows={2} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 11, resize: 'vertical', fontFamily: 'inherit' }} />
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input value={editMealValues.calories} onChange={e => setEditMealValues({ ...editMealValues, calories: e.target.value })} placeholder="Calories" style={{ width: 80, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
                              <textarea value={editMealValues.prep} onChange={e => setEditMealValues({ ...editMealValues, prep: e.target.value })} placeholder="Prep" rows={1} style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 11, resize: 'vertical', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => saveMealEdit(selectedDay, meal.id)} style={s.btnSm('#10b981')}>Save</button>
                              <button onClick={() => setEditingMealId(null)} style={s.btnSm('#eee', '#333')}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ flex: 1 }} onClick={() => startMealEdit(meal)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: mc, background: `${mc}15`, padding: '2px 8px', borderRadius: 4 }}>{meal.time}</span>
                              <span style={{ fontSize: 13, fontWeight: 500, textDecoration: mealsCompleted[meal.id] ? 'line-through' : 'none', color: '#333', cursor: 'pointer' }}>{meal.name}</span>
                            </div>
                            {meal.calories && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{meal.calories} cal</div>}
                          </div>
                        )}
                        {editingMealId !== meal.id && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {(meal.ingredients || meal.prep) && <button onClick={e => { e.stopPropagation(); setExpandedMealId(expandedMealId === meal.id ? null : meal.id); }} style={{ background: expandedMealId === meal.id ? '#10b981' : 'none', border: expandedMealId === meal.id ? 'none' : '1px solid #ddd', color: expandedMealId === meal.id ? '#fff' : '#888', cursor: 'pointer', fontSize: 11, padding: '3px 7px', borderRadius: 5, fontWeight: 600 }}>i</button>}
                            {confirmMealDelete === meal.id ? (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => removeMeal(selectedDay, meal.id)} style={s.btnSm('#ef4444')}>Yes</button>
                                <button onClick={() => setConfirmMealDelete(null)} style={s.btnSm('#eee', '#333')}>No</button>
                              </div>
                            ) : <button onClick={() => setConfirmMealDelete(meal.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>{'\u00d7'}</button>}
                          </div>
                        )}
                      </div>
                      {expandedMealId === meal.id && (
                        <div style={{ padding: '0 14px 12px 48px' }}>
                          {meal.ingredients && <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: meal.prep ? 6 : 0 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ingredients</div><div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>{meal.ingredients}</div></div>}
                          {meal.prep && <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #f59e0b' }}><div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>How to Prepare</div><div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{meal.prep}</div></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {mealDayData?.meals?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, padding: '8px 0 20px' }}>
                <button onClick={() => updateWeek(w => ({ ...w, mealsCompleted: {} }))} style={{ ...s.btn('#fff', '#666'), border: '1px solid #ddd' }}>Reset Meals</button>
                <button onClick={() => setShowAddMealModal(true)} style={s.btn('#10b981')}>+ Add Meal</button>
              </div>
            )}
          </>
        )}

        {/* ══════════ STATS VIEW ══════════ */}
        {hasWeekData && view === 'stats' && (() => {
          const currentScore = getWeekScore(weekInfo.key);
          const grade = currentScore ? getScoreGrade(currentScore.overall) : null;
          const history = getConsistencyHistory();

          return (
          <div style={{ paddingBottom: 20 }}>
            {/* Consistency Score Card */}
            {currentScore && grade && (
              <div style={{ ...s.card, padding: 20, marginTop: 8, textAlign: 'center', background: `linear-gradient(135deg, ${grade.color}08, ${grade.color}15)` }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 4 }}>Consistency Score - {weekInfo.label}</div>
                <div style={{ fontSize: 56, fontWeight: 800, color: grade.color, lineHeight: 1 }}>{grade.grade}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: grade.color, marginTop: 4 }}>{grade.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#333', marginTop: 8 }}>{currentScore.overall}%</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12, fontSize: 12 }}>
                  <div><span style={{ fontWeight: 700, color: '#e94560' }}>{currentScore.exPct}%</span> <span style={{ color: '#888' }}>Workout</span></div>
                  <div><span style={{ fontWeight: 700, color: '#10b981' }}>{currentScore.mealPct}%</span> <span style={{ color: '#888' }}>Meals</span></div>
                  <div><span style={{ fontWeight: 700, color: '#3b82f6' }}>{currentScore.daysWithWorkout}/6</span> <span style={{ color: '#888' }}>Active Days</span></div>
                </div>
              </div>
            )}

            {/* Week-by-Week Comparison */}
            {history.length > 1 && (
              <div style={{ ...s.card, padding: 16 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#1a1a2e' }}>Week-by-Week Consistency</h3>
                {history.map((w, idx) => {
                  const g = getScoreGrade(w.overall);
                  const prev = history[idx + 1];
                  const diff = prev ? w.overall - prev.overall : null;
                  return (
                    <div key={w.key} style={{ marginBottom: 12, padding: 12, background: w.offset === 0 ? '#f8f9ff' : '#fafafa', borderRadius: 10, border: w.offset === 0 ? '2px solid #e94560' : '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                            {w.label}
                            {w.offset === 0 && <span style={{ fontSize: 10, color: '#e94560', marginLeft: 6, fontWeight: 700 }}>THIS WEEK</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {diff !== null && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: diff > 0 ? '#16a34a' : diff < 0 ? '#ef4444' : '#888' }}>
                              {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '0%'}
                              {diff > 0 ? ' ↑' : diff < 0 ? ' ↓' : ' →'}
                            </span>
                          )}
                          <div style={{ background: g.color, color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 13, fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{g.grade}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                              <div style={{ background: '#e94560', height: '100%', width: `${w.exPct}%`, borderRadius: 4 }} />
                            </div>
                            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                              <div style={{ background: '#10b981', height: '100%', width: `${w.mealPct}%`, borderRadius: 4 }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888' }}>
                            <span>Workout {w.exPct}%</span>
                            <span>Meals {w.mealPct}%</span>
                            <span>{w.daysWithWorkout} active days</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: g.color, minWidth: 42, textAlign: 'right' }}>{w.overall}%</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#888', marginTop: 8, justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 6, background: '#e94560', borderRadius: 3 }} /> Workout</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 6, background: '#10b981', borderRadius: 3 }} /> Meals</div>
                </div>
              </div>
            )}

            {/* ─── WORKOUT: 5-Week Comparison ─── */}
            {history.length > 0 && (
              <div style={{ ...s.card, padding: 16 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#e94560', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#e94560', color: '#fff', width: 28, height: 28, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>W</span>
                  Workout — 5 Week Trend
                </h3>
                {history.map((w, idx) => {
                  const prev = history[idx + 1];
                  const diff = prev ? w.exPct - prev.exPct : null;
                  const barColor = w.exPct >= 80 ? '#16a34a' : w.exPct >= 55 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={w.key} style={{ marginBottom: 10, padding: '10px 12px', background: w.offset === 0 ? '#fef2f2' : '#fafafa', borderRadius: 10, border: w.offset === 0 ? '2px solid #e94560' : '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                          {w.label}
                          {w.offset === 0 && <span style={{ fontSize: 9, color: '#e94560', marginLeft: 6, fontWeight: 700, textTransform: 'uppercase' }}>Current</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {diff !== null && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? '#16a34a' : diff < 0 ? '#ef4444' : '#888' }}>
                              {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '—'}
                              {diff > 0 ? ' ↑' : diff < 0 ? ' ↓' : ''}
                            </span>
                          )}
                          <span style={{ fontSize: 18, fontWeight: 700, color: barColor }}>{w.exPct}%</span>
                        </div>
                      </div>
                      <div style={{ background: '#f0f0f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ background: '#e94560', height: '100%', width: `${w.exPct}%`, borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 4 }}>
                        <span>{w.exDone}/{w.exTotal} exercises</span>
                        <span>{w.daysWithWorkout} active days</span>
                      </div>
                    </div>
                  );
                })}
                {history.length >= 2 && (() => {
                  const newest = history[0];
                  const oldest = history[history.length - 1];
                  const trend = newest.exPct - oldest.exPct;
                  return (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: trend >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{history.length}-Week Trend</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: trend > 0 ? '#16a34a' : trend < 0 ? '#ef4444' : '#888' }}>
                        {trend > 0 ? `+${trend}% ↑` : trend < 0 ? `${trend}% ↓` : 'Steady →'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ─── MEALS: 5-Week Comparison ─── */}
            {history.length > 0 && (
              <div style={{ ...s.card, padding: 16 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#059669', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#10b981', color: '#fff', width: 28, height: 28, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>M</span>
                  Meals — 5 Week Trend
                </h3>
                {history.map((w, idx) => {
                  const prev = history[idx + 1];
                  const diff = prev ? w.mealPct - prev.mealPct : null;
                  const barColor = w.mealPct >= 80 ? '#16a34a' : w.mealPct >= 55 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={w.key} style={{ marginBottom: 10, padding: '10px 12px', background: w.offset === 0 ? '#f0fdf4' : '#fafafa', borderRadius: 10, border: w.offset === 0 ? '2px solid #10b981' : '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                          {w.label}
                          {w.offset === 0 && <span style={{ fontSize: 9, color: '#059669', marginLeft: 6, fontWeight: 700, textTransform: 'uppercase' }}>Current</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {diff !== null && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? '#16a34a' : diff < 0 ? '#ef4444' : '#888' }}>
                              {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '—'}
                              {diff > 0 ? ' ↑' : diff < 0 ? ' ↓' : ''}
                            </span>
                          )}
                          <span style={{ fontSize: 18, fontWeight: 700, color: barColor }}>{w.mealPct}%</span>
                        </div>
                      </div>
                      <div style={{ background: '#f0f0f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ background: '#10b981', height: '100%', width: `${w.mealPct}%`, borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 4 }}>
                        <span>{w.mealDone}/{w.mealTotal} meals</span>
                        <span>{w.mealPct >= 80 ? 'On track' : w.mealPct >= 50 ? 'Room to improve' : 'Needs attention'}</span>
                      </div>
                    </div>
                  );
                })}
                {history.length >= 2 && (() => {
                  const newest = history[0];
                  const oldest = history[history.length - 1];
                  const trend = newest.mealPct - oldest.mealPct;
                  return (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: trend >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{history.length}-Week Trend</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: trend > 0 ? '#16a34a' : trend < 0 ? '#ef4444' : '#888' }}>
                        {trend > 0 ? `+${trend}% ↑` : trend < 0 ? `${trend}% ↓` : 'Steady →'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Daily breakdown */}
            <div style={{ ...s.card, padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#1a1a2e' }}>Daily Breakdown - {weekInfo.label}</h3>
              {DAYS.map(day => {
                const p = getDayProgress(day); const mp = getMealDayProgress(day);
                const isToday = getToday() === day && weekInfo.isCurrentWeek;
                return (<div key={day} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: isToday ? 700 : 400, color: isToday ? '#e94560' : '#333' }}>{day}{isToday && ' (Today)'}</span>
                    <span style={{ color: '#888', fontSize: 11 }}>Gym {p.done}/{p.total} | Meals {mp.done}/{mp.total}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ background: p.pct === 100 ? '#4ade80' : DAY_COLORS[day], height: '100%', width: `${p.pct}%`, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ background: mp.pct === 100 ? '#4ade80' : '#10b981', height: '100%', width: `${mp.pct}%`, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                </div>);
              })}
            </div>

            {/* Summary */}
            <div style={{ ...s.card, padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { val: week.done, label: 'Exercises Done', bg: '#f8f9ff', color: '#1a1a2e' },
                  { val: week.total - week.done, label: 'Remaining', bg: '#fff5f7', color: '#e94560' },
                  { val: DAYS.filter(d => getDayProgress(d).pct === 100).length, label: 'Workout Days Done', bg: '#f0fdf4', color: '#16a34a' },
                  { val: `${week.pct}%`, label: 'Week Completion', bg: '#fefce8', color: '#ca8a04' },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.val}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          );
        })()}

        {/* ══════════ UPLOAD VIEW ══════════ */}
        {view === 'upload' && (
          <div style={{ paddingTop: 12, paddingBottom: 20 }}>
            {/* Copy last week - shown prominently when week is empty */}
            {!hasWeekData && hasPrevWeekData && (
              <div style={{ ...s.card, padding: 16, borderLeft: '4px solid #e94560', marginBottom: 8 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, color: '#e94560' }}>Quick Start</h3>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#888' }}>No plan for {weekInfo.label} yet.</p>
                <button onClick={copyLastWeek} style={s.btn('#e94560')}>Copy Last Week's Plan (Workout + Meals)</button>
              </div>
            )}

            {/* Meal upload */}
            <div style={{ ...s.card, padding: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 15, color: '#059669' }}>Upload Meal Plan for {weekInfo.label}</h3>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>CSV columns: Day, Time, Meal Name, Ingredients, Calories, Prep Instructions</p>
              <button onClick={downloadMealTemplate} style={{ ...s.btn('#059669'), marginBottom: 10 }}>Download Meal Template</button>
              <div onClick={() => mealFileRef.current?.click()}
                style={{ border: '2px dashed #10b981', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#059669'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = '#10b981'; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#10b981'; const f = e.dataTransfer.files[0]; if (f) handleMealFileUpload({ target: { files: [f] } }); }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🍽️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Drop meal plan CSV here</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Supports .csv files</div>
              </div>
              <input ref={mealFileRef} type="file" accept=".csv,.tsv" onChange={handleMealFileUpload} style={{ display: 'none' }} />
            </div>

            {uploadStatus === 'preview' && uploadResult && (
              <div style={{ ...s.card, padding: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#16a34a' }}>Preview: {uploadResult.rowCount} meals</h3>
                {uploadErrors.length > 0 && <div style={{ background: '#fff5f5', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 12, color: '#dc2626' }}><strong>Warnings:</strong>{uploadErrors.map((e, i) => <div key={i}>- {e}</div>)}</div>}
                {Object.entries(uploadResult.mealPlan).map(([day, data]) => (
                  <div key={day} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DAY_COLORS[day]||'#333', marginBottom: 2 }}>{day}</div>
                    {data.meals.map((m, i) => <div key={i} style={{ marginLeft: 12, fontSize: 12, color: '#666' }}><span style={{ fontWeight: 600 }}>{m.time}</span> - {m.name} {m.calories && `(${m.calories} cal)`}</div>)}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={applyUploadedMealPlan} style={{ ...s.btn('#10b981'), flex: 1 }}>Publish to {weekInfo.label}</button>
                  <button onClick={() => { setUploadStatus(null); setUploadResult(null); }} style={{ ...s.btn('#eee', '#333'), flex: 1 }}>Cancel</button>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div style={{ ...s.card, padding: 16, borderLeft: '4px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#ef4444' }}>Upload Failed</h3>
                {uploadErrors.map((e, i) => <div key={i} style={{ fontSize: 13, color: '#666' }}>{e}</div>)}
                <button onClick={() => setUploadStatus(null)} style={{ ...s.btn('#eee', '#333'), marginTop: 10 }}>Try Again</button>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div style={{ ...s.card, padding: 16, borderLeft: '4px solid #16a34a' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, color: '#16a34a' }}>Meal Plan Published!</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#666' }}>{uploadResult?.rowCount} meals loaded for {weekInfo.label}.</p>
                <button onClick={() => setView('meals')} style={{ ...s.btn('#16a34a'), marginTop: 12 }}>Go to Meals</button>
              </div>
            )}

            {/* Export & copy */}
            {hasWeekData && (
              <div style={{ ...s.card, padding: 16 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 15, color: '#1a1a2e' }}>Export & Copy</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button onClick={() => exportCSV('gym')} style={{ ...s.btn('#1a1a2e'), flex: 1 }}>Workout CSV</button>
                  <button onClick={() => exportCSV('meal')} style={{ ...s.btn('#059669'), flex: 1 }}>Meal CSV</button>
                </div>
                <button onClick={copyLastWeek} disabled={!hasPrevWeekData} style={{ ...s.btn(hasPrevWeekData ? '#e94560' : '#ccc'), opacity: hasPrevWeekData ? 1 : 0.5 }}>
                  Copy Last Week's Plan to This Week
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD EXERCISE MODAL */}
      {showAddModal && (
        <div style={s.modalBottom} onClick={() => setShowAddModal(false)}>
          <div style={s.modalB} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Add Exercise to {addTarget.day}</h3>
            <input value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} placeholder="Exercise name *" style={{ ...s.input, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} placeholder="Sets x Reps" style={{ ...s.input, flex: 1 }} />
              <input value={newExercise.rest} onChange={e => setNewExercise({ ...newExercise, rest: e.target.value })} placeholder="Rest" style={{ ...s.input, flex: 1 }} />
            </div>
            <textarea value={newExercise.desc} onChange={e => setNewExercise({ ...newExercise, desc: e.target.value })} placeholder="How to do it" rows={2} style={{ ...s.input, marginBottom: 8, resize: 'vertical', fontFamily: 'inherit' }} />
            <textarea value={newExercise.tips} onChange={e => setNewExercise({ ...newExercise, tips: e.target.value })} placeholder="Watch out" rows={2} style={{ ...s.input, marginBottom: 14, resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addExercise} style={{ ...s.btn('#e94560'), flex: 1 }}>Add Exercise</button>
              <button onClick={() => setShowAddModal(false)} style={{ ...s.btn('#f0f0f0', '#333'), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEAL MODAL */}
      {showAddMealModal && (
        <div style={s.modalBottom} onClick={() => setShowAddMealModal(false)}>
          <div style={s.modalB} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Add Meal to {selectedDay}</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={newMeal.time} onChange={e => setNewMeal({ ...newMeal, time: e.target.value })} placeholder="Time (e.g. 7:00 AM)" style={{ ...s.input, width: 140 }} />
              <input value={newMeal.name} onChange={e => setNewMeal({ ...newMeal, name: e.target.value })} placeholder="Meal name *" style={{ ...s.input, flex: 1 }} />
            </div>
            <textarea value={newMeal.ingredients} onChange={e => setNewMeal({ ...newMeal, ingredients: e.target.value })} placeholder="Ingredients" rows={2} style={{ ...s.input, marginBottom: 8, resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={newMeal.calories} onChange={e => setNewMeal({ ...newMeal, calories: e.target.value })} placeholder="Calories" style={{ ...s.input, width: 120 }} />
              <textarea value={newMeal.prep} onChange={e => setNewMeal({ ...newMeal, prep: e.target.value })} placeholder="Prep instructions" rows={1} style={{ ...s.input, flex: 1, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addMeal} style={{ ...s.btn('#10b981'), flex: 1 }}>Add Meal</button>
              <button onClick={() => setShowAddMealModal(false)} style={{ ...s.btn('#f0f0f0', '#333'), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && (
        <div style={s.modalOverlay} onClick={() => setShowShareModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Share - {weekInfo.label}</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>Share this week's workout and meal plans</p>
            <button onClick={copyPlanText} style={{ ...s.btn('#1a1a2e'), marginBottom: 8 }}>Copy All as Text</button>
            <button onClick={() => exportCSV('gym')} style={{ ...s.btn('#0f3460'), marginBottom: 8 }}>Export Workout CSV</button>
            <button onClick={() => exportCSV('meal')} style={{ ...s.btn('#059669'), marginBottom: 8 }}>Export Meal CSV</button>
            <button onClick={() => {
              const data = { week: weekInfo.label, workout: plan, meals: mealPlan };
              const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const u = URL.createObjectURL(b); const a = document.createElement('a');
              a.href = u; a.download = `health_tracker_${weekInfo.key}.json`; a.click();
              showToast('JSON exported!');
            }} style={{ ...s.btn('#e94560'), marginBottom: 12 }}>Export All as JSON</button>
            <button onClick={() => setShowShareModal(false)} style={s.btn('#f0f0f0', '#333')}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
