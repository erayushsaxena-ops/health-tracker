// Ayush's default gym plan - pre-loaded with exercise descriptions
export const DAYS = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"];

export const DAY_COLORS = {
  Tuesday: "#e94560",
  Wednesday: "#0f3460",
  Thursday: "#e94560",
  Friday: "#0f3460",
  Saturday: "#e94560",
  Sunday: "#0f3460",
  Monday: "#6c757d",
};

export const DEFAULT_PLAN = {
  Tuesday: {
    label: "Chest, Triceps & Core",
    warmup: "5 min elliptical (low resistance) + arm circles + dynamic stretches",
    sections: [
      {
        name: "Strength Training",
        exercises: [
          {
            id: "t1", name: "Flat Bench Press (Barbell or Dumbbell)", sets: "3 x 10-12", rest: "60-90s",
            desc: "Lie flat on bench, feet planted firmly. Grip bar slightly wider than shoulder-width. Lower bar to mid-chest, elbows at 45 degrees (not flared out). Press up explosively. Keep shoulder blades squeezed together throughout.",
            tips: "Don't bounce the bar off your chest. Keep wrists straight. Ask for a spotter when going heavier."
          },
          {
            id: "t2", name: "Incline Dumbbell Press", sets: "3 x 10-12", rest: "60-90s",
            desc: "Set bench to 30-45 degree incline. Hold dumbbells at shoulder level, palms facing forward. Press up until arms are extended but not locked. Lower slowly with control.",
            tips: "Don't set the incline too steep (above 45 degrees) as it shifts focus to shoulders. Keep core tight and back flat against the bench."
          },
          {
            id: "t3", name: "Dumbbell Flyes (flat bench)", sets: "3 x 12", rest: "60s",
            desc: "Lie flat holding dumbbells above chest, palms facing each other. With a slight bend in elbows, lower arms out to the sides in a wide arc until you feel a stretch in your chest. Squeeze chest to bring dumbbells back together.",
            tips: "Keep the elbow bend constant throughout. Don't go too heavy - this is an isolation move. Think of hugging a large tree trunk."
          },
          {
            id: "t4", name: "Triceps Rope Pushdowns", sets: "3 x 12", rest: "60s",
            desc: "Stand facing cable machine, grab rope attachment with both hands. Keep elbows pinned to your sides. Push the rope down by extending your forearms. At the bottom, split the rope apart slightly and squeeze triceps.",
            tips: "Don't let your elbows drift forward or use momentum. Keep your torso upright, don't lean over the cable. Slow and controlled on the way up."
          },
          {
            id: "t5", name: "Overhead Dumbbell Triceps Extension", sets: "3 x 12", rest: "60s",
            desc: "Hold one dumbbell with both hands behind your head, arms extended overhead. Lower the dumbbell behind your head by bending at the elbows. Extend back up by straightening your arms. Keep upper arms stationary and close to your ears.",
            tips: "Keep elbows pointing forward, not flaring out. Use a controlled tempo. If the weight feels unstable, try seated on a bench with back support."
          },
        ],
      },
      {
        name: "Core Circuit (2 rounds)",
        exercises: [
          {
            id: "t6", name: "Crunches", sets: "15 reps", rest: "-",
            desc: "Lie on your back, knees bent, feet flat. Place hands lightly behind your head (don't pull on your neck). Curl your upper back off the floor by contracting your abs. Lift only your shoulder blades, not your entire back.",
            tips: "Exhale as you crunch up, inhale going down. Focus on squeezing your abs, not pulling with your hands. Keep a fist-sized gap between chin and chest."
          },
          {
            id: "t7", name: "Plank Hold", sets: "30-45 sec", rest: "-",
            desc: "Get into a push-up position on your forearms. Keep your body in a perfectly straight line from head to heels. Engage your core, glutes, and quads. Look at the floor slightly ahead of your hands.",
            tips: "Don't let your hips sag or pike up. Breathe steadily. If 45 seconds is too hard, start with 20 seconds and build up. Squeeze your glutes to protect your lower back."
          },
          {
            id: "t8", name: "Bicycle Crunches", sets: "15 each side", rest: "-",
            desc: "Lie on your back, hands behind head, legs lifted with knees at 90 degrees. Bring right elbow toward left knee while extending right leg. Alternate sides in a pedaling motion. Rotate through your torso, not just your arms.",
            tips: "Move slowly and deliberately - this isn't about speed. Fully extend the straight leg. Keep lower back pressed into the floor."
          },
          {
            id: "t9", name: "Lying Leg Raises", sets: "12 reps", rest: "60s",
            desc: "Lie flat on your back, legs straight, hands under your glutes for support. Keeping legs straight, raise them until perpendicular to the floor. Lower slowly back down without letting feet touch the floor.",
            tips: "Keep lower back pressed into the floor throughout. If too difficult, bend knees slightly. Control the lowering phase - don't just drop your legs."
          },
        ],
      },
      {
        name: "Cardio Finisher (20 min)",
        exercises: [
          {
            id: "t10", name: "Stationary Bike - moderate pace", sets: "20 min", rest: "-",
            desc: "Adjust seat height so there's a slight bend in your knee at the bottom of each pedal stroke. Keep resistance moderate - you should be able to maintain conversation but feel challenged. Maintain 60-80 RPM.",
            tips: "Keep your back upright, don't hunch over. Stay hydrated. This is low-impact and great for your knees. If it feels too easy, increase resistance slightly."
          },
        ],
      },
    ],
  },
  Wednesday: {
    label: "Back, Biceps & Obliques",
    warmup: "5 min treadmill walk (incline 3-5%) + band pull-aparts",
    sections: [
      {
        name: "Strength Training",
        exercises: [
          {
            id: "w1", name: "Lat Pulldowns (wide grip)", sets: "3 x 10-12", rest: "60-90s",
            desc: "Sit at the lat pulldown machine, grip the bar wider than shoulder-width. Pull the bar down to your upper chest while squeezing your shoulder blades together. Lean back slightly (about 10-15 degrees). Slowly return to the top.",
            tips: "Always pull to the FRONT, never behind the neck. Don't use momentum to swing the weight down. Focus on pulling with your elbows, not your hands."
          },
          {
            id: "w2", name: "Seated Cable Rows", sets: "3 x 10-12", rest: "60-90s",
            desc: "Sit with feet on footrests, knees slightly bent. Grab the handle and sit upright. Pull the handle to your lower chest/upper abdomen, squeezing shoulder blades together at the end. Slowly extend arms back.",
            tips: "Keep your torso stationary - don't rock back and forth. Pull your shoulders back and down at the peak. Maintain a neutral spine throughout."
          },
          {
            id: "w3", name: "Single-Arm Dumbbell Row", sets: "3 x 10 each", rest: "60s",
            desc: "Place one knee and hand on a bench for support. Hold a dumbbell in the other hand, arm hanging straight. Pull the dumbbell up to your hip/lower ribcage, leading with your elbow. Lower with control.",
            tips: "Keep your back flat like a table. Don't rotate your torso to lift the weight. Think about driving your elbow toward the ceiling. Squeeze at the top for a second."
          },
          {
            id: "w4", name: "Dumbbell Bicep Curls", sets: "3 x 12", rest: "60s",
            desc: "Stand with dumbbells at your sides, palms facing forward. Curl the weights up by bending at the elbow while keeping upper arms stationary. Squeeze biceps at the top, then lower slowly.",
            tips: "Don't swing your body to lift the weight. Keep elbows pinned to your sides. Lower the weight slowly (2-3 seconds) - this eccentric phase builds muscle. Fully extend at the bottom."
          },
          {
            id: "w5", name: "Hammer Curls", sets: "3 x 12", rest: "60s",
            desc: "Stand holding dumbbells at your sides with palms facing each other (neutral grip). Curl up while maintaining the neutral grip. This targets your brachialis and forearms in addition to biceps.",
            tips: "Same rules as regular curls - no swinging, elbows pinned. You can alternate arms or curl both simultaneously. These build arm thickness and forearm strength."
          },
          {
            id: "w6", name: "Wrist Curls (forearm on thigh)", sets: "2 x 15", rest: "45s",
            desc: "Sit on a bench, rest your forearm on your thigh with wrist hanging over your knee, palm facing up. Hold a light dumbbell and curl your wrist up. Lower slowly. Switch hands.",
            tips: "Use light weight - forearm muscles are small. Full range of motion is important. You can also do reverse wrist curls (palm facing down) for complete forearm development."
          },
        ],
      },
      {
        name: "Oblique Circuit (2 rounds)",
        exercises: [
          {
            id: "w7", name: "Side Plank (each side)", sets: "20-30 sec", rest: "-",
            desc: "Lie on your side, prop yourself up on your forearm with elbow directly under shoulder. Lift your hips so your body forms a straight line from head to feet. Hold this position, keeping core engaged.",
            tips: "Don't let your hips drop. Stack your feet or stagger them for more stability. If too hard, drop your bottom knee to the floor. Breathe steadily."
          },
          {
            id: "w8", name: "Oblique Crunches", sets: "12 each side", rest: "-",
            desc: "Lie on your back, knees bent. Drop both knees to one side. With hands behind your head, crunch upward, focusing on the obliques on the opposite side. Complete all reps then switch sides.",
            tips: "The movement is small but powerful. Focus on feeling the contraction in your side abs. Don't pull on your neck."
          },
          {
            id: "w9", name: "Russian Twists (bodyweight)", sets: "15 each side", rest: "60s",
            desc: "Sit on the floor, knees bent, feet slightly off the ground (or on the floor for easier version). Lean back slightly to engage core. Rotate your torso side to side, touching the floor beside your hip each time.",
            tips: "Keep your chest lifted - don't round your back. Move with your whole torso, not just your arms. For more difficulty, hold a light weight or lift feet higher."
          },
        ],
      },
      {
        name: "Cardio Finisher (20 min)",
        exercises: [
          {
            id: "w10", name: "Elliptical - moderate resistance, steady pace", sets: "20 min", rest: "-",
            desc: "Step onto the elliptical, grip the moving handles. Set resistance to moderate (level 5-7). Maintain a smooth, steady stride. Push and pull the handles to engage your arms and chest.",
            tips: "Keep your posture upright, don't lean on the handles. This is low-impact and excellent for your knees. Vary resistance every 5 minutes to keep your body engaged."
          },
        ],
      },
    ],
  },
  Thursday: {
    label: "Steady Cardio + Core",
    warmup: "5 min easy cycling + dynamic leg stretches",
    sections: [
      {
        name: "Cardio Rotation (30 min)",
        exercises: [
          {
            id: "th1", name: "Incline Treadmill Walk (12%, 5.5-6 km/h)", sets: "10 min", rest: "-",
            desc: "Set treadmill to 12% incline and 5.5-6 km/h speed. Walk with a natural stride, arms swinging freely. This is one of the best fat-burning exercises available in any gym.",
            tips: "DO NOT hold the handles - this reduces calorie burn by 20-25%. If you must hold on, the incline is too steep. Lean slightly forward from your ankles."
          },
          {
            id: "th2", name: "Elliptical (moderate resistance)", sets: "10 min", rest: "-",
            desc: "Set resistance to moderate and maintain a steady rhythm. Use both the foot pedals and arm handles for a full-body cardio effect. Keep your stride smooth and controlled.",
            tips: "Stand upright, don't lean on the console. Keep your core engaged. You should be slightly breathless but able to hold a short conversation."
          },
          {
            id: "th3", name: "Stationary Bike (2 min mod / 1 min fast)", sets: "10 min", rest: "-",
            desc: "Alternate between 2 minutes at moderate effort and 1 minute at high effort. During the fast intervals, increase resistance and/or cadence. Recover during moderate periods.",
            tips: "During fast intervals, push hard but maintain proper form. Keep your core tight and don't bounce in the saddle. This interval pattern maximizes calorie burn."
          },
        ],
      },
      {
        name: "Core Session (3 rounds)",
        exercises: [
          {
            id: "th4", name: "Crunches", sets: "15 reps", rest: "-",
            desc: "Lie on your back, knees bent, feet flat. Hands lightly behind head. Curl shoulder blades off the floor by contracting your abs. Keep movement small and controlled.",
            tips: "Exhale as you crunch up. Don't pull on your neck. Pause and squeeze at the top for 1 second."
          },
          {
            id: "th5", name: "Plank Hold", sets: "30-45 sec", rest: "-",
            desc: "Forearm plank position: elbows under shoulders, body in a straight line from head to heels. Engage everything - core, glutes, quads. Look at the floor just ahead of your hands.",
            tips: "If hips start sagging, take a short rest rather than holding with bad form. Squeeze your glutes hard - this protects your lower back."
          },
          {
            id: "th6", name: "Reverse Crunches", sets: "12 reps", rest: "-",
            desc: "Lie on your back, hands beside you or under glutes. Bring knees toward your chest, then curl your hips off the floor by contracting your lower abs. Slowly lower back down.",
            tips: "This targets lower abs specifically. Use your abs to lift your hips, don't just swing your legs. Keep the movement slow and controlled."
          },
          {
            id: "th7", name: "Russian Twists", sets: "15 each side", rest: "60s",
            desc: "Sit with knees bent, lean back slightly, feet off the floor if possible. Rotate torso side to side, touching the floor beside each hip.",
            tips: "Keep chest lifted and spine long. Rotate through your midsection, not just your arms. Start without weight; add a light weight once you've mastered the form."
          },
        ],
      },
    ],
  },
  Friday: {
    label: "Quads, Calves & Shoulders",
    warmup: "5 min stationary bike + bodyweight squats + leg swings",
    sections: [
      {
        name: "Strength Training",
        exercises: [
          {
            id: "f1", name: "Goblet Squats (control depth for knees)", sets: "3 x 10-12", rest: "60-90s",
            desc: "Hold a dumbbell vertically at chest level with both hands. Stand shoulder-width apart. Push hips back and bend knees to squat down. Keep chest up and elbows between knees. Push through heels to stand.",
            tips: "Only go as deep as your knees allow without pain. Keep weight on your heels and midfoot. The goblet position naturally keeps your torso upright, reducing knee stress."
          },
          {
            id: "f2", name: "Leg Press (feet high & wide)", sets: "3 x 12", rest: "60-90s",
            desc: "Sit in the leg press machine, place feet high and wide on the platform. Release the safety handles and lower the platform by bending your knees toward your chest. Press back up without locking your knees at the top.",
            tips: "Feet placed high reduces knee stress. Don't let your lower back round off the seat at the bottom. Never fully lock your knees. Control the weight down slowly."
          },
          {
            id: "f3", name: "Leg Extensions (light, controlled)", sets: "3 x 12", rest: "60s",
            desc: "Sit on the leg extension machine, adjust pad so it rests on your lower shins. Extend your legs until straight, squeezing your quads at the top. Lower slowly with control.",
            tips: "Use lighter weight with slow, controlled reps. Don't kick the weight up or let it drop. This exercise can stress knees, so keep it light and focus on the squeeze at the top."
          },
          {
            id: "f4", name: "Standing Calf Raises", sets: "3 x 15", rest: "45s",
            desc: "Stand on the edge of a step or calf raise machine with heels hanging off. Rise up onto your toes as high as possible, squeezing your calves at the top. Lower slowly below the platform for a full stretch.",
            tips: "Full range of motion is key - go all the way up AND all the way down. Hold the top position for 1-2 seconds. Don't bounce. Calves respond well to higher reps and slow tempo."
          },
          {
            id: "f5", name: "Seated Dumbbell Shoulder Press", sets: "3 x 10-12", rest: "60-90s",
            desc: "Sit on a bench with back support, hold dumbbells at shoulder height with palms forward. Press both dumbbells overhead until arms are extended (don't lock elbows). Lower back to shoulder height with control.",
            tips: "Keep your back against the bench pad - don't arch excessively. Don't bring the dumbbells too low (stop at ear level). Press in a slight arc, not straight up."
          },
          {
            id: "f6", name: "Lateral Dumbbell Raises", sets: "3 x 12", rest: "60s",
            desc: "Stand with dumbbells at your sides. With a slight bend in your elbows, raise your arms out to the sides until they're parallel with the floor. Lead with your elbows, not your hands. Lower slowly.",
            tips: "Use lighter weight than you think you need. Don't shrug your shoulders up to your ears. Think of pouring water from a pitcher at the top of the movement. Control the descent."
          },
        ],
      },
      {
        name: "Core Circuit (2 rounds)",
        exercises: [
          {
            id: "f7", name: "Crunches", sets: "15 reps", rest: "-",
            desc: "Lie on your back, knees bent, hands behind head. Curl upper back off floor by squeezing abs. Lower with control.",
            tips: "Don't pull on your neck. Exhale as you crunch up. Small, controlled movement."
          },
          {
            id: "f8", name: "Plank Hold", sets: "30-45 sec", rest: "-",
            desc: "Forearm plank: body in a straight line, core and glutes engaged. Look at the floor ahead of your hands.",
            tips: "Don't let hips sag or pike up. Breathe steadily. Build up time gradually."
          },
          {
            id: "f9", name: "Bicycle Crunches", sets: "15 each side", rest: "-",
            desc: "Lie on back, hands behind head, legs lifted. Bring opposite elbow to opposite knee while extending the other leg. Alternate in a pedaling motion.",
            tips: "Rotate through your torso, not just elbows. Move slowly for maximum engagement. Keep lower back pressed to floor."
          },
          {
            id: "f10", name: "Lying Leg Raises", sets: "12 reps", rest: "60s",
            desc: "Lie flat, hands under glutes. Raise straight legs to 90 degrees, lower slowly without touching the floor.",
            tips: "Keep lower back pressed down. Bend knees slightly if it's too hard. Control the lowering phase."
          },
        ],
      },
      {
        name: "Cardio Finisher (20 min)",
        exercises: [
          {
            id: "f11", name: "Treadmill incline walk (10-12%, 5.5-6.5 km/h)", sets: "20 min", rest: "-",
            desc: "Set treadmill to steep incline (10-12%) and moderate speed. Walk naturally with arms swinging. This burns significantly more calories than flat walking and builds glute and hamstring strength.",
            tips: "Don't hold the handles! It defeats the purpose. If you can't walk without holding on, reduce the incline. Keep a tall posture, slight forward lean from ankles."
          },
        ],
      },
    ],
  },
  Saturday: {
    label: "Full Body Circuit + Cardio",
    warmup: "5 min elliptical + full body dynamic stretches",
    sections: [
      {
        name: "Full Body Circuit (3 rounds, light weights)",
        exercises: [
          {
            id: "s1", name: "Dumbbell Goblet Squats (light)", sets: "12 reps", rest: "15-20s",
            desc: "Hold light dumbbell at chest, squat down keeping chest up. This is a lighter version for the circuit - focus on form and speed, not weight.",
            tips: "Use 50-60% of your Friday squat weight. Move quickly between reps while keeping good form. The goal is to keep heart rate elevated."
          },
          {
            id: "s2", name: "Push-ups (knee if needed)", sets: "10-12 reps", rest: "15-20s",
            desc: "Standard push-up: hands slightly wider than shoulders, body straight. Lower chest toward floor, push back up. Use knee push-ups if standard is too difficult.",
            tips: "Keep your core tight and body straight. Don't flare elbows out to 90 degrees - keep them at 45 degrees. Quality over quantity."
          },
          {
            id: "s3", name: "Dumbbell Rows (each arm)", sets: "10 each", rest: "15-20s",
            desc: "Bent-over position, one hand on bench for support. Row dumbbell up to hip, squeezing upper back. Lower with control. Complete all reps on one side before switching.",
            tips: "Keep your back flat. Pull the weight to your hip, not your shoulder. Light weight, quick tempo for this circuit."
          },
          {
            id: "s4", name: "Dumbbell Shoulder Press (light)", sets: "10 reps", rest: "15-20s",
            desc: "Standing or seated, press light dumbbells from shoulder height to overhead. Keep core engaged throughout. Lower to shoulder height.",
            tips: "Use light weight for the circuit. Don't arch your back. Keep the tempo quick but controlled."
          },
          {
            id: "s5", name: "Dumbbell Romanian Deadlift (light)", sets: "12 reps", rest: "15-20s",
            desc: "Stand holding light dumbbells in front of thighs. Hinge at hips, pushing them back, lowering dumbbells along your legs until you feel a hamstring stretch. Return by driving hips forward.",
            tips: "Keep a slight bend in knees. Back stays flat throughout. Don't round your lower back. Feel the stretch in hamstrings, not back."
          },
          {
            id: "s6", name: "Plank Hold", sets: "30 sec", rest: "90s",
            desc: "Standard forearm plank to finish each round. Body straight, core and glutes engaged. This is your brief rest before the next round.",
            tips: "Focus on breathing. Use this as active recovery between intense circuit rounds."
          },
        ],
      },
      {
        name: "Cardio (20 min)",
        exercises: [
          {
            id: "s7", name: "Cycling (3 min moderate / 1 min fast x 5)", sets: "20 min", rest: "-",
            desc: "Alternate 3 minutes at comfortable pace (RPE 5-6) with 1 minute at high effort (RPE 8-9). Repeat 5 times for 20 minutes total. Adjust resistance for each interval.",
            tips: "The fast intervals should feel genuinely hard. The moderate intervals are recovery - don't stop pedaling. Keep your upper body relaxed during fast intervals."
          },
        ],
      },
    ],
  },
  Sunday: {
    label: "Cardio, Hamstrings & Glutes",
    warmup: "5 min treadmill walk + hip circles + glute activation band walks",
    sections: [
      {
        name: "Cardio Block (20-25 min)",
        exercises: [
          {
            id: "su1", name: "Elliptical intervals (2 min mod / 1 min high x 7-8)", sets: "20-25 min", rest: "-",
            desc: "Alternate 2 minutes moderate resistance with 1 minute high resistance/fast pace. Repeat 7-8 times. Use both handles for full-body engagement.",
            tips: "The high intervals should push you to RPE 8 (hard to talk). Recover during moderate intervals. Keep posture upright throughout."
          },
        ],
      },
      {
        name: "Strength Training",
        exercises: [
          {
            id: "su2", name: "Lying Hamstring Curls", sets: "3 x 12", rest: "60s",
            desc: "Lie face down on the hamstring curl machine. Adjust the pad so it sits just above your heels. Curl your heels toward your glutes, squeezing hamstrings at the top. Lower slowly.",
            tips: "Don't lift your hips off the bench. Use full range of motion. Slow the eccentric (lowering) phase to 2-3 seconds for better results."
          },
          {
            id: "su3", name: "Glute Bridges (barbell or bodyweight)", sets: "3 x 15", rest: "60s",
            desc: "Lie on your back, knees bent, feet flat on floor hip-width apart. Drive through your heels to lift your hips until your body forms a straight line from shoulders to knees. Squeeze glutes hard at the top. Lower with control.",
            tips: "Push through your HEELS, not toes. Squeeze glutes for 2 seconds at the top. Don't hyperextend your lower back. For progression, place a barbell across your hips."
          },
          {
            id: "su4", name: "Romanian Deadlift (dumbbell, light)", sets: "3 x 10", rest: "60-90s",
            desc: "Stand holding dumbbells in front of thighs. With slight knee bend, hinge at your hips and push them back. Lower dumbbells along your legs until you feel a deep hamstring stretch. Drive hips forward to return.",
            tips: "Keep the dumbbells close to your body throughout. Your back must stay flat - never round it. Feel the stretch in your hamstrings, not your lower back. Hinge from hips, not waist."
          },
          {
            id: "su5", name: "Hip Thrusts (bench)", sets: "3 x 12", rest: "60s",
            desc: "Sit on the floor with upper back against a bench. Roll a barbell over your hips (or use bodyweight). Feet flat, shoulder-width. Drive hips upward until your thighs are parallel to the floor. Squeeze glutes at the top.",
            tips: "Look forward, not up, to keep a neutral neck position. Keep your chin tucked. Drive through heels. The top of the movement should look like a tabletop from shoulders to knees."
          },
        ],
      },
      {
        name: "Oblique Circuit (2 rounds)",
        exercises: [
          {
            id: "su6", name: "Side Plank (each side)", sets: "20-30 sec", rest: "-",
            desc: "Lie on your side, forearm on the floor with elbow under shoulder. Lift hips to create a straight line. Hold steady.",
            tips: "Keep hips lifted and stacked. Drop bottom knee for an easier modification. Switch sides."
          },
          {
            id: "su7", name: "Oblique Crunches", sets: "12 each side", rest: "-",
            desc: "Lie on your back, knees dropped to one side. Crunch upward, targeting the opposite-side obliques. Complete all reps, then switch.",
            tips: "Small, focused movement. Feel the squeeze in your side abs. Don't rush."
          },
          {
            id: "su8", name: "Russian Twists (bodyweight)", sets: "15 each side", rest: "60s",
            desc: "Sit with knees bent, lean back, rotate torso to touch the floor on each side.",
            tips: "Keep chest lifted. Feet off floor for extra challenge. Control the rotation through your core."
          },
        ],
      },
    ],
  },
  Monday: {
    label: "Rest & Recovery",
    warmup: "",
    sections: [
      {
        name: "Recovery Activities",
        exercises: [
          {
            id: "m1", name: "Light walk or yoga stretching", sets: "10-15 min", rest: "-",
            desc: "Gentle walking outdoors or a basic yoga flow. Focus on opening hips, stretching hamstrings, and loosening the upper back. No intensity - this is pure recovery.",
            tips: "Try Child's Pose, Cat-Cow, Downward Dog, and Pigeon Pose. Hold each stretch for 30-60 seconds. Breathe deeply throughout."
          },
          {
            id: "m2", name: "Foam rolling (quads, back, calves)", sets: "10 min", rest: "-",
            desc: "Use a foam roller on your quads, IT band, calves, upper back, and lats. Roll slowly over each muscle group for 30-60 seconds. Pause on any tight spots.",
            tips: "Roll slowly - don't rush. When you find a tender spot, stay on it for 20-30 seconds. Avoid rolling directly on your lower back or joints."
          },
          {
            id: "m3", name: "Hydration: 3-4 liters water", sets: "All day", rest: "-",
            desc: "Drink 3-4 liters of water spread throughout the day. This aids muscle recovery, reduces soreness, and helps with weight loss by supporting metabolism.",
            tips: "Start your day with 500ml of water before anything else. Keep a water bottle with you. Herbal tea counts. Reduce caffeine intake after 2 PM for better sleep."
          },
          {
            id: "m4", name: "Sleep: 7-8 hours", sets: "Night", rest: "-",
            desc: "Quality sleep is when your muscles actually repair and grow. Growth hormone is released during deep sleep. Aim for 7-8 hours of uninterrupted sleep.",
            tips: "No screens 30 min before bed. Keep your room cool and dark. Consistent sleep/wake times improve quality. Avoid heavy meals 2 hours before bed."
          },
        ],
      },
    ],
  },
};

// Default meal plan structure - empty for all 7 days
export const DEFAULT_MEAL_PLAN = {
  Tuesday: { meals: [] },
  Wednesday: { meals: [] },
  Thursday: { meals: [] },
  Friday: { meals: [] },
  Saturday: { meals: [] },
  Sunday: { meals: [] },
  Monday: { meals: [] },
};

// Sample meal plan with Indian vegetarian meals
export const SAMPLE_MEAL_PLAN = {
  Tuesday: {
    meals: [
      {
        id: 'meal_t1',
        time: '7:00 AM',
        name: 'Oats with Banana & Almonds',
        ingredients: 'Rolled oats (50g), 1 banana, 10 almonds, honey (1 tsp), milk (200ml)',
        calories: '380',
        prep: 'Cook oats in milk for 3-4 minutes. Top with sliced banana, crushed almonds, and a drizzle of honey.',
      },
      {
        id: 'meal_t2',
        time: '10:00 AM',
        name: 'Greek Yogurt & Mixed Fruits',
        ingredients: 'Greek yogurt (150g), mixed berries (100g), chia seeds (1 tsp)',
        calories: '180',
        prep: 'Mix yogurt with chia seeds. Top with fresh berries. Can be prepped night before.',
      },
      {
        id: 'meal_t3',
        time: '1:00 PM',
        name: 'Paneer Tikka Wrap',
        ingredients: 'Whole wheat roti (2), paneer tikka (150g), onion, capsicum, mint chutney, salad',
        calories: '520',
        prep: 'Grill marinated paneer with veggies. Wrap in roti with chutney and salad greens.',
      },
      {
        id: 'meal_t4',
        time: '4:30 PM',
        name: 'Protein Smoothie',
        ingredients: 'Banana (1), peanut butter (1 tbsp), milk (250ml), protein powder (1 scoop optional)',
        calories: '280',
        prep: 'Blend all ingredients until smooth. Add ice for thickness.',
      },
      {
        id: 'meal_t5',
        time: '8:00 PM',
        name: 'Dal Tadka with Brown Rice',
        ingredients: 'Toor dal (1 cup), brown rice (1 cup), vegetables, ghee (1 tsp), salad',
        calories: '450',
        prep: 'Cook dal with turmeric. Prepare tadka with cumin, garlic, tomatoes. Serve with brown rice and side salad.',
      },
    ],
  },
  Wednesday: {
    meals: [
      {
        id: 'meal_w1',
        time: '7:00 AM',
        name: 'Moong Dal Cheela',
        ingredients: 'Moong dal batter (1 cup), onion, tomato, green chili, curd (100g)',
        calories: '320',
        prep: 'Soak and grind moong dal. Make thin crepes with chopped veggies. Serve with curd.',
      },
      {
        id: 'meal_w2',
        time: '10:00 AM',
        name: 'Handful of Nuts + Apple',
        ingredients: 'Mixed nuts (20g), 1 apple',
        calories: '200',
        prep: 'No cooking needed. Carry as a portable snack.',
      },
      {
        id: 'meal_w3',
        time: '1:00 PM',
        name: 'Rajma Chawal',
        ingredients: 'Rajma (1 cup cooked), brown rice (1 cup), onion salad, curd',
        calories: '480',
        prep: 'Pressure cook rajma with spices. Serve with brown rice, onion-tomato salad, and a bowl of curd.',
      },
      {
        id: 'meal_w4',
        time: '4:30 PM',
        name: 'Sprouts Chaat',
        ingredients: 'Mixed sprouts (1 cup), onion, tomato, lemon, chaat masala',
        calories: '150',
        prep: 'Steam or boil sprouts. Mix with diced onion, tomato, lemon juice, and chaat masala.',
      },
      {
        id: 'meal_w5',
        time: '8:00 PM',
        name: 'Grilled Paneer with Veggies',
        ingredients: 'Paneer (150g), bell peppers, zucchini, olive oil, roti (1)',
        calories: '420',
        prep: 'Marinate paneer in spices. Grill with vegetables. Serve with one roti.',
      },
    ],
  },
  Thursday: { meals: [] },
  Friday: { meals: [] },
  Saturday: { meals: [] },
  Sunday: { meals: [] },
  Monday: { meals: [] },
};

export const EMPTY_MEAL_PLAN = {
  Tuesday: { meals: [] },
  Wednesday: { meals: [] },
  Thursday: { meals: [] },
  Friday: { meals: [] },
  Saturday: { meals: [] },
  Sunday: { meals: [] },
  Monday: { meals: [] },
};
