/* --------------------------------------------------------------------------
 * Projects catalog - Class 9 (PRD §19.2)
 *
 * Frontend-only typed data consumed by the projects list + workspace pages.
 * Each project has exactly 4 guided sections (problem, data, approach, result)
 * with rich prompts, optional hints, and example answers to inspire students.
 * ------------------------------------------------------------------------ */

export type ProjectSection = {
  id: "problem" | "data" | "approach" | "result";
  title: string;
  prompt: string;
  hint?: string;
  example?: string;
};

export type ProjectDef = {
  slug: string;
  title: string;
  shortDescription: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "guided" | "semi-guided" | "open-ended";
  estMinutes: number;
  emoji: string;
  accent: "coral" | "mint" | "yellow" | "lav" | "sky" | "peach";
  conceptsApplied: string[];
  sections: ProjectSection[];
  deliverables: string[];
};

export const PROJECTS: ProjectDef[] = [
  {
    slug: "ai-project-pitch",
    title: "AI Project Pitch",
    shortDescription:
      "Spot a real problem around you and draft a one-page AI pitch that could actually solve it.",
    difficulty: "beginner",
    type: "guided",
    estMinutes: 45,
    emoji: "\u{1F4A1}",
    accent: "yellow",
    conceptsApplied: [
      "AI project cycle",
      "Problem scoping",
      "Stakeholders",
      "Success metrics",
    ],
    deliverables: [
      "A clear one-line problem statement",
      "A named target user (who benefits)",
      "A measurable goal for your AI",
      "3 risks or things that could go wrong",
    ],
    sections: [
      {
        id: "problem",
        title: "The Problem",
        prompt:
          "What everyday problem will your AI solve? Who has this problem, and why does it matter? Write it as if you were pitching to your principal.",
        hint: "Be specific about the user. 'Students forgetting homework' is stronger than 'education is hard'.",
        example:
          "Many Class 9 students in our school forget to bring the right textbook because the timetable changes every week. This wastes 10 minutes every morning and stresses parents. An AI reminder could check tomorrow's timetable and notify the student what books to pack.",
      },
      {
        id: "data",
        title: "The Data",
        prompt:
          "What data would your AI need to learn from? Where would you collect it, and how would you label it? List at least 3 data sources.",
        hint: "Think about both the inputs (what the AI sees) and the labels (the correct answers it should learn).",
        example:
          "I'd need (1) the weekly school timetable (from the school office), (2) which books each subject uses (from the textbook list), and (3) a record of which books students usually forget (a quick Google Form survey of 20 classmates). The label is simply the list of books needed for tomorrow.",
      },
      {
        id: "approach",
        title: "The Approach",
        prompt:
          "How would your AI work, step by step? Describe what it takes in, what it does, and what it returns. You don't have to code it - just explain the idea.",
        hint: "Use the AI project cycle: input -> process -> output. Keep it simple enough for a classmate to follow.",
        example:
          "Every night at 8pm the app reads tomorrow's timetable, looks up which books each subject needs, and sends a WhatsApp-style reminder: 'Pack: Maths, Science, Hindi'. If the student marks 'packed', we save that for the next day. Over time it learns which reminders actually get used.",
      },
      {
        id: "result",
        title: "The Result",
        prompt:
          "How will you know if your AI worked? What would 'success' look like after 1 month? Name one number you could measure.",
        hint: "A good success metric is specific and countable. 'Fewer forgotten books' is vague - 'less than 2 forgotten books per week' is measurable.",
        example:
          "Success means students in my class forget their books less than 2 times per month (down from about 8 right now). I'd also ask 10 classmates if they find the reminder helpful on a 1-5 scale. If the average is above 4, we scale it to the next class.",
      },
    ],
  },
  {
    slug: "data-story",
    title: "Data Story",
    shortDescription:
      "Collect a tiny dataset from the world around you, draw a simple chart, and tell the story hidden inside the numbers.",
    difficulty: "beginner",
    type: "semi-guided",
    estMinutes: 60,
    emoji: "\u{1F4CA}",
    accent: "mint",
    conceptsApplied: [
      "Data collection",
      "Data visualization",
      "Averages & outliers",
      "Insights",
    ],
    deliverables: [
      "A dataset with at least 15 rows (table or list)",
      "One chart (bar, line, or scatter) drawn by hand or in a tool",
      "Two insights you found in the data",
      "One question the data couldn't answer",
    ],
    sections: [
      {
        id: "problem",
        title: "The Question",
        prompt:
          "What is the one question you want your data to answer? Frame it so the answer could be a number or a comparison.",
        hint: "Questions that begin with 'how much', 'how often', or 'which is more' work best.",
        example:
          "How much screen time do Class 9 students in my neighbourhood get on school days compared to weekends? I suspect weekend use is much higher, but I want the data to prove or disprove it.",
      },
      {
        id: "data",
        title: "Collecting the Data",
        prompt:
          "How did you collect your data? Describe the source, the sample size, and one bias you noticed. Paste or describe the first 5 rows.",
        hint: "Every dataset has bias. Mention who you left out - for example, only asking friends may skew results.",
        example:
          "I asked 18 classmates to write their daily screen time in hours for 3 days each (Fri, Sat, Sun). Bias: I only surveyed students in my tuition batch, so everyone already has a smartphone. First rows: [Aditi, Fri, 2.5h], [Rohan, Fri, 1h], [Meera, Fri, 3h], [Kabir, Sat, 5h], [Priya, Sat, 4h].",
      },
      {
        id: "approach",
        title: "Visualizing the Data",
        prompt:
          "What chart did you draw and why? What does the x-axis mean, what does the y-axis mean, and what does the shape of the chart tell you?",
        hint: "Match the chart to the question: bar charts compare groups, line charts show change over time, scatter plots show relationships.",
        example:
          "I drew a bar chart with two bars per student: one for school-day average, one for weekend average. The weekend bar is taller for 15 out of 18 students - the shape is clearly skewed toward weekends. I used different colours so my little sister could read it.",
      },
      {
        id: "result",
        title: "The Story",
        prompt:
          "What are the two most interesting things your data revealed? Was there an outlier? What new question do you now want to investigate?",
        hint: "A good insight surprises you a little. If your chart confirmed exactly what you expected, look again for outliers.",
        example:
          "Insight 1: Weekend screen time is on average 2.4x school-day time. Insight 2: One classmate had almost the same screen time every day - he plays competitive games daily. New question: does screen time drop during exam weeks? I want to repeat this during the next unit test.",
      },
    ],
  },
  {
    slug: "first-ml-experiment",
    title: "My First ML Experiment",
    shortDescription:
      "Design a supervised learning task from scratch: pick a prediction, choose features and labels, and describe how you'd train it.",
    difficulty: "intermediate",
    type: "guided",
    estMinutes: 50,
    emoji: "\u{1F9EA}",
    accent: "sky",
    conceptsApplied: [
      "Supervised learning",
      "Features & labels",
      "Train/test split",
      "Prediction",
    ],
    deliverables: [
      "A clear prediction task (input -> output)",
      "List of 4+ features with data types",
      "A label definition",
      "A plan for evaluating accuracy",
    ],
    sections: [
      {
        id: "problem",
        title: "The Task",
        prompt:
          "What is your AI predicting? Write it as a function: given ___, predict ___. Pick something where you could realistically collect 30+ examples.",
        hint: "Classic beginner picks: movie recommendations, will it rain tomorrow, will this student pass the test, which friend posted this WhatsApp message.",
        example:
          "Given the weather today (temperature, humidity, cloud cover, wind) and yesterday's weather, predict whether it will rain tomorrow (yes/no). I picked this because my city has heavy monsoons and we plan cricket matches around it.",
      },
      {
        id: "data",
        title: "Features & Labels",
        prompt:
          "List 4 or more features your model would use. For each, say whether it's a number, a category, or a yes/no. Then define the label - what is the 'correct answer' for each row?",
        hint: "Features are what the AI SEES. The label is what the AI should OUTPUT. If you can't measure a feature easily, replace it.",
        example:
          "Features: (1) temperature in Celsius - number, (2) humidity % - number, (3) cloud cover level - category (clear/partly/overcast), (4) wind speed km/h - number, (5) rained yesterday? - yes/no. Label: 'did it rain at least 2mm the next day?' - yes/no. I'd collect data from IMD's website for the last 60 days.",
      },
      {
        id: "approach",
        title: "The Model",
        prompt:
          "Which simple algorithm would you use and why? How would you split your data into training and test sets, and how would you avoid cheating?",
        hint: "K-Nearest Neighbors and decision trees are both great for beginners. For train/test, never peek at the test set while tuning.",
        example:
          "I'd use K-Nearest Neighbors with K=5 because it's easy to visualize: 'find the 5 most similar past days, and vote'. I'd take 60 days of data, randomly pick 12 for testing (20%) and 48 for training. I'd lock the test set in a separate file so I don't accidentally look at it.",
      },
      {
        id: "result",
        title: "Measuring Success",
        prompt:
          "How will you check if the model is good? What accuracy would you consider 'better than guessing', and what confusion could the model still make?",
        hint: "Always compare to a baseline. If it rains 30% of the time, a model that always says 'no rain' is already 70% accurate - so your bar must be higher.",
        example:
          "Baseline: 'always say no rain' gives 68% accuracy (it rains about 1 in 3 days). My goal is >80% accuracy on the test set. The worst mistake would be predicting 'no rain' on a day that actually floods the ground - false negatives cost us a cancelled match. I'd look at the confusion matrix to check both error types.",
      },
    ],
  },
  {
    slug: "neural-network-story",
    title: "My Neural Network Story",
    shortDescription:
      "Write a short story where neurons, weights, and backpropagation are characters learning together.",
    difficulty: "intermediate",
    type: "semi-guided",
    estMinutes: 40,
    emoji: "\u{1F9E0}",
    accent: "lav",
    conceptsApplied: [
      "Neurons & layers",
      "Weights & biases",
      "Forward pass",
      "Backpropagation",
    ],
    deliverables: [
      "A story with 3+ named characters representing neurons",
      "A clear 'learning moment' where a weight is adjusted",
      "One analogy for backpropagation",
      "A one-line summary of what the network learned",
    ],
    sections: [
      {
        id: "problem",
        title: "The Setting",
        prompt:
          "Where does your story take place and what is the neural network trying to learn? Give your network a fun purpose - not just 'classify digits'.",
        hint: "Think of a scenario your class could relate to: a cricket team, a tiffin-guessing game, a dance crew.",
        example:
          "In Saraswati Vidyalaya, the canteen uncle can never remember which tiffin belongs to which student. The students build a tiny neural network called 'TiffinBot' that looks at three clues - tiffin colour, favourite subject, and time of arrival - and guesses the owner's name.",
      },
      {
        id: "data",
        title: "The Characters",
        prompt:
          "Who are your neurons? Give at least 3 named characters from the input, hidden, and output layers. What does each 'see' or 'decide'?",
        hint: "Don't forget a bias - the 'attitude' of a neuron. It's allowed to be grumpy or optimistic.",
        example:
          "Input layer: Rangu (sees the tiffin colour), Subju (sees the subject), Tempu (sees the arrival time). Hidden layer: Mixy (combines Rangu and Tempu), Clue (combines Subju and Tempu). Output layer: Naamu the Namer who shouts a student's name. Each neuron also has a tiny bias coach on its shoulder whispering 'lean yes' or 'lean no'.",
      },
      {
        id: "approach",
        title: "The Learning Moment",
        prompt:
          "Show one round where the network makes a mistake and learns. Describe the forward pass, the wrong answer, and how backpropagation changes a weight.",
        hint: "Backpropagation is like the blame travelling backwards: 'you listened to me too much, trust me a bit less next time'.",
        example:
          "Round 1: Rangu sees pink, Subju sees Maths, Tempu sees 11:02. Signals flow forward. Mixy adds them, Naamu shouts 'PRIYA!' - but it was actually Aarti's tiffin. Naamu looks sad. The error travels backwards: 'Mixy, you trusted Rangu too much on pink - reduce that weight by 0.1. Clue, you were almost right - nudge up by 0.05.' Next round, on the same clues, Naamu whispers 'AARTI' correctly.",
      },
      {
        id: "result",
        title: "The Ending",
        prompt:
          "After many rounds of learning, what can your neural network do reliably? What surprised the characters, and what is the one-line moral of the story?",
        hint: "A good ending shows the network doing something it COULDN'T do at the start.",
        example:
          "After 200 rounds, TiffinBot guesses correctly 9 out of 10 times - even on rainy days when students wear jumpers over their tiffin bags. The surprise: Naamu learned that arrival time mattered more than colour. Moral: small nudges to many weights, repeated kindly, beat one big guess.",
      },
    ],
  },
  {
    slug: "ai-for-india",
    title: "AI for India Proposal",
    shortDescription:
      "Design an AI solution for a problem that Indians face every day - from farming to traffic to healthcare.",
    difficulty: "advanced",
    type: "open-ended",
    estMinutes: 75,
    emoji: "\u{1F1EE}\u{1F1F3}",
    accent: "coral",
    conceptsApplied: [
      "AI applications",
      "Ethics & fairness",
      "Social impact",
      "Feasibility",
    ],
    deliverables: [
      "A named target problem specific to an Indian context",
      "A feasible data + model plan",
      "A fairness & ethics check",
      "A rollout plan for the first 100 users",
    ],
    sections: [
      {
        id: "problem",
        title: "The Indian Problem",
        prompt:
          "Which Indian problem will your AI tackle? Be specific - 'traffic in Bangalore' is better than 'traffic'. Who suffers from it today, and what makes it hard to solve?",
        hint: "Pick a problem you've actually seen. Local beats global. Name a city, a village, or a specific community.",
        example:
          "Small tomato farmers in Kolar district lose up to 30% of their crop because they can't spot early blight on leaves until it spreads. Agriculture officers visit only once a month, and Google search results are in English. The problem is hard because most farmers have a basic smartphone, not a laptop, and only Kannada voice.",
      },
      {
        id: "data",
        title: "Data & Feasibility",
        prompt:
          "What data would your AI need? Where could a student or NGO realistically collect it in India? What languages, devices, and internet limits must you respect?",
        hint: "Indian data often isn't on the internet yet. Mention who could help collect it - KVKs, ASHA workers, local schools, NGOs.",
        example:
          "I'd need 2000+ photos of tomato leaves (healthy, early blight, late blight) labelled by a plant scientist. UAS Bangalore already runs farmer camps - I'd partner with them to collect images on Rs 5000 Android phones during one season. The app must work offline (2G zones are common) and support Kannada voice instructions.",
      },
      {
        id: "approach",
        title: "The AI Approach",
        prompt:
          "Sketch how the AI works end to end. Which type of ML, which features, and how does the user actually interact with it on a cheap phone?",
        hint: "Complexity is not a virtue. If a simple decision tree works, use it.",
        example:
          "A small image classifier (like MobileNet fine-tuned) runs directly on the phone - no server, no internet. The farmer opens the app, tapes 1 photo of a leaf, and hears: 'Jaagrut: Early blight spotted. Spray neem oil tonight.' A simple decision tree then asks 3 follow-up questions (last spray date, rainfall) to personalise advice. Model size: under 5 MB so it installs on a Rs 5000 phone.",
      },
      {
        id: "result",
        title: "Ethics & Impact",
        prompt:
          "Who could be harmed or left out by your AI? What would you measure to know it's actually helping - and what's your plan to reach your first 100 real users?",
        hint: "An AI for India must think about language, caste, gender, literacy, and phone access. 'It works on my phone' is not enough.",
        example:
          "Risk 1: if our training photos come only from Karnataka, the model may fail on Maharashtra tomatoes - so we label the training set and warn users outside Karnataka. Risk 2: women farmers are often not the phone owner - we add a WhatsApp fallback so the AI message can be forwarded. Success = 70% of our first 100 farmers saving at least 1 crop loss per season. Rollout: partner with 2 KVK centres, train 10 youth volunteers, door-to-door demos in 4 villages.",
      },
    ],
  },
];

export function getProjectBySlug(slug: string): ProjectDef | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
