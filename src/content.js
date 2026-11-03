// Every word on the site lives here. Facts are checked against Job-Switch-2026/00-SOURCE-OF-TRUTH.md.
// Lines still waiting for Bishal's own words are marked PENDING (search for it before launch).

export const PERSON = {
  name: "Bishal Roy",
  email: "roybishal9989@gmail.com",
  linkedin: "https://www.linkedin.com/in/bishal-roy-5410b5257/",
  github: "https://github.com/roybishal362",
  resume: "https://bishal-roy-portfolio.vercel.app/Bishal_Roy_Resume.pdf",
  twin: "https://bishal-roy-portfolio.vercel.app",
};

export const TITLE = {
  presents: "BISHAL ROY PRESENTS",
  name: "The Vast Realm",
  tagline: "a world spoken into being",
  tip: "My name, Bishal, means vast. So I built a world to match. Fair warning: I almost win a lot. I never stop.",
};

export const SIXTY = {
  lead: "I build AI that works for real people, I count everything, and I've almost won more finals than I can list. I never stop.",
  points: [
    "Applied AI Intern, Interview Kickstart (Apr to Oct 2026): a live AI platform; a 4-hour class becomes instructor feedback in ~9 minutes for ~$1.",
    "Runner-up, Smart India Hackathon 2024 · 4th nationally, Rajasthan Royals (solo) · Grand Finalist, iQOO 2026 (solo).",
    "Builds for people who get left out: older people (StripSense), Indian Sign Language (Mudra), six Indian languages (VayuNetra).",
    "Ran 8 GDG on Campus workshops on GenAI, LLMs and RAG for 400+ developers.",
    "For Wispr Flow India: family onboarding, campus workshops and Hinglish creators, each measured within 30 days.",
  ],
};

// ---------- the world: realms around the Vast City ----------
export const REALMS = [
  { id: "city", name: "The Vast City", short: "who I am, ring by ring", island: "isl-vast-city", route: "/city", preview: "02-vast-city/bg-city", center: true },
  { id: "line", name: "The Long Line", short: "my journey, by train", island: "isl-chandrapur", route: "/line", preview: "03-long-line/bg-leg1", angle: 30 },
  { id: "lake", name: "The Lake of Mirrors", short: "8 wins, and what each one cost", island: "isl-lake-mirrors", route: "/lake", preview: "04-lake-of-mirrors/bg-lake-master", angle: 90 },
  { id: "ring", name: "The Lantern Ring", short: "12 shops, one for every build", island: "isl-lantern-ring", route: "/ring", preview: "05-lantern-ring/bg-in-oracle", angle: 150 },
  { id: "skyport", name: "The Wispr Skyport", short: "the summit: where I'd go next", island: "isl-skyport-v2", route: "/skyport", preview: "08-wispr-skyport/bg-skyport-dock", angle: 210 },
  { id: "echo", name: "The Echo Caves", short: "proof that this was spoken", island: "isl-echo-caves", route: "/echo", preview: "07-echo-caves/bg-echo-idle", angle: 270 },
  { id: "crafters", name: "The Crafters' Quarter", short: "five workshops, five skill families", island: "isl-crafters", route: "/crafters", preview: "06-crafters-quarter/bg-forge", angle: 330 },
];

// ---------- 02 Vast City ----------
export const RINGS = [
  { n: "I", name: "Roots", sub: "where I'm from", art: "bg-ring1-roots", expr: "happy",
    text: "I grew up in Chandrapur, Maharashtra. I came second in my school there, prepared for JEE at a junior college, and I still work from home here.",
    roy: "Start at the bottom: where I come from." },
  { n: "II", name: "Values", sub: "what I won't compromise", art: "bg-ring2-values", expr: "proud",
    text: "Only say what I can prove. Build for the people who get left out. Own it end to end, from the first sketch to the cost bill.",
    roy: "Three lanterns I never let go out." },
  { n: "III", name: "Learning", sub: "how I taught myself", art: "bg-ring3-learning", expr: "thinking",
    text: "I had no laptop until January of my first year. Then came Python, SQL all the way to a HackerRank gold badge, Power BI, and finally the machine-learning course that made it click.",
    roy: "This is the ring I built at night, alone, with a borrowed course and my own notes." },
  { n: "IV", name: "Work", sub: "where I've built", art: "bg-ring4-work", expr: "proud",
    text: "Applied AI Intern at Interview Kickstart: Feedback Loop scores 3,000+ classes and turns a 4-hour class into feedback in ~9 minutes for ~$1. Before that: AI Engineer Intern at CloudCredits, where my risk models cut false positives by 34%.",
    roy: "Where the work happens. Real users, real numbers." },
  { n: "V", name: "The Trophy Hall", sub: "every final I reached", art: "bg-ring5-trophies", expr: "wink",
    text: "SIH 2024 runner-up · Rajasthan Royals 4th · NEST semifinalist · Amazon ML top 8% (team) · iQOO Grand Finalist. And one empty pedestal, still waiting.",
    roy: "Look at all those silver trophies. And that one empty pedestal. I'm coming for it." },
  { n: "VI", name: "Community", sub: "teaching what I learned", art: "bg-ring6-community", expr: "happy",
    text: "As GDG on Campus AI/ML co-lead, I ran 8 workshops on GenAI, LLMs and RAG for 400+ developers, and organised a hackathon on campus.",
    roy: "I learned it, so I teach it." },
  { n: "VII", name: "The Crown", sub: "opens when every realm is explored", art: "bg-ring7-crown", expr: "surprised",
    text: "A letter, sealed, for whoever made it all the way here.",
    letter: "You explored every realm. Thank you: that's more time than most people give anything. If you got this far, I think we'd work well together. Write to me, and I'll answer the same day.",
    roy: "You made it to the top. Open the letter." },
];

// ---------- 03 Long Line (story order) ----------
export const ENGINES = [
  { id: "steam", label: "I · STEAM", place: "Chandrapur" },
  { id: "diesel", label: "II · DIESEL", place: "Pune" },
  { id: "electric", label: "III · ELECTRIC", place: "The hackathons" },
  { id: "bullet", label: "IV · BULLET", place: "The grind" },
  { id: "sky", label: "V · SKY-TRAIN", place: "Bengaluru" },
];
export const LINE = [
  { kind: "leg", id: "leg1", leg: 0, art: "bg-leg1", k: "STATION · LEG I", h: "Class 10",
    s: "Wardha Valley English High School, Chandrapur",
    p: "It starts in Chandrapur. I came second in my school, with 100 out of 100 in maths. Then came two years at Inspire Junior College, preparing for JEE, until the lockdown stopped the train.",
    chips: [["2nd", "in my school"], ["100 / 100", "in maths"], ["88.80%", "overall"]],
    ticket: { n: "I", from: "Chandrapur", to: "Pune", cls: "Steam", yrs: "to 2022", brief: "The school years: second in school, full marks in maths, then JEE." },
    expr: "happy", roy: "This is my journey as a train. Stations are milestones; depots are where something broke and I rebuilt. It starts here, in Chandrapur. I came second in my school. Get used to that number." },
  { kind: "depot", id: "depot1", from: 0, to: 1, art: "bg-depot1-lockdown", title: "DEPOT I · THE LOCKDOWN",
    story: "April 2021. The second lockdown moved every class onto a screen, and my focus slipped into PUBG nights. JEE Main came back at about 88 percentile, I missed JEE Advanced by 0.0032 percentile, and Class 12 ended at 77.50%.",
    turn: "I learned exactly what losing focus costs. I chose AI & Data Science, and wrote a plan I still follow: analyst, then machine learning, then data scientist.",
    time: "about a year", expr: "worried", roy: "The quietest depot. Nothing broke loudly; it just stopped." },
  { kind: "leg", id: "leg2", leg: 1, art: "bg-leg2-diesel", k: "STATION · LEG II", h: "DYPIT Pune", s: "Induction: 15 November 2022",
    p: "COVID pushed everything back, so I reached DYPIT late, and I had no laptop until January. On day one I wrote my plan: data analyst first, then machine learning, then data scientist.",
    chips: [["15 Nov", "induction day"], ["Jan 2023", "first laptop"]], lesson: "A late start is still a start.",
    ticket: { n: "II", from: "Pune", to: "the first hackathons", cls: "Diesel", yrs: "2022 – 2024", brief: "College begins late. No laptop until January. Then Python, SQL, Power BI, and a lot of rejections." },
    expr: "happy", roy: "Pune. A late start, and the first engine change waiting ahead." },
  { kind: "depot", id: "depot2", from: 1, to: 2, art: "bg-depot2-hard-year", title: "DEPOT II · THE HARD YEAR",
    story: "Internship after internship said no. Microsoft took me to the final round for a data-science internship, then said no too: my communication. Machine learning felt impossible, and no senior could guide me. Then, in my 4th semester, a liver infection took 10 kg in a week, and I had to leave Pune for home in Chandrapur.",
    turn: "My parents nursed me back, and a week later, still weak, I sat my university practical exams. Then I found the teacher who finally made it click (Krish Naik), wrote my own notes, joined my department club's tech team, and wrote my first research paper.",
    time: "about one year", expr: "worried", roy: "This one hurt. A final round I lost, and a hospital bed. But look at what rolled out of the depot." },
  { kind: "leg", id: "leg3", leg: 2, art: "bg-leg3-electric", k: "STATION · LEG III", h: "SIH 2024 Grand Finale", s: "Indian Sign Language, two-way",
    p: "We were one of five teams chosen for the Indian Sign Language problem. At the Grand Finale it was -1°C and we went three nights without sleep, but the model worked both ways: signs to text, and text back to signs. We came out runner-up.",
    chips: [["Runner-up", "Grand Finale"], ["1 of 5", "teams chosen"]], lesson: "We believed we had the strongest solution. I started again within days.",
    ticket: { n: "III", from: "The hackathons", to: "the grind", cls: "Electric", yrs: "2024 – 2025", brief: "The year I found my teacher, my notes, Kaggle and my first big hackathon." },
    expr: "worried", roy: "Runner-up. Again." },
  { kind: "depot", id: "depot3", from: 2, to: 3, art: "bg-depot3-after-sih", title: "DEPOT III · AFTER SIH",
    story: "We went to the SIH Grand Finale believing we had the strongest solution. After three nights without sleep, we came out runner-up. It was the hardest result I have had to accept.",
    turn: "I moved on in days, not months. I became GDG AI/ML co-lead, and went back to Kaggle and building, harder than before.",
    time: "a few weeks", expr: "worried", roy: "This one stung the most. So I built faster." },
  { kind: "leg", id: "leg4", leg: 3, art: "bg-leg4-bullet-v2", k: "STATION · LEG IV", h: "Rajasthan Royals SupeRR Selector", s: "Solo · at the RR office, on camera",
    p: "I went in alone. Sixteen of us reached the Rajasthan Royals office, then eight, then five. I finished fourth; the top three flew to Dubai.",
    chips: [["4th", "nationally, solo"], ["7,500+", "participants"]], lesson: "Nerves cost me the pitch. Now I practise the pitch as hard as the model.",
    ticket: { n: "IV", from: "The grind", to: "Bengaluru", cls: "Bullet", yrs: "2025 – 2026", brief: "Internships, GDG, five national finals and a live AI platform at Interview Kickstart." },
    expr: "thinking", roy: "Fourth. The top three flew to Dubai." },
  { kind: "signal", id: "signal", art: "bg-leg4-bullet-v2", title: "Rajasthan Royals: the final pitch",
    p: "Top 5 of 16, in front of the main judges, on camera. I knew my solution. I panicked on the pitch, and finished 4th.",
    lesson: "Lesson: practise the pitch as hard as you practise the model.", expr: "worried", roy: "Not a breakdown. Just a red light, and a lesson." },
  { kind: "depot", id: "depot4", from: 3, to: 4, art: "bg-depot4-oct7", title: "DEPOT IV · 7 OCTOBER 2026",
    story: "7 October 2026 was my last day at Interview Kickstart. The full-time role I had been working towards didn't happen.",
    turn: "Days later I was a Grand Finalist at the iQOO finale in Bengaluru. Then I started this: a whole world, built by voice, for Wispr Flow.",
    time: "one week", expr: "worried", roy: "The day the rails ran out. So the train learned to fly." },
  { kind: "leg", id: "leg5", leg: 4, art: "bg-leg5-sky", k: "STATION · LEG V", h: "iQOO Grand Finale, Bengaluru", s: "Solo · 41 hours",
    p: "Days after my internship ended, I was in Bengaluru for the iQOO finale, building StripSense alone in 41 hours: an offline helper that checks an older person's medicine before they take it. I left a Grand Finalist.",
    chips: [["Grand Finalist", "iQOO 2026"], ["0.25%", "of 60,000 teams"]], lesson: "The best people I've met, I met here.",
    ticket: { n: "V", from: "Bengaluru", to: "the Wispr Skyport", cls: "Sky-train", yrs: "2026 →", brief: "The train lifts off the rails. Next stop: Wispr Flow." },
    expr: "proud", roy: "And then the train left the ground." },
];

// ---------- 04 Lake of Mirrors ----------
export const TOWERS = [
  { n: "I", name: "The Bell Tower", about: "A bell is meant to be heard. This tower is about my voice: how I communicate.", win: "I reached the final round at Microsoft, and the final five at Rajasthan Royals.", refl: "Both times, my communication and my nerves let me down at the very last step.", gold: "So I pitched at every hackathon after that, talked to everyone I could at iQOO, and told this whole world in my own voice." },
  { n: "II", name: "The Silver Spire", about: "Silver is the colour of second place. This tower is about always coming close.", win: "Second in school. Runner-up at SIH. Fourth at Rajasthan Royals. Semifinalist at NEST.", refl: "Never first. Not once.", gold: "My longest slump lasted three weeks, and then I got back up. Giving up is not in my dictionary." },
  { n: "III", name: "The Lighthouse", about: "A lighthouse keeps its light on through the storm. This tower is about my health, and coming back.",
    win: "In second year I was doing great: learning fast, and deep in my first research.",
    refl: "Then a liver infection took 10 kg in a week. I ended up in hospital, and had to leave Pune and go home to Chandrapur to recover.",
    gold: "My parents nursed me back. A week later, still weak, I sat my university practical exams anyway. The light stayed on." },
  { n: "IV", name: "The Clockwork", about: "A clock at one minute to midnight. This tower is about time running out.", win: "Top 8% (team) at Amazon ML 2025, with a new semi-supervised stack.", refl: "My best model was still training when the time ran out.", gold: "Now I plan the time budget first, and ship a safe version early." },
  { n: "V", name: "The Tower of Books", about: "A tower built from books. This tower is about learning without anyone to guide me.", win: "Now I teach: 8 GDG workshops on GenAI, LLMs and RAG.", refl: "For two years no one could guide me, and no course stuck.", gold: "I found the teacher who made it click, wrote my own notes, and then taught others." },
  { n: "VI", name: "The Theatre", about: "A stage with its curtains open. This tower is about showing my work to judges.", win: "At NEST, my idea was picked for the semifinal.", refl: "A cluttered demo at NEST, and a video I edited myself for ET that didn't make the cut.", gold: "Now I tell one clean story, and I explain the method." },
  { n: "VII", name: "The Weathervane", about: "A weathervane reads the air. This tower is about building for where things really run.", win: "VayuNetra: air-quality forecasts for 6 cities, 72 hours ahead.", refl: "It was too heavy for free hosting, so the judges never saw it run.", gold: "Now I build for where it will actually run." },
  { n: "VIII", name: "The Broken Bridge", about: "Two towers, one mended bridge. This tower is about the job that didn't happen, and what came next.", win: "Feedback Loop at Interview Kickstart: 3,000+ classes scored.", refl: "On my last day, the full-time role didn't happen.", gold: "Days later I was a Grand Finalist in Bengaluru. Now I'm here." },
];
// tower centre x (0-1 of the painting width) and top y (0-1 of height) in bg-lake-master
export const LAKE_POS = [[.095, .19], [.205, .19], [.315, .15], [.44, .18], [.56, .16], [.675, .24], [.785, .20], [.91, .21]];

// ---------- 05 Lantern Ring (12 shops) ----------
export const SHOPS = [
  { id: "oracle", name: "The Oracle's Reading Room", proj: "Feedback Loop · Interview Kickstart", stars: 5, item: "Scroll of Honest Feedback", type: "RELIC · EDTECH · LLM", itemImg: "item-scroll",
    stats: [["Class → feedback", "~9 min"], ["Cost per class", "~$1"], ["Classes scored", "3,000+"], ["Tests", "850+"]], flavour: "It shows its evidence.",
    desc: "Interview Kickstart runs thousands of live classes. Feedback Loop scores every one, and an AI reviews the weak ones, quoting the exact moment it is talking about, so instructors get honest feedback in minutes, not days.", link: null, linkNote: "company code (private)" },
  { id: "apothecary", name: "The Apothecary of Right Doses", proj: "StripSense · iQOO Grand Finale", stars: 5, item: "Guardian's Pill Box", type: "RELIC · HEALTH · ANDROID", itemImg: "item-pillbox",
    stats: [["Built in", "41 h, solo"], ["Unit tests", "610"], ["Internet", "none needed"], ["On-device AI", "Gemma"]], flavour: "It would rather say no than guess.",
    desc: "Older people can take the wrong strip of medicine. StripSense reads the strip with the phone camera, fully offline, and refuses whenever it is not sure.", link: "https://github.com/roybishal362/StripSense" },
  { id: "theatre-hands", interior: "theatre", name: "The Theatre of Hands", proj: "Mudra · SIH 2024", stars: 5, item: "Gloves of Two Tongues", type: "RELIC · ACCESSIBILITY", itemImg: "item-gloves",
    stats: [["Result", "Runner-up"], ["Teams chosen", "1 of 5"], ["Direction", "two-way"], ["Built with", "TensorFlow"]], flavour: "Signs become words. Words become signs.",
    desc: "Deaf and hearing people often can't talk to each other. Mudra turns Indian Sign Language into text, and text back into signs.", link: null },
  { id: "scouts", name: "The Scouts' Guild", proj: "Cricket Scout · Rajasthan Royals", stars: 4, item: "Scout's Lens", type: "TOOL · SPORTS ANALYTICS", itemImg: "item-lens",
    stats: [["Result", "4th, solo"], ["Deliveries", "602,992"], ["Matches", "2,714"], ["Bowler bias", "fixed"]], flavour: "It sees the bowler the baseline missed.",
    desc: "Talented uncapped cricketers get missed. Cricket Scout reads 602,992 ball-by-ball deliveries and ranks the players who deserve a look, without the old bias towards batsmen.", link: "https://github.com/roybishal362/Rajasthan-Royals-SuperSelector-Cricket-Scouting-Intelligence-System-" },
  { id: "bridge-office", name: "The Bridge-Builders' Office", proj: "Kakehashi · India → Japan", stars: 4, item: "Bridge Charter", type: "TOOL · AGENTS · RAG", itemImg: "item-charter",
    stats: [["Fact checks", "132"], ["Contradictions", "0"], ["Working agents", "5"], ["Languages", "3"]], flavour: "A bridge built from official rules.",
    desc: "Moving to Japan for work means a maze of visa rules. Kakehashi plans the move with agents that answer only from official sources: an LLM judge found 0 contradictions in 132 fact checks.", link: "https://kakehashi-4e1v.vercel.app/" },
  { id: "observatory", name: "The Wind-Eye Observatory", proj: "VayuNetra", stars: 4, item: "Weather Glass", type: "TOOL · FORECASTING", itemImg: "item-weatherglass",
    stats: [["Cities", "6, ward level"], ["Horizon", "72 h"], ["Source match", "84.5%"], ["Languages", "7"]], flavour: "Honest about the cities it couldn't read.",
    desc: "Air quality changes street by street. VayuNetra forecasts it 72 hours ahead for 6 Indian cities, ward by ward, and gives health advice in English and six Indian languages.", link: "https://vayu-netra-urban-air-quality-intell.vercel.app" },
  { id: "assay", name: "The Assay House", proj: "C-TRUST · Novartis NEST 2.0", stars: 4, item: "Seal of Safe Trials", type: "TOOL · HEALTHCARE DATA", itemImg: "item-seal",
    stats: [["Result", "semifinalist"], ["Agents", "7 + a guardian"], ["Tests", "331"], ["Studies", "23"]], flavour: "Same data, same answer, with a reason.",
    desc: "Clinical trials depend on clean data. In C-TRUST, specialist agents score each study's data quality, and a guardian agent checks that they agree, so the same data always gets the same answer.", link: "https://github.com/roybishal362/NEST_2.0_Hackthon" },
  { id: "appraiser", name: "The Appraiser's Scales", proj: "Smart Pricing · Amazon ML 2025", stars: 4, item: "Fair-Price Scales", type: "TOOL · MULTIMODAL ML", itemImg: "item-scales",
    stats: [["Result", "top 8% (team)"], ["Products", "75,000"], ["Features", "1,742"], ["Inputs", "text + image"]], flavour: "It weighs a picture and a paragraph.",
    desc: "Can you price a product from its listing alone? This model reads the text and the images of 75,000 products and predicts the price. Our team finished in the top 8%.", link: "https://github.com/roybishal362/Amazon_ML_2025" },
  { id: "boneclinic", name: "The Bone-Reader's Clinic", proj: "Knee MRI · RSNA on Kaggle", stars: 4, item: "Crystal of Twelve Findings", type: "TOOL · MEDICAL IMAGING", itemImg: "item-crystal",
    stats: [["Findings", "12"], ["MRI studies", "4,407"], ["Macro ROC-AUC", "0.91"], ["Held-out studies", "1,102"]], flavour: "It reads twelve things in one knee.",
    desc: "Reading a knee MRI takes a specialist. This model looks at the scan slice by slice and flags 12 kinds of findings. I left the competition before the final submission, so there is no rank.", link: null, linkNote: "code private" },
  { id: "teahouse", name: "The Matchmaker's Tea House", proj: "WingMate · agentic dating", stars: 4, item: "Twin-Feather Charm", type: "TOOL · MULTI-AGENT", itemImg: "item-feathers",
    stats: [["People", "28"], ["Swipes", "707"], ["Dates", "53"], ["Turns a date", "6"]], flavour: "Every trait cites its evidence.",
    desc: "What if your AI went on the first date for you? Each person gets one agent that knows only their public profiles. The agents swipe, go on six-turn dates and write a debrief, all on free-tier models.", link: "https://wing-mate-seven.vercel.app" },
  { id: "postoffice", name: "The Courier's Post Office", proj: "Freshdesk connector · MCP", stars: 4, item: "Courier's Seal", type: "TOOL · MCP · AGENTS", itemImg: "item-sortingseal",
    stats: [["Typed tools", "10"], ["Protocol", "JSON-RPC"], ["On overload", "backoff + breaker"], ["Built as", "a take-home"]], flavour: "Agents can read and answer the help desk.",
    desc: "Support teams live in their help desk. This MCP server lets AI agents list, search, create and update Freshdesk tickets, and backs off safely when the help desk is busy.", link: null, linkNote: "take-home (private)" },
  { id: "gatekeeper", name: "The Gatekeeper's Tower", proj: "Urumi · MCP gateway", stars: 4, item: "Master Key Ring", type: "TOOL · PLATFORM · SECURITY", itemImg: "item-keyring",
    stats: [["Layers", "4"], ["Tests", "49"], ["Runs on", "Kubernetes"], ["API keys", "hashed"]], flavour: "One gate, many tools, every key checked.",
    desc: "A team using many AI tools needs one safe front door. Urumi is a single MCP gateway in front of many servers, with encrypted credentials, rate limits and a written threat model.", link: "https://github.com/roybishal362/Urumi" },
];

// ---------- 06 Crafters' Quarter ----------
export const WORKSHOPS = [
  { id: "forge", name: "The Dwarven Forge", sub: "engineering & shipping", about: "How I build and ship software, from a Python script to a live, tested product.", art: "bg-forge", sheet: "stages-sword", act: "STRIKE THE ANVIL", color: "#ffb35c", item: "The Blade of Shipping",
    skills: ["Python", "FastAPI", "Docker", "PostgreSQL", "Next.js", "pytest · 850+"], logos: ["python", "fastapi", "docker", "postgresql", "nextdotjs", "pytest"],
    stages: ["Rough iron · Python scripts", "Shaped · APIs with FastAPI", "Tempered · Docker & deployment", "Engraved · tests and reliability", "Rune-lit · a live product"],
    roy: "The dwarves turn code into steel. Every strike is a skill I actually ship with." },
  { id: "alchemist", name: "The Alchemist's Lab", sub: "data & machine learning", about: "How I turn raw data into predictions, from SQL to boosted trees and neural networks.", art: "ws-alchemist", sheet: "stages-potion", act: "STIR THE CAULDRON", color: "#7cf0a0", item: "The Grove of Prediction",
    skills: ["SQL", "pandas", "NumPy", "scikit-learn", "XGBoost", "LightGBM", "PyTorch"], logos: ["mysql", "pandas", "numpy", "scikitlearn", "pytorch"],
    stages: ["Raw crystals · data pulled with SQL", "The ledger · cleaned with pandas", "The prism · features engineered", "The magic tree · a decision tree", "The grove · boosted trees + a neural crystal"],
    roy: "The alchemists turn raw data into predictions. My HackerRank SQL gold badge started here." },
  { id: "witches", name: "The Witches' Spell Tower", sub: "generative AI", about: "How I build with language models that stay grounded: prompts, RAG, agents, caching and evals.", art: "ws-witches", sheet: "stages-spell", act: "CAST THE NEXT PAGE", color: "#c9a5ff", item: "The Grimoire of Grounded Answers",
    skills: ["LLMs", "RAG", "agents", "prompt caching", "LangChain", "evaluation"], logos: ["claude", "googlegemini", "langchain", "huggingface"],
    stages: ["Page 1 · the prompt", "Page 2 · RAG, the library memory", "Page 3 · agents, familiars with tools", "Page 4 · prompt caching", "Page 5 · evals, the balance and the eye"],
    roy: "The witches cast what I can actually do with language models, and none of it makes things up." },
  { id: "elves", name: "The Elven Library", sub: "research", about: "How I do research: a question, the data, careful experiments, and a paper.", art: "ws-elven-library", sheet: "stages-book", act: "TURN THE PAGE", color: "#9cf5bd", item: "The Lantern of Knowledge",
    skills: ["papers", "experiments", "statistics", "Kaggle", "cross-validation"], logos: ["kaggle", "jupyter"],
    stages: ["A question scroll", "A Kaggle data chest", "The experiment log · cross-validation", "A manuscript under review", "The lantern · knowledge shared at GDG"],
    roy: "The elves keep my research: two papers under review, five Kaggle competitions, and a lot of failed experiments." },
  { id: "bards", name: "The Bards' Hall", sub: "communication · growing fastest", about: "How I learned to talk about my work, from nervous pitches to this world, told in my own voice.", art: "ws-bards", sheet: "stages-song", act: "PLAY THE NEXT SONG", color: "#ffd29a", item: "The Song That Got Louder",
    skills: ["pitching", "teaching", "writing", "storytelling", "listening"], logos: [],
    stages: ["Whistle · nervous pitches", "Drum · GDG workshops", "Lute · the stage at RR", "Harp · networking at iQOO", "Enchanted harp · this world, in my voice"],
    roy: "My weakest skill once. The one I've grown the most." },
];

// ---------- 07 Echo Caves: Bishal's real dictated sentences (verbatim, from our build chats via Wispr Flow) ----------
export const ECHO = {
  stats: [ // from Bishal's Wispr Flow dashboard, 3 Nov 2026
    { v: "17.6K", l: "words spoken into Wispr Flow (my dashboard total)" },
    { v: "155", l: "words per minute, my speaking speed" },
    { v: "2 days", l: "streak: built back to back, by voice" },
  ],
  crystals: [
    { realm: "city", text: "Like in anime you see, there is one big country that looks like a very grand one and through it all other neighboring countries are connected." },
    { realm: "line", text: "We can show that animation, like a diesel train, then it transforms into an electric train, and all those things." },
    { realm: "lake", text: "If you want to see your honesty you can see it in the mirror." },
    { realm: "ring", text: "You can say jumping from one project to another project is like hopping and shopping, kind of those things." },
    { realm: "crafters", text: "You can do that, like the magic books, alchemy, and all those fun parts for the forge." },
    { realm: "echo", text: "Giving up is not in my dictionary, you can say." },
    { realm: "skyport", text: "No I would go with the cleaner part, like a skyport where Wispr's airships dock, or those things." },
  ],
  keywords: { city: ["city", "vast", "ring of", "who"], line: ["train", "journey", "line", "rail"], lake: ["lake", "mirror", "tower"],
    ring: ["shop", "lantern", "project", "bazaar", "market"], crafters: ["craft", "forge", "skill", "workshop", "witch", "alchem"],
    skyport: ["sky", "port", "wispr", "hire", "airship", "flow"], echo: ["echo", "cave", "voice"] },
};

// ---------- 08 Wispr Skyport ----------
export const SKYPORT = {
  lead: "India is Wispr Flow's second-biggest market: 14% of installs, but about 2% of in-app revenue. Half of Indian use is on mobile, and younger family members are teaching older ones.",
  source: "Source: TechCrunch, 9 May 2026 (Sensor Tower data).",
  sourceUrl: "https://techcrunch.com/2026/05/09/voice-ai-in-india-is-hard-wispr-flow-is-betting-on-it-anyway/",
  plans: [
    { n: "I", name: "Ghar ka Flow", hindi: "घर का Flow", one: "Families already teach their parents. A festival kit: set Flow up for Papa, with a first message in Hinglish.",
      insight: "Younger people are already setting Flow up for their parents.", idea: "A “set it up for Papa” kit for festivals and family visits: a 60-second WhatsApp guide and a first message in Hinglish.",
      test: "I'd start with ten families for two weeks, and check who still uses it on day 14.", measure: "The parent's activation, week-2 retention, how far it spreads." },
    { n: "II", name: "Campus Flow", hindi: "a channel I have run before", one: "“Build your portfolio by voice in 60 minutes”, run by campus clubs. I've led 8 workshops before.",
      insight: "Students are a growing group, and campus clubs trust their own leads.", idea: "This challenge as a kit: “Build your portfolio by voice in 60 minutes”, run by campus tech clubs.",
      test: "3 colleges in Pune in month one. I co-led GDG on Campus: 8 workshops, 400+ developers.", measure: "Installs per workshop, activated users, paid conversion." },
    { n: "III", name: "Bolo, type mat karo", hindi: "बोलो, टाइप मत करो", one: "Creators show one real Hinglish moment: a messy thought, spoken, becomes a clean message.",
      insight: "Half of Indian use is on mobile, and personal apps like WhatsApp are growing.", idea: "Micro-creators each show one real Hinglish moment: a messy thought, spoken, becomes a clean message.",
      test: "10 micro-creators, one tracked link each.", measure: "Cost per activated user and 30-day retention, by creator." },
  ],
  days: [["WEEK 1", "Listen: 30 calls with Indian users"], ["WEEK 2", "Launch the cheapest route"], ["WEEK 3", "Measure it; I build the dashboard"], ["WEEK 4", "Double down, or stop it"]],
  pricing: "And on the 2% gap: I'd test payment options (monthly against annual, UPI Autopay) as an experiment before guessing.",
  treaty: {
    bring: "Someone who builds the landing page, the referral tool and the dashboard himself, and who never stops after a loss.",
    ask: "A seat on the India growth team, from November.",
    mission: "Route I: Ghar ka Flow. Ten families, two weeks, a real number.",
  },
};

// ---------- realm intros: what each place is, and how to explore it ----------
export const INTRO = {
  world: { title: "The Vast Realm", what: "My story was never a straight line of wins, so it isn't a page. It's a world: each floating island holds one part of it, and Roy, a tiny version of me, flies you between them.",
    how: ["Drag to turn the world, or use ⟲ ⟳", "Click an island to travel there", "In a hurry? The 60-second version is always at the top right"] },
  city: { title: "The Vast City", what: "Who I am, in seven rings: my roots, my values, how I learned, where I've worked, the finals I've reached, the people I teach, and a crown at the top.",
    how: ["Pick a ring, or start at Ring I and climb", "The Crown opens once you've explored every realm"] },
  line: { title: "The Long Line", what: "My journey from school to today is a train, because it never ran smoothly. Stations are the milestones. Depots are where something broke, and where I rebuilt the engine before moving on.",
    how: ["Read the station card and its ticket", "At a depot, press Roll out to change the engine", "Use ← → or the buttons to ride the line"] },
  lake: { title: "The Lake of Mirrors", what: "You can't escape yourself: to see your own face, you look in a mirror. Every tower here is a win, and its reflection is what that win cost me and what it taught me. My wins aren't the whole story, and neither are my losses. Together, they make me.",
    how: ["Tap a tower to fly in and see the win", "Press ⇅ Turn the mirror to see the other side of the story", "The gold is what each one taught me"] },
  ring: { title: "The Lantern Ring", what: "Jumping from project to project always felt like hopping from shop to shop, so my projects became a night market. Each shop is one thing I've built, and each one hands you a card with the real numbers.",
    how: ["Drag, or use ⟲ ⟳, to turn around the fountain", "Enter the shop in front of you", "Add its card to your bag, and collect all twelve"] },
  crafters: { title: "The Crafters' Quarter", what: "Skills aren't a list of logos; they're built, one stage at a time. So each family of my skills has its own workshop and its own makers: engineering, data and machine learning, generative AI, research, and communication.",
    how: ["Pick a workshop door", "Press its action and watch the item grow, stage by stage", "Each stage is a real skill, with the tools I use"] },
  echo: { title: "The Echo Caves", what: "Proof that this whole world was built by voice. Each crystal holds a sentence I really said while building it, and the cave can hear you too.",
    how: ["Pick a crystal to read what I said, word for word", "Hold the 🎙 and say a realm, like \"take me to the lake\"", "No microphone? Tap one of the phrases"] },
  skyport: { title: "The Wispr Skyport", what: "The top of the world, and where my journey goes next: my plan for growing Wispr Flow in India, and my first 30 days.",
    how: ["Open a flight plan to read the full idea", "Board the airship for the Council Chamber"] },
};
