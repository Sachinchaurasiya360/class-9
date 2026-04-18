/* --------------------------------------------------------------------------
 * Exam Prep Question Bank - CBSE AI Code 417 (Class 9-10)
 *
 * Structured around the seven core units from the official CBSE AI 417
 * syllabus. Each question carries a short teaching explanation so that
 * practice mode doubles as revision. Pure data module - no React, no
 * browser APIs, safe to import from server components or tests.
 * ------------------------------------------------------------------------ */

export type ExamQuestion = {
  id: string;
  chapter: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "true-false";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
};

export type ExamChapter = {
  slug: string;
  name: string;
  description: string;
  totalMarks: number;
  icon: string;
};

export const EXAM_CHAPTERS: ExamChapter[] = [
  {
    slug: "intro-ai",
    name: "Introduction to AI",
    description: "What AI is, its history, domains, and how it differs from ML and Deep Learning.",
    totalMarks: 10,
    icon: "🤖",
  },
  {
    slug: "ai-project-cycle",
    name: "AI Project Cycle",
    description: "Problem scoping, data acquisition, exploration, modelling and evaluation.",
    totalMarks: 12,
    icon: "🔄",
  },
  {
    slug: "neural-networks",
    name: "Neural Networks",
    description: "Neurons, layers, weights, activation functions and how networks learn.",
    totalMarks: 10,
    icon: "🧠",
  },
  {
    slug: "data-literacy",
    name: "Data Literacy",
    description: "Types of data, features vs labels, train-test split and bias.",
    totalMarks: 10,
    icon: "📊",
  },
  {
    slug: "computer-vision",
    name: "Computer Vision",
    description: "How machines see: images as pixels, CNN basics and real-world uses.",
    totalMarks: 10,
    icon: "👁️",
  },
  {
    slug: "nlp",
    name: "Natural Language Processing",
    description: "Text data, tokenisation, sentiment analysis and chatbots.",
    totalMarks: 10,
    icon: "💬",
  },
  {
    slug: "ethics",
    name: "AI Ethics",
    description: "Bias, fairness, privacy, deepfakes and responsible AI practice.",
    totalMarks: 8,
    icon: "⚖️",
  },
];

export const EXAM_QUESTIONS: ExamQuestion[] = [
  /* ------------------------------------------------------------------ *
   * 1. INTRODUCTION TO AI                                               *
   * ------------------------------------------------------------------ */
  {
    id: "intro-ai-001",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following best describes Artificial Intelligence?",
    options: [
      "A robot that does household chores",
      "A machine or system that can perform tasks typically requiring human intelligence",
      "Any computer program that runs on a mobile phone",
      "A program that only plays video games",
    ],
    correctIndex: 1,
    explanation:
      "AI refers to machines or systems that can perform tasks requiring human-like intelligence - learning, reasoning, problem-solving, perception and language understanding.",
    topic: "definition",
  },
  {
    id: "intro-ai-002",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "mcq",
    question: "Who is often called the 'Father of Artificial Intelligence'?",
    options: ["Alan Turing", "John McCarthy", "Geoffrey Hinton", "Elon Musk"],
    correctIndex: 1,
    explanation:
      "John McCarthy coined the term 'Artificial Intelligence' at the 1956 Dartmouth Conference and is widely regarded as the father of the field.",
    topic: "history",
  },
  {
    id: "intro-ai-003",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "mcq",
    question: "Which of these is NOT one of the three common domains of AI?",
    options: [
      "Data Sciences",
      "Computer Vision",
      "Natural Language Processing",
      "Quantum Cryptography",
    ],
    correctIndex: 3,
    explanation:
      "CBSE groups AI applications into three main domains: Data Sciences, Computer Vision, and Natural Language Processing. Quantum Cryptography is a separate field.",
    topic: "domains",
  },
  {
    id: "intro-ai-004",
    chapter: "intro-ai",
    difficulty: "medium",
    type: "mcq",
    question: "Which statement correctly describes the relationship between AI, ML, and Deep Learning?",
    options: [
      "AI is a subset of Machine Learning",
      "Deep Learning is a subset of Machine Learning, which is a subset of AI",
      "ML and AI are the same thing",
      "Deep Learning is broader than AI",
    ],
    correctIndex: 1,
    explanation:
      "AI is the broadest field. Machine Learning is a subset of AI. Deep Learning, which uses multi-layer neural networks, is a subset of Machine Learning.",
    topic: "ai-ml-dl",
  },
  {
    id: "intro-ai-005",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "true-false",
    question: "Every computer program is considered an AI system.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Only systems that can learn from data or simulate intelligent decision-making qualify as AI. A calculator or simple script is not AI.",
    topic: "definition",
  },
  {
    id: "intro-ai-006",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "mcq",
    question: "A smart assistant like Alexa or Siri primarily uses which AI domain?",
    options: ["Computer Vision", "Natural Language Processing", "Robotics", "Data Visualisation"],
    correctIndex: 1,
    explanation:
      "Voice assistants use NLP to convert speech to text, understand intent and generate spoken responses.",
    topic: "applications",
  },
  {
    id: "intro-ai-007",
    chapter: "intro-ai",
    difficulty: "medium",
    type: "mcq",
    question: "Which of the following is an example of a narrow (weak) AI system?",
    options: [
      "An AI that can do any intellectual task a human can",
      "A chess-playing engine that cannot recognise faces",
      "A sentient robot from a movie",
      "An AI with consciousness",
    ],
    correctIndex: 1,
    explanation:
      "Narrow AI is designed for a single task. A chess engine is expert at chess but cannot generalise to other tasks like face recognition - that would require general AI.",
    topic: "types-of-ai",
  },
  {
    id: "intro-ai-008",
    chapter: "intro-ai",
    difficulty: "medium",
    type: "mcq",
    question: "The Turing Test is designed to check whether a machine can:",
    options: [
      "Solve maths problems faster than a human",
      "Exhibit intelligent behaviour indistinguishable from that of a human",
      "Store more data than a human brain",
      "Run without electricity",
    ],
    correctIndex: 1,
    explanation:
      "Proposed by Alan Turing in 1950, the test asks whether a human judge can reliably tell a machine apart from a human based only on conversation.",
    topic: "history",
  },
  {
    id: "intro-ai-009",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "mcq",
    question: "Which of these is an AI application in the healthcare domain?",
    options: [
      "A pen that writes with ink",
      "An image-based system that detects tumours from X-rays",
      "A printed medical textbook",
      "A manual thermometer",
    ],
    correctIndex: 1,
    explanation:
      "AI-powered image analysis can scan X-rays, CT scans and MRIs to flag abnormalities, assisting doctors in faster diagnosis.",
    topic: "applications",
  },
  {
    id: "intro-ai-010",
    chapter: "intro-ai",
    difficulty: "medium",
    type: "true-false",
    question: "Machine Learning always requires the programmer to hand-code every rule.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "The whole point of ML is that the machine learns rules from data rather than being explicitly programmed with them.",
    topic: "ai-ml-dl",
  },
  {
    id: "intro-ai-011",
    chapter: "intro-ai",
    difficulty: "hard",
    type: "mcq",
    question: "Which of the following best represents 'General AI' (AGI)?",
    options: [
      "An AI that plays only Go",
      "An AI that can perform any intellectual task a human can",
      "A rule-based spam filter",
      "An AI that works only on images",
    ],
    correctIndex: 1,
    explanation:
      "General AI, or AGI, refers to a hypothetical system with the flexibility to learn and reason across any domain - something not yet achieved in practice.",
    topic: "types-of-ai",
  },
  {
    id: "intro-ai-012",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "mcq",
    question: "Which of these is an example of AI in daily life?",
    options: [
      "A wall clock",
      "YouTube recommendations for your next video",
      "A printed newspaper",
      "A wooden chair",
    ],
    correctIndex: 1,
    explanation:
      "Recommendation systems use your watch history and patterns of other users to predict what you might like next - a classic ML application.",
    topic: "applications",
  },
  {
    id: "intro-ai-013",
    chapter: "intro-ai",
    difficulty: "medium",
    type: "mcq",
    question: "Which language is most commonly used for AI and ML development today?",
    options: ["COBOL", "Python", "HTML", "CSS"],
    correctIndex: 1,
    explanation:
      "Python is the de-facto language for AI/ML because of libraries like NumPy, pandas, TensorFlow and PyTorch.",
    topic: "tools",
  },
  {
    id: "intro-ai-014",
    chapter: "intro-ai",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is the correct expansion of 'AI'?",
    options: [
      "Automatic Information",
      "Artificial Intelligence",
      "Advanced Internet",
      "Applied Innovation",
    ],
    correctIndex: 1,
    explanation: "AI stands for Artificial Intelligence.",
    topic: "definition",
  },
  {
    id: "intro-ai-015",
    chapter: "intro-ai",
    difficulty: "hard",
    type: "mcq",
    question: "Deep Learning is primarily built on top of which underlying structure?",
    options: [
      "Decision trees",
      "Multi-layer artificial neural networks",
      "Spreadsheets",
      "Relational databases",
    ],
    correctIndex: 1,
    explanation:
      "Deep Learning uses artificial neural networks with many layers (hence 'deep') to learn complex patterns from large datasets.",
    topic: "ai-ml-dl",
  },
  {
    id: "intro-ai-016",
    chapter: "intro-ai",
    difficulty: "medium",
    type: "mcq",
    question: "Which of the following is NOT a characteristic of an AI system?",
    options: [
      "It can learn from data",
      "It can adapt to new inputs",
      "It always produces the same output for the same input with zero flexibility",
      "It can make predictions",
    ],
    correctIndex: 2,
    explanation:
      "AI systems are expected to adapt and generalise - rigid fixed-output systems are traditional rule-based programs, not AI.",
    topic: "characteristics",
  },

  /* ------------------------------------------------------------------ *
   * 2. AI PROJECT CYCLE                                                 *
   * ------------------------------------------------------------------ */
  {
    id: "apc-001",
    chapter: "ai-project-cycle",
    difficulty: "easy",
    type: "mcq",
    question: "What is the first stage of the AI Project Cycle?",
    options: ["Modelling", "Data Acquisition", "Problem Scoping", "Evaluation"],
    correctIndex: 2,
    explanation:
      "Problem Scoping comes first. Before collecting any data, you must understand exactly what problem you are trying to solve.",
    topic: "stages",
  },
  {
    id: "apc-002",
    chapter: "ai-project-cycle",
    difficulty: "easy",
    type: "mcq",
    question: "The 4Ws used in Problem Scoping stand for Who, What, Where, and:",
    options: ["Why", "When", "Which", "Whose"],
    correctIndex: 0,
    explanation:
      "The 4Ws canvas used in the CBSE curriculum asks Who, What, Where and Why to define the problem clearly before building a solution.",
    topic: "problem-scoping",
  },
  {
    id: "apc-003",
    chapter: "ai-project-cycle",
    difficulty: "easy",
    type: "mcq",
    question: "Which stage involves collecting raw data from sources like surveys, sensors or APIs?",
    options: ["Problem Scoping", "Data Acquisition", "Modelling", "Deployment"],
    correctIndex: 1,
    explanation:
      "Data Acquisition is the stage where you gather data relevant to the problem from the real world or open repositories.",
    topic: "data-acquisition",
  },
  {
    id: "apc-004",
    chapter: "ai-project-cycle",
    difficulty: "medium",
    type: "mcq",
    question: "Data Exploration is done mainly to:",
    options: [
      "Train the model",
      "Understand trends, patterns and quality issues in the data",
      "Deploy the model",
      "Write the problem statement",
    ],
    correctIndex: 1,
    explanation:
      "In Data Exploration you visualise and summarise the data so you understand it, spot outliers and decide how to clean it before modelling.",
    topic: "data-exploration",
  },
  {
    id: "apc-005",
    chapter: "ai-project-cycle",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is a common tool for Data Exploration?",
    options: ["Bar charts and scatter plots", "3D printers", "Hammers", "Paint brushes"],
    correctIndex: 0,
    explanation:
      "Visualisations like bar charts, histograms and scatter plots are core tools for exploring what the data looks like.",
    topic: "data-exploration",
  },
  {
    id: "apc-006",
    chapter: "ai-project-cycle",
    difficulty: "medium",
    type: "mcq",
    question: "In the Modelling stage, the main activity is:",
    options: [
      "Writing the 4Ws problem canvas",
      "Selecting and training an algorithm on the prepared data",
      "Collecting more data",
      "Deploying the final product",
    ],
    correctIndex: 1,
    explanation:
      "Modelling is where you pick an ML algorithm (e.g., decision tree, neural network) and train it using the cleaned data.",
    topic: "modelling",
  },
  {
    id: "apc-007",
    chapter: "ai-project-cycle",
    difficulty: "medium",
    type: "mcq",
    question: "Rule-based modelling is best described as:",
    options: [
      "A model that learns rules automatically from data",
      "A model where humans define the rules explicitly",
      "A model that uses only neural networks",
      "A model that requires no input",
    ],
    correctIndex: 1,
    explanation:
      "In rule-based systems, humans write the decision rules directly. In learning-based systems, the machine figures out the rules from data.",
    topic: "modelling",
  },
  {
    id: "apc-008",
    chapter: "ai-project-cycle",
    difficulty: "medium",
    type: "mcq",
    question: "Which stage checks how well the trained model performs on unseen data?",
    options: ["Problem Scoping", "Data Acquisition", "Evaluation", "Data Exploration"],
    correctIndex: 2,
    explanation:
      "Evaluation uses a held-out test set to measure metrics like accuracy, precision and recall so you know whether the model is good enough to deploy.",
    topic: "evaluation",
  },
  {
    id: "apc-009",
    chapter: "ai-project-cycle",
    difficulty: "hard",
    type: "mcq",
    question: "If a model performs perfectly on training data but badly on test data, what is the most likely issue?",
    options: ["Underfitting", "Overfitting", "Good generalisation", "Too little training"],
    correctIndex: 1,
    explanation:
      "Overfitting means the model has memorised the training data, including its noise, and fails to generalise to new examples.",
    topic: "evaluation",
  },
  {
    id: "apc-010",
    chapter: "ai-project-cycle",
    difficulty: "easy",
    type: "true-false",
    question: "In the AI Project Cycle, Problem Scoping can be skipped if you already have a dataset.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Even with data in hand, you still need to clearly define the problem and who it affects - otherwise you risk building the wrong solution.",
    topic: "problem-scoping",
  },
  {
    id: "apc-011",
    chapter: "ai-project-cycle",
    difficulty: "easy",
    type: "mcq",
    question: "The 'Who' in the 4Ws canvas refers to:",
    options: [
      "Who will build the hardware",
      "Who is affected by the problem",
      "Who writes the code",
      "Who pays for the project",
    ],
    correctIndex: 1,
    explanation:
      "'Who' identifies the stakeholders - the people experiencing or affected by the problem.",
    topic: "problem-scoping",
  },
  {
    id: "apc-012",
    chapter: "ai-project-cycle",
    difficulty: "medium",
    type: "mcq",
    question: "Which is an example of a valid data acquisition source?",
    options: [
      "Making numbers up",
      "Publicly available dataset portals like Kaggle",
      "Random guessing",
      "Copying answers from friends",
    ],
    correctIndex: 1,
    explanation:
      "Open data portals (Kaggle, data.gov.in, UCI) provide real labelled datasets that you can use for AI projects.",
    topic: "data-acquisition",
  },
  {
    id: "apc-013",
    chapter: "ai-project-cycle",
    difficulty: "medium",
    type: "mcq",
    question: "Evaluation metrics like accuracy and F1 score fall under which stage?",
    options: ["Problem Scoping", "Modelling", "Evaluation", "Deployment"],
    correctIndex: 2,
    explanation:
      "These metrics are calculated in the Evaluation stage to quantify model performance on the test set.",
    topic: "evaluation",
  },
  {
    id: "apc-014",
    chapter: "ai-project-cycle",
    difficulty: "easy",
    type: "mcq",
    question: "Which of these is the correct order of the AI project cycle?",
    options: [
      "Modelling → Problem Scoping → Data Acquisition → Evaluation",
      "Problem Scoping → Data Acquisition → Data Exploration → Modelling → Evaluation",
      "Evaluation → Modelling → Problem Scoping",
      "Data Acquisition → Evaluation → Problem Scoping → Modelling",
    ],
    correctIndex: 1,
    explanation:
      "The standard CBSE order is Problem Scoping, then Data Acquisition, then Data Exploration, then Modelling, and finally Evaluation.",
    topic: "stages",
  },
  {
    id: "apc-015",
    chapter: "ai-project-cycle",
    difficulty: "hard",
    type: "mcq",
    question: "A team builds an AI to predict dengue outbreaks. Which of these is a problem-scoping question?",
    options: [
      "What algorithm should we use?",
      "How many hidden layers does the network need?",
      "Who is affected by dengue outbreaks and why is early prediction important?",
      "What hardware should we buy?",
    ],
    correctIndex: 2,
    explanation:
      "Problem scoping focuses on stakeholders and the 'why' - not on technical choices, which come later in the cycle.",
    topic: "problem-scoping",
  },
  {
    id: "apc-016",
    chapter: "ai-project-cycle",
    difficulty: "medium",
    type: "true-false",
    question: "Data cleaning (handling missing values, outliers) is usually done during Data Exploration.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Cleaning happens as part of exploring the data - you can't properly model data you haven't inspected and fixed.",
    topic: "data-exploration",
  },

  /* ------------------------------------------------------------------ *
   * 3. NEURAL NETWORKS                                                  *
   * ------------------------------------------------------------------ */
  {
    id: "nn-001",
    chapter: "neural-networks",
    difficulty: "easy",
    type: "mcq",
    question: "An artificial neuron is inspired by:",
    options: [
      "The engine of a car",
      "A biological neuron in the human brain",
      "A calculator",
      "A telephone line",
    ],
    correctIndex: 1,
    explanation:
      "Artificial neurons loosely mimic biological neurons - they receive inputs, process them, and produce an output.",
    topic: "neurons",
  },
  {
    id: "nn-002",
    chapter: "neural-networks",
    difficulty: "easy",
    type: "mcq",
    question: "The three main layers of a simple neural network are:",
    options: [
      "Input, Hidden, Output",
      "Start, Middle, End",
      "Top, Bottom, Side",
      "Red, Green, Blue",
    ],
    correctIndex: 0,
    explanation:
      "A feed-forward network has an input layer to receive data, one or more hidden layers that compute features, and an output layer that produces predictions.",
    topic: "layers",
  },
  {
    id: "nn-003",
    chapter: "neural-networks",
    difficulty: "medium",
    type: "mcq",
    question: "Weights in a neural network represent:",
    options: [
      "The physical weight of the computer",
      "The strength of the connection between neurons",
      "How fast the network runs",
      "The number of neurons",
    ],
    correctIndex: 1,
    explanation:
      "Each connection has a numerical weight that scales its input. Training adjusts these weights so the network makes better predictions.",
    topic: "weights",
  },
  {
    id: "nn-004",
    chapter: "neural-networks",
    difficulty: "medium",
    type: "mcq",
    question: "What is the role of an activation function?",
    options: [
      "To shut the network off",
      "To introduce non-linearity so the network can learn complex patterns",
      "To measure accuracy",
      "To clean the data",
    ],
    correctIndex: 1,
    explanation:
      "Without non-linear activation functions like ReLU or sigmoid, the entire network collapses into a single linear function and cannot model complex problems.",
    topic: "activation",
  },
  {
    id: "nn-005",
    chapter: "neural-networks",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is a popular activation function?",
    options: ["ReLU", "HTML", "CSV", "JPEG"],
    correctIndex: 0,
    explanation:
      "ReLU (Rectified Linear Unit) outputs the input if positive and zero otherwise. It is the most common activation in modern deep networks.",
    topic: "activation",
  },
  {
    id: "nn-006",
    chapter: "neural-networks",
    difficulty: "medium",
    type: "mcq",
    question: "During training, what does the network try to minimise?",
    options: [
      "The number of layers",
      "A loss function that measures how wrong the predictions are",
      "The number of neurons",
      "The amount of RAM used",
    ],
    correctIndex: 1,
    explanation:
      "The loss function quantifies prediction error. Training uses gradient descent to adjust weights so that this loss decreases.",
    topic: "training",
  },
  {
    id: "nn-007",
    chapter: "neural-networks",
    difficulty: "hard",
    type: "mcq",
    question: "Backpropagation is used to:",
    options: [
      "Display the output to the user",
      "Calculate gradients so weights can be updated during training",
      "Store data in the hard drive",
      "Select the activation function",
    ],
    correctIndex: 1,
    explanation:
      "Backpropagation applies the chain rule to compute how the loss changes with respect to each weight, which lets gradient descent update them.",
    topic: "training",
  },
  {
    id: "nn-008",
    chapter: "neural-networks",
    difficulty: "easy",
    type: "true-false",
    question: "A deep neural network has only one hidden layer.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "By definition, deep networks have multiple hidden layers. That is why they are called 'deep'.",
    topic: "layers",
  },
  {
    id: "nn-009",
    chapter: "neural-networks",
    difficulty: "medium",
    type: "mcq",
    question: "Bias in a neural network (not statistical bias) refers to:",
    options: [
      "Unfair behaviour of the model",
      "An extra trainable parameter added to each neuron to shift the activation",
      "The number of layers",
      "The learning rate",
    ],
    correctIndex: 1,
    explanation:
      "Neural-network 'bias' is a learnable offset. It lets the activation function fire even when all inputs are zero, adding flexibility.",
    topic: "weights",
  },
  {
    id: "nn-010",
    chapter: "neural-networks",
    difficulty: "easy",
    type: "mcq",
    question: "Which layer receives the raw features of an example?",
    options: ["Output layer", "Input layer", "Hidden layer", "Loss layer"],
    correctIndex: 1,
    explanation:
      "The input layer is where the data enters the network. Each input neuron usually corresponds to one feature.",
    topic: "layers",
  },
  {
    id: "nn-011",
    chapter: "neural-networks",
    difficulty: "medium",
    type: "mcq",
    question: "A perceptron is best described as:",
    options: [
      "A deep convolutional network",
      "The simplest possible neural unit - a single linear model with an activation",
      "A recurrent network",
      "A chatbot",
    ],
    correctIndex: 1,
    explanation:
      "A perceptron computes a weighted sum of inputs, adds a bias, and applies an activation. It is the building block of more complex networks.",
    topic: "neurons",
  },
  {
    id: "nn-012",
    chapter: "neural-networks",
    difficulty: "medium",
    type: "mcq",
    question: "Gradient Descent updates weights in which direction?",
    options: [
      "Opposite to the gradient of the loss, to reduce error",
      "Same as the gradient of the loss, to increase error",
      "At random",
      "Towards the highest loss",
    ],
    correctIndex: 0,
    explanation:
      "To reduce the loss, weights are moved opposite to the direction of increasing loss - that is the 'descent' in gradient descent.",
    topic: "training",
  },
  {
    id: "nn-013",
    chapter: "neural-networks",
    difficulty: "hard",
    type: "mcq",
    question: "If a network has 3 input features and 5 neurons in its hidden layer, how many weights connect the input to the hidden layer?",
    options: ["5", "8", "15", "3"],
    correctIndex: 2,
    explanation:
      "Each of the 3 inputs connects to each of the 5 hidden neurons, giving 3 × 5 = 15 weights (biases are counted separately).",
    topic: "layers",
  },
  {
    id: "nn-014",
    chapter: "neural-networks",
    difficulty: "easy",
    type: "mcq",
    question: "Training a neural network means:",
    options: [
      "Running the finished network on new data",
      "Adjusting weights and biases so the network makes fewer mistakes",
      "Designing the web interface",
      "Plotting a bar chart",
    ],
    correctIndex: 1,
    explanation:
      "Training is the process of updating parameters (weights and biases) using data so that predictions improve.",
    topic: "training",
  },
  {
    id: "nn-015",
    chapter: "neural-networks",
    difficulty: "medium",
    type: "true-false",
    question: "Sigmoid activation squashes its input into a value between 0 and 1.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "The sigmoid function maps any real number to the range (0, 1), which is why it is often used for binary probabilities.",
    topic: "activation",
  },
  {
    id: "nn-016",
    chapter: "neural-networks",
    difficulty: "hard",
    type: "mcq",
    question: "The 'forward pass' in a neural network is:",
    options: [
      "Taking inputs and computing outputs layer by layer",
      "Updating weights using gradients",
      "Storing data in memory",
      "Deleting the model",
    ],
    correctIndex: 0,
    explanation:
      "The forward pass feeds inputs through the network layer by layer to produce a prediction. Backpropagation then flows errors backwards.",
    topic: "training",
  },

  /* ------------------------------------------------------------------ *
   * 4. DATA LITERACY                                                    *
   * ------------------------------------------------------------------ */
  {
    id: "data-001",
    chapter: "data-literacy",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is an example of structured data?",
    options: [
      "A random photo",
      "A spreadsheet of student marks with columns and rows",
      "A voice recording",
      "A handwritten letter",
    ],
    correctIndex: 1,
    explanation:
      "Structured data is organised in a fixed schema - like tables with rows and columns. Spreadsheets and SQL tables are classic examples.",
    topic: "data-types",
  },
  {
    id: "data-002",
    chapter: "data-literacy",
    difficulty: "easy",
    type: "mcq",
    question: "Which of these is unstructured data?",
    options: [
      "A CSV file of temperatures",
      "A database of orders",
      "An MP4 video",
      "An Excel sheet of expenses",
    ],
    correctIndex: 2,
    explanation:
      "Unstructured data has no fixed schema - videos, images, audio and free text are all unstructured.",
    topic: "data-types",
  },
  {
    id: "data-003",
    chapter: "data-literacy",
    difficulty: "easy",
    type: "mcq",
    question: "In supervised learning, the 'label' is:",
    options: [
      "The name of the dataset",
      "The correct answer the model is supposed to predict",
      "The input features",
      "The algorithm being used",
    ],
    correctIndex: 1,
    explanation:
      "Each training example has features (the input) and a label (the known correct output). The model learns to map features to labels.",
    topic: "features-labels",
  },
  {
    id: "data-004",
    chapter: "data-literacy",
    difficulty: "easy",
    type: "mcq",
    question: "If you are predicting house prices, 'number of bedrooms' is an example of a:",
    options: ["Label", "Feature", "Loss", "Bias"],
    correctIndex: 1,
    explanation:
      "Number of bedrooms is an input attribute used to make the prediction, so it is a feature. The price itself would be the label.",
    topic: "features-labels",
  },
  {
    id: "data-005",
    chapter: "data-literacy",
    difficulty: "medium",
    type: "mcq",
    question: "Why do we split data into training and test sets?",
    options: [
      "To make training faster only",
      "To check how well the model generalises to unseen data",
      "To save disk space",
      "To remove labels",
    ],
    correctIndex: 1,
    explanation:
      "The test set simulates new, unseen data. If the model performs well on it, we have evidence it will work in the real world.",
    topic: "train-test",
  },
  {
    id: "data-006",
    chapter: "data-literacy",
    difficulty: "medium",
    type: "mcq",
    question: "A typical train-test split for a dataset is:",
    options: ["50-50", "80-20", "99-1", "100-0"],
    correctIndex: 1,
    explanation:
      "An 80-20 split (80% train, 20% test) is a common default, though the ratio can vary based on dataset size.",
    topic: "train-test",
  },
  {
    id: "data-007",
    chapter: "data-literacy",
    difficulty: "medium",
    type: "mcq",
    question: "Bias in a dataset usually means:",
    options: [
      "The data is fully representative",
      "The data systematically over- or under-represents certain groups or outcomes",
      "The data is in CSV format",
      "The data is encrypted",
    ],
    correctIndex: 1,
    explanation:
      "Biased data leads to biased models. For example, a face dataset of only one demographic will produce models that work poorly on others.",
    topic: "bias",
  },
  {
    id: "data-008",
    chapter: "data-literacy",
    difficulty: "easy",
    type: "true-false",
    question: "More data is always better, even if it's dirty or irrelevant.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Quality matters more than quantity. Dirty or irrelevant data can hurt model performance regardless of volume.",
    topic: "data-quality",
  },
  {
    id: "data-009",
    chapter: "data-literacy",
    difficulty: "medium",
    type: "mcq",
    question: "Which of these is categorical data?",
    options: [
      "Student height in cm",
      "Temperature in °C",
      "Favourite subject: Math / Science / English",
      "Time taken in seconds",
    ],
    correctIndex: 2,
    explanation:
      "Categorical data takes a fixed set of labels or categories. Numerical values like height and temperature are continuous data.",
    topic: "data-types",
  },
  {
    id: "data-010",
    chapter: "data-literacy",
    difficulty: "easy",
    type: "mcq",
    question: "A dataset with clear rows and columns is best visualised using:",
    options: ["A random sketch", "Tables, bar charts and scatter plots", "A poem", "An audio clip"],
    correctIndex: 1,
    explanation:
      "Tabular data is best explored using statistical summaries and standard charts like bar, histogram and scatter plots.",
    topic: "visualisation",
  },
  {
    id: "data-011",
    chapter: "data-literacy",
    difficulty: "medium",
    type: "mcq",
    question: "A missing value in a dataset is typically represented as:",
    options: ["999999", "NaN or NULL", "A random emoji", "The letter 'M'"],
    correctIndex: 1,
    explanation:
      "Most data libraries use NaN (Not a Number) or NULL to represent missing values, which must be handled before training.",
    topic: "data-quality",
  },
  {
    id: "data-012",
    chapter: "data-literacy",
    difficulty: "hard",
    type: "mcq",
    question: "A model trained only on pictures of light-skinned faces fails on darker-skinned faces. This is an example of:",
    options: [
      "Overfitting",
      "Dataset bias",
      "Good generalisation",
      "Underfitting due to small model",
    ],
    correctIndex: 1,
    explanation:
      "The training data was not representative of the full population, so the model carries that bias into its predictions.",
    topic: "bias",
  },
  {
    id: "data-013",
    chapter: "data-literacy",
    difficulty: "medium",
    type: "mcq",
    question: "'Features' and 'attributes' in a dataset are:",
    options: [
      "Completely unrelated",
      "Roughly synonymous - both refer to the input columns",
      "Types of algorithms",
      "Metrics like accuracy",
    ],
    correctIndex: 1,
    explanation:
      "In ML contexts, 'feature' and 'attribute' are used interchangeably to mean an input variable used to describe an example.",
    topic: "features-labels",
  },
  {
    id: "data-014",
    chapter: "data-literacy",
    difficulty: "easy",
    type: "mcq",
    question: "An example of a numerical continuous feature is:",
    options: ["Blood group", "Age in years", "Gender", "City name"],
    correctIndex: 1,
    explanation:
      "Age is measured on a continuous numeric scale. Blood group, gender and city are categorical.",
    topic: "data-types",
  },
  {
    id: "data-015",
    chapter: "data-literacy",
    difficulty: "medium",
    type: "true-false",
    question: "Outliers should always be deleted from a dataset.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Outliers might represent errors - but they can also be the most interesting points (e.g., fraud detection). They should be investigated, not blindly removed.",
    topic: "data-quality",
  },
  {
    id: "data-016",
    chapter: "data-literacy",
    difficulty: "hard",
    type: "mcq",
    question: "What is the purpose of a validation set?",
    options: [
      "It replaces the test set",
      "It is used during training to tune hyper-parameters without touching the test set",
      "It is the same as training data",
      "It is used only after deployment",
    ],
    correctIndex: 1,
    explanation:
      "A validation set lets you tune choices like learning rate and number of layers without peeking at the final test set, preserving an unbiased evaluation.",
    topic: "train-test",
  },

  /* ------------------------------------------------------------------ *
   * 5. COMPUTER VISION                                                  *
   * ------------------------------------------------------------------ */
  {
    id: "cv-001",
    chapter: "computer-vision",
    difficulty: "easy",
    type: "mcq",
    question: "In Computer Vision, a digital image is represented as:",
    options: [
      "A single number",
      "A grid of pixels, each with colour values",
      "A piece of music",
      "A word document",
    ],
    correctIndex: 1,
    explanation:
      "Digital images are 2-D (or 3-D for colour) arrays of pixels. Each pixel carries intensity or RGB values.",
    topic: "images",
  },
  {
    id: "cv-002",
    chapter: "computer-vision",
    difficulty: "easy",
    type: "mcq",
    question: "A grayscale pixel is usually represented by a single value in the range:",
    options: ["0 to 1", "0 to 255", "-100 to 100", "1 to 1000"],
    correctIndex: 1,
    explanation:
      "An 8-bit grayscale pixel takes values 0 (black) to 255 (white), giving 256 shades of gray.",
    topic: "images",
  },
  {
    id: "cv-003",
    chapter: "computer-vision",
    difficulty: "easy",
    type: "mcq",
    question: "A colour (RGB) image has how many channels?",
    options: ["1", "2", "3", "4"],
    correctIndex: 2,
    explanation:
      "Red, Green and Blue channels - three in total. Each pixel has one value per channel.",
    topic: "images",
  },
  {
    id: "cv-004",
    chapter: "computer-vision",
    difficulty: "medium",
    type: "mcq",
    question: "CNN stands for:",
    options: [
      "Convolutional Neural Network",
      "Connected Node Network",
      "Central Neural Node",
      "Coded Numeric Net",
    ],
    correctIndex: 0,
    explanation:
      "CNNs use convolution operations to detect spatial patterns like edges, textures and shapes in images.",
    topic: "cnn",
  },
  {
    id: "cv-005",
    chapter: "computer-vision",
    difficulty: "medium",
    type: "mcq",
    question: "The convolution operation in a CNN is used to:",
    options: [
      "Randomly shuffle pixels",
      "Apply small filters that detect local features like edges and corners",
      "Delete part of the image",
      "Compress the image into text",
    ],
    correctIndex: 1,
    explanation:
      "Convolution slides a small filter (kernel) over the image to produce feature maps that highlight specific local patterns.",
    topic: "cnn",
  },
  {
    id: "cv-006",
    chapter: "computer-vision",
    difficulty: "medium",
    type: "mcq",
    question: "Pooling layers in a CNN are used to:",
    options: [
      "Increase the image resolution",
      "Reduce the spatial size of feature maps while keeping important information",
      "Add colour to the image",
      "Convert the image to audio",
    ],
    correctIndex: 1,
    explanation:
      "Pooling (e.g., max pooling) downsamples feature maps, cutting computation and making the network more robust to small shifts.",
    topic: "cnn",
  },
  {
    id: "cv-007",
    chapter: "computer-vision",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is a real-world application of computer vision?",
    options: [
      "Self-driving cars recognising pedestrians",
      "Calculating a factorial",
      "Sending SMS messages",
      "Playing an MP3 file",
    ],
    correctIndex: 0,
    explanation:
      "Self-driving systems rely heavily on CV to detect lanes, signs, vehicles and pedestrians from camera input.",
    topic: "applications",
  },
  {
    id: "cv-008",
    chapter: "computer-vision",
    difficulty: "medium",
    type: "mcq",
    question: "Face recognition is primarily an application of:",
    options: ["NLP", "Computer Vision", "Reinforcement Learning", "Robotic Arms"],
    correctIndex: 1,
    explanation:
      "Face recognition analyses facial pixel patterns to identify individuals - a core CV task.",
    topic: "applications",
  },
  {
    id: "cv-009",
    chapter: "computer-vision",
    difficulty: "hard",
    type: "mcq",
    question: "A 3×3 filter applied to a 5×5 image (no padding, stride 1) produces an output of what size?",
    options: ["3×3", "5×5", "7×7", "4×4"],
    correctIndex: 0,
    explanation:
      "Output size = (input − filter + 1). (5 − 3 + 1) = 3, so the feature map is 3×3.",
    topic: "cnn",
  },
  {
    id: "cv-010",
    chapter: "computer-vision",
    difficulty: "easy",
    type: "true-false",
    question: "A CNN can automatically learn useful image features during training.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Unlike hand-engineered feature extractors, CNNs learn their filters directly from data during training.",
    topic: "cnn",
  },
  {
    id: "cv-011",
    chapter: "computer-vision",
    difficulty: "medium",
    type: "mcq",
    question: "Object detection differs from image classification because it:",
    options: [
      "Only outputs a single label for the whole image",
      "Locates multiple objects with bounding boxes and labels them",
      "Works only on videos",
      "Does not require training",
    ],
    correctIndex: 1,
    explanation:
      "Classification answers 'what is in this image?'. Detection answers 'what, and where, using boxes?'.",
    topic: "applications",
  },
  {
    id: "cv-012",
    chapter: "computer-vision",
    difficulty: "easy",
    type: "mcq",
    question: "An edge in an image is a region where:",
    options: [
      "Pixel intensity is constant",
      "Pixel intensity changes sharply",
      "There is no colour",
      "The image is compressed",
    ],
    correctIndex: 1,
    explanation:
      "Edges are detected where neighbouring pixels have very different intensities - boundaries between objects or textures.",
    topic: "images",
  },
  {
    id: "cv-013",
    chapter: "computer-vision",
    difficulty: "medium",
    type: "mcq",
    question: "Which of the following is NOT typically part of a CNN architecture?",
    options: ["Convolution layer", "Pooling layer", "Fully-connected layer", "HTML layer"],
    correctIndex: 3,
    explanation:
      "HTML is a web markup language and has nothing to do with neural networks. Convolution, pooling and fully-connected layers are standard CNN components.",
    topic: "cnn",
  },
  {
    id: "cv-014",
    chapter: "computer-vision",
    difficulty: "easy",
    type: "mcq",
    question: "If an image has resolution 640×480, the total number of pixels is:",
    options: ["1120", "30720", "307200", "3072000"],
    correctIndex: 2,
    explanation: "640 × 480 = 307,200 pixels.",
    topic: "images",
  },
  {
    id: "cv-015",
    chapter: "computer-vision",
    difficulty: "hard",
    type: "mcq",
    question: "Data augmentation in CV typically means:",
    options: [
      "Deleting part of the training data",
      "Creating new training examples via flips, rotations, crops and colour shifts",
      "Encrypting images",
      "Changing the label order",
    ],
    correctIndex: 1,
    explanation:
      "Augmentation expands the effective training set by transforming existing images, helping the model become more robust and reducing overfitting.",
    topic: "training",
  },
  {
    id: "cv-016",
    chapter: "computer-vision",
    difficulty: "medium",
    type: "true-false",
    question: "A grayscale image has 3 channels like RGB.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Grayscale images have only 1 channel representing intensity. RGB has 3.",
    topic: "images",
  },

  /* ------------------------------------------------------------------ *
   * 6. NATURAL LANGUAGE PROCESSING                                      *
   * ------------------------------------------------------------------ */
  {
    id: "nlp-001",
    chapter: "nlp",
    difficulty: "easy",
    type: "mcq",
    question: "NLP stands for:",
    options: [
      "Natural Language Processing",
      "Neural Language Pipeline",
      "New Linguistic Program",
      "Node Logic Package",
    ],
    correctIndex: 0,
    explanation:
      "NLP is the AI domain that deals with making computers understand, interpret and generate human language.",
    topic: "definition",
  },
  {
    id: "nlp-002",
    chapter: "nlp",
    difficulty: "easy",
    type: "mcq",
    question: "Which of these is an NLP task?",
    options: [
      "Face recognition",
      "Sentiment analysis of tweets",
      "Detecting cars in images",
      "Predicting house prices from area",
    ],
    correctIndex: 1,
    explanation:
      "Sentiment analysis classifies the emotion of text - a textbook NLP task.",
    topic: "applications",
  },
  {
    id: "nlp-003",
    chapter: "nlp",
    difficulty: "easy",
    type: "mcq",
    question: "Tokenisation in NLP means:",
    options: [
      "Encrypting text",
      "Splitting text into smaller units like words or sub-words",
      "Translating text to another language",
      "Counting the letters only",
    ],
    correctIndex: 1,
    explanation:
      "Tokenisation breaks text into tokens (usually words or sub-words) that can then be converted into numbers for the model.",
    topic: "tokenisation",
  },
  {
    id: "nlp-004",
    chapter: "nlp",
    difficulty: "medium",
    type: "mcq",
    question: "Stop words are usually:",
    options: [
      "Very rare, important words",
      "Very common words like 'the', 'is', 'and' that carry little meaning on their own",
      "Swear words",
      "Words in capital letters only",
    ],
    correctIndex: 1,
    explanation:
      "Stop words are common words often filtered out during text processing because they rarely help with classification tasks.",
    topic: "preprocessing",
  },
  {
    id: "nlp-005",
    chapter: "nlp",
    difficulty: "medium",
    type: "mcq",
    question: "'Bag of Words' is a representation that:",
    options: [
      "Preserves word order perfectly",
      "Represents text as a count of how often each word appears, ignoring order",
      "Converts text to images",
      "Requires a neural network to build",
    ],
    correctIndex: 1,
    explanation:
      "Bag of Words turns a document into a word-count vector, ignoring grammar and word order - simple but surprisingly effective for many tasks.",
    topic: "representation",
  },
  {
    id: "nlp-006",
    chapter: "nlp",
    difficulty: "medium",
    type: "mcq",
    question: "Stemming and lemmatisation both aim to:",
    options: [
      "Translate sentences into English",
      "Reduce words to a common root form",
      "Break the sentence into characters",
      "Remove vowels from words",
    ],
    correctIndex: 1,
    explanation:
      "Both map related forms (running, runs, ran) to a base form (run) so the model treats them as the same concept.",
    topic: "preprocessing",
  },
  {
    id: "nlp-007",
    chapter: "nlp",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is a chatbot application?",
    options: [
      "Answering customer-service queries in text",
      "Sharpening a blurry photo",
      "Detecting faces",
      "Playing chess",
    ],
    correctIndex: 0,
    explanation:
      "Chatbots hold text or voice conversations with users and are a common commercial NLP application.",
    topic: "applications",
  },
  {
    id: "nlp-008",
    chapter: "nlp",
    difficulty: "medium",
    type: "true-false",
    question: "Sentiment analysis can classify a review as positive, negative or neutral.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Sentiment analysis assigns a polarity label (and sometimes an intensity) to text, which is useful for analysing reviews and social media.",
    topic: "applications",
  },
  {
    id: "nlp-009",
    chapter: "nlp",
    difficulty: "medium",
    type: "mcq",
    question: "In the sentence 'Pandas love bamboo', how many tokens are there after simple word tokenisation?",
    options: ["1", "2", "3", "4"],
    correctIndex: 2,
    explanation:
      "Three tokens: ['Pandas', 'love', 'bamboo'] - each word becomes one token.",
    topic: "tokenisation",
  },
  {
    id: "nlp-010",
    chapter: "nlp",
    difficulty: "hard",
    type: "mcq",
    question: "Why do we convert text to numerical vectors before feeding it to a model?",
    options: [
      "To save space",
      "Because ML models work on numbers, not raw text",
      "To encrypt the text",
      "Because the alphabet has 26 letters",
    ],
    correctIndex: 1,
    explanation:
      "Models operate on numeric tensors. Techniques like one-hot, TF-IDF and embeddings convert text into vectors the model can process.",
    topic: "representation",
  },
  {
    id: "nlp-011",
    chapter: "nlp",
    difficulty: "easy",
    type: "mcq",
    question: "Which of these is a popular virtual assistant using NLP?",
    options: ["Google Assistant", "Microsoft Excel", "Photoshop", "VLC Media Player"],
    correctIndex: 0,
    explanation:
      "Google Assistant interprets spoken or typed language, making it a voice-based NLP system.",
    topic: "applications",
  },
  {
    id: "nlp-012",
    chapter: "nlp",
    difficulty: "medium",
    type: "mcq",
    question: "Machine translation converts text:",
    options: [
      "From text to sound",
      "From one natural language to another",
      "From words to numbers only",
      "Into a bar chart",
    ],
    correctIndex: 1,
    explanation:
      "Machine translation (like Google Translate) maps sentences from a source language to a target language while preserving meaning.",
    topic: "applications",
  },
  {
    id: "nlp-013",
    chapter: "nlp",
    difficulty: "medium",
    type: "true-false",
    question: "Removing punctuation and lowercasing text are common preprocessing steps in NLP.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Standardising case and stripping punctuation shrinks the vocabulary and makes downstream matching more reliable for many tasks.",
    topic: "preprocessing",
  },
  {
    id: "nlp-014",
    chapter: "nlp",
    difficulty: "hard",
    type: "mcq",
    question: "TF-IDF helps by:",
    options: [
      "Giving higher weight to words that are common across all documents",
      "Giving higher weight to words that are frequent in a document but rare in the corpus",
      "Encrypting text",
      "Tokenising text",
    ],
    correctIndex: 1,
    explanation:
      "TF-IDF boosts terms that distinguish a document from the rest, down-weighting generic words that appear everywhere.",
    topic: "representation",
  },
  {
    id: "nlp-015",
    chapter: "nlp",
    difficulty: "easy",
    type: "mcq",
    question: "A spam email filter is an example of:",
    options: [
      "Text classification",
      "Image segmentation",
      "Speech synthesis",
      "Video editing",
    ],
    correctIndex: 0,
    explanation:
      "A spam filter assigns each email a label - spam or not spam - which is text classification.",
    topic: "applications",
  },
  {
    id: "nlp-016",
    chapter: "nlp",
    difficulty: "medium",
    type: "mcq",
    question: "Which of the following is NOT an NLP task?",
    options: [
      "Named entity recognition",
      "Speech to text",
      "Object detection in photos",
      "Summarisation of articles",
    ],
    correctIndex: 2,
    explanation:
      "Object detection is a computer-vision task. The others all deal with text or speech, which are NLP.",
    topic: "applications",
  },

  /* ------------------------------------------------------------------ *
   * 7. AI ETHICS                                                        *
   * ------------------------------------------------------------------ */
  {
    id: "eth-001",
    chapter: "ethics",
    difficulty: "easy",
    type: "mcq",
    question: "AI bias usually arises from:",
    options: [
      "Perfectly balanced data",
      "Training data that unfairly over- or under-represents certain groups",
      "Using Python instead of Java",
      "Running on the cloud",
    ],
    correctIndex: 1,
    explanation:
      "If the data reflects historical or sampling bias, the model will learn and amplify that bias in its predictions.",
    topic: "bias",
  },
  {
    id: "eth-002",
    chapter: "ethics",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is an example of an AI privacy concern?",
    options: [
      "Storing everyone's face data without consent",
      "A bar chart in a textbook",
      "A calculator app",
      "A multiplication table",
    ],
    correctIndex: 0,
    explanation:
      "Collecting biometric data without consent violates privacy and can be illegal under data-protection laws.",
    topic: "privacy",
  },
  {
    id: "eth-003",
    chapter: "ethics",
    difficulty: "easy",
    type: "mcq",
    question: "A 'deepfake' is:",
    options: [
      "A type of database",
      "A synthetic image or video generated by AI that shows people doing or saying things they never did",
      "An encryption standard",
      "A CNN architecture",
    ],
    correctIndex: 1,
    explanation:
      "Deepfakes use generative models to create highly realistic fake media and raise serious misinformation concerns.",
    topic: "deepfakes",
  },
  {
    id: "eth-004",
    chapter: "ethics",
    difficulty: "medium",
    type: "mcq",
    question: "Which of these is a principle of Responsible AI?",
    options: [
      "Collect as much data as possible, consent or not",
      "Transparency, fairness, privacy and accountability",
      "Hide how the model works from everyone",
      "Use AI to automate every decision without oversight",
    ],
    correctIndex: 1,
    explanation:
      "Responsible AI frameworks emphasise being fair, transparent, privacy-respecting and accountable for the impact of AI systems.",
    topic: "responsible-ai",
  },
  {
    id: "eth-005",
    chapter: "ethics",
    difficulty: "easy",
    type: "true-false",
    question: "It is ethical to train a facial-recognition model on photos scraped without users' consent.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Collecting biometric images without informed consent violates privacy norms and, in many jurisdictions, the law.",
    topic: "privacy",
  },
  {
    id: "eth-006",
    chapter: "ethics",
    difficulty: "medium",
    type: "mcq",
    question: "A hiring AI trained mostly on resumes from male engineers may:",
    options: [
      "Be perfectly fair",
      "Systematically disadvantage female candidates due to biased training data",
      "Give random results",
      "Work better for women",
    ],
    correctIndex: 1,
    explanation:
      "The model learns historical hiring patterns, which can encode past discrimination - a well-documented real-world case.",
    topic: "bias",
  },
  {
    id: "eth-007",
    chapter: "ethics",
    difficulty: "medium",
    type: "mcq",
    question: "Explainability in AI refers to:",
    options: [
      "The ability to explain how and why a model made a specific decision",
      "Translating the model into English",
      "Making the UI colourful",
      "Encrypting the weights",
    ],
    correctIndex: 0,
    explanation:
      "Explainable AI (XAI) gives humans insight into the factors a model used, which is vital for trust and accountability.",
    topic: "responsible-ai",
  },
  {
    id: "eth-008",
    chapter: "ethics",
    difficulty: "medium",
    type: "mcq",
    question: "Which of the following is a legitimate concern about generative AI like deepfakes?",
    options: [
      "They can be used to spread misinformation and defame people",
      "They make images faster to load",
      "They reduce file sizes",
      "They speed up your laptop",
    ],
    correctIndex: 0,
    explanation:
      "Generated media can impersonate real people, making deepfakes a potent tool for misinformation, fraud and harassment.",
    topic: "deepfakes",
  },
  {
    id: "eth-009",
    chapter: "ethics",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following protects the personal data of Indian citizens digitally?",
    options: [
      "Digital Personal Data Protection Act (DPDP)",
      "Income Tax Act",
      "Traffic Rules Act",
      "Education Policy",
    ],
    correctIndex: 0,
    explanation:
      "India's DPDP Act (2023) sets rules for how personal data can be collected, stored and processed.",
    topic: "privacy",
  },
  {
    id: "eth-010",
    chapter: "ethics",
    difficulty: "hard",
    type: "mcq",
    question: "'Fairness' in AI usually requires that the model:",
    options: [
      "Performs equally well across relevant groups like gender, region or ethnicity",
      "Only answers 'yes' to every question",
      "Runs on every device",
      "Has the largest possible dataset",
    ],
    correctIndex: 0,
    explanation:
      "Fair models should not systematically under-serve or harm any specific demographic, which requires checking performance across groups.",
    topic: "responsible-ai",
  },
  {
    id: "eth-011",
    chapter: "ethics",
    difficulty: "easy",
    type: "true-false",
    question: "An AI system can be held legally accountable like a human being.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Legally, the developers, deployers and owners of the system are held accountable - not the AI itself.",
    topic: "responsible-ai",
  },
  {
    id: "eth-012",
    chapter: "ethics",
    difficulty: "medium",
    type: "mcq",
    question: "Which of these is an example of data anonymisation?",
    options: [
      "Removing or masking names and ID numbers so individuals cannot be identified",
      "Publishing raw names and addresses",
      "Sharing passwords openly",
      "Encrypting images",
    ],
    correctIndex: 0,
    explanation:
      "Anonymisation strips or replaces identifiers so datasets can be studied without exposing individuals.",
    topic: "privacy",
  },
  {
    id: "eth-013",
    chapter: "ethics",
    difficulty: "medium",
    type: "mcq",
    question: "If a self-driving car causes an accident, accountability typically lies with:",
    options: [
      "The car itself",
      "The manufacturer, software developers and operators - not the car",
      "The road",
      "No one",
    ],
    correctIndex: 1,
    explanation:
      "Since the AI is not a legal person, liability is spread across the humans and organisations that built and deployed it.",
    topic: "responsible-ai",
  },
  {
    id: "eth-014",
    chapter: "ethics",
    difficulty: "easy",
    type: "mcq",
    question: "Which of the following is NOT one of the core ethical concerns about AI?",
    options: ["Bias", "Privacy", "Accountability", "Screen brightness"],
    correctIndex: 3,
    explanation:
      "Bias, privacy and accountability are central AI ethics topics. Screen brightness is a hardware setting with no direct ethical dimension.",
    topic: "responsible-ai",
  },
  {
    id: "eth-015",
    chapter: "ethics",
    difficulty: "hard",
    type: "mcq",
    question: "'Algorithmic transparency' means:",
    options: [
      "Keeping the algorithm completely secret",
      "Making the logic and data sources of the algorithm open to scrutiny",
      "Using transparent plastic on the computer",
      "Outputting only yes/no answers",
    ],
    correctIndex: 1,
    explanation:
      "Transparency means stakeholders can understand how decisions are made - crucial for trust, auditing and legal compliance.",
    topic: "responsible-ai",
  },
  {
    id: "eth-016",
    chapter: "ethics",
    difficulty: "medium",
    type: "true-false",
    question: "Using AI to automatically reject loan applicants without human review is an ethical concern.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Fully automated high-stakes decisions can amplify bias and remove accountability; most frameworks recommend meaningful human oversight.",
    topic: "responsible-ai",
  },
];

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

export function getQuestionsByChapter(slug: string): ExamQuestion[] {
  return EXAM_QUESTIONS.filter((q) => q.chapter === slug);
}

export function getQuestionById(id: string): ExamQuestion | undefined {
  return EXAM_QUESTIONS.find((q) => q.id === id);
}

/** Deterministic PRNG so the same seed produces the same paper. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Produce a balanced sample paper - draws roughly equal numbers of questions
 * from each chapter so the paper covers the syllabus. Deterministic given a seed.
 */
export function getSamplePaper(seed: number, count: number = 30): ExamQuestion[] {
  const rng = mulberry32(seed);
  const perChapter = Math.max(1, Math.floor(count / EXAM_CHAPTERS.length));
  const picks: ExamQuestion[] = [];

  for (const ch of EXAM_CHAPTERS) {
    const pool = shuffle(getQuestionsByChapter(ch.slug), rng);
    picks.push(...pool.slice(0, perChapter));
  }

  // Fill remaining slots with a random pool of unused questions
  if (picks.length < count) {
    const usedIds = new Set(picks.map((q) => q.id));
    const leftover = shuffle(
      EXAM_QUESTIONS.filter((q) => !usedIds.has(q.id)),
      rng,
    );
    for (const q of leftover) {
      if (picks.length >= count) break;
      picks.push(q);
    }
  }

  return shuffle(picks, rng).slice(0, count);
}
