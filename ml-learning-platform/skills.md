# Skills — ML Learning Platform

## Tech Skills Used

### Frontend Framework
- **Next.js 15** — App Router, file-based routing, route groups, layouts
- **React 19** — Hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `useSyncExternalStore`)
- **TypeScript 5.9** — Strict mode, interfaces, generics, type narrowing

### Styling & Design
- **Tailwind CSS v4** — `@theme` tokens, utility-first, responsive breakpoints
- **Custom CSS** — Keyframe animations, hand-drawn aesthetic, notebook grid backgrounds
- **SVG Graphics** — Interactive coordinate grids, neural network diagrams, data visualizations

### State Management
- **localStorage** — Persistent client-side state (progress, predictions, review cards)
- **useSyncExternalStore** — React-native external store pattern (no Redux/Zustand needed)
- **Cross-tab sync** — CustomEvent + storage event listeners for multi-tab consistency

### Audio
- **Web Audio API** — Programmatic sound effects (oscillators, gain nodes, noise buffers)

### Computer Vision (Level 9)
- **MediaPipe Vision** — Hand landmark detection, gesture recognition, object detection
- **getUserMedia** — Browser webcam access with permission handling
- **CDN lazy loading** — Dynamic import of WASM vision modules at runtime

### Build & Tooling
- **npm** — Package management and scripts
- **PostCSS** — Tailwind v4 integration via `@tailwindcss/postcss`

## Educational / Domain Skills

### Machine Learning Concepts Covered
1. **Fundamentals** — Machines, data, binary, sensors, bits/bytes
2. **Data Analysis** — Coordinates, patterns, sorting, outliers, averages (mean/median)
3. **Prediction** — Best-fit line, algorithms, features/labels, train/test split
4. **Supervised Learning** — KNN, decision trees, accuracy, confusion matrix
5. **Unsupervised Learning** — K-Means clustering, choosing K, anomaly detection, dimensionality reduction
6. **Neural Networks** — Perceptron, activation functions, layers, backpropagation, weights/biases, forward pass
7. **Training** — Gradient descent, learning rate, overfitting/regularization, SGD vs batch
8. **Computer Vision** — Pixels, convolution filters, stride/padding/pooling, CNNs
9. **Live AI** — Hand tracking, gesture recognition, object detection via camera

### Pedagogical Techniques
- **Spaced repetition** — Leitner 5-box system with intervals (10min to 14 days)
- **Predict-first** — Pre-assessment gates before lesson content
- **Progressive unlock** — Sequential lesson/tab completion requirements
- **Story-driven learning** — Characters (Aru & Byte) with dialogue-based narratives
- **Interactive activities** — Click/drag SVG-based explorations for each concept
- **Multi-modal feedback** — Sound effects, visual highlights, animation on correct/incorrect

## Project Architecture Skills
- **Route groups** — `(lessons)` group for shared sidebar layout without URL prefix
- **Component composition** — `LessonShell` as a reusable lesson framework
- **Separation of concerns** — Routes (app/), views, components, lessons, utils, hooks, data
- **Migration** — Successfully migrated from Vite + React Router to Next.js App Router
