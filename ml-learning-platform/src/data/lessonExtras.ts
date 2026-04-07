import type { PredictionPrompt } from "../components/PredictionGate";
import type { ReviewCardDef } from "../utils/reviewDeck";

interface LessonExtras {
  predict: PredictionPrompt;
  cards: Omit<ReviewCardDef, "lessonPath" | "id">[];
}

export const LESSON_EXTRAS: Record<string, LessonExtras> = {
  "/level1/machines": {
    predict: {
      type: "mcq",
      question: "If a machine takes the number 5 and its rule is 'double it, then add 3', what comes out?",
      options: ["8", "13", "10", "16"],
    },
    cards: [
      { question: "What are the 3 parts of any machine?", answer: "Input, Rule (process), and Output." },
    ],
  },
  "/level1/computers": {
    predict: {
      type: "mcq",
      question: "What language do computers actually speak deep down?",
      options: ["English", "0s and 1s (binary)", "Math symbols", "Pictures"],
    },
    cards: [
      { question: "What is binary?", answer: "A number system using only 0 and 1, the language computers use." },
    ],
  },
  "/level1/data": {
    predict: {
      type: "text",
      question: "Name 3 examples of data your phone collects about you every day.",
    },
    cards: [
      { question: "What is data?", answer: "Information stored in a form a computer can read, like numbers, text, or images." },
    ],
  },
  "/level2/coordinates": {
    predict: {
      type: "numeric",
      question: "On a graph, the point (3, 4) is how many steps to the right of the origin?",
    },
    cards: [
      { question: "What does the point (x, y) mean?", answer: "x is steps right, y is steps up from the origin (0,0)." },
    ],
  },
  "/level2/patterns": {
    predict: {
      type: "text",
      question: "What pattern do you see in: 2, 4, 8, 16, ___ ?",
    },
    cards: [
      { question: "Why do patterns matter in ML?", answer: "Machine learning is all about finding patterns in data and using them to predict new things." },
    ],
  },
  "/level2/sorting": {
    predict: {
      type: "mcq",
      question: "Sorting fruits into 'apples' and 'oranges' is an example of...",
      options: ["Counting", "Grouping (classification)", "Adding", "Drawing"],
    },
    cards: [
      { question: "What does it mean to 'group' data?", answer: "Putting similar items into the same category based on shared features." },
    ],
  },
  "/level2/outliers": {
    predict: {
      type: "mcq",
      question: "In the list 3, 4, 5, 4, 3, 5, 99, 4 — which value is the outlier?",
      options: ["3", "4", "5", "99"],
    },
    cards: [
      { question: "What is an outlier?", answer: "A data point that lies far away from the rest — much higher or lower than the typical values." },
      { question: "How does an outlier affect the mean (average)?", answer: "It pulls the mean toward itself, making the average misleading." },
      { question: "Should you always delete outliers?", answer: "No — sometimes they're mistakes, but other times they're the most important discovery in your data." },
    ],
  },
  "/level2/averages": {
    predict: {
      type: "numeric",
      question: "What's the mean (average) of 4, 6, 8, 10?",
    },
    cards: [
      { question: "How do you compute the mean?", answer: "Add all the values and divide by how many there are." },
      { question: "How do you compute the median?", answer: "Sort the values and pick the one in the middle." },
      { question: "Which is more affected by outliers — mean or median?", answer: "The mean. The median ignores extreme values and only cares about the middle position." },
    ],
  },
  "/level3/predictions": {
    predict: {
      type: "text",
      question: "If it rained yesterday and today, what's your prediction for tomorrow? Why?",
    },
    cards: [
      { question: "What is a prediction?", answer: "A guess about something we don't know yet, based on patterns in things we do know." },
    ],
  },
  "/level3/best-line": {
    predict: {
      type: "mcq",
      question: "The 'best line' through a bunch of points is the one that...",
      options: ["Touches the most points", "Has the smallest total distance to all points", "Is the longest", "Goes through (0,0)"],
    },
    cards: [
      { question: "What makes a line the 'best fit'?", answer: "It minimizes the total distance (error) between the line and all the data points." },
    ],
  },
  "/level3/algorithms": {
    predict: {
      type: "text",
      question: "Write a 3-step algorithm for brushing your teeth.",
    },
    cards: [
      { question: "What is an algorithm?", answer: "A step-by-step set of instructions to solve a problem or complete a task." },
    ],
  },
  "/level3/how-computers-learn": {
    predict: {
      type: "mcq",
      question: "Computers 'learn' by...",
      options: ["Reading books", "Adjusting their rules based on examples and mistakes", "Asking humans", "Magic"],
    },
    cards: [
      { question: "How does a computer learn from data?", answer: "It tries a guess, checks how wrong it was, and adjusts its rule to do better next time." },
    ],
  },
  "/level4/supervised-learning": {
    predict: {
      type: "mcq",
      question: "In supervised learning, what does the computer get along with the data?",
      options: ["Money", "The correct answers (labels)", "Random guesses", "Nothing"],
    },
    cards: [
      { question: "What is supervised learning?", answer: "Learning from data that comes with the correct answers (labels) attached." },
    ],
  },
  "/level4/knn": {
    predict: {
      type: "text",
      question: "If you had to guess a new student's favorite subject, would you ask their nearest classmates or random strangers? Why?",
    },
    cards: [
      { question: "How does K-Nearest Neighbors work?", answer: "It looks at the K closest examples and votes for the most common label among them." },
    ],
  },
  "/level4/decision-trees": {
    predict: {
      type: "mcq",
      question: "A decision tree makes choices by...",
      options: ["Flipping coins", "Asking yes/no questions one after another", "Doing math", "Randomly picking"],
    },
    cards: [
      { question: "What is a decision tree?", answer: "A model that classifies things by asking a series of yes/no questions, branching at each one." },
    ],
  },
  "/level4/measuring-success": {
    predict: {
      type: "numeric",
      question: "If a model gets 80 out of 100 predictions right, what's its accuracy in percent?",
    },
    cards: [
      { question: "What is accuracy?", answer: "The fraction of predictions a model gets correct, usually shown as a percentage." },
    ],
  },
  "/level4/train-test-split": {
    predict: {
      type: "mcq",
      question: "If a student memorizes the practice test answers and gets 100% on the same test, did they really learn?",
      options: [
        "Yes, 100% means they learned",
        "No — memorizing isn't learning. We need a NEW test.",
        "Only if the test was hard",
        "Yes, but only on Tuesdays",
      ],
    },
    cards: [
      { question: "Why split data into training and test sets?", answer: "So we can test the model on data it has never seen — the only honest way to know it learned the pattern." },
      { question: "What's a typical train/test split ratio?", answer: "80% training, 20% test. Big enough to learn from, big enough to grade fairly." },
      { question: "What is a 'data leak'?", answer: "When test data accidentally appears in the training set, making model scores look better than they really are." },
    ],
  },
  "/level4/confusion-matrix": {
    predict: {
      type: "mcq",
      question: "A cancer detector tells a sick patient 'You're healthy.' What kind of mistake is this?",
      options: [
        "True Positive",
        "False Positive",
        "True Negative",
        "False Negative",
      ],
      hint: "The model predicted NO, but the truth was YES.",
    },
    cards: [
      { question: "What does a confusion matrix show?", answer: "A 2x2 grid breaking down predictions into True Positives, False Positives, True Negatives, and False Negatives." },
      { question: "What is a False Negative?", answer: "When the model predicts NO but the real answer was YES — a missed catch." },
      { question: "Why is accuracy alone not enough?", answer: "It hides which KIND of mistake the model makes — and some mistakes (like missing a fire) are far worse than others." },
    ],
  },
  "/level5/unsupervised-learning": {
    predict: {
      type: "mcq",
      question: "Unsupervised learning is different because the data has...",
      options: ["More numbers", "No labels (no correct answers given)", "Pictures only", "A teacher watching"],
    },
    cards: [
      { question: "What is unsupervised learning?", answer: "Learning patterns from data that has no labels — the computer finds groups on its own." },
    ],
  },
  "/level5/kmeans": {
    predict: {
      type: "text",
      question: "If you dumped 100 candies on a table, how would YOU group them without being told the categories?",
    },
    cards: [
      { question: "What does K-Means do?", answer: "It groups data into K clusters by repeatedly moving cluster centers to the average of their nearest points." },
    ],
  },
  "/level5/choosing-k": {
    predict: {
      type: "mcq",
      question: "If K is too big, what happens?",
      options: ["Better clusters always", "Too many tiny groups that don't mean much", "The model crashes", "Nothing changes"],
    },
    cards: [
      { question: "Why is choosing K hard?", answer: "Too small a K merges different things; too big a K splits real groups into noise." },
    ],
  },
  "/level6/perceptron": {
    predict: {
      type: "mcq",
      question: "A perceptron is inspired by...",
      options: ["A calculator", "A single brain cell (neuron)", "A computer chip", "A camera"],
    },
    cards: [
      { question: "What is a perceptron?", answer: "The simplest neural network — one neuron that takes inputs, weights them, sums them up, and fires." },
    ],
  },
  "/level6/activation-functions": {
    predict: {
      type: "text",
      question: "Why do you think a neuron needs to decide 'fire or don't fire' instead of just passing numbers along?",
    },
    cards: [
      { question: "What does an activation function do?", answer: "It decides how strongly a neuron fires, letting the network model non-linear patterns." },
    ],
  },
  "/level6/neural-network": {
    predict: {
      type: "mcq",
      question: "A neural network is made of...",
      options: ["One giant neuron", "Many neurons connected in layers", "Wires only", "Transistors"],
    },
    cards: [
      { question: "What are 'layers' in a neural network?", answer: "Groups of neurons stacked together — input layer, hidden layers, and output layer." },
    ],
  },
  "/level6/backpropagation": {
    predict: {
      type: "text",
      question: "If a network guesses wrong, how would YOU tell each neuron how to fix itself?",
    },
    cards: [
      { question: "What is backpropagation?", answer: "An algorithm that sends the error backward through the network to update each weight." },
    ],
  },
  "/level6/weights-biases": {
    predict: {
      type: "numeric",
      question: "If a neuron has input 5 and weight 3, what's the output (input × weight)?",
    },
    cards: [
      { question: "What does a 'weight' do in a neuron?", answer: "Tells the neuron how important each input is. Big weight = listen closely; zero = ignore; negative = argues against firing." },
      { question: "What is a 'bias' in a neuron?", answer: "A constant nudge added to the weighted sum, letting the neuron fire (or not) regardless of inputs." },
      { question: "What does training a neural network actually do?", answer: "It slowly adjusts millions of weights and biases until the network produces correct outputs." },
    ],
  },
  "/level6/forward-pass": {
    predict: {
      type: "mcq",
      question: "When you ask ChatGPT a question, what's mainly happening inside?",
      options: [
        "It's training itself on your question",
        "A forward pass through a giant network of weights",
        "Random guessing",
        "Looking up the answer in a database",
      ],
    },
    cards: [
      { question: "What is a forward pass?", answer: "Data flowing from inputs through every layer of the network to produce a prediction at the output." },
      { question: "What's the difference between forward and backward pass?", answer: "Forward = make a prediction (using the network). Backward = fix the weights (training)." },
      { question: "What does each neuron do during a forward pass?", answer: "Multiply inputs by weights, add them up with a bias, run through an activation function, pass to the next layer." },
    ],
  },
  "/level7/gradient-descent": {
    predict: {
      type: "mcq",
      question: "Gradient descent is like...",
      options: ["Climbing a mountain blindfolded", "Walking downhill to find the lowest valley", "Running in circles", "Standing still"],
    },
    cards: [
      { question: "What is gradient descent?", answer: "An algorithm that finds the minimum of a function by stepping in the direction of steepest descent." },
    ],
  },
  "/level7/learning-rate": {
    predict: {
      type: "mcq",
      question: "If the learning rate is too big, the model will...",
      options: ["Learn fast and perfect", "Overshoot and never settle", "Never start", "Crash"],
    },
    cards: [
      { question: "What is the learning rate?", answer: "How big a step the model takes when updating its weights — too big overshoots, too small is slow." },
    ],
  },
  "/level7/overfitting": {
    predict: {
      type: "mcq",
      question: "An overfit model is one that...",
      options: ["Works great on new data", "Memorized the training data but fails on new examples", "Is too small", "Has no errors"],
    },
    cards: [
      { question: "What is overfitting?", answer: "When a model learns the training data too well, including noise, and fails to generalize to new data." },
    ],
  },
  "/level7/sgd-vs-batch": {
    predict: {
      type: "mcq",
      question: "SGD updates weights after looking at...",
      options: ["All the data at once", "One example at a time", "Half the data", "No data"],
    },
    cards: [
      { question: "What is the difference between SGD and Batch GD?", answer: "Batch uses all data per update; SGD updates after each example, faster but noisier." },
    ],
  },
  "/level8/images-as-data": {
    predict: {
      type: "mcq",
      question: "To a computer, an image is really...",
      options: ["A drawing", "A grid of numbers (pixel values)", "A video", "A word"],
    },
    cards: [
      { question: "How does a computer see an image?", answer: "As a grid of pixel values — each pixel is a number representing brightness or color." },
    ],
  },
  "/level8/filters": {
    predict: {
      type: "text",
      question: "If you wanted to find edges in a photo, what kind of pattern would your 'detector' look for?",
    },
    cards: [
      { question: "What is a convolution filter?", answer: "A small grid of numbers slid across an image to detect features like edges, corners, or textures." },
    ],
  },
  "/level8/stride-padding": {
    predict: {
      type: "mcq",
      question: "Padding adds zeros around an image so that...",
      options: ["It looks bigger", "The filter can reach the edges and the output size is preserved", "Colors change", "It loads faster"],
    },
    cards: [
      { question: "What do stride and padding control?", answer: "Stride is how far the filter jumps each step; padding adds borders so edges aren't lost." },
    ],
  },
  "/level8/history": {
    predict: {
      type: "mcq",
      question: "Who do you think built the first 'learning machine' (the Perceptron)?",
      options: [
        "Alan Turing in 1950",
        "Frank Rosenblatt in 1958",
        "Geoffrey Hinton in 1986",
        "OpenAI in 2022",
      ],
      hint: "It was way earlier than you might think!",
    },
    cards: [
      { question: "When was the first Perceptron built and by whom?", answer: "Frank Rosenblatt built it in 1958 — the first machine that could learn from examples." },
      { question: "What was AlexNet (2012) and why did it matter?", answer: "A deep neural network that crushed image recognition using GPUs. It started the modern deep learning boom." },
      { question: "What architecture powers ChatGPT and Claude?", answer: "The Transformer, introduced in the 2017 paper 'Attention Is All You Need'." },
    ],
  },
  "/level8/mini-cnn": {
    predict: {
      type: "text",
      question: "If you were building a CNN to spot cats, what features would the early layers learn first?",
    },
    cards: [
      { question: "What is a CNN?", answer: "A Convolutional Neural Network — a neural network that uses convolution filters to recognize patterns in images." },
    ],
  },
};

export function getLessonExtras(path: string) {
  return LESSON_EXTRAS[path];
}
