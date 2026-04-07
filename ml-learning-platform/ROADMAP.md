# ML Learning Platform  End-to-End Roadmap

> **Goal:** Make this the place where a kid says *"I built a neural net from scratch in my browser and I actually saw it think."*
> **Audience:** Two tracks  **Explorer** (Class 9 / K-12 / homeschool USA) and **Builder** (high-school CS / college / engineer).
> **Moat:** Visualization-first, hands-on, browser-only, no-install, mobile-friendly. Things Coursera/Brainly/Doubtnut **structurally cannot do** because they're video/text platforms.

---

## 1. The "Unfair Advantage" Pillars

These are the things competitors *can't copy in a weekend*. Every feature below should reinforce at least one.

| Pillar | What it means | Why competitors can't match |
|---|---|---|
| **P1. See-It-Move** | Every concept has a live, interactive SVG/Canvas/3D viz with sliders | Coursera = video. 3B1B = beautiful but passive. We are *playable*. |
| **P2. Build-From-Zero** | Student literally drags neurons, types weights, watches forward + backprop happen in real time | Nobody on Brainly/Doubtnut does this. fast.ai jumps to PyTorch too fast. |
| **P3. Your-Own-Data** | Webcam, mic, drawing canvas, photo upload → train a model on *you* | Impossible on a video platform. This is the screenshot kids share. |
| **P4. Two Brains, One Page** | A kid mode (story + emoji) and a builder mode (math + code) toggle on the same lesson | Nobody serves both audiences in one product. |
| **P5. Browser-Native Python** | Pyodide → real numpy/sklearn, no install, works on a Chromebook | Schools love this. Parents love this. Mobile works. |
| **P6. Zero-Cost AI** | Tiny in-browser models (TF.js, ONNX-web, transformers.js) for "AI moments" without paid APIs | Free forever, scales to millions, no key leaks. |

---

## 2. Audit of What You Already Have

(So we don't repeat work.)

- **Level 1**  Machines, Computers, Data
- **Level 2**  Coordinates, Patterns, Sorting
- **Level 3**  Predictions, Best Line, Algorithms, How Computers Learn
- **Level 4**  Supervised, KNN, Decision Trees, Measuring Success
- **Level 5**  Unsupervised, K-Means, Choosing K
- **Level 6**  Perceptron, Activation, Neural Net, Backprop
- **Level 7**  Gradient Descent, Learning Rate, Overfitting, SGD vs Batch
- **Level 8**  Images as Data, Filters, Stride/Padding, Mini CNN

**Honest gap analysis:**
1. No **data pipeline** content (cleaning, EDA, feature engineering, splits, leakage).
2. No **evaluation depth** (confusion matrix, ROC, PR curve, cross-validation, bias/variance live demo).
3. No **real datasets**  students never touch a CSV.
4. No **modern ML**  no embeddings, no transformers, no LLMs, no RAG, no diffusion.
5. No **deployment / "ship it"**  the loop ends at training.
6. No **project capstones**  nothing the student can put on a portfolio / show parents.
7. No **Python playground**  currently 100% TypeScript activities; the "I trained a model" moment never uses real ML code.
8. No **assessment / certificate**  nothing to monetize beyond access.
9. No **teacher / parent dashboard**  homeschool USA buyers will ask for this.
10. No **community / sharing**  every trained model dies in the tab.

---

## 3. New Levels to Add (in order of priority)

### **Level 9  Real Data, Real Mess** ⭐ CRITICAL GAP
The level that turns "toy demos" into "actual ML."

- **L30  Meet a CSV**  drag-drop a CSV, see rows/cols, types auto-detected, missing cells highlighted in coral. Built-in datasets: Titanic, Iris, Pokémon, NBA stats, Spotify songs (kids relate).
- **L31  Cleaning Lab**  interactive: click a missing cell → pick fill strategy (mean/median/drop) → *see the histogram update live*.
- **L32  Feature Engineering Playground**  combine columns with drag-drop blocks (`age / height`, `log(price)`, one-hot), see correlation heatmap update.
- **L33  The Leakage Trap**  a dramatized lesson: "Why your 99% model fails in real life." Animated split visualization. This is the lesson nobody else teaches well.
- **L34  Train/Val/Test Split, Visually**  drag a slider, watch the dataset physically split into 3 colored bins.

### **Level 10  How Good Is Your Model, Really?**
- **L35  Confusion Matrix Sandbox**  drag prediction dots into TP/FP/TN/FN buckets, watch precision/recall/F1 update live.
- **L36  ROC & PR Curves That Move**  slide the threshold, watch the curve trace itself and the dot move.
- **L37  Bias vs Variance Seesaw**  literal animated seesaw. Add capacity → variance up, bias down.
- **L38  Cross-Validation Carousel**  animated K-fold rotation with live mean ± std bars.

### **Level 11  Classical ML Deep Dive** (fills holes Coursera glosses over)
- **L39  Linear & Logistic Regression from Scratch** (live coefficient sliders → decision boundary morphs).
- **L40  Random Forests**  grow a forest tree by tree, see variance shrink.
- **L41  SVM & The Kernel Trick**  2D points lift into 3D in **Three.js**, plane separates them. (This is a P1+P3 moment.)
- **L42  Naive Bayes Spam Lab**  paste an email, watch each word pull the bar toward SPAM/HAM in real time.
- **L43  PCA Projector**  high-D dataset collapses into 2D, students rotate the axes themselves.

### **Level 12  Deep Learning, For Real**
- **L44  Optimizer Race**  SGD vs Momentum vs Adam vs RMSProp running side-by-side on the same loss landscape (**3D Three.js** terrain). Multiple balls rolling.
- **L45  Regularization Lab**  toggle L1/L2/Dropout, watch weights die in real time on a heatmap.
- **L46  Batch Norm Visualizer**  see activations before/after BN as histograms.
- **L47  Build-Your-Own MNIST**  *student draws a digit on canvas, in-browser CNN classifies it.* Train it themselves on a tiny subset. **This is the screenshot lesson.**
- **L48  Transfer Learning**  take a frozen MobileNet, retrain the head on the **student's webcam** (5 photos of 2 things). Teachable-Machine but inside the lesson with full explanation. *(This single lesson sells the course.)*

### **Level 13  Computer Vision Beyond MNIST**
- **L49  Object Detection Live**  webcam → COCO-SSD in browser → boxes drawn with sketchy borders.
- **L50  Style Transfer Playground**  upload selfie + a Van Gogh, in-browser style transfer.
- **L51  Pose Estimation Game**  use MoveNet to make the student do yoga poses, track score.
- **L52  Image Segmentation Painter**  click an object, watch it get masked.

### **Level 14  Sequences, Language & Embeddings**
- **L53  Words as Vectors**  type two words → see cosine similarity bar + 2D projection.
- **L54  Embedding Atlas**  explore a 10k-word UMAP cloud in **Three.js**, fly through it.
- **L55  RNN as a Storyteller**  character-level RNN trained live on a paragraph the student types.
- **L56  Attention, Visualized**  interactive attention heatmap on a sentence. Drag the query word, watch the weights light up.

### **Level 15  Transformers & LLMs (the part everyone wants)**
- **L57  Tokenizer Playground**  type any sentence, see BPE split it. Then "now type your name."
- **L58  Mini-GPT in Your Browser**  a tiny char-GPT (~1MB) running with transformers.js. Slide temperature, see outputs change.
- **L59  Inside an LLM Layer**  animated Q/K/V matrix multiply, with real numbers.
- **L60  Build a RAG Bot**  student uploads a PDF (their textbook!), free local embeddings (MiniLM via transformers.js), chat with it. **No API key. Ever.**
- **L61  Prompting as Programming**  A/B test prompts on the local model, score outputs.

### **Level 16  Generative AI**
- **L62  Diffusion, One Step at a Time**  animated denoising on a tiny model. Slider scrubs through noise→image.
- **L63  GAN Tug-of-War**  generator vs discriminator animated as a game with HP bars.
- **L64  VAE Latent Space Explorer**  drag a 2D point, watch the decoded face/digit morph.

### **Level 17  MLOps & Ship It** ⭐ THE "I MADE SOMETHING REAL" LEVEL
- **L65  From Notebook to Web App**  student exports their L47 model to TF.js → drops it into a provided template → gets a shareable URL (host on free GitHub Pages from inside the app).
- **L66  Model Cards & Ethics**  fill out a real model card, get a "responsible AI" certificate.
- **L67  Monitoring & Drift**  animated dashboard, simulate data drift with a slider.
- **L68  Versioning & Reproducibility**  git for models, simplified.

### **Level 18  Capstone Projects** (portfolio gold)
Pick one, ship it, get a shareable page:
- **C1.** "Is this my cat?"  webcam classifier deployed.
- **C2.** Spotify mood predictor  uses the L30 dataset.
- **C3.** Handwritten math solver  draw an equation, OCR + solve.
- **C4.** Personal RAG over your notes.
- **C5.** AI-powered Pong (student trains the paddle).
- **C6.** Pose-controlled browser game.

---

## 4. Cross-Cutting Features (the platform layer)

### **A. Dual-mode rendering ("Two Brains")**  P4
Every lesson has a top-right toggle: **🧒 Explorer** | **🧑‍💻 Builder**
- Explorer: story, doodles, no math, big buttons, voice-over option.
- Builder: equations in KaTeX, code snippets, "show the math" expansions.
- Same component, different content slots. Build once.

### **B. Browser Python Playground**  P5
- Pyodide-loaded `<PyCell>` component used inside lessons.
- Pre-loaded numpy, pandas, scikit-learn, matplotlib.
- Output renders inline (text + matplotlib SVGs).
- "Run", "Reset", "Reveal Solution" buttons.
- Critical for the Builder track and high-schoolers prepping for AP CS.

### **C. Live Model Sandbox**  P2
A reusable `<NeuralLab>` panel  drag neurons, set activations, paste data, hit train, watch loss + decision boundary live. Reuse across L18–L48.

### **D. "Your Data" Capture Toolkit**  P3
Reusable hooks:
- `useWebcam()` → frames into a tensor.
- `useDrawCanvas()` → 28×28 grayscale.
- `useMicrophone()` → spectrogram tensor.
- `useFileDrop()` → CSV/JSON/Image.
Powers L47, L48, L49, L51, L60.

### **E. 3D Visualization Layer**  P1
Three.js + react-three-fiber wrapper components:
- `<LossLandscape3D>`  3D surface, ball rolls down. (L44)
- `<EmbeddingCloud3D>`  point cloud you can fly through. (L54)
- `<KernelLift>`  2D→3D point lift. (L41)
Mobile fallback: 2D contour.

### **F. Shareable "Model Snapshots"**
Every lesson: a "📸 Save my model" button → serializes weights + settings into a URL hash. Student tweets it, friend opens, sees the same network. *Viral loop.*

### **G. Progress, Streaks & Achievements**
- Duolingo-style daily streak.
- "Curious", "Tinkerer", "Debugger", "Shipper" badges.
- Per-level XP bar (already have sketchy theme to match).

### **H. Assessment Engine**
- Per-lesson: 1 quick quiz (3Q) + 1 "tinker challenge" (modify a sandbox to hit a target metric).
- Per-level: a graded mini-project.
- Auto-grading runs in browser (compare model accuracy on hidden test set).

### **I. Certificates** (the freemium paywall)
- Free: all lessons, all sandboxes, all sharing.
- Paid: signed PDF certificate per level + capstone, model-card review, "verified portfolio page" hosted on your domain. Parents pay for the credential.

### **J. Teacher / Parent Dashboard** ⭐ USA homeschool unlock
- Add students, see progress, see time-spent, see actual saved models.
- Lesson plans aligned to **Common Core / NGSS / AP CSP / UK KS3-4**. (Schools won't buy without this.)
- Print-friendly worksheets per lesson (parents love paper).

### **K. Mobile-First Polish**
- Every sandbox must work with one finger.
- Sliders large enough for touch.
- Three.js scenes have orbit-via-touch.
- Test on a $200 Android in Chrome.

### **L. Accessibility & i18n**
- WCAG AA contrast (your sketchy palette is close already).
- Voice-over for Explorer mode using browser TTS (free).
- Keyboard nav for sandboxes.
- Spanish first (huge in USA homeschool), then Hindi.

### **M. Community Layer (light)**
- Public "Wall of Models"  students publish their L47/L48/Capstone projects with one click.
- Upvote, remix (open in editor with same weights).
- No comments → no moderation nightmare.

### **N. AI Tutor (free, in-browser)**  P6
- Small local LLM (Phi-3-mini or Gemma-2B via transformers.js) that *only* answers about the current lesson, with the lesson's content in context.
- Falls back to a curated FAQ when the device can't run it.
- **Marketing line: "An AI tutor that runs on your laptop, with zero data sent anywhere. Ever."** Parents will love this.

---

## 5. Content Depth Upgrades for Existing Lessons

You said *"topics are not explained in detail."* Per existing lesson, add these slots:

1. **The Story** (60s comic-strip intro, sketchy theme already fits).
2. **The Intuition** (current activity  keep it).
3. **The Math** (Builder mode only  KaTeX, derivations, no skipping).
4. **The Code** (Pyodide cell  same thing in real Python).
5. **The Mistake** ("here's what goes wrong if you…")  interactive, students *cause* the bug.
6. **The Real World** (where this is used  Netflix, Spotify, Tesla, hospitals  with one real news link).
7. **The Challenge** (modify the sandbox to hit X).
8. **The Quiz** (3Q, instant feedback).
9. **The Recap Card** (printable, downloadable PNG  parents stick on fridge).

If every existing L1–L29 gets these 9 slots, the platform's perceived depth **5x** without adding new lessons.

---

## 6. Monetization Map (freemium)

| Tier | Price | What's in |
|---|---|---|
| **Free Forever** | $0 | All lessons, all sandboxes, share links, AI tutor, 1 capstone |
| **Builder** | $9/mo or $79/yr | All capstones, certificates, Python playground unlimited compute, hosted portfolio page |
| **Family** | $19/mo | 4 students, parent dashboard, printable worksheets |
| **Classroom** | $99/yr per teacher | Up to 30 students, lesson plans, standards alignment, gradebook export |

Free tier must feel *complete*, not crippled. The paid tier sells the **proof** (certificates, portfolio, dashboard), not the **content**.

---

## 7. Anti-Coursera Marketing Hooks

Concrete one-liners to use on the landing page / ads (USA audience):

1. *"Coursera shows you a video of a neural network. We let your kid build one."*
2. *"No installs. No accounts. No API keys. Open a tab, train a model in 4 minutes."*
3. *"The only ML course where Grade 9 and freshman engineering use the same playground."*
4. *"Your child's first AI project  saved as a link they can text to grandma."*
5. *"Runs on a Chromebook. Works offline after first load."*
6. *"From 'what is a number' to 'I built a chatbot'  without ever installing Python."*

---

## 8. Suggested Build Order (next 8 milestones)

1. **Dual-mode toggle** (§4A)  unlocks two audiences with one codebase. **Do this first.**
2. **Pyodide `<PyCell>` component** (§4B)  once it exists, every old lesson can grow a "Code" tab.
3. **L30–L34 (Real Data level)**  closes the biggest credibility gap.
4. **L47 Draw-Your-Own MNIST**  the screenshot lesson. Marketing fuel.
5. **L48 Webcam Transfer Learning**  the "wow" lesson. Marketing fuel.
6. **Model Snapshot share-links** (§4F)  viral loop.
7. **Teacher dashboard MVP** (§4J)  unlocks USA homeschool sales.
8. **L60 RAG-on-your-PDF**  kills "but ChatGPT already does this" objection because *it runs locally*.

After these 8, the product is **structurally different** from anything Coursera/Brainly/Doubtnut can ship, on a budget of $0 in API costs.

---

## 9. Open Questions for You

Before we start building, these decisions will shape everything:

1. **Pyodide is ~10MB on first load.** Are you ok with that for the Builder track? (Lazy-loaded only when a PyCell mounts.)
2. **Webcam/mic** require HTTPS. Confirm hosting is HTTPS (Vercel/Netlify/GitHub Pages all are).
3. **Storage of student work**  local-only (IndexedDB) to start, or do you want a backend (Supabase free tier) for cross-device sync?
4. **Which capstone do we build first?**  Pick 1 of C1–C6 from §3 Level 18. My vote: **C1 ("Is this my cat?")**  it's the demo that closes a sale in 30 seconds.
5. **Branding name?**  Right now it's "ml-learning-platform". A real name (e.g., *Synapse*, *Neuronotes*, *BuildBrains*) makes the marketing copy 10× stronger.
6. **What's in the other directories** (Python, Data Science)?  If they share a sidebar with this, the cross-sell story is huge: "ML pairs with Python pairs with Data Science = full data career path for $9/mo." Want me to plan that integration in a separate doc?
