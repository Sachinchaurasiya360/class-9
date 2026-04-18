/* --------------------------------------------------------------------------
 * Career catalog - PRD §22.1
 *
 * 10 AI careers for Indian students (Class 8-12). Pure data, no React imports.
 * Each entry is deliberately distinct so the quiz can differentiate matches
 * via tag overlap.
 * ------------------------------------------------------------------------ */

export type CareerTag =
  | "tech"
  | "data"
  | "research"
  | "creative"
  | "business"
  | "policy"
  | "build"
  | "communicate";

export type CareerAccent =
  | "coral"
  | "mint"
  | "yellow"
  | "lav"
  | "sky"
  | "peach";

export type Career = {
  slug: string;
  name: string;
  emoji: string;
  accent: CareerAccent;
  shortDescription: string;
  longDescription: string;
  tags: CareerTag[];
  dayInLife: string[];
  skills: { name: string; why: string }[];
  education: { stage: string; detail: string }[];
  subjects: string[];
  projectsToBuild: string[];
  colleges: string[];
  salaryRange: { entry: string; mid: string; senior: string };
  industryOutlook: string;
  alumniStories: { name: string; role: string; background: string }[];
};

export const CAREER_TAGS: CareerTag[] = [
  "tech",
  "data",
  "research",
  "creative",
  "business",
  "policy",
  "build",
  "communicate",
];

export const CAREERS: Career[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "ai-ml-engineer",
    name: "AI/ML Engineer",
    emoji: "🛠️",
    accent: "coral",
    shortDescription: "Build and deploy ML models that power real products used by millions.",
    longDescription:
      "AI/ML Engineers are the bridge between research papers and production software. In India's booming tech scene - from Flipkart's recommendation systems to Swiggy's delivery-time predictions - they take a trained model and make it work at scale: fast, reliable, and cheap. You'll write a lot of Python, read a lot of GitHub, and wake up at 3 AM exactly once when a model misbehaves in production.\n\nThe role sits at the intersection of software engineering and applied ML. Unlike researchers who publish papers, engineers care about latency, cost per inference, and whether the Bengaluru data centre can actually serve the model during IPL finals. It's a great career if you love coding and want your work to be used by actual humans within weeks, not years.\n\nIndian companies from startups to Jio are hiring aggressively. The best part: you don't need a PhD. A strong portfolio on GitHub and an engineering degree is usually enough to land interviews.",
    tags: ["tech", "build", "data"],
    dayInLife: [
      "Morning: stand-up with the ML platform team, review overnight model drift alerts",
      "Late morning: debug a feature pipeline that started dropping rows after a schema change",
      "Lunch: read a new paper on quantization with colleagues over filter coffee",
      "Afternoon: retrain a recommendation model and run A/B test comparisons in a notebook",
      "Late afternoon: code review for a teammate's inference service PR",
      "Evening: deploy the winning model to staging and set up monitoring dashboards",
    ],
    skills: [
      { name: "Python + NumPy/Pandas", why: "The daily driver for any ML work - data wrangling, experimentation, glue code" },
      { name: "PyTorch or TensorFlow", why: "You'll train, fine-tune, and debug models in one of these frameworks" },
      { name: "SQL + data pipelines", why: "Models eat data, and that data lives in warehouses you need to query" },
      { name: "Git + GitHub workflows", why: "Team-based coding requires PRs, branches, and merge discipline" },
      { name: "Linux command line", why: "Most training and inference servers run Linux - you'll live in the terminal" },
      { name: "Docker + basic Kubernetes", why: "Packaging models for deployment is table stakes in production ML" },
      { name: "Cloud platforms (AWS/GCP)", why: "Indian companies run on cloud GPUs - knowing one platform deeply is a huge edge" },
      { name: "Model evaluation & metrics", why: "You need to know whether a model is actually good, not just 'accurate on the test set'" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Pick PCM with Computer Science. Strong math fundamentals matter more than memorising code" },
      { stage: "Undergrad (B.Tech / B.E.)", detail: "Computer Science, IT, or Electronics. Build projects every semester - college projects count" },
      { stage: "Internships (6th-8th sem)", detail: "Aim for ML internships at Flipkart, Razorpay, Fractal, or research labs at IITs" },
      { stage: "First job", detail: "Junior ML Engineer or SDE with ML focus - expect 6 months of production ramp-up" },
      { stage: "Optional Masters", detail: "MS at IIIT-H or IISc helps if you want senior roles fast - not required to start" },
    ],
    subjects: ["Mathematics", "Computer Science", "Physics", "Statistics (if available)"],
    projectsToBuild: [
      "Movie recommendation system trained on MovieLens - deploy as a tiny web app",
      "Image classifier for Indian currency notes using TensorFlow Lite on your phone",
      "Stock price predictor with an LSTM on NSE data (predict next day's direction, not value)",
      "Fine-tune a small LLM on your own WhatsApp chat export to mimic your texting style",
      "A Twitter/X bot that flags misinformation in trending Indian political posts",
      "End-to-end MLOps project: train, version, deploy, and monitor a cat-vs-dog classifier",
    ],
    colleges: [
      "IIT Bombay - Computer Science & Engineering",
      "IIT Madras - CS with ML electives",
      "IIT Delhi - CS / Mathematics & Computing",
      "IIIT Hyderabad - CS with strong research culture",
      "IISc Bangalore (Masters) - gold standard for ML in India",
      "BITS Pilani - CS with great industry ties",
      "NIT Trichy / NIT Warangal - excellent ROI for ML careers",
    ],
    salaryRange: {
      entry: "₹8-15 LPA",
      mid: "₹20-40 LPA",
      senior: "₹50 LPA - 1.5 Cr",
    },
    industryOutlook:
      "India is the world's second-largest hub for AI talent and hiring is compounding every year. Every large Indian company - from banks like HDFC to fintechs like Razorpay - is now an ML shop. Expect demand to keep growing through the 2030s as regional-language AI becomes mainstream.",
    alumniStories: [
      {
        name: "Aditya Menon",
        role: "Senior ML Engineer at Flipkart",
        background:
          "NIT Trichy '21 Computer Science. Interned at a Bengaluru startup, built a Kaggle profile in his 3rd year, and joined Flipkart's personalization team straight out of college.",
      },
      {
        name: "Sneha Kulkarni",
        role: "ML Engineer at Razorpay",
        background:
          "BITS Pilani '22. Self-taught PyTorch in Class 12, won an Inter-IIT hackathon, and now builds fraud-detection models for UPI payments.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "data-scientist",
    name: "Data Scientist",
    emoji: "📊",
    accent: "mint",
    shortDescription: "Extract insights from messy data and help businesses make smarter decisions.",
    longDescription:
      "Data Scientists are the detectives of the tech world. Give them a spreadsheet with millions of rows and they'll tell you why Zomato orders dropped on Wednesday in Pune, or which Ola drivers are most likely to quit next month. The role combines statistics, coding, and storytelling - you're not just running regressions, you're convincing a skeptical CEO that the numbers mean something.\n\nIn India, data science roles are common at consulting firms like Fractal and MuSigma, product companies like Swiggy and CRED, and increasingly at traditional sectors like banking and pharma. Unlike ML engineers who build systems, data scientists are usually closer to the business side - you'll write Jupyter notebooks, present to stakeholders, and occasionally ship models to production.\n\nA bachelor's in CS, math, or statistics works. What matters more is curiosity: can you look at a chart and ask 'why?' five times in a row without getting bored.",
    tags: ["data", "research", "communicate"],
    dayInLife: [
      "Morning: open last night's SQL query results and notice an anomaly in retention numbers",
      "Late morning: hypothesis workshop with the product manager - what's causing the dip?",
      "Lunch: explain Bayesian A/B testing to a junior analyst over dosa",
      "Afternoon: build a churn-prediction notebook in Jupyter, iterate on features",
      "Late afternoon: present findings to the growth team, defend your methodology",
      "Evening: write a Confluence doc summarizing conclusions so it doesn't get lost",
    ],
    skills: [
      { name: "Statistics & probability", why: "Every insight you produce needs a confidence interval - intuition isn't enough" },
      { name: "SQL (advanced)", why: "You'll write joins, CTEs, and window functions daily against production databases" },
      { name: "Python with Pandas", why: "The universal tool for cleaning, exploring, and modelling tabular data" },
      { name: "Data visualization", why: "Matplotlib, Seaborn, or Plotly - a bad chart loses a good argument" },
      { name: "A/B testing & experimentation", why: "Most product decisions now rely on experiments, and you'll design them" },
      { name: "Storytelling with data", why: "You'll present to non-technical execs - slides and narrative matter a lot" },
      { name: "Basic ML (regression, trees)", why: "Not to deploy, but to answer 'what drives X?' questions" },
      { name: "Excel (yes, really)", why: "Executives live in Excel - knowing it well makes you ten times more effective" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Math is non-negotiable. Statistics as an elective is a huge bonus if your school offers it" },
      { stage: "Undergrad", detail: "B.Sc/B.Tech in CS, Math, Statistics, or Economics. ISI Kolkata is legendary for this path" },
      { stage: "Projects", detail: "Build a Kaggle profile - it's the fastest resume boost. Public notebooks speak loudly" },
      { stage: "First job", detail: "Start as a Data Analyst or Business Analyst, then pivot to Data Scientist in 1-2 years" },
      { stage: "Masters (optional)", detail: "M.Stat at ISI, MS in Analytics at IIMs - strong credentials but not always required" },
    ],
    subjects: ["Mathematics", "Statistics", "Economics", "Computer Science"],
    projectsToBuild: [
      "Analyze Indian Premier League ball-by-ball data - find which bowlers are unlucky",
      "Build a Zomato restaurant recommender using user ratings and cuisine clustering",
      "Predict Delhi air-quality index from weather features using a gradient-boosted tree",
      "A/B test simulator that shows why 100 visitors isn't enough sample size",
      "Churn analysis on a public telecom dataset - write it up as a blog post",
      "Uber fare prediction with geospatial features - teach yourself Folium for maps",
    ],
    colleges: [
      "Indian Statistical Institute (ISI) Kolkata - the gold standard for statistics",
      "IIM Calcutta / IIM Lucknow - M.Sc in Business Analytics",
      "IIT Kharagpur - Mathematics & Computing",
      "Chennai Mathematical Institute (CMI) - research-oriented BSc",
      "Delhi University - BSc Statistics (Hindu College, St. Stephen's)",
      "Symbiosis Institute - MBA with analytics specialization",
      "IIIT Bangalore - PG in Data Science",
    ],
    salaryRange: {
      entry: "₹6-12 LPA",
      mid: "₹15-30 LPA",
      senior: "₹40-80 LPA",
    },
    industryOutlook:
      "India's data science market is maturing fast - firms like Fractal now hire thousands a year. Expect continued growth, but the bar is rising: rote Kaggle skills are commoditised, and communication + domain knowledge are becoming the real differentiators.",
    alumniStories: [
      {
        name: "Priya Ramanathan",
        role: "Senior Data Scientist at CRED",
        background:
          "ISI Kolkata '20 M.Stat. Started as a Business Analyst at Fractal, moved to CRED after two years, now leads the fraud analytics pod.",
      },
      {
        name: "Rahul Deshmukh",
        role: "Data Scientist at Swiggy",
        background:
          "Pune University BSc Statistics → MS Analytics from Great Lakes. Built his reputation on a Kaggle solo silver medal in a delivery-time challenge.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "data-analyst",
    name: "Data Analyst",
    emoji: "📈",
    accent: "yellow",
    shortDescription: "Turn raw numbers into dashboards and reports that drive daily business decisions.",
    longDescription:
      "Data Analysts are the eyes and ears of any modern business. Every morning, someone at Swiggy needs to know: how many orders did we get yesterday? In which cities? Which restaurants cancelled the most? The analyst is the one building that dashboard, investigating odd spikes, and emailing the ops team when something looks off.\n\nIt's often the most accessible starting point in a data career - you can land a role with a bachelor's in commerce, economics, or even arts, as long as you're fluent in SQL and Excel. Tools like Tableau, Power BI, and Looker are industry standards, and strong analysts often move into data science or product roles within a few years.\n\nThis role is perfect if you love finding patterns in numbers but also enjoy talking to people. Half the job is figuring out what stakeholders actually need - they rarely ask the right question on the first try.",
    tags: ["data", "communicate", "business"],
    dayInLife: [
      "Morning: refresh yesterday's sales dashboard, cross-check numbers with the finance team",
      "Late morning: investigate why Tier-2 city signups dropped 18% on Monday - was it a bug or a trend?",
      "Lunch: quick walk while sketching a new funnel chart for the marketing head",
      "Afternoon: SQL deep-dive into campaign performance, pivot by channel and demographic",
      "Late afternoon: build a Tableau dashboard and schedule it for daily auto-refresh",
      "Evening: email a 5-bullet summary to leadership with key insights highlighted",
    ],
    skills: [
      { name: "SQL (intermediate to advanced)", why: "90% of the job - you'll query production databases every hour" },
      { name: "Excel power-user skills", why: "Pivot tables, VLOOKUP, INDEX/MATCH - stakeholders still email spreadsheets" },
      { name: "Tableau or Power BI", why: "Every Indian enterprise uses one of these - Tableau dominates in analytics teams" },
      { name: "Basic Python or R", why: "For analyses that outgrow Excel, and for automating repetitive reports" },
      { name: "Business intuition", why: "Knowing what to measure is harder than knowing how to measure" },
      { name: "Clear written English", why: "You'll write executive summaries daily - clarity beats cleverness" },
      { name: "Statistics fundamentals", why: "Knowing mean vs median and sampling errors prevents embarrassing mistakes" },
      { name: "Google Analytics or similar", why: "Web and mobile analytics tools are standard in product companies" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Commerce with Math, or Science - both work. Focus on quantitative aptitude" },
      { stage: "Undergrad", detail: "B.Com, BBA, BSc Economics, BSc Statistics, or BTech - anything quantitative" },
      { stage: "Certifications", detail: "Google Data Analytics Certificate, Tableau Desktop Specialist - both low-cost, high-signal" },
      { stage: "First job", detail: "Business Analyst or Junior Data Analyst at a startup, consultancy, or bank" },
      { stage: "Growth path", detail: "Senior Analyst → Analytics Manager → pivot into Data Science or Product Management" },
    ],
    subjects: ["Mathematics", "Economics", "Business Studies", "Statistics"],
    projectsToBuild: [
      "Indian unicorn funding tracker dashboard in Tableau using Crunchbase data",
      "Personal expense analyzer from your own bank statements - clean, chart, insight",
      "COVID-19 vaccination dashboard by Indian state with daily drill-downs",
      "Netflix India viewing pattern analysis using public dataset",
      "Ola/Uber fare comparison tool across Indian cities from scraped data",
      "Sales funnel analysis for a fictional D2C brand, presented as a board deck",
    ],
    colleges: [
      "Shri Ram College of Commerce (SRCC), Delhi - B.Com Honours",
      "Hindu College, Delhi - BSc Statistics / Economics",
      "St. Xavier's Mumbai - BSc Statistics",
      "Symbiosis Pune - BBA (Business Analytics)",
      "Christ University Bangalore - BCom with analytics",
      "Narsee Monjee (NMIMS) Mumbai - BBA/BTech with business analytics",
      "IIM-B (PGP in Business Analytics)",
    ],
    salaryRange: {
      entry: "₹4-8 LPA",
      mid: "₹10-18 LPA",
      senior: "₹25-45 LPA",
    },
    industryOutlook:
      "Data analysis is now table-stakes at every Indian company with more than 50 employees. Entry-level roles face competition, but strong analysts with business sense remain in short supply. Expect steady demand, with the biggest premium on those who can also code and communicate.",
    alumniStories: [
      {
        name: "Neha Iyer",
        role: "Senior Data Analyst at Zomato",
        background:
          "SRCC '22 B.Com. Taught herself SQL in Class 12 from freeCodeCamp, landed at Zomato as a BA, promoted twice in two years.",
      },
      {
        name: "Arjun Patel",
        role: "Analytics Lead at Paytm",
        background:
          "NMIMS BBA '19. Started at Deloitte as a business analyst, shifted to fintech, now owns the risk analytics dashboard stack.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "ai-product-manager",
    name: "AI Product Manager",
    emoji: "🎯",
    accent: "lav",
    shortDescription: "Define what AI products should do, who they're for, and when to ship them.",
    longDescription:
      "AI Product Managers are the conductors of the tech orchestra. You won't be training models yourself, but you'll decide which models to build, what problem they solve, and how they'll reach users. You'll sit between engineers, designers, business stakeholders, and sometimes data scientists - translating fuzzy customer problems into concrete specs.\n\nIn India, AI PMs are increasingly sought at companies like Ola, Dream11, Cleartrip, and every fintech. The role is one of the highest-paid paths in tech, but also the most demanding: you own the outcome but not the team. You'll write PRDs, run user interviews, argue about tradeoffs, and celebrate (or mourn) launches.\n\nBest background: engineering or MBA, usually both eventually. The classic path is engineer → PM → senior PM → head of product. For AI specifically, technical literacy matters - you need to understand what's feasible so you don't promise magic.",
    tags: ["business", "communicate", "tech"],
    dayInLife: [
      "Morning: user interview with a Tier-3 city merchant about why they stopped using the AI-suggested pricing feature",
      "Late morning: write a PRD for the next iteration of the recommendation carousel",
      "Lunch: 1:1 with the ML lead to negotiate scope vs timeline",
      "Afternoon: review competitor launch from Meesho, update the roadmap accordingly",
      "Late afternoon: prep slides for the leadership review next week",
      "Evening: respond to Slack from three time zones, clear design review blockers",
    ],
    skills: [
      { name: "Product sense", why: "Knowing which problem is worth solving is 80% of the job" },
      { name: "Written communication", why: "PRDs, specs, launch briefs - great PMs write clearly for everyone" },
      { name: "Basic ML literacy", why: "You don't need to train models, but you must know what's possible" },
      { name: "Data analysis (SQL + Excel)", why: "You'll pull your own metrics before bothering an analyst" },
      { name: "User research methods", why: "Interviews, surveys, usability tests - the raw input for product decisions" },
      { name: "Stakeholder management", why: "Engineers, designers, leadership - getting them aligned is your daily battle" },
      { name: "Prioritization frameworks", why: "RICE, MoSCoW, impact/effort matrices - to keep your roadmap honest" },
      { name: "Presentation skills", why: "You'll pitch to leadership every month - storytelling is not optional" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Any stream, but strong math and English help equally. Join debate and MUN for communication" },
      { stage: "Undergrad", detail: "Engineering is the most common entry path - CS, Electronics, or Mechanical all work" },
      { stage: "Work experience", detail: "Start as an engineer or analyst - 2-4 years of building products before PM roles open up" },
      { stage: "MBA (optional but common)", detail: "IIM-A, IIM-B, or ISB are the top-tier routes - PM hiring spikes from these campuses" },
      { stage: "First PM job", detail: "Associate PM at a product company like Razorpay, Cred, or Microsoft India" },
    ],
    subjects: ["Mathematics", "English", "Economics", "Computer Science"],
    projectsToBuild: [
      "Write a PRD for an AI feature you wish Zomato had - include metrics and risks",
      "Run a 5-user research study on how classmates use ChatGPT for homework",
      "Reverse-engineer the product roadmap of Meesho based on public changelogs",
      "Prototype a Figma mockup of an AI-powered study planner for Indian students",
      "Product teardown blog post: why did Hike Messenger fail?",
      "Build a simple chatbot with clear success metrics, then pretend you're pitching it to a CEO",
    ],
    colleges: [
      "IIT Bombay - CS/Engineering then PM pipeline is strongest",
      "IIM Ahmedabad - top MBA for product roles",
      "IIM Bangalore - strong tech alumni network",
      "ISB Hyderabad - one-year MBA, product-heavy cohort",
      "BITS Pilani - direct hiring into APM programs at Razorpay/PhonePe",
      "IIT Delhi - great alumni network for APM roles",
      "SP Jain Mumbai - MBA with emerging tech electives",
    ],
    salaryRange: {
      entry: "₹10-20 LPA",
      mid: "₹25-50 LPA",
      senior: "₹60 LPA - 2 Cr",
    },
    industryOutlook:
      "Product Management is one of the fastest-growing roles in Indian tech and AI-focused PMs command a premium. As every company adds AI features, the demand for PMs who can specifically navigate model tradeoffs, hallucinations, and cost-per-inference is exploding.",
    alumniStories: [
      {
        name: "Ishan Mehta",
        role: "Senior AI PM at PhonePe",
        background:
          "IIT Kanpur '17 Mechanical → 2 years at Flipkart as engineer → IIM-A '21 → APM at PhonePe, now leads the AI fraud detection product line.",
      },
      {
        name: "Divya Nair",
        role: "Product Manager at Razorpay",
        background:
          "BITS Pilani '20 CS. Joined Razorpay as a software engineer, switched to PM track after 18 months, now owns the AI-based underwriting product.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "prompt-engineer",
    name: "Prompt Engineer",
    emoji: "💬",
    accent: "sky",
    shortDescription: "Design prompts and systems that get the best out of large language models.",
    longDescription:
      "Prompt Engineering didn't exist as a job five years ago. Today, it's one of the most in-demand skills for any company building on top of GPT, Claude, or Gemini. A prompt engineer is part linguist, part detective, part software engineer - figuring out exactly how to phrase a prompt so the LLM gives correct, safe, and consistent answers.\n\nIn India, companies like Freshworks, Zoho, Ola Krutrim, and dozens of GenAI startups are hiring for this role. You might build a customer support bot for an Indian bank, or design prompts for an AI tutor app. The work spans system prompts, few-shot examples, evaluation harnesses, retrieval-augmented generation (RAG), and sometimes light fine-tuning.\n\nThe role is evolving fast. Today's prompt engineer often becomes tomorrow's LLM application engineer - writing Python wrappers, setting up vector databases, and owning the entire AI layer of a product.",
    tags: ["creative", "communicate", "tech"],
    dayInLife: [
      "Morning: review 100 failing support-bot conversations from last night, tag failure modes",
      "Late morning: iterate on a system prompt to reduce hallucinations in Hindi responses",
      "Lunch: brainstorm with the product team on a new multi-turn feature",
      "Afternoon: build an eval harness using 50 handcrafted test cases to score prompt versions",
      "Late afternoon: experiment with chain-of-thought prompting and log the win rates",
      "Evening: write documentation so new teammates don't repeat the same prompt mistakes",
    ],
    skills: [
      { name: "Natural language precision", why: "Word choice changes model behaviour - a prompt engineer is a careful writer" },
      { name: "LLM mental models", why: "Understanding tokens, context windows, and sampling helps debug weird outputs" },
      { name: "Python scripting", why: "Most eval harnesses and RAG pipelines are written in Python with a few libraries" },
      { name: "Prompt evaluation methods", why: "You must measure, not guess - that means building test sets and scorers" },
      { name: "Retrieval-augmented generation", why: "Most production LLM apps use RAG - knowing vector DBs is essential" },
      { name: "Critical thinking", why: "Models lie confidently - you need skepticism as a professional reflex" },
      { name: "Domain empathy", why: "A medical prompt engineer needs to know medicine vocabulary; a legal one, legal" },
      { name: "Basic API integration", why: "You'll use OpenAI, Anthropic, or Google APIs daily - not just the playground" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Any stream works. Strong English + logical reasoning are the core requirements" },
      { stage: "Undergrad", detail: "B.Tech CS is common but not required - English majors with Python skills also land roles" },
      { stage: "Self-study", detail: "Free OpenAI/Anthropic prompt guides, plus building a portfolio of prompt-hack projects" },
      { stage: "First role", detail: "Start as a 'LLM application engineer' or 'AI specialist' at a GenAI startup" },
      { stage: "Senior path", detail: "Grow into LLM architect, AI researcher, or AI product manager within 2-3 years" },
    ],
    subjects: ["English", "Computer Science", "Mathematics", "Psychology (if available)"],
    projectsToBuild: [
      "Build an AI tutor for Class 9 Math that explains problems step-by-step without just giving answers",
      "Design a prompt system that answers customer-support queries for a fictional Indian bank",
      "Create a prompt eval harness comparing GPT-4, Claude, and Gemini on Hindi translation",
      "Jailbreak red-team exercise: find 10 ways a naive chatbot could be misused, then patch it",
      "RAG-powered Q&A bot over your NCERT textbook PDFs",
      "Voice-to-voice Hinglish conversation agent using Whisper + an LLM + TTS",
    ],
    colleges: [
      "IIIT Hyderabad - strong NLP research",
      "IIT Madras - BS in Data Science (online-friendly)",
      "IIT Delhi - CS with linguistics electives",
      "Ashoka University - liberal arts + CS minor works surprisingly well",
      "Symbiosis Pune - Liberal Arts with English major",
      "Delhi University - BA English Honours (St. Stephen's, Hindu, LSR)",
      "NALSAR Hyderabad - for legal-AI specialization",
    ],
    salaryRange: {
      entry: "₹6-15 LPA",
      mid: "₹15-30 LPA",
      senior: "₹40-80 LPA",
    },
    industryOutlook:
      "The role is new, demand is exploding, and supply is scarce - a great time to enter. Expect the role to merge with LLM application engineering over the next few years, so pair prompt skills with Python and RAG to stay ahead.",
    alumniStories: [
      {
        name: "Kabir Saxena",
        role: "LLM Application Engineer at Freshworks",
        background:
          "Delhi University BA English '23. Taught himself prompt engineering during college via free OpenAI cookbook tutorials, wrote a viral blog post on ChatGPT prompt patterns, and landed a role within 6 months.",
      },
      {
        name: "Ananya Reddy",
        role: "Senior Prompt Engineer at a Bangalore GenAI startup",
        background:
          "IIIT Hyderabad '22 CS. Worked on NLP research as an undergrad, joined a stealth GenAI startup, now builds the system prompt pipeline for their customer support product.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "ai-researcher",
    name: "AI Researcher",
    emoji: "🔬",
    accent: "peach",
    shortDescription: "Push the frontier - publish papers, invent new algorithms, and teach machines to learn better.",
    longDescription:
      "AI Researchers are the scientists of the AI world. Instead of shipping features, you spend months investigating a single hypothesis - can we reduce LLM hallucinations with a new training objective? Can we make vision models robust to adversarial attacks? The output is usually a paper at NeurIPS, ICML, or ACL, plus open-source code that the world can build on.\n\nIn India, top research jobs are at Microsoft Research India, Google DeepMind India, Amazon Science, and of course IISc and the IITs. The path is longer - usually a PhD - but the work is deeply intellectual and the impact compounds over decades. A single well-read paper can shape an entire subfield.\n\nThis is the career for people who loved reading math proofs in school, who enjoyed physics problem sets more than the answers, and who find joy in the chase rather than the ship. It's not for everyone, but for those it fits, there's nothing else quite like it.",
    tags: ["research", "tech", "build"],
    dayInLife: [
      "Morning: read 2-3 new arxiv papers over chai - one deeply, two skimmed",
      "Late morning: debug training run gone wrong, add logging to catch the gradient explosion",
      "Lunch: discuss reviewer comments on your ICML submission with your advisor",
      "Afternoon: run ablation experiments on a cluster of A100 GPUs",
      "Late afternoon: sketch a new loss function on a whiteboard with labmates",
      "Evening: write a few paragraphs of the paper's related-work section",
    ],
    skills: [
      { name: "Linear algebra & calculus", why: "Every paper you read uses them - there's no shortcut around this" },
      { name: "Probability & statistics", why: "Training, evaluation, and uncertainty all live in probability land" },
      { name: "PyTorch (advanced)", why: "Fast iteration on novel architectures requires deep framework mastery" },
      { name: "Paper reading & writing", why: "Reading 500+ papers in a PhD is normal - and you'll write 10+ yourself" },
      { name: "Experimental design", why: "Good ablations and controls separate real results from accidents" },
      { name: "GPU cluster workflows", why: "You'll launch multi-GPU runs and manage experiments at scale" },
      { name: "LaTeX", why: "Every serious paper uses LaTeX - fluency saves you days per submission" },
      { name: "Perseverance", why: "90% of experiments fail - treating each one as data beats giving up" },
    ],
    education: [
      { stage: "Class 11-12", detail: "PCM, ideally with strong olympiad-level math. Read 'Deep Learning Book' by Goodfellow early" },
      { stage: "Undergrad", detail: "B.Tech CS/Maths/EE at an IIT, IIIT, or IISc. Research internships from 2nd year" },
      { stage: "Masters", detail: "MS by Research at IISc, IIIT-H, or IIT. First paper at a workshop is a milestone" },
      { stage: "PhD (5-6 years)", detail: "In India or abroad - MIT, Stanford, CMU, ETH, and IISc are all top options" },
      { stage: "First role", detail: "Research Scientist at MSR India, Google Research, or an AI lab at IISc" },
    ],
    subjects: ["Mathematics", "Physics", "Computer Science", "Statistics"],
    projectsToBuild: [
      "Re-implement a 2017 NLP paper from scratch using only PyTorch - no copy-paste from GitHub",
      "Reproduce the original Transformer paper and train on a small translation task",
      "Propose a small novelty - e.g., new positional encoding - and compare on a public benchmark",
      "Write a thorough literature review blog on one narrow subfield (say, diffusion for audio)",
      "Contribute a PR to HuggingFace Transformers - even a small one teaches a lot",
      "Join a research internship at IIIT-H, IISc, or MSR India and co-author a workshop paper",
    ],
    colleges: [
      "IISc Bangalore - the premier research institute in India",
      "IIT Bombay - strong ML research groups",
      "IIIT Hyderabad - NLP and computer vision labs are world-class",
      "IIT Madras - robotics and RL research",
      "IIT Delhi - ML and theory groups",
      "TIFR Mumbai - theoretical CS",
      "CMI Chennai - rigorous mathematical foundations",
    ],
    salaryRange: {
      entry: "₹10-25 LPA (with PhD)",
      mid: "₹30-60 LPA",
      senior: "₹80 LPA - 2.5 Cr",
    },
    industryOutlook:
      "Research roles are harder to land than engineering roles, but India is becoming a genuine AI research hub. MSR India, Google DeepMind's India team, and top IITs publish at every major venue. If you have the patience for a PhD, the ceiling is very high.",
    alumniStories: [
      {
        name: "Dr. Rohan Bhattacharya",
        role: "Research Scientist at Microsoft Research India",
        background:
          "IIT Kharagpur '15 CS → PhD at IIT Bombay on reinforcement learning '21 → MSR India. Has 15+ papers at NeurIPS and ICML.",
      },
      {
        name: "Meera Subramaniam",
        role: "PhD student at IISc",
        background:
          "IIIT-H '22 CS, first-author on an EMNLP workshop paper as an undergrad, now working on multilingual LLMs for Indian languages.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "ai-designer",
    name: "AI Designer",
    emoji: "🎨",
    accent: "coral",
    shortDescription: "Design the user experience of AI products - make magic feel usable and trustworthy.",
    longDescription:
      "AI Designers are a new breed of UX designers who specialise in interfaces for AI-powered products. How do you show a user that the AI is thinking? What happens when the model gets it wrong? How do you explain a confidence score without a statistics lecture? These are the questions you'll live with daily.\n\nIn India, AI design roles are popping up at product companies like Razorpay, Postman, CRED, and every startup building GenAI. The work blends classic UX design (Figma, research, prototyping) with an understanding of how models fail and how to gracefully communicate uncertainty to users.\n\nIt's perfect for visual thinkers who love psychology and tech. You don't need to code, but you do need to understand AI capabilities deeply enough to design around them. A design degree from NID is the gold-standard path, but many great designers are self-taught through online courses and portfolios.",
    tags: ["creative", "communicate", "build"],
    dayInLife: [
      "Morning: review user testing video where someone got confused by an AI suggestion modal",
      "Late morning: sketch 5 alternative designs for how to show AI confidence in a recommendation",
      "Lunch: scroll Mobbin and Dribbble for inspiration from global AI apps",
      "Afternoon: Figma prototyping - build an interactive flow for stakeholder review",
      "Late afternoon: walkthrough with the PM and engineer to check feasibility",
      "Evening: update the design system components library and write usage guidelines",
    ],
    skills: [
      { name: "Figma mastery", why: "The industry-standard tool - components, variants, auto-layout, prototyping" },
      { name: "User research", why: "Interviews and usability tests separate real insight from assumptions" },
      { name: "Visual design fundamentals", why: "Typography, color, hierarchy - these never go out of style" },
      { name: "Interaction design", why: "AI features often need novel interactions - you'll design new patterns" },
      { name: "Understanding AI uncertainty", why: "Designing for probabilistic systems requires a mental model of them" },
      { name: "Writing microcopy", why: "'Sorry, I didn't get that' is a design decision - words matter" },
      { name: "Design systems", why: "Scaling design across a product requires documented, reusable components" },
      { name: "Prototyping tools (Framer, Principle)", why: "Higher-fidelity prototypes help test interactions not possible in Figma" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Any stream - humanities or science both work. Build a portfolio of drawings / sketches / side projects" },
      { stage: "Undergrad", detail: "B.Des at NID, Srishti, MIT Institute of Design, or IIT Guwahati design program" },
      { stage: "Portfolio building", detail: "Redesign existing apps as case studies - Zomato, Swiggy, Meesho - write up your process" },
      { stage: "Internships", detail: "UX internships at product companies are the best entry - even small startups count" },
      { stage: "First role", detail: "Junior Product Designer → Senior Designer → Staff Designer in 5-7 years" },
    ],
    subjects: ["Fine Arts", "English", "Psychology", "Computer Science"],
    projectsToBuild: [
      "Redesign an existing chatbot UI to handle failure modes gracefully - write a case study",
      "Mobile app mockup for an AI-powered Indian-language learning app",
      "Design a dashboard that shows ML model performance to a non-technical executive",
      "Voice interface concept for a rural-India agriculture helper - sketch the whole flow",
      "Accessibility redesign of a popular AI app focusing on dyslexic users",
      "Figma design system for a fictional AI photo-editing app - complete with dark mode",
    ],
    colleges: [
      "National Institute of Design (NID) Ahmedabad - India's top design school",
      "IIT Bombay - IDC School of Design",
      "Srishti Manipal Institute Bangalore",
      "MIT Institute of Design Pune",
      "Pearl Academy Delhi - fashion + communication design",
      "Symbiosis Institute of Design Pune",
      "Unitedworld Institute of Design Gandhinagar",
    ],
    salaryRange: {
      entry: "₹5-12 LPA",
      mid: "₹15-30 LPA",
      senior: "₹35-70 LPA",
    },
    industryOutlook:
      "Product design is a stable and growing field in India. AI design in particular is a new specialization that commands a premium - senior designers who understand LLMs and probabilistic UX are rare and well-paid.",
    alumniStories: [
      {
        name: "Sanya Khanna",
        role: "Senior Product Designer at CRED",
        background:
          "NID Ahmedabad '20 Communication Design. Interned at Airbnb India during college, joined CRED right after graduation, now leads design for the AI-powered credit insights feature.",
      },
      {
        name: "Vikram Joshi",
        role: "UX Lead at Postman",
        background:
          "IIT Guwahati Design '18. Self-taught Figma, built a strong Dribbble presence, joined Postman as a mid-level designer and now owns the AI copilot UX.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "robotics-engineer",
    name: "Robotics Engineer",
    emoji: "🤖",
    accent: "mint",
    shortDescription: "Build intelligent machines - from warehouse robots to autonomous drones.",
    longDescription:
      "Robotics Engineers work at the intersection of hardware and AI. You'll design the mechanical structure of a robot, wire up sensors, write embedded C++ code, and train computer vision models that let the robot see. It's one of the most interdisciplinary careers in tech - mechanical, electrical, and software skills all matter.\n\nIn India, the robotics field is finally taking off. Companies like GreyOrange (warehouse automation), Ati Motors (industrial AGVs), ideaForge (drones), and several DRDO labs are hiring aggressively. The ISRO Chandrayaan missions, though not pure robotics, have inspired a generation of young engineers to pursue this path seriously.\n\nThis career suits hands-on builders. You'll spend time in labs, not just at keyboards. Expect to break things, solder things, and debug why the motor isn't responding at 2 AM before a demo. The joy of watching your robot move for the first time is hard to match.",
    tags: ["build", "tech", "research"],
    dayInLife: [
      "Morning: calibrate the LIDAR sensor on the prototype AGV and check yesterday's drift data",
      "Late morning: write ROS2 nodes in C++ for the new obstacle-avoidance behaviour",
      "Lunch: hardware lab - solder a fresh Raspberry Pi cluster for testing",
      "Afternoon: train a small YOLO model on warehouse pallet images",
      "Late afternoon: integration test on the robot itself, log every failure case",
      "Evening: write a post-mortem for the morning's drift issue - was it sensor or software?",
    ],
    skills: [
      { name: "C++ and Python", why: "C++ for real-time robot control, Python for ML and scripting" },
      { name: "ROS / ROS2", why: "The industry standard middleware for almost every modern robot" },
      { name: "Linear algebra + control theory", why: "Moving a robot requires understanding transforms, PID, and kinematics" },
      { name: "Computer vision (OpenCV, PyTorch)", why: "Most robots use cameras, and you'll train perception models" },
      { name: "Electronics basics", why: "You need to read schematics and debug when the motor won't spin" },
      { name: "CAD (SolidWorks / Fusion 360)", why: "Designing brackets, mounts, and enclosures is part of the job" },
      { name: "Simulation tools (Gazebo, Isaac Sim)", why: "Testing robots in simulation saves weeks of physical debugging" },
      { name: "Systems thinking", why: "A robot has a dozen subsystems - you must understand how they interact" },
    ],
    education: [
      { stage: "Class 11-12", detail: "PCM. Join a robotics club if possible - build your first line-follower in Class 11" },
      { stage: "Undergrad", detail: "B.Tech in Mechatronics, Electronics, or CS. Robotics electives and labs matter" },
      { stage: "Projects", detail: "Build one robot a year - line followers, obstacle avoiders, drones, arms - each is a portfolio piece" },
      { stage: "Masters", detail: "Specialized MS at IIT-Madras (Robotics) or IISc CSA is a strong signal for research roles" },
      { stage: "First job", detail: "Junior Robotics Engineer at GreyOrange, Ati Motors, or a research lab at IIT" },
    ],
    subjects: ["Physics", "Mathematics", "Computer Science", "Electronics (if available)"],
    projectsToBuild: [
      "Build a line-following robot using an Arduino and an IR sensor array",
      "Self-balancing two-wheel robot using an MPU-6050 and a PID controller",
      "Camera-based object pick-and-place with a 6DOF robotic arm simulated in Gazebo",
      "Autonomous drone that follows a person using a face/pose detection model",
      "Warehouse-style mobile robot that navigates your room using SLAM in ROS2",
      "Voice-controlled robot using Whisper for speech-to-text + servo commands",
    ],
    colleges: [
      "IIT Madras - Robotics Research Centre, one of India's best",
      "IIT Bombay - Centre for Machine Intelligence & Robotics",
      "IIT Kanpur - strong Mechatronics program",
      "IISc Bangalore - Robotics and autonomous systems research",
      "BITS Pilani - Mechanical + CS combinations",
      "NIT Surathkal - Mechatronics",
      "PES University Bangalore - industry-friendly robotics curriculum",
    ],
    salaryRange: {
      entry: "₹8-15 LPA",
      mid: "₹18-35 LPA",
      senior: "₹45-90 LPA",
    },
    industryOutlook:
      "India's robotics industry is at an inflection point. Warehouse automation, drones, and defence robotics are growing 30%+ year over year. Expect salaries to rise as supply stays tight for engineers who can work across hardware and software.",
    alumniStories: [
      {
        name: "Karthik Subramanian",
        role: "Robotics Engineer at GreyOrange",
        background:
          "IIT Madras Mechanical '19. Built 3 robots in undergrad as part of the robotics club, interned at ABB, joined GreyOrange's perception team focusing on warehouse navigation.",
      },
      {
        name: "Riya Chandra",
        role: "Perception Engineer at ideaForge",
        background:
          "NIT Trichy ECE '21. Self-taught OpenCV in Class 12, published a 3rd-year paper on drone obstacle avoidance, joined ideaForge as a new grad.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "ai-entrepreneur",
    name: "AI Entrepreneur",
    emoji: "🚀",
    accent: "yellow",
    shortDescription: "Start your own AI company - identify a problem, build a product, find customers.",
    longDescription:
      "AI Entrepreneurs don't wait for a job description - they create one. You'll spot a problem (stuck trying to learn calculus? small businesses can't write English emails?), build a minimum viable AI product, and try to get strangers to pay for it. The work is messy: one day you're coding, the next you're writing pitch decks, then fielding customer complaints.\n\nIndia is in the middle of an unprecedented startup wave. Bengaluru alone has birthed dozens of AI unicorns in the last decade. With programs like Antler, Y Combinator's Bengaluru cohort, and government schemes like Startup India, even 20-year-olds can raise seed rounds if the idea is strong enough.\n\nThe tradeoff: salaries are variable (₹0 to ₹1 Cr+ overnight), the hours are brutal, and most startups fail. But if you love building things and don't mind risk, this is the highest-agency career in tech. And even failed founders go on to senior roles with a premium, so the downside isn't fatal.",
    tags: ["business", "build", "creative"],
    dayInLife: [
      "Morning: customer support tickets while your co-founder does infra fires",
      "Late morning: demo call with a potential enterprise customer in Mumbai",
      "Lunch: cold brew and a spreadsheet - am I still profitable this month?",
      "Afternoon: code the MVP feature a customer requested yesterday, deploy by evening",
      "Late afternoon: investor update email, 2 pitch decks edited",
      "Evening: founder WhatsApp group vent session, plan tomorrow's 6 AM standup",
    ],
    skills: [
      { name: "Relentless learning", why: "You'll need to learn marketing, hiring, legal, and finance - fast" },
      { name: "Basic coding (Python + web)", why: "Early MVP means you code it yourself - no outsourcing when you have no money" },
      { name: "Storytelling & pitching", why: "Every week you pitch to customers, investors, and recruits" },
      { name: "Customer discovery", why: "Talk to 50 users before writing a line of code - this one habit changes everything" },
      { name: "Financial literacy", why: "Runway, burn, unit economics - numbers you'll obsess over daily" },
      { name: "Grit", why: "Most days are hard, and quitting is easier than showing up - grit decides who wins" },
      { name: "Design sense", why: "A product that looks trustworthy sells 3x more - even early-stage" },
      { name: "Negotiation", why: "You'll negotiate with investors, customers, employees, and landlords" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Any stream. Start selling something - even Instagram stickers - to taste entrepreneurship early" },
      { stage: "Undergrad", detail: "Engineering or business, but the real education is the side projects you ship" },
      { stage: "Experience path (optional)", detail: "Work 2-3 years at a startup to see how they operate before founding your own" },
      { stage: "Accelerator", detail: "Antler India, YC, or Sequoia Surge - cash + mentors + network in one package" },
      { stage: "Launch", detail: "Pick a co-founder you trust, incorporate, ship the MVP, and start selling" },
    ],
    subjects: ["Mathematics", "English", "Economics", "Computer Science"],
    projectsToBuild: [
      "Sell an AI-generated Instagram content service to 5 local businesses - get real money",
      "Build a simple SaaS tool (invoice generator, for example) and post on Product Hunt",
      "Run an AI newsletter for Indian students - get to 1,000 subscribers",
      "Launch a Shopify-style store selling AI-designed merchandise",
      "Ship a Chrome extension that uses an LLM to summarize NCERT chapters",
      "Build an AI tutor bot for Class 10 students and actually collect fee",
    ],
    colleges: [
      "IIT Delhi - strong startup culture, many famous founders",
      "IIT Bombay - SINE incubator is India's best",
      "IIM Ahmedabad - best for business founders",
      "BITS Pilani - surprising number of unicorn founders",
      "IIIT Hyderabad - deep-tech heavy alumni network",
      "Ashoka University - liberal arts + entrepreneurship",
      "ISB Hyderabad - for post-MBA founders",
    ],
    salaryRange: {
      entry: "₹0 - variable",
      mid: "₹0 - ₹50 LPA equivalent",
      senior: "Exit-dependent (₹1 Cr - ₹100 Cr+)",
    },
    industryOutlook:
      "India's AI startup ecosystem has never been hotter. Venture capital flows remain strong, government support is real, and public markets reward AI stories. Expect the next decade to produce multiple Indian AI unicorns. But 90% of startups still fail - the outlook is bright only if you're willing to face that number.",
    alumniStories: [
      {
        name: "Aarav Shah",
        role: "Co-founder of a YC-backed AI education startup",
        background:
          "IIT Bombay '19 CS. Dropped out of a Google offer to start his company at 23, raised seed from Sequoia Surge, now serving 200,000+ Indian students.",
      },
      {
        name: "Tanvi Kulkarni",
        role: "Founder of an AI-powered D2C analytics tool",
        background:
          "BITS Pilani EEE '20. Worked at Razorpay for 2 years, quit to start her company, bootstrapped to ₹2 Cr ARR in 18 months.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "ai-ethics-specialist",
    name: "AI Ethics Specialist",
    emoji: "⚖️",
    accent: "lav",
    shortDescription: "Ensure AI systems are fair, transparent, and don't cause unintended harm.",
    longDescription:
      "AI Ethics Specialists make sure the AI systems companies build don't accidentally cause harm - racial bias in face recognition, gender bias in hiring models, privacy leaks in language models. It's a role that blends policy, law, philosophy, and a little bit of technical depth. You won't train models, but you'll audit them, write guidelines, and sit in meetings where tradeoffs get decided.\n\nIn India, AI ethics is moving from academic concern to real job. With the Digital Personal Data Protection Act (DPDPA) and growing attention from the government on AI regulation, companies like Infosys, Wipro, Tata, and MNCs operating in India are all hiring for this function. There's also strong demand from think tanks like Aapti Institute and the Centre for Internet & Society.\n\nThe work suits people who care about justice and can argue clearly. You'll face resistance - ethics teams often slow down shipping - so persuasion skills matter as much as knowledge. The upside: you get to shape how billions of Indians interact with AI over the next decade.",
    tags: ["policy", "communicate", "research"],
    dayInLife: [
      "Morning: review a new internal model for gender bias using the company's fairness toolkit",
      "Late morning: draft a one-page ethics review for a face-recognition product launch",
      "Lunch: discuss the new DPDPA compliance requirements with legal counsel",
      "Afternoon: interview with a journalist about your org's AI use in hiring",
      "Late afternoon: write internal guidelines on acceptable LLM use for customer data",
      "Evening: read two papers on algorithmic fairness for tomorrow's book club with the ethics team",
    ],
    skills: [
      { name: "Applied ethics fundamentals", why: "Knowing utilitarianism vs deontology helps structure real-world tradeoffs" },
      { name: "Knowledge of Indian + global AI laws", why: "DPDPA, EU AI Act, GDPR - you'll cite these weekly" },
      { name: "Basic ML literacy", why: "You can't audit a system you don't understand at all" },
      { name: "Fairness metrics", why: "Demographic parity, equalized odds - the language of fair ML" },
      { name: "Persuasive writing", why: "Policy memos, risk reports, internal op-eds - writing is the daily output" },
      { name: "Stakeholder facilitation", why: "You'll host workshops between legal, engineering, and product" },
      { name: "Research skills", why: "You'll read papers, case studies, and government reports constantly" },
      { name: "Courage to push back", why: "Ethics sometimes means saying no - your job is to say it well" },
    ],
    education: [
      { stage: "Class 11-12", detail: "Humanities or Science both work. Join debate, MUN, or Model UN to build argument muscle" },
      { stage: "Undergrad", detail: "Law (BA LLB) from NLU, or Political Science, Philosophy, or Public Policy" },
      { stage: "Masters", detail: "LLM in technology law, MPP at IIM-B or Harris, or M.Phil in Philosophy" },
      { stage: "Early experience", detail: "Intern at a think tank (CIS, Aapti) or NGO working on digital rights" },
      { stage: "First role", detail: "Policy Analyst, Responsible AI Consultant, or Trust & Safety Specialist at a tech company" },
    ],
    subjects: ["Political Science", "English", "History", "Computer Science"],
    projectsToBuild: [
      "Audit a publicly available face-recognition API for bias across Indian skin tones",
      "Write a policy brief on how DPDPA affects Indian edtech AI products",
      "Case study blog: how Aadhaar's AI systems affect privacy in India",
      "Fairness report on a public loan-approval dataset using the AIF360 toolkit",
      "Comparative analysis of EU AI Act vs India's draft AI framework",
      "Run a classroom ethics workshop with 20 classmates about deepfakes in elections",
    ],
    colleges: [
      "National Law School of India (NLSIU) Bangalore - top law school",
      "NALSAR Hyderabad - National Law University with strong tech-law focus",
      "NLU Delhi - strong in tech policy",
      "Jindal Global Law School Sonipat - tech and AI law programs",
      "IIM Bangalore - MPP (Public Policy)",
      "Harvard Kennedy School / Oxford Internet Institute (for international track)",
      "Ashoka University - Philosophy + political science",
    ],
    salaryRange: {
      entry: "₹6-12 LPA",
      mid: "₹15-28 LPA",
      senior: "₹35-80 LPA",
    },
    industryOutlook:
      "This is a young field and supply is tight. As the Indian government tightens AI regulation and companies face PR disasters, demand for ethics specialists will grow steeply. Within 5 years, expect every large Indian tech company to have a dedicated Responsible AI team.",
    alumniStories: [
      {
        name: "Kavya Ramachandran",
        role: "Responsible AI Lead at Infosys",
        background:
          "NLSIU Bangalore BA LLB '20. Interned at the Centre for Internet & Society, joined Infosys's newly formed Responsible AI team, now audits models for Fortune 500 clients.",
      },
      {
        name: "Siddharth Das",
        role: "Policy Analyst at Aapti Institute",
        background:
          "NALSAR '21 LLM in Tech Law. Wrote his thesis on algorithmic bias in Indian welfare schemes, joined Aapti after graduation, co-authored a report cited by the government.",
      },
    ],
  },
];

/** Look up a career by its slug. Returns undefined if not found. */
export function getCareerBySlug(slug: string): Career | undefined {
  return CAREERS.find((c) => c.slug === slug);
}
