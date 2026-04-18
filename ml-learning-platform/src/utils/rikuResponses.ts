/* --------------------------------------------------------------------------
 * rikuResponses - rule-based intent matcher + response generator for Riku.
 *
 * Pure TypeScript (no React). Responses are keyword-matched against a small
 * intent set, with a lightweight topic dictionary for "what is X?" style
 * questions covering ~20 ML concepts. Every generic intent has multiple
 * variants; one is picked via Math.random() so Riku feels less robotic.
 * ------------------------------------------------------------------------ */

export type RikuIntent =
  | "greeting"
  | "whatis"
  | "howto"
  | "recommend"
  | "thanks"
  | "progress"
  | "motivation"
  | "joke"
  | "help"
  | "unknown";

export type RikuContext = {
  level?: number;
  totalLessons?: number;
  streak?: number;
  currentLesson?: string;
};

export type RikuResponse = {
  intent: RikuIntent;
  text: string;
  suggestions?: string[];
};

/* --------------------------------------------------------------------------
 * Starter suggestions shown in the empty chat state
 * ------------------------------------------------------------------------ */

export const STARTER_SUGGESTIONS: string[] = [
  "What is a neural network?",
  "How do I start learning?",
  "How am I doing?",
  "Tell me a joke",
];

/* --------------------------------------------------------------------------
 * Topic dictionary - kid-friendly, 2-3 sentences, under ~200 chars each.
 * ------------------------------------------------------------------------ */

const TOPIC_EXPLANATIONS: Record<string, string[]> = {
  "neural network": [
    "A neural network is like a team of tiny decision-makers stacked in layers 🧠. Each one passes a number to the next until the last layer shouts out the answer. Inspired by brain neurons!",
    "Think of it as a big relay race 🏃‍♂️ - info starts at the input, zooms through hidden layers, and crosses the finish line as a prediction. More layers = deeper brain!",
  ],
  "knn": [
    "KNN (K-Nearest Neighbors) is the 'ask your friends' algorithm 🫂. To classify something, it looks at the K closest examples and picks whatever most of them are. Super lazy, super effective!",
    "K-Nearest Neighbors finds the K closest data points to your new sample and votes. If 3 out of 5 neighbors are cats, it's a cat 🐱. Zero training needed!",
  ],
  "kmeans": [
    "K-Means is a clustering trick 🎯 - you pick K groups, and it shuffles points around until each one sits with its closest group center. Great for finding hidden teams in data!",
    "K-Means clusters data into K groups by finding K 'centers' and assigning each point to the nearest one. Then it recalculates centers and repeats until everyone's happy 💡.",
  ],
  "backpropagation": [
    "Backprop is how a neural net learns from mistakes 🔁. It compares its guess to the right answer, then walks backwards through the layers tweaking weights to be slightly less wrong next time.",
    "Backpropagation = blame spreading 😄. The network figures out which weights caused the error and nudges them. Do it a million times and boom - it's learned!",
  ],
  "ai": [
    "AI means making machines do things that usually need human smarts - like recognising faces, translating languages, or playing chess 🤖. ML is just one way to build AI.",
    "Artificial Intelligence is the big umbrella ☂️. Anything where a computer acts 'smart' counts - from spam filters to self-driving cars. ML is AI that learns from data!",
  ],
  "ml": [
    "Machine Learning is teaching computers by showing them loads of examples instead of writing rules 📚. Show it 10,000 cat pics and it figures out what 'cat' means on its own!",
    "ML = learning from data 🔥. Instead of programming every rule, you feed the computer examples and let it spot the patterns. That's the whole trick!",
  ],
  "supervised": [
    "Supervised learning is studying with an answer key 📝. Every training example comes labelled - 'this is a dog', 'this is a cat' - and the model learns to match inputs to labels.",
    "In supervised learning you give the model both the question AND the correct answer. It figures out the pattern between them so it can answer new questions later 💡.",
  ],
  "unsupervised": [
    "Unsupervised learning has no answer key 🕵️. The model just looks at raw data and finds patterns on its own - grouping similar things, spotting weird outliers, that kinda stuff.",
    "No labels, no teacher - just data. Unsupervised learning hunts for hidden structure, like sorting songs into genres without being told what genres exist 🎵.",
  ],
  "cnn": [
    "CNN (Convolutional Neural Network) is the image-whisperer 👁️. It slides tiny filters over a picture to spot edges, shapes, and eventually whole objects. Best friend of computer vision!",
    "CNNs are neural nets built for pictures 📷. They use little sliding windows called filters to detect patterns at every spot, which is why they crush image classification tasks.",
  ],
  "perceptron": [
    "The perceptron is the grandpa of neural nets 👴. It takes inputs, multiplies each by a weight, adds them up, and fires '1' if the total crosses a threshold. Simple but legendary!",
    "A perceptron is one single neuron. Inputs × weights → sum → activation → output. Stack lots of them together and you've got a full neural network 🧠.",
  ],
  "gradient descent": [
    "Gradient descent is how models find the best weights 🎿. Imagine sliding down a hill - you always step in the direction that goes downhill the most, until you hit the bottom (low error).",
    "It's an error-minimising ski trip 🏔️. Gradient descent looks at which way the loss is decreasing fastest and nudges the weights that direction. Repeat forever!",
  ],
  "overfitting": [
    "Overfitting is when your model memorises the training data too hard 📚. It aces practice tests but flops in the real world. Kinda like cramming answers without understanding 😅.",
    "Overfit = too cozy with training data. The model learns the noise, not the pattern, so new inputs confuse it. Fix: more data, simpler model, or regularisation 🛡️.",
  ],
  "activation": [
    "An activation function decides if a neuron should 'fire' or stay quiet ⚡. Popular picks: ReLU (keep positives, kill negatives), sigmoid (squish to 0-1), and tanh (squish to -1 to 1).",
    "Activations add the spice 🌶️ - without them, a deep network is just one big linear equation. ReLU is the crowd favourite because it's fast and works great.",
  ],
  "bias": [
    "In ML, a bias is an extra number added to a neuron so it can shift its output up or down 📊. Think of it as the 'y-intercept' for a neuron - lets it fit data that doesn't pass through zero.",
    "Bias = a tunable offset. Weights scale the inputs, bias shifts the whole thing. Together they let neurons fit way more patterns 💡.",
  ],
  "data": [
    "Data is anything a computer can measure or store 📊 - numbers, text, images, sounds, clicks. In ML, data is the fuel. Good data = smart model, junk data = junk model.",
    "Data is just recorded observations. The more examples you have, the better a model can learn patterns from them. 'Garbage in, garbage out' is basically ML law 🔥.",
  ],
  "algorithm": [
    "An algorithm is a step-by-step recipe the computer follows 📜. Sorting numbers, finding shortest routes, training a model - all algorithms. ML algorithms are recipes that learn from examples!",
    "Think of an algorithm like a cooking recipe for a computer 🍳. Clear steps, clear ingredients, clear result. ML just adds 'taste it and adjust' to every step.",
  ],
  "feature": [
    "A feature is one property of your data 📏 - like the height of a person, or the colour of a pixel. Models mash features together to make predictions.",
    "Features are the clues 🔍 your model uses. For predicting house price, features might be size, location, number of rooms. Better features = better predictions!",
  ],
  "label": [
    "A label is the correct answer for a training example 🏷️. In 'cat vs dog', the label tells the model 'this pic is a cat'. Supervised learning needs labels; unsupervised doesn't.",
    "Labels are the 'right answers' you want your model to predict. They're how supervised learning knows when it's wrong and needs to adjust 📝.",
  ],
  "prediction": [
    "A prediction is the model's guess 🎯 for a new input it hasn't seen before. 'Will this email be spam?' 'Is this tumour dangerous?' - predictions are where ML earns its keep!",
    "Predictions are what models produce after training. Feed in new data, get out an answer 💡. The whole point of building a model is to make useful predictions later.",
  ],
  "weight": [
    "Weights are the 'importance knobs' inside a neural network 🎛️. Each connection has one, and training tweaks all of them until the network makes good predictions.",
    "Weights decide how much each input matters. Big weight = strong influence, small weight = meh. Training is basically 'find the right weights' 🔥.",
  ],
  "learning rate": [
    "Learning rate is how big a step your model takes when updating weights 👟. Too small = snail pace. Too big = it overshoots and goes wild. Goldilocks zone needed!",
    "It's the step size for gradient descent. A tiny learning rate learns slowly but safely; a huge one bounces around and never settles. Tuning it is a classic ML puzzle 🧩.",
  ],
  "loss": [
    "Loss is a number that says 'how wrong was the model?' 📉. Training's whole goal is to shrink loss. Low loss = good predictions, high loss = back to the drawing board.",
    "The loss function measures error. Every training step, the model tries to make loss smaller. It's the scoreboard the optimizer is watching 💡.",
  ],
};

/* --------------------------------------------------------------------------
 * Generic intent variants
 * ------------------------------------------------------------------------ */

const GREETINGS: string[] = [
  "Hey there! 🐼 I'm Riku. Ready to nerd out about AI together?",
  "Namaste yaar! 🐼 Riku here. What's on your mind today?",
  "Heyyy! 🔥 Glad you popped in. Ask me anything about ML - I live for this stuff!",
  "Oi! 🐼 Riku reporting for duty. What shall we learn today?",
  "Hello hello! 💡 I'm Riku, your friendly neighbourhood red panda tutor. Shoot your question!",
];

const THANKS: string[] = [
  "Anytime! 🐼 That's literally what I'm here for.",
  "Aww, you're too sweet 🐼💛. Keep being curious!",
  "No problem bhai! 🔥 Come back whenever your brain itches with questions.",
  "Happy to help! 🐼 Every question makes you sharper.",
];

const MOTIVATION: string[] = [
  "Hey, feeling stuck is literally how learning works 💡. Take a breath, re-read slowly, and if it still doesn't click - ask me to explain differently!",
  "Bhai, even Einstein was confused before he was a genius 😄. Break the problem into tiny bits. One small win at a time!",
  "Hard doesn't mean impossible 🔥. It means you're about to level up. Push through - you've got this, promise!",
  "Deep breath 🧘. The best learners get stuck the most. It means your brain is stretching. Want me to re-explain something?",
];

const JOKES: string[] = [
  "Why did the neural network go to therapy? Too many issues with its weights 😅",
  "Why was the ML model bad at poker? It kept overfitting 🃏",
  "What do you call a panda that codes? A bam-BOO-coder 🐼💻",
  "Why did the data scientist get dumped? Too many unresolved dependencies 💔",
  "My model told a joke. Sadly, it didn't generalise 😆",
  "Why was the gradient sad? It couldn't descend any lower 📉",
  "How many ML engineers does it take to change a bulb? Just one, but they need 50 epochs first 🔁",
];

const HELP_RESPONSES: string[] = [
  "I can explain ML concepts (neural nets, KNN, backprop, CNNs, etc.), tell you how you're doing, drop dad jokes, or motivate you when stuck 🐼. Just ask!",
  "Here's what I'm good at: defining ML terms, progress check-ins, learning tips, and terrible jokes 😅. Ask me 'what is X' or 'how am I doing?' to start!",
];

const UNKNOWN_FALLBACKS: string[] = [
  "Hmm, that one zoomed over my panda ears 🐼. Try asking me 'what is a neural network?' or 'how do I start?' - those are my jam!",
  "Not sure I caught that, yaar 😅. I'm best at ML concepts - try 'what is overfitting?' or 'tell me a joke'!",
  "My circuits are buffering 🔄. Could you ask it another way? I can explain AI/ML concepts, track your progress, or tell silly jokes!",
];

/* --------------------------------------------------------------------------
 * Intent matching - keyword-based, simple and predictable.
 * ------------------------------------------------------------------------ */

const GREETING_WORDS = ["hi", "hello", "hey", "yo", "namaste", "hola", "sup", "hiya", "howdy"];
const THANKS_WORDS = ["thanks", "thank you", "thx", "ty", "thankyou", "shukriya", "dhanyavad"];
const JOKE_WORDS = ["joke", "funny", "laugh", "pun", "meme"];
const MOTIVATION_WORDS = ["stuck", "hard", "difficult", "confused", "lost", "frustrated", "give up", "can't do", "cannot do", "too tough"];
const PROGRESS_WORDS = ["how am i doing", "my progress", "my level", "how many lessons", "my streak", "status", "stats"];
const RECOMMEND_WORDS = ["what should i", "where do i start", "where to start", "how do i start", "how to start", "what next", "what now", "recommend", "next lesson"];
const HELP_WORDS = ["help", "what can you", "who are you", "what do you do"];

function normalise(input: string): string {
  return input.toLowerCase().trim();
}

function hasAny(text: string, words: readonly string[]): boolean {
  return words.some((w) => text.includes(w));
}

function hasWord(text: string, word: string): boolean {
  const re = new RegExp(`\\b${word}\\b`, "i");
  return re.test(text);
}

export function matchIntent(input: string): RikuIntent {
  const t = normalise(input);
  if (!t) return "unknown";

  // Thanks (check before greeting because "thanks" is short)
  if (hasAny(t, THANKS_WORDS)) return "thanks";

  // Jokes
  if (hasAny(t, JOKE_WORDS)) return "joke";

  // Motivation
  if (hasAny(t, MOTIVATION_WORDS)) return "motivation";

  // Progress
  if (hasAny(t, PROGRESS_WORDS)) return "progress";

  // Recommend / how to start
  if (hasAny(t, RECOMMEND_WORDS)) return "recommend";

  // What-is questions
  if (
    t.startsWith("what is") ||
    t.startsWith("what's") ||
    t.startsWith("whats") ||
    t.startsWith("define") ||
    t.startsWith("explain") ||
    t.startsWith("tell me about") ||
    t.startsWith("what are") ||
    t.includes(" meaning of")
  ) {
    return "whatis";
  }

  // How-to
  if (t.startsWith("how do") || t.startsWith("how to") || t.startsWith("how can") || t.startsWith("how does")) {
    return "howto";
  }

  // Help
  if (hasAny(t, HELP_WORDS)) return "help";

  // Greeting - check last so "hi there what is KNN" goes to whatis
  if (GREETING_WORDS.some((g) => hasWord(t, g))) return "greeting";

  // Bare topic words also count as whatis
  for (const key of Object.keys(TOPIC_EXPLANATIONS)) {
    if (t.includes(key)) return "whatis";
  }

  return "unknown";
}

/* --------------------------------------------------------------------------
 * Topic lookup - find the best matching key in the explanation dictionary.
 * Returns null if nothing matches.
 * ------------------------------------------------------------------------ */

const TOPIC_ALIASES: Record<string, string> = {
  "neural net": "neural network",
  "neuralnet": "neural network",
  "nn": "neural network",
  "k nearest neighbors": "knn",
  "k-nearest neighbors": "knn",
  "nearest neighbor": "knn",
  "k means": "kmeans",
  "k-means": "kmeans",
  "backprop": "backpropagation",
  "back prop": "backpropagation",
  "artificial intelligence": "ai",
  "machine learning": "ml",
  "supervised learning": "supervised",
  "unsupervised learning": "unsupervised",
  "convolutional neural network": "cnn",
  "conv net": "cnn",
  "convnet": "cnn",
  "gradient": "gradient descent",
  "descent": "gradient descent",
  "overfit": "overfitting",
  "activation function": "activation",
  "relu": "activation",
  "sigmoid": "activation",
  "features": "feature",
  "labels": "label",
  "predictions": "prediction",
  "predict": "prediction",
  "weights": "weight",
  "biases": "bias",
  "lr": "learning rate",
  "loss function": "loss",
  "cost": "loss",
};

function findTopic(text: string): string | null {
  // Check aliases first (longer phrases match before shorter ones)
  const aliasKeys = Object.keys(TOPIC_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of aliasKeys) {
    if (text.includes(alias)) return TOPIC_ALIASES[alias];
  }
  // Then direct dictionary keys
  const dictKeys = Object.keys(TOPIC_EXPLANATIONS).sort((a, b) => b.length - a.length);
  for (const key of dictKeys) {
    if (text.includes(key)) return key;
  }
  return null;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* --------------------------------------------------------------------------
 * generateResponse - the main public API.
 * ------------------------------------------------------------------------ */

export function generateResponse(input: string, context: RikuContext = {}): RikuResponse {
  const raw = input ?? "";
  const t = normalise(raw);
  if (!t) {
    return {
      intent: "unknown",
      text: "Empty message - type something and I'll do my thing 🐼",
      suggestions: STARTER_SUGGESTIONS.slice(0, 3),
    };
  }

  const intent = matchIntent(raw);

  switch (intent) {
    case "greeting": {
      const base = pick(GREETINGS);
      const withLevel =
        context.level !== undefined
          ? `${base} (You're level ${context.level}, by the way - looking sharp! 🔥)`
          : base;
      return {
        intent,
        text: withLevel,
        suggestions: ["What is a neural network?", "How am I doing?", "Tell me a joke"],
      };
    }

    case "thanks": {
      return {
        intent,
        text: pick(THANKS),
        suggestions: ["Teach me something new", "How am I doing?"],
      };
    }

    case "joke": {
      return {
        intent,
        text: pick(JOKES),
        suggestions: ["Another joke", "What is overfitting?", "Explain CNN"],
      };
    }

    case "motivation": {
      return {
        intent,
        text: pick(MOTIVATION),
        suggestions: ["Explain it simpler", "What should I learn next?", "Tell me a joke"],
      };
    }

    case "progress": {
      const lessons = context.totalLessons ?? 0;
      const streak = context.streak ?? 0;
      const lvl = context.level ?? 1;
      let text: string;
      if (lessons === 0) {
        text = `Fresh start! 🌱 You're at level ${lvl} with 0 lessons done. Pick any Level 1 lesson to kick things off - I believe in you!`;
      } else if (lessons < 5) {
        text = `Nice! You've finished ${lessons} lesson${lessons === 1 ? "" : "s"} and you're at level ${lvl} 🔥. Streak: ${streak} day${streak === 1 ? "" : "s"}. Keep the momentum going!`;
      } else if (lessons < 20) {
        text = `Solid work! ${lessons} lessons done, level ${lvl}, and a ${streak}-day streak 🐼. You're officially not a beginner anymore!`;
      } else {
        text = `Bhai you're on fire 🔥! ${lessons} lessons completed, level ${lvl}, ${streak}-day streak. Certified ML nerd status achieved!`;
      }
      return {
        intent,
        text,
        suggestions: ["What should I learn next?", "Tell me a joke", "Explain backprop"],
      };
    }

    case "recommend": {
      const lessons = context.totalLessons ?? 0;
      let text: string;
      if (lessons === 0) {
        text = "Start with Level 1 - 'Machines & Instructions' 🧩. It's chill, no maths, and sets up everything else. Then just follow the path!";
      } else if (lessons < 10) {
        text = "Keep rolling through Levels 1-3 📚. They build the base: data, patterns, predictions. Don't skip - the later stuff leans on them!";
      } else if (lessons < 25) {
        text = "You're ready for the fun stuff 🔥 - Level 4 (Supervised Learning) and Level 5 (Clustering) are where ML starts feeling magical.";
      } else {
        text = "Time for the neural net levels 🧠 - Level 6 (Perceptron/Backprop) and Level 8 (CNNs) will bend your brain in the best way.";
      }
      return {
        intent,
        text,
        suggestions: ["What is a neural network?", "How am I doing?", "What is KNN?"],
      };
    }

    case "howto": {
      // Could be "how do I start" (already caught) or "how does X work"
      const topic = findTopic(t);
      if (topic && TOPIC_EXPLANATIONS[topic]) {
        return {
          intent: "whatis",
          text: pick(TOPIC_EXPLANATIONS[topic]),
          suggestions: ["Tell me more", "Give an example", "What should I learn next?"],
        };
      }
      return {
        intent,
        text: "Break it into steps 👣 - find a lesson on it, read slowly, try the activity, then come back and ask me what didn't click. That's the Riku method!",
        suggestions: ["What should I learn next?", "I'm stuck", "Tell me a joke"],
      };
    }

    case "whatis": {
      const topic = findTopic(t);
      if (topic && TOPIC_EXPLANATIONS[topic]) {
        return {
          intent,
          text: pick(TOPIC_EXPLANATIONS[topic]),
          suggestions: ["Give an example", "What's next?", "Explain simpler"],
        };
      }
      return {
        intent: "unknown",
        text: "Ooh good question, but I don't have that one memorised yet 🐼. Try asking about: neural network, KNN, KMeans, CNN, backprop, overfitting, or gradient descent!",
        suggestions: ["What is a neural network?", "What is overfitting?", "What is KNN?"],
      };
    }

    case "help": {
      return {
        intent,
        text: pick(HELP_RESPONSES),
        suggestions: STARTER_SUGGESTIONS.slice(0, 3),
      };
    }

    case "unknown":
    default: {
      return {
        intent: "unknown",
        text: pick(UNKNOWN_FALLBACKS),
        suggestions: STARTER_SUGGESTIONS.slice(0, 3),
      };
    }
  }
}

/* --------------------------------------------------------------------------
 * Introspection helpers - handy for tests/dev tooling.
 * ------------------------------------------------------------------------ */

export function listTopics(): string[] {
  return Object.keys(TOPIC_EXPLANATIONS);
}

export function topicCount(): number {
  return Object.keys(TOPIC_EXPLANATIONS).length;
}
