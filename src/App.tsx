import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  recruitmentHighlights,
  recruitmentInfoGroups,
  researchOpportunities,
  visibleResearchOpportunities,
  type OpportunityStatus,
  type ResearchOpportunity,
} from "./recruitment";
import { alumni } from "./alumni";
import { AlumniDetailPage, AlumniSection } from "./AlumniViews";
import { mainProjects, type MainProject } from "./mainProjects";
import ParticleHome from "./ParticleHome";
import UnifiedParticleBackdrop from "./UnifiedParticleBackdrop";

type Lang = "zh" | "en";
type Localized = { zh: string; en: string };
type PublicationOwner = "bryan" | "lijie" | "haonan" | "renzhi";

const t = (value: Localized, lang: Lang) => value[lang];

const navItems: Array<{ id: string; label: Localized }> = [
  { id: "about", label: { zh: "关于", en: "About" } },
  { id: "opportunities", label: { zh: "机会", en: "Opportunities" } },
  { id: "projects", label: { zh: "项目", en: "Projects" } },
  { id: "work", label: { zh: "实践", en: "Work" } },
  { id: "team", label: { zh: "团队", en: "Team" } },
  { id: "publications", label: { zh: "论文", en: "Publications" } },
];

const applications = [
  {
    number: "A.01",
    title: { zh: "康复与长期健康管理", en: "Rehabilitation & Long-term Health" },
    text: {
      zh: "探索如何在不增加使用负担的情况下了解动作质量和训练完成情况，用直观反馈帮助调整动作，并提示潜在风险。",
      en: "Capture movement quality and training completion without adding burden, enabling timely correction and earlier risk recognition.",
    },
  },
  {
    number: "A.02",
    title: { zh: "医学教育与技能训练", en: "Medical Education & Skills Training" },
    text: {
      zh: "把复杂的医学知识变成能看、能操作、能反复练习的体验，让学习和训练更容易上手。",
      en: "Spatial interaction creates actionable, repeatable learning environments that make complex knowledge clearer and training more efficient.",
    },
  },
  {
    number: "A.03",
    title: { zh: "无障碍与包容性交互", en: "Accessible & Inclusive Interaction" },
    text: {
      zh: "让新技术真正好用、容易获得，也能长期发挥作用，让更多人享有平等而有尊严的交互体验。",
      en: "Translate frontier technology into usable, accessible, and sustainable systems that support more equitable, dignified experiences.",
    },
  },
];

type ResearchFigure = {
  image: string;
  alt: Localized;
  label: Localized;
  title: Localized;
  pdf: string;
  source: string;
  fit?: "cover" | "contain";
  objectPosition?: string;
};

type ResearchStory = {
  id: string;
  tag: Localized;
  title: Localized;
  note: Localized;
  figures: [ResearchFigure, ResearchFigure];
};

const researchStories: ResearchStory[] = [
  {
    id: "rehabilitation-in-practice",
    tag: { zh: "自适应康复 / 01", en: "ADAPTIVE REHAB / 01" },
    title: { zh: "让训练跟上人的节奏。", en: "Let training intensity move with the person." },
    note: {
      zh: "训练不只是变难或变容易。我们希望它能随着人的状态调整，让挑战、信心和持续练习保持平衡。",
      en: "Adaptation is not simply making a task harder or easier. It is a moving balance between challenge, confidence, and sustained participation.",
    },
    figures: [
      {
        image: "/images/research/xr-prototype-session.jpg",
        alt: { zh: "研究人员体验扩展现实康复原型", en: "Researcher experiencing an extended reality rehabilitation prototype" },
        label: { zh: "原型 / 01A", en: "PROTOTYPE / 01A" },
        title: { zh: "空间交互原型测试", en: "Spatial interaction prototyping" },
        pdf: "/papers/emotional-responses-adaptive-ivr-exergaming.pdf",
        source: "IEEE COMPSAC 2024",
        objectPosition: "50% 50%",
      },
      {
        image: "/images/research/xr-rehabilitation-exergame.jpg",
        alt: { zh: "虚拟现实康复训练游戏画面", en: "Virtual reality rehabilitation exergame scene" },
        label: { zh: "实验 / 01B", en: "EXPERIMENT / 01B" },
        title: { zh: "游戏化康复与动态反馈", en: "Gamified rehabilitation & adaptive feedback" },
        pdf: "/papers/emotional-responses-adaptive-ivr-exergaming.pdf",
        source: "IEEE COMPSAC 2024",
        objectPosition: "55% 50%",
      },
    ],
  },
  {
    id: "collaborative-immersion",
    tag: { zh: "社会临场感 / 02", en: "SOCIAL PRESENCE / 02" },
    title: { zh: "在虚拟世界里，也能感到彼此在场。", en: "Enter together. Feel present together." },
    note: {
      zh: "当人们一起走进沉浸式世界，合作和彼此在场的感觉，也会成为体验的一部分。",
      en: "When people enter an immersive world together, the interface becomes a social space—carrying collaboration, familiarity, and presence beyond the screen.",
    },
    figures: [
      {
        image: "/images/research/collaborative-gameplay-conditions.png",
        alt: { zh: "协作式沉浸游戏的多种任务与场景条件", en: "Multiple tasks and scene conditions in a collaborative immersive game" },
        label: { zh: "游戏机制 / 02A", en: "GAMEPLAY / 02A" },
        title: { zh: "协作游戏的实验条件", en: "Collaborative gameplay conditions" },
        pdf: "/papers/differential-effects-vr-ar-collaborative-gaming.pdf",
        source: "IEEE VR 2026",
        fit: "contain",
      },
      {
        image: "/images/research/collaborative-study-protocol.png",
        alt: { zh: "虚拟与增强现实协作游戏实验流程", en: "Study protocol for collaborative gaming in virtual and augmented reality" },
        label: { zh: "研究流程 / 02B", en: "PROTOCOL / 02B" },
        title: { zh: "从游戏阶段到参与者体验", en: "From gameplay phases to participant experience" },
        pdf: "/papers/differential-effects-vr-ar-collaborative-gaming.pdf",
        source: "IEEE VR 2026",
        fit: "contain",
      },
    ],
  },
  {
    id: "embodied-data",
    tag: { zh: "具身数据 / 03", en: "EMBODIED DATA / 03" },
    title: { zh: "用双手探索数据。", en: "Let the hands become the interface to data." },
    note: {
      zh: "当数据有了大小、方向和触感，人们就能借助双手和身体，在空间里理解它。",
      en: "When abstract data gains scale, direction, and tactility, understanding moves beyond the screen and into the coordination of body and space.",
    },
    figures: [
      {
        image: "/images/research/embodied-two-handed-interactions.png",
        alt: { zh: "沉浸式数据探索中的双手交互条件", en: "Two-handed interaction conditions for immersive data exploration" },
        label: { zh: "交互 / 03A", en: "INTERACTION / 03A" },
        title: { zh: "双手交互的不同设计方式", en: "Embodied two-handed interaction design space" },
        pdf: "/papers/embodied-two-handed-immersive-data-exploration.pdf",
        source: "ACM CHI 2024 EA",
        fit: "contain",
      },
      {
        image: "/images/research/tangible-data-cubes.png",
        alt: { zh: "混合现实中的可触数据立方体交互示意", en: "Tangible data-cube interactions in mixed reality" },
        label: { zh: "实物交互 / 03B", en: "TANGIBLE / 03B" },
        title: { zh: "手中的时空数据立方体", en: "Spatio-temporal data cubes in hand" },
        pdf: "/papers/data-cubes-in-hand-mixed-reality.pdf",
        source: "ACM CHI 2024",
        fit: "contain",
      },
    ],
  },
  {
    id: "gamified-collaboration",
    tag: { zh: "游戏化协作 / 04", en: "GAMIFIED COLLABORATION / 04" },
    title: { zh: "熟人与陌生人，需要怎样的合作体验？", en: "Write relationships into the game mechanics." },
    note: {
      zh: "熟人和陌生人对竞争、合作与奖励的感受可能不同。设计游戏时，也需要考虑他们之间的关系。",
      en: "Whether participants know one another changes how they respond to competition, cooperation, and reward. Design must bring those social relationships into the evidence loop.",
    },
    figures: [
      {
        image: "/images/research/gamification-preference-concept.png",
        alt: { zh: "人际关系如何影响沉浸式游戏化偏好的概念图", en: "Concept illustration of how interpersonal relationships shape immersive gamification preferences" },
        label: { zh: "协作学习 / 04A", en: "CO-LEARNING / 04A" },
        title: { zh: "人与人的关系，如何影响游戏偏好", en: "How relationships shape gamification preferences" },
        pdf: "/papers/interpersonal-relationships-gamification-ivr.pdf",
        source: "IEEE VR 2025",
        fit: "contain",
      },
      {
        image: "/images/research/gamification-collaboration-study.png",
        alt: { zh: "协作式沉浸游戏的前测、三项任务与后测流程", en: "Pre-study, three-task, and post-study flow for collaborative immersive gaming" },
        label: { zh: "实验流程 / 04B", en: "EVIDENCE LOOP / 04B" },
        title: { zh: "用实验检验游戏设计", en: "From game design to reproducible evidence" },
        pdf: "/papers/interpersonal-relationships-gamification-ivr.pdf",
        source: "IEEE VR 2025",
        fit: "contain",
      },
    ],
  },
  {
    id: "social-intelligence",
    tag: { zh: "社会智能 / 05", en: "SOCIAL INTELLIGENCE / 05" },
    title: { zh: "从彼此的差异出发，找到合作的方法。", en: "Let differences lead to shared understanding." },
    note: {
      zh: "每个人知道的、需要的都不一样。理解这些差异，才能让协作更顺畅，也让虚拟同伴提供更合适的支持。",
      en: "Asymmetric information can prompt collaboration, while virtual peers can provide support. Social intelligence begins with understanding differences, relationships, and needs.",
    },
    figures: [
      {
        image: "/images/research/context-dependent-collaboration-scenes.png",
        alt: { zh: "数据、位置与视角三类非对称协作谜题", en: "Data-, position-, and perspective-based asymmetric collaboration puzzles" },
        label: { zh: "非对称协作 / 05A", en: "ASYMMETRY / 05A" },
        title: { zh: "信息不同，如何一起完成任务", en: "Using asymmetry to drive collaboration" },
        pdf: "/papers/context-dependent-social-engagement-immersive-learning.pdf",
        source: "CHBR 2026",
        fit: "contain",
      },
      {
        image: "/images/research/virtual-peer-mentor-framework.png",
        alt: { zh: "虚拟同伴导师提供信息、动作与情感支持的框架", en: "Virtual peer mentor framework for informational, instrumental, and emotional support" },
        label: { zh: "同伴支持 / 05B", en: "PEER SUPPORT / 05B" },
        title: { zh: "虚拟同伴如何支持康复训练", en: "Embedding peer support into rehabilitation" },
        pdf: "/papers/virtual-peer-mentor-vr-rehabilitation.pdf",
        source: "IEEE TVCG 2026",
        fit: "contain",
      },
    ],
  },
  {
    id: "spatial-visualisation",
    tag: { zh: "空间可视化 / 06", en: "SPATIAL VISUALISATION / 06" },
    title: { zh: "把时间、人物和数据放进同一个空间。", en: "Let time, people, and data meet in space." },
    note: {
      zh: "复杂的信息也可以直观地探索。我们尝试在空间里看清人物随时间变化的轨迹，也从已有研究中寻找更好的交互方式。",
      en: "Spatial visualisation makes complex information explorable—from character trajectories across time to interaction patterns distilled through systematic review.",
    },
    figures: [
      {
        image: "/images/research/3dstoryline-trajectories.png",
        alt: { zh: "沉浸式故事线可视化的总览与细节视图", en: "Overview and detail views in immersive storyline visualization" },
        label: { zh: "故事线 / 06A", en: "STORYLINE / 06A" },
        title: { zh: "在三维空间中阅读故事轨迹", en: "Reading story trajectories in three dimensions" },
        pdf: "/papers/3dstoryline-immersive-visual-storytelling.pdf",
        source: "Journal of Visualization 2025",
        fit: "contain",
      },
      {
        image: "/images/research/visualization-widget-taxonomy.png",
        alt: { zh: "实物数据探索任务、交互与可视化组件的分类图", en: "Taxonomy of tasks, interactions, and visualization widgets for tangible data exploration" },
        label: { zh: "设计空间 / 06B", en: "DESIGN SPACE / 06B" },
        title: { zh: "从已有研究中寻找设计线索", en: "Distilling interaction patterns from evidence" },
        pdf: "/papers/visualization-widgets-tangible-data-exploration.pdf",
        source: "IEEE VIS 2025",
        fit: "contain",
      },
    ],
  },
];

const team = [
  {
    name: { zh: "郑力杰", en: "Lijie Zheng" },
    image: "/images/team/lijie-zheng.jpg",
    imagePosition: "50% 42%",
    personalWebsite: "https://zhenglijie.com/",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: [
      { zh: "扩展现实", en: "XR" },
      { zh: "智慧医疗", en: "Smart Healthcare" },
      { zh: "教育科技", en: "EdTech" },
    ],
    bio: {
      zh: "目前在宁波诺丁汉大学攻读计算机与运筹学博士。本科就读计算机科学与人工智能专业，2025 年以一等学位毕业后直升博士。他关注扩展现实、智慧医疗和教育科技，研究成果发表于 IEEE VR、UIST 和 Computers in Human Behavior Reports。",
      en: "A PhD candidate in Computer Science and Operations Research at the University of Nottingham Ningbo China. After graduating with First-Class Honours in Computer Science with Artificial Intelligence in 2025, he progressed directly into doctoral study. His XR, smart healthcare, and EdTech research has appeared at IEEE VR, UIST, and Computers in Human Behavior Reports.",
    },
  },
  {
    name: { zh: "姚淏楠", en: "Haonan Yao" },
    image: "/images/team/haonan-yao-20261008.jpg",
    imagePosition: "50% 42%",
    personalWebsite: "https://haonanyao.pages.dev/",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: [
      { zh: "XR+AI", en: "XR+AI" },
      { zh: "有形交互", en: "Tangible Interaction" },
      { zh: "数字艺术", en: "Digital Art" },
    ],
    bio: {
      zh: "目前在宁波诺丁汉大学攻读计算机科学博士，也是独立 XR 开发者和数字艺术家。他关注扩展现实、有形交互和 AI 驱动的交互技术，相关成果发表于 CHI、IEEE VIS 等国际会议和期刊。",
      en: "A PhD researcher in Computer Science at the University of Nottingham Ningbo China, independent XR developer, and digital artist. His research focuses on extended reality, tangible interaction, and AI-driven interaction technologies, with work published in international academic conferences and journals including CHI and IEEE VIS.",
    },
  },
  {
    name: { zh: "张小蕾", en: "Xiaolei Zhang" },
    image: "/images/team/xiaolei-zhang.png",
    imagePosition: "50% 38%",
    personalWebsite: "https://xiaolei1998.github.io/people/",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: [
      { zh: "智能物联网", en: "AIoT" },
      { zh: "生物医学系统", en: "Biomedical Systems" },
      { zh: "系统设计", en: "Systems Design" },
    ],
    bio: {
      zh: "目前在宁波诺丁汉大学攻读计算机科学博士，拥有新加坡国立大学计算机工程硕士学位和加拿大阿尔伯塔大学学士学位。她曾任博世 ADAS 泊车系统工程师，现在关注 AI 与物联网、生物医学应用，以及面向健康生活的系统设计。",
      en: "A Computer Science PhD candidate at the University of Nottingham Ningbo China, with an M.Eng. from the National University of Singapore and a bachelor’s degree from the University of Alberta. A former BOSCH ADAS parking systems engineer, she researches AI-enabled IoT, intelligent biomedical applications, and systems for healthcare and wellbeing.",
    },
  },
  {
    name: { zh: "韩仁智", en: "Renzhi Han" },
    image: "/images/team/renzhi-han-2026.png",
    imagePosition: "50% 50%",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: [
      { zh: "扩展现实康复", en: "XR Rehabilitation" },
      { zh: "游戏化设计", en: "Gamification" },
      { zh: "Unity", en: "Unity" },
    ],
    bio: {
      zh: "目前在宁波诺丁汉大学攻读计算机科学博士，开发用于康复的 XR 严肃游戏。他研究如何通过游戏化、虚拟角色和交互设计改善沉浸式康复体验，并持续与宁波的医疗机构合作，探索临床验证和实际应用。",
      en: "A Computer Science PhD candidate at the University of Nottingham Ningbo China and developer of XR rehabilitation serious games. His work explores immersive intelligent rehabilitation through gamification, virtual characters, and interaction design, alongside long-term clinical collaboration with healthcare institutions in Ningbo.",
    },
  },
];

const currentResearchAssistants = [
  {
    name: { zh: "侯炳旭", en: "Bingxu HOU" },
    image: "/images/team/bingxu-hou-2026.png",
    start: { zh: "2026 年 3 月起", en: "Since March 2026" },
    personalWebsite: "https://bingxuhou.com/",
    tags: [
      { zh: "交互设计", en: "Interaction Design" },
      { zh: "网站开发", en: "Web Development" },
      { zh: "科研传播", en: "Research Communication" },
    ],
    bio: {
      zh: "负责 I²Lab 网站的视觉与交互设计、开发和日常维护，让更多人可以清楚地了解实验室的项目、团队和论文成果。",
      en: "Bingxu designed, built, and continues to maintain the I²Lab website. His work brings the laboratory’s projects, people, and publications together in a clear bilingual experience, connecting interaction design and web development with research communication.",
    },
  },
];

const advisors = [
  {
    name: { zh: "李汶锦教授", en: "Dr. Boon Giin Lee" },
    role: {
      zh: "外部顾问 · 宁波诺丁汉大学计算机科学副教授",
      en: "External Advisor · Associate Professor of Computer Science, UNNC",
    },
    image: "/images/team/boon-giin-lee.png",
    profileUrl: "https://research.nottingham.edu.cn/en/persons/boon-giin-lee/",
    bio: {
      zh: "长期研究人机交互与以人为本的智能感知，担任传感器、传感器网络与仪器技术研究组负责人，也是 IEEE 资深会员。他致力于推动 XR 和智能交互在医疗、康复领域的研究与应用。",
      en: "A scholar in human-computer interaction and human-centred intelligent sensing, Head of the Sensors, Sensor Networks and Instrumentation research group, and IEEE Senior Member. His work advances the translation of XR and intelligent interaction into healthcare and rehabilitation.",
    },
  },
  {
    name: { zh: "郑力伟", en: "Liwei Zheng" },
    role: {
      zh: "股东 · 监事 · 项目顾问",
      en: "Shareholder · Supervisor · Project Advisor",
    },
    image: "/images/team/liwei-zheng.jpg",
    profileUrl: "",
    bio: {
      zh: "在供应链管理和冷链物流领域有多年企业经营与项目实践经验，熟悉仓配网络、冷链运营、合作伙伴拓展，以及成本和风险管理。",
      en: "An experienced operator in supply-chain management and cold-chain logistics, with expertise spanning distribution networks, cold-chain operations, partner development, and cost and risk control.",
    },
  },
];

type Publication = {
  owner: PublicationOwner;
  year: string;
  type: Localized;
  title: string;
  authors: string;
  venue: string;
  badge?: string;
  pdf?: string;
  url?: string;
  resources?: Array<{ label: string; url: string }>;
};

const publications: Publication[] = [
  {
    owner: "bryan", year: "2026", type: { zh: "期刊论文", en: "Journal" },
    title: "Kolmogorov–Arnold Networks-Based GRU and LSTM for Loan Default Early Prediction",
    authors: "Y. Yang, Z. Su, Y. Zhang, C. C. Goh, Y. Lin, A. G. Bellotti & B. G. Lee",
    venue: "Applied Soft Computing", pdf: "/papers/bryan-kan-loan-default-prediction.pdf",
    url: "https://doi.org/10.1016/j.asoc.2026.115213",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "会议论文", en: "Conference" },
    title: "Cognitive Style Shapes Search Behaviours: An fNIRS Study of Exploratory Search",
    authors: "H. Tang, B. G. Lee, D. Towey, M. L. Wilson & M. Pike",
    venue: "ACM SIGIR 2026", pdf: "/papers/bryan-cognitive-style-fnirs-search.pdf",
    url: "https://doi.org/10.1145/3805712.3809541",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "期刊论文", en: "Journal" },
    title: "Context-Dependent Roles of Familiarity, Discipline, and Personality in Shaping Social Engagement in Cooperative Immersive Learning",
    authors: "L. Zheng, S. Ke, Y. Zang, L. Sun, M. Pike & B. G. Lee",
    venue: "Computers in Human Behavior Reports", pdf: "/papers/context-dependent-social-engagement-immersive-learning.pdf",
    url: "https://doi.org/10.1016/j.chbr.2026.101089",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "期刊论文", en: "Journal" },
    title: "A Virtual Peer Mentor to Enhance Social Presence in VR Rehabilitation for Recovering Heart-Attack Patients",
    authors: "R. Han, B. G. Lee, D. Towey, Y. Yao & M. Pike",
    venue: "IEEE Transactions on Visualization and Computer Graphics · 32(5), 3809–3819",
    pdf: "/papers/virtual-peer-mentor-vr-rehabilitation.pdf",
    url: "https://doi.org/10.1109/TVCG.2026.3679134",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "会议论文", en: "Conference" },
    title: "Differential Effects of Virtual and Augmented Reality on Social Presence and Engagement in Collaborative Gaming for Unfamiliar Users",
    authors: "L. Zheng, G. Cheng, S. Ke, J. Yuan, Y. Fan, B. G. Lee, M. Pike & A. Guerra-Manzanares",
    venue: "IEEE Conference on Virtual Reality and 3D User Interfaces (IEEE VR)",
    pdf: "/papers/differential-effects-vr-ar-collaborative-gaming.pdf",
    url: "https://doi.org/10.1109/VR67842.2026.00063",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "会议论文", en: "Conference" },
    title: "MAHJONG: An Augmented Reality Rehabilitation Serious Game for Motor-Cognitive Dual-Task Training in Older Adults",
    authors: "Y. Zuo & B. G. Lee", venue: "IEEE VR 2026 Workshops",
    pdf: "/papers/bryan-mahjong-ar-rehabilitation.pdf",
    url: "https://doi.org/10.1109/VRW70859.2026.00199",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "期刊论文", en: "Journal" },
    title: "MRT4Depth: Metamorphic Robustness Testing for Ground-Truth-Free Evaluation of Monocular Depth Estimation Models",
    authors: "P. C. Y. Cheah, B. G. Lee, D. Towey, D. Chieng, T. Y. Chen & Z. Q. Zhou",
    venue: "IEEE Transactions on Reliability · 75",
    pdf: "/papers/bryan-mrt4depth-robustness-testing.pdf",
    url: "https://doi.org/10.1109/TR.2026.3711986",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "会议论文", en: "Conference" },
    title: "The Trust Gap in Agentic Search: How Verbal-Imagery Cognitive Styles Shape Behavioural Signals and AI Acceptance",
    authors: "H. Tang, Y. Zhang, A. Guerra-Manzanares, B. G. Lee, D. Towey, M. L. Wilson & M. Pike",
    venue: "IEEE COMPSAC 2026", pdf: "/papers/bryan-trust-gap-agentic-search.pdf",
    url: "https://doi.org/10.1109/COMPSAC69091.2026.00161",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "期刊论文", en: "Journal" },
    title: "Wi-ViTAL: Domain Generalization of Wireless Human Activity Recognition Using Linear Attention Vision Transformer With Adversarial Learning",
    authors: "Y. Li, D. Chieng, B. G. Lee, C. F. Kwong, K. M. Lim & S. Li",
    venue: "IEEE Transactions on Mobile Computing · 25(4)",
    pdf: "/papers/bryan-wi-vital-wireless-activity-recognition.pdf",
    url: "https://doi.org/10.1109/TMC.2025.3632752",
  },
  {
    owner: "bryan", year: "2026", type: { zh: "期刊论文", en: "Journal" },
    title: "Transforming Credit Risk Analysis: A Time-Series-Driven ResE-BiLSTM Framework for Post-Loan Default Detection",
    authors: "Y. Yang, Y. Lin, Y. Zhang, Z. Su, C. C. Goh, T. Fang, A. Bellotti & B. G. Lee",
    venue: "Information · 17(1), 5", pdf: "/papers/bryan-credit-risk-rese-bilstm.pdf",
    url: "https://doi.org/10.3390/info17010005",
  },
  {
    owner: "bryan", year: "2025", type: { zh: "期刊论文", en: "Journal" },
    title: "IoT-FAR: A Multi-Sensor Fusion Approach for IoT-Based Firefighting Activity Recognition",
    authors: "X. Chai, B. G. Lee, C. Hu, M. Pike, D. Chieng, R. Wu & W.-Y. Chung",
    venue: "Information Fusion", pdf: "/papers/bryan-iot-far-firefighting-recognition.pdf",
    url: "https://doi.org/10.1016/j.inffus.2024.102650",
  },
  {
    owner: "bryan", year: "2025", type: { zh: "期刊论文", en: "Journal" },
    title: "A Multimodal Decision–Fusion Network Approach for Activity Recognition in Firefighter Self-Contained Breathing Apparatus Endurance Training",
    authors: "X. Chai, J. Yu, B. G. Lee, M. Pike, L. Nkenyereye & W.-Y. Chung",
    venue: "IEEE Sensors Letters · 9(11)", pdf: "/papers/bryan-firefighter-multimodal-fusion.pdf",
    url: "https://doi.org/10.1109/LSENS.2025.3614427",
  },
  {
    owner: "bryan", year: "2025", type: { zh: "会议论文", en: "Conference" },
    title: "Bridging Theory and Practice in Machine Learning Education Through Mixed Reality Gamification",
    authors: "G. Zhang & B. G. Lee", venue: "IEEE TALE 2025",
    pdf: "/papers/bryan-mixed-reality-machine-learning-education.pdf",
    url: "https://doi.org/10.1109/TALE66047.2025.11346761",
  },
  {
    owner: "bryan", year: "2025", type: { zh: "期刊论文", en: "Journal" },
    title: "CNN-LiDAR-SLAM: Multimodal Fusion With Object Detection for Indoor Localization",
    authors: "S. H. Kalan, B. G. Lee & W.-Y. Chung", venue: "IEEE Access",
    pdf: "/papers/bryan-cnn-lidar-slam-indoor-localization.pdf",
    url: "https://doi.org/10.1109/ACCESS.2025.3635243",
  },
  {
    owner: "bryan", year: "2025", type: { zh: "期刊论文", en: "Journal" },
    title: "Evaluating Denoising Approaches for RGB-Infrared Images: Systematic Review and Comparative Analysis of Traditional Methods and Performance Metrics",
    authors: "Y. Yu, B. G. Lee, Q. Zhang & T. Cui", venue: "Journal of Signal Processing Systems · 97, 91–115",
    pdf: "/papers/bryan-rgb-infrared-denoising-review.pdf",
    url: "https://doi.org/10.1007/s11265-025-01957-8",
  },
  {
    owner: "bryan", year: "2025", type: { zh: "期刊论文", en: "Journal" },
    title: "Functionality-Aware Offloading Technique for Scheduling Containerized Edge Applications in IoT Edge Computing",
    authors: "L. Nkenyereye, B. G. Lee & W.-Y. Chung", venue: "Journal of Cloud Computing · 14, Article 13",
    pdf: "/papers/bryan-functionality-aware-edge-offloading.pdf",
    url: "https://doi.org/10.1186/s13677-025-00737-w",
  },
  {
    owner: "lijie",
    year: "2026",
    type: { zh: "会议论文", en: "Conference" },
    title: "Differential Effects of Virtual and Augmented Reality on Social Presence and Engagement in Collaborative Gaming for Unfamiliar Users",
    authors: "L. Zheng, G. Cheng, S. Ke, J. Yuan, Y. Fan, B. G. Lee, M. Pike & A. Guerra-Manzanares",
    venue: "IEEE Conference on Virtual Reality and 3D User Interfaces (IEEE VR)",
    badge: "CCF-A",
    pdf: "/papers/differential-effects-vr-ar-collaborative-gaming.pdf",
    url: "https://doi.org/10.1109/VR67842.2026.00063",
    resources: [{ label: "UNNC", url: "https://research.nottingham.edu.cn/en/publications/differential-effects-of-virtual-and-augmented-reality-on-social-p/" }],
  },
  {
    owner: "lijie",
    year: "2026",
    type: { zh: "期刊论文", en: "Journal" },
    title: "Context-Dependent Roles of Familiarity, Discipline, and Personality in Shaping Social Engagement in Cooperative Immersive Learning",
    authors: "L. Zheng, S. Ke, Y. Zang, L. Sun, M. Pike & B. G. Lee",
    venue: "Computers in Human Behavior Reports",
    pdf: "/papers/context-dependent-social-engagement-immersive-learning.pdf",
    url: "https://doi.org/10.1016/j.chbr.2026.101089",
    resources: [{ label: "Open access", url: "https://www.sciencedirect.com/science/article/pii/S2451958826001636" }],
  },
  {
    owner: "lijie",
    year: "2025",
    type: { zh: "会议论文", en: "Conference" },
    title: "Understanding Asymmetric Collaboration in Augmented and Virtual Reality Immersive Environments",
    authors: "L. Zheng, G. Cheng, S. Ke, J. Yuan, B. G. Lee & M. Pike",
    venue: "ACM UIST 2025 Adjunct",
    badge: "CCF-A",
    pdf: "/papers/understanding-asymmetric-collaboration-ar-vr.pdf",
    url: "https://doi.org/10.1145/3746058.3758399",
    resources: [{ label: "ACM DL", url: "https://dl.acm.org/doi/10.1145/3746058.3758399" }],
  },
  {
    owner: "lijie",
    year: "2025",
    type: { zh: "会议论文", en: "Conference" },
    title: "Exploring the Influence of Interpersonal Relationships on Gamification Preferences in Collaborative IVR Environments",
    authors: "S. Ke, L. Zheng & B. G. Lee",
    venue: "IEEE VR 2025 · pp. 104–114",
    badge: "CCF-A",
    pdf: "/papers/interpersonal-relationships-gamification-ivr.pdf",
    url: "https://doi.org/10.1109/VR59515.2025.00035",
    resources: [{ label: "IEEE Xplore", url: "https://ieeexplore.ieee.org/document/10937399/" }],
  },
  {
    owner: "haonan",
    year: "2025",
    type: { zh: "期刊论文", en: "Journal" },
    title: "3DStoryline: Immersive Visual Storytelling",
    authors: "H. Yao, L. Zhao, B. Chen, K. Li, H. N. Liang & L. Yu",
    venue: "Journal of Visualization · 28(3), 681–697",
    pdf: "/papers/3dstoryline-immersive-visual-storytelling.pdf",
    url: "https://doi.org/10.1007/s12650-025-01058-5",
    resources: [{ label: "arXiv", url: "https://arxiv.org/abs/2408.01775" }],
  },
  {
    owner: "haonan",
    year: "2025",
    type: { zh: "会议论文", en: "Conference" },
    title: "Designing Visualization Widgets for Tangible Data Exploration: A Systematic Review",
    authors: "H. Yao, L. Yu & L. Yao",
    venue: "IEEE Visualization and Visual Analytics (VIS) · pp. 261–265",
    pdf: "/papers/visualization-widgets-tangible-data-exploration.pdf",
    url: "https://doi.org/10.1109/VIS60296.2025.00058",
    resources: [{ label: "arXiv", url: "https://arxiv.org/abs/2507.00775" }],
  },
  {
    owner: "haonan",
    year: "2024",
    type: { zh: "会议论文", en: "Conference" },
    title: "Data Cubes in Hand: A Design Space of Tangible Cubes for Visualizing 3D Spatio-Temporal Data in Mixed Reality",
    authors: "S. He, H. Yao, L. Jiang, K. Li, N. Xiang, Y. Li, H. N. Liang & L. Yu",
    venue: "ACM CHI 2024",
    badge: "CCF-A",
    pdf: "/papers/data-cubes-in-hand-mixed-reality.pdf",
    url: "https://doi.org/10.1145/3613904.3642740",
    resources: [{ label: "arXiv", url: "https://arxiv.org/abs/2403.06891" }],
  },
  {
    owner: "haonan",
    year: "2024",
    type: { zh: "会议论文", en: "Conference" },
    title: "Exploring Embodied Asymmetric Two-Handed Interactions for Immersive Data Exploration",
    authors: "H. Yao, L. Zhao, H. N. Liang, Y. Liu, Y. Li & L. Yu",
    venue: "ACM CHI 2024 Extended Abstracts",
    badge: "CCF-A",
    pdf: "/papers/embodied-two-handed-immersive-data-exploration.pdf",
    url: "https://doi.org/10.1145/3613905.3650777",
    resources: [{ label: "ACM DL", url: "https://dl.acm.org/doi/10.1145/3613905.3650777" }],
  },
  {
    owner: "renzhi",
    year: "2026",
    type: { zh: "期刊论文", en: "Journal" },
    title: "A Virtual Peer Mentor to Enhance Social Presence in VR Rehabilitation for Recovering Heart-Attack Patients",
    authors: "R. Han et al.",
    venue: "IEEE Transactions on Visualization and Computer Graphics · 32(5), 3809–3819",
    pdf: "/papers/virtual-peer-mentor-vr-rehabilitation.pdf",
    url: "https://doi.org/10.1109/TVCG.2026.3679134",
    resources: [
      { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/41911123/" },
      { label: "UNNC", url: "https://research.nottingham.edu.cn/en/publications/a-virtual-peer-mentor-to-enhance-social-presence-in-vr-rehabilita/" },
    ],
  },
  {
    owner: "renzhi",
    year: "2025",
    type: { zh: "期刊论文", en: "Journal" },
    title: "Sproutfit: An Immersive Seed-Planting Virtual Reality Game to Enhance Patient Motivation for Performing Exercises for the Prevention of Venous Thromboembolism through Loss and Avoidance Gamification",
    authors: "R. Han et al.",
    venue: "Virtual Reality · 29(3), Article 137",
    pdf: "/papers/renzhi-han-sproutfit-immersive-vr-rehabilitation-2025.pdf",
    url: "https://doi.org/10.1007/s10055-025-01220-2",
    resources: [{ label: "UNNC", url: "https://research.nottingham.edu.cn/en/publications/sproutfit-an-immersive-seed-planting-virtual-reality-game-to-enha-2/" }],
  },
  {
    owner: "renzhi",
    year: "PDF",
    type: { zh: "博士研究报告", en: "Doctoral Research Report" },
    title: "Research on Gamification to Enhance User Motivation in Extended Reality (XR) Rehabilitation",
    authors: "Renzhi Han",
    venue: "University of Nottingham Ningbo China · First-Year Annual Review Report",
    pdf: "/papers/renzhi-han-xr-rehabilitation-annual-review.pdf",
  },
  {
    owner: "renzhi",
    year: "2024",
    type: { zh: "会议论文", en: "Conference" },
    title: "Exploring Emotional Responses with Dynamic Difficulty Adjustment Adaptation in Immersive Virtual Reality Exergaming",
    authors: "R. Han, B. G. Lee, D. Towey, Y. Yao & M. Pike",
    venue: "IEEE COMPSAC 2024",
    pdf: "/papers/emotional-responses-adaptive-ivr-exergaming.pdf",
    url: "https://doi.org/10.1109/COMPSAC61105.2024.00089",
    resources: [{ label: "IEEE Xplore", url: "https://ieeexplore.ieee.org/document/10633336/" }],
  },
  {
    owner: "renzhi",
    year: "2024",
    type: { zh: "书章", en: "Book Chapter" },
    title: "Deep Learning Approach for Enhanced Object Recognition and Assembly Guidance with Augmented Reality",
    authors: "B. G. Lee, X. Wang, R. Han, L. Sun, M. Pike & W. Y. Chung",
    venue: "Intelligent Human Computer Interaction · LNCS 14532",
    url: "https://doi.org/10.1007/978-3-031-53830-8_11",
    resources: [{ label: "Springer", url: "https://link.springer.com/chapter/10.1007/978-3-031-53830-8_11" }],
  },
];

const ownerNames: Record<PublicationOwner, Localized> = {
  bryan: { zh: "李汶锦 · 精选研究", en: "Boon Giin Lee · Selected research" },
  lijie: { zh: "郑力杰 · 精选研究", en: "Lijie Zheng · Selected research" },
  haonan: { zh: "姚淏楠 · 精选研究", en: "Haonan Yao · Selected research" },
  renzhi: { zh: "韩仁智 · 精选研究", en: "Renzhi Han · Selected research" },
};

function usePageObservers(setActiveSection: (id: string) => void, refreshKey: string) {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    let sectionFrame = 0;
    const syncActiveSection = () => {
      sectionFrame = 0;
      const marker = window.innerHeight * 0.28;
      const section = sections.find((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top <= marker && bounds.bottom > marker;
      });
      if (section) setActiveSection(section.dataset.navSection ?? section.id);
    };
    const scheduleSection = () => {
      if (!sectionFrame) sectionFrame = window.requestAnimationFrame(syncActiveSection);
    };
    scheduleSection();
    window.addEventListener("scroll", scheduleSection, { passive: true });
    window.addEventListener("resize", scheduleSection);

    return () => {
      window.cancelAnimationFrame(sectionFrame);
      window.removeEventListener("scroll", scheduleSection);
      window.removeEventListener("resize", scheduleSection);
    };
  }, [refreshKey, setActiveSection]);
}

function SectionHeading({
  eyebrow,
  title,
  description,
  lang,
}: {
  eyebrow: Localized;
  title: Localized;
  description?: Localized;
  lang: Lang;
}) {
  return (
    <div className="section-heading reveal">
      <div className="eyebrow"><span />{t(eyebrow, lang)}</div>
      <h2>{t(title, lang)}</h2>
      {description && <p>{t(description, lang)}</p>}
    </div>
  );
}

function ArrowLink({ href, children, download }: { href: string; children: ReactNode; download?: boolean }) {
  return (
    <a className="arrow-link" href={href} target="_blank" rel="noopener noreferrer" download={download}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

const opportunityStatusLabels: Record<OpportunityStatus, Localized> = {
  open: { zh: "开放申请", en: "Open" },
  upcoming: { zh: "即将开放", en: "Upcoming" },
  closed: { zh: "已截止", en: "Closed" },
};

function OpportunityStatus({ status, lang }: { status: OpportunityStatus; lang: Lang }) {
  return (
    <span className={`opportunity-status opportunity-status-${status}`}>
      <i aria-hidden="true" />
      {t(opportunityStatusLabels[status], lang)}
    </span>
  );
}

function OpportunitiesOverview({ lang }: { lang: Lang }) {
  return (
    <section className="opportunities-overview dark-section" id="opportunities" data-nav-section="opportunities">
      <div className="section-frame">
        <SectionHeading
          lang={lang}
          eyebrow={{ zh: "研究机会", en: "RESEARCH OPPORTUNITIES" }}
          title={{ zh: "从真实项目出发，找到自己的方向。", en: "Begin with real research. Build your own academic path." }}
          description={{
            zh: "加入实验室正在开展的项目，和团队长期合作，学习系统开发、实验设计和论文写作，亲身经历研究是怎样一步步完成的。",
            en: "Join an active Intelligent Interaction Laboratory project and experience the complete research process—from system development and experimental design to academic writing.",
          }}
        />

        <div className="opportunity-highlights reveal" aria-label={lang === "zh" ? "申请关键信息" : "Key application information"}>
          {recruitmentHighlights.map((highlight) => (
            <div key={highlight.value.en}>
              <strong>{t(highlight.value, lang)}</strong>
              <span>{t(highlight.label, lang)}</span>
            </div>
          ))}
          <p>{lang === "zh" ? "I²Lab / 研究助理" : "I² LAB / RESEARCH ASSISTANT"}</p>
        </div>

        <div className="recruitment-info-list">
          {recruitmentInfoGroups.map((group) => (
            <article className="recruitment-info-row reveal" key={group.index}>
              <span className="recruitment-info-index">{group.index}</span>
              <h3>{t(group.title, lang)}</h3>
              <ul>
                {group.items.map((item) => <li key={item.en}>{t(item, lang)}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <div className="application-protocol reveal">
          <div>
            <span>{lang === "zh" ? "申请邮件标题" : "EMAIL SUBJECT"}</span>
            <code>RA Application – Name – Programme – Year</code>
          </div>
          <p>
            {lang === "zh"
              ? "选好项目后，请给对应负责人发邮件。正文用英文要点撰写，不超过 200 词，并附上简历和相关作品链接。"
              : "Choose a project, then contact its project lead. Use no more than 200 words in English bullet points and attach your CV and relevant project links."}
          </p>
          <a className="primary-button" href="#available-projects">
            <span>{lang === "zh" ? "查看可申请项目" : "View available projects"}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <a className="alumni-recruitment-link reveal" href="#alumni">
          <span>{lang === "zh" ? "从实验室出发，走向更多可能" : "FROM RESEARCH TO WHAT COMES NEXT"}</span>
          <strong>{lang === "zh" ? "看看往届研究助理如今走到了哪里" : "Discover our RA alumni’s pathways"}</strong>
          <i aria-hidden="true">↗</i>
        </a>
      </div>
    </section>
  );
}

function OpportunityDirectory({ lang }: { lang: Lang }) {
  return (
    <section className="opportunity-directory light-section" id="available-projects" data-nav-section="opportunities">
      <div className="section-frame">
        <div className="opportunity-directory-heading">
          <SectionHeading
            lang={lang}
            eyebrow={{ zh: "可申请研究项目", en: "AVAILABLE RESEARCH PROJECTS" }}
            title={{ zh: "选择一个你愿意长期投入的问题。", en: "Choose a question worth staying with." }}
            description={{
              zh: "这里的项目会随着实验室的研究进展更新。点开感兴趣的项目，就能了解它在做什么、需要哪些能力，以及如何申请。",
              en: "Opportunities evolve with the laboratory’s research. Open a project to review its context, participation requirements, and application route.",
            }}
          />
          <div className="opportunity-count reveal" aria-label={lang === "zh" ? `当前 ${visibleResearchOpportunities.length} 个项目开放展示` : `${visibleResearchOpportunities.length} projects currently listed`}>
            <strong>{String(visibleResearchOpportunities.length).padStart(2, "0")}</strong>
            <span>{lang === "zh" ? "当前项目" : "CURRENT PROJECTS"}</span>
          </div>
        </div>

        <div className="opportunity-index-list">
          {visibleResearchOpportunities.map((project, index) => (
            <a className="opportunity-index-row reveal" href={`/opportunities/${project.slug}`} key={project.slug}>
              <span className="opportunity-project-index">P.{String(index + 1).padStart(2, "0")}</span>
              <div className="opportunity-project-heading">
                <OpportunityStatus status={project.status} lang={lang} />
                <h3>{t(project.title, lang)}</h3>
                <p>{t(project.summary, lang)}</p>
              </div>
              <div className="opportunity-project-meta">
                <span>{lang === "zh" ? "负责人" : "PROJECT LEAD"}</span>
                <strong>{t(project.leader, lang)}</strong>
                <div>{project.tags.map((tag) => <small key={tag.en}>{t(tag, lang)}</small>)}</div>
              </div>
              <span className="opportunity-project-link">
                {lang === "zh" ? "查看项目详情" : "View project"}<i aria-hidden="true">↗</i>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpportunityDetailPage({ project, lang }: { project: ResearchOpportunity; lang: Lang }) {
  const mailSubject = encodeURIComponent("RA Application – Name – Programme – Year");

  return (
    <main className="opportunity-detail-main" id="main" tabIndex={-1} data-project={project.slug}>
      <section className="opportunity-detail-hero dark-section" id="project-detail" data-nav-section="opportunities" aria-labelledby="project-title">
        <div className="opportunity-detail-grid" aria-hidden="true" />
        <div className="section-frame opportunity-detail-hero-frame">
          <a className="project-back-link reveal is-visible" href="/#available-projects">
            <span aria-hidden="true">←</span>{lang === "zh" ? "返回可申请项目" : "Back to available projects"}
          </a>
          <div className="project-detail-heading reveal is-visible">
            <div className="project-detail-kicker">
              <span>P.{String(project.order).padStart(2, "0")}</span>
              <OpportunityStatus status={project.status} lang={lang} />
            </div>
            <h1 id="project-title">{t(project.title, lang)}</h1>
            <p>{t(project.summary, lang)}</p>
          </div>
          <div className="project-detail-rail reveal is-visible">
            <div>
              <span>{lang === "zh" ? "项目负责人" : "PROJECT LEAD"}</span>
              <strong>{t(project.leader, lang)}</strong>
            </div>
            <div>
              <span>{lang === "zh" ? "联系邮箱" : "CONTACT"}</span>
              <a href={`mailto:${project.email}`}>{project.email}<i aria-hidden="true">↗</i></a>
            </div>
            <div className="project-detail-tags">{project.tags.map((tag) => <small key={tag.en}>{t(tag, lang)}</small>)}</div>
          </div>
        </div>
      </section>

      <section className="opportunity-detail-body light-section">
        <div className="section-frame project-detail-content">
          <aside className="project-detail-aside reveal">
            <span>{lang === "zh" ? "I² / 研究机会" : "I² / RESEARCH OPPORTUNITY"}</span>
            <p>{lang === "zh" ? "长期参与 · 真实项目 · 扎实成果" : "LONG-TERM · REAL RESEARCH · VERIFIABLE OUTCOMES"}</p>
          </aside>
          <div className="project-detail-sections">
            {project.sections.map((section, sectionIndex) => (
              <article className="project-detail-section reveal" key={section.id}>
                <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                <h2>{t(section.title, lang)}</h2>
                <div>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph.en}>{t(paragraph, lang)}</p>)}
                  {section.items && (
                    <ol>
                      {section.items.map((item) => <li key={item.en}>{t(item, lang)}</li>)}
                    </ol>
                  )}
                </div>
              </article>
            ))}

            {project.closing && <blockquote className="project-detail-closing reveal">{t(project.closing, lang)}</blockquote>}
            {project.note && <p className="project-detail-note reveal">{t(project.note, lang)}</p>}

            {project.references && project.references.length > 0 && (
              <section className="project-reference-list reveal" aria-labelledby="project-references-title">
                <h2 id="project-references-title">{lang === "zh" ? "相关研究" : "Related Articles"}</h2>
                {project.references.map((reference, index) => (
                  <article key={reference.title}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>
                        {reference.pdf || reference.doi ? (
                          <a className="project-reference-title" href={reference.pdf ?? reference.doi} target="_blank" rel="noopener noreferrer">{reference.title}</a>
                        ) : reference.title}
                      </h3>
                      {reference.citation && <p>{reference.citation}</p>}
                    </div>
                    <div className="project-reference-actions">
                      {reference.doi && <a href={reference.doi} target="_blank" rel="noopener noreferrer" aria-label={`DOI: ${reference.title}`}>DOI <i aria-hidden="true">↗</i></a>}
                      {reference.pdf && <a href={reference.pdf} target="_blank" rel="noopener noreferrer" aria-label={`PDF: ${reference.title}`}>PDF <i aria-hidden="true">↗</i></a>}
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        </div>
      </section>

      <section className="project-application-band">
        <div>
          <span>{lang === "zh" ? "准备加入这个项目？" : "READY TO JOIN THIS PROJECT?"}</span>
          <h2>{lang === "zh" ? "先写一封简单、清楚的申请邮件。" : "Start with a clear application email."}</h2>
          <p>{lang === "zh" ? "请用英文要点写正文，不超过 200 词，并附上简历和相关项目链接。" : "Use no more than 200 words in English bullet points and attach your CV and relevant project links."}</p>
        </div>
        <a className="primary-button light-button" href={`mailto:${project.email}?subject=${mailSubject}`}>
          <span>{lang === "zh" ? `联系${t(project.leader, lang)}` : `Email ${t(project.leader, lang)}`}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}

function MainProjectsSection({ lang }: { lang: Lang }) {
  return (
    <section className="main-projects-section dark-section" id="projects" data-nav-section="projects">
      <div className="section-frame">
        <SectionHeading
          lang={lang}
          eyebrow={{ zh: "研究与临床实践", en: "RESEARCH IN PRACTICE" }}
          title={{ zh: "主要项目", en: "Main Projects" }}
          description={{
            zh: "从临床里的真实问题出发，做出人们能亲身体验的系统。一个项目帮助患者了解治疗过程，另一个关注术后康复。点击项目，看看它们各自怎样展开。",
            en: "From clinical questions to research systems people can experience. These two perioperative projects address different needs—understanding care and participating in recovery. Open each to explore its approach.",
          }}
        />
        <div className="main-projects-list">
          {mainProjects.map((project) => (
            <a className="main-project-card reveal" href={`/projects/${project.slug}`} key={project.slug}>
              <div className="main-project-index"><span>{project.number}</span><small>{t(project.code, lang)}</small></div>
              <div className="main-project-copy">
                <h3>{t(project.title, lang)}</h3>
                <p>{t(project.summary, lang)}</p>
                <span className="main-project-setting">{t(project.setting, lang)}</span>
              </div>
              <div className={`main-project-symbol main-project-symbol-${project.number}`} aria-hidden="true"><i /><i /><i /></div>
              <span className="main-project-arrow" aria-label={lang === "zh" ? "查看项目详情" : "View project details"}>↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MainProjectDetailPage({ project, lang }: { project: MainProject; lang: Lang }) {
  const nextProject = mainProjects.find((candidate) => candidate.slug !== project.slug);

  return (
    <main className="main-project-detail" id="main" tabIndex={-1}>
      <section className="main-project-detail-hero dark-section" data-nav-section="projects" aria-labelledby="main-project-title">
        <div className="section-frame">
          <a className="project-back-link reveal is-visible" href="/#projects"><span aria-hidden="true">←</span>{lang === "zh" ? "返回主要项目" : "Back to main projects"}</a>
          <div className="main-project-detail-heading reveal is-visible">
            <span className="main-project-detail-kicker">{lang === "zh" ? "I²Lab" : "I² LAB"} / {project.number} / {t(project.code, lang)}</span>
            <h1 id="main-project-title">{t(project.title, lang)}</h1>
            <p>{t(project.summary, lang)}</p>
            <small>{t(project.setting, lang)}</small>
          </div>
        </div>
      </section>
      <section className="main-project-detail-body light-section">
        <div className="section-frame main-project-detail-layout">
          <div className="main-project-detail-visual reveal">
            <img src={project.visual} alt={t(project.visualAlt, lang)} loading="eager" decoding="async" />
            <div><span>{t(project.code, lang)}</span><p>{t(project.visualCaption, lang)}</p></div>
          </div>
          <div className="main-project-detail-sections">
            {project.sections.map((section, index) => (
              <article className="main-project-detail-section reveal" key={section.label.en}>
                <span>{String(index + 1).padStart(2, "0")} / {t(section.label, lang)}</span>
                <h2>{t(section.title, lang)}</h2>
                <div className="main-project-detail-copy">
                  <p>{t(section.text, lang)}</p>
                  {section.details?.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{t(paragraph, lang)}</p>)}
                </div>
                {section.images && (
                  <div className={`main-project-detail-media ${section.images.length > 1 ? "main-project-detail-media-pair" : ""}`}>
                    {section.images.map((visual) => (
                      <figure key={visual.src}>
                        <img src={visual.src} alt={t(visual.alt, lang)} loading="lazy" decoding="async" />
                        <figcaption>{t(visual.caption, lang)}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
      {nextProject && (
        <section className="main-project-next dark-section">
          <div className="section-frame">
            <span>{lang === "zh" ? "继续探索" : "CONTINUE EXPLORING"}</span>
            <a href={`/projects/${nextProject.slug}`}>{t(nextProject.title, lang)}<i aria-hidden="true">↗</i></a>
          </div>
        </section>
      )}
    </main>
  );
}

function ResearchFigureCard({ figure, lang }: { figure: ResearchFigure; lang: Lang }) {
  const openLabel = lang === "zh" ? "打开论文 PDF（新标签页）" : "Open the paper PDF in a new tab";

  return (
    <figure className={`research-figure research-figure-${figure.fit ?? "cover"}`}>
      <a
        className="research-visual-link"
        href={figure.pdf}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t(figure.title, lang)} · ${figure.source} · ${openLabel}`}
      >
        <span className="research-visual">
          <img
            src={figure.image}
            alt={t(figure.alt, lang)}
            style={{ objectPosition: figure.objectPosition }}
            loading="lazy"
            decoding="async"
          />
          <span className="research-frame-code">{t(figure.label, lang)}</span>
        </span>
      </a>
      <figcaption>
        <span>
          <small>{figure.source}</small>
          <strong>{t(figure.title, lang)}</strong>
        </span>
        <a
          className="research-source-link"
          href={figure.pdf}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${lang === "zh" ? "查看论文 PDF" : "PDF source"}: ${t(figure.title, lang)} · ${openLabel}`}
        >
          {lang === "zh" ? "查看论文 PDF" : "PDF source"}<i aria-hidden="true">↗</i>
        </a>
      </figcaption>
    </figure>
  );
}

function ResearchCarousel({ stories, lang }: { stories: ResearchStory[]; lang: Lang }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((requestedIndex: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const index = Math.max(0, Math.min(requestedIndex, stories.length - 1));
    const slide = viewport.querySelector<HTMLElement>(`[data-research-index="${index}"]`);
    if (!slide) return;

    let reducedMotion = false;
    try { reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* media queries may be unavailable */ }
    viewport.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
  }, [stories.length]);

  const handleScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      if (viewport) {
        const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
        const slides = Array.from(viewport.querySelectorAll<HTMLElement>("[data-research-slide]"));
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        slides.forEach((slide, index) => {
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const distance = Math.abs(slideCenter - viewportCenter);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        setActiveIndex((current) => current === nearestIndex ? current : nearestIndex);
      }
      scrollFrameRef.current = null;
    });
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(stories.length - 1);
    }
  };

  useEffect(() => () => {
    if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
  }, []);

  return (
    <div
      className="research-carousel reveal"
      role="region"
      aria-roledescription="carousel"
      aria-label={lang === "zh" ? "研究图像与论文 PDF" : "Research imagery and paper PDFs"}
    >
      <div className="research-carousel-toolbar">
        <div className="research-carousel-intro">
          <span>{lang === "zh" ? "I² / 研究图谱" : "I² / RESEARCH ATLAS"}</span>
          <p>{lang === "zh" ? "12 张研究图片 · 6 组主题 · 点击图片阅读对应论文" : "12 visual records · 6 research pairings · every image opens its source PDF"}</p>
        </div>
        <div className="research-carousel-controls">
          <span aria-hidden="true"><b>{String(activeIndex + 1).padStart(2, "0")}</b> / {String(stories.length).padStart(2, "0")}</span>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-controls="research-carousel-viewport"
            aria-label={lang === "zh" ? "上一组研究图片" : "Previous research image group"}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === stories.length - 1}
            aria-controls="research-carousel-viewport"
            aria-label={lang === "zh" ? "下一组研究图片" : "Next research image group"}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div
        id="research-carousel-viewport"
        className="research-carousel-viewport"
        ref={viewportRef}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        <div className="research-carousel-track">
          {stories.map((story, index) => (
            <article
              className="research-story"
              key={story.id}
              data-research-slide
              data-research-index={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${stories.length} · ${t(story.title, lang)}`}
            >
              <ResearchFigureCard figure={story.figures[0]} lang={lang} />
              <div className="research-story-note">
                <span>{t(story.tag, lang)}</span>
                <strong>{t(story.title, lang)}</strong>
                <p>{t(story.note, lang)}</p>
                <small>{lang === "zh" ? "研究 · 原型 · 实践" : "RESEARCH · PROTOTYPE · TRANSLATION"}</small>
              </div>
              <ResearchFigureCard figure={story.figures[1]} lang={lang} />
            </article>
          ))}
        </div>
      </div>

      <div className="research-carousel-pagination" aria-label={lang === "zh" ? "选择研究图片组" : "Select research image group"}>
        {stories.map((story, index) => (
          <button
            type="button"
            key={story.id}
            className={activeIndex === index ? "active" : ""}
            onClick={() => goTo(index)}
            aria-current={activeIndex === index ? "step" : undefined}
            aria-label={`${lang === "zh" ? "查看第" : "View group"} ${index + 1}${lang === "zh" ? "组" : ""}: ${t(story.title, lang)}`}
          >
            <span />
          </button>
        ))}
      </div>

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {lang === "zh" ? `当前为第 ${activeIndex + 1} 组，共 ${stories.length} 组` : `Group ${activeIndex + 1} of ${stories.length}`}
      </span>
    </div>
  );
}

function App() {
  const projectSlug = window.location.pathname.match(/^\/opportunities\/([^/]+)\/?$/)?.[1];
  const activeProject = projectSlug
    ? researchOpportunities.find((project) => project.published && project.slug === projectSlug)
    : undefined;
  const alumniSlug = window.location.pathname.match(/^\/alumni\/([^/]+)\/?$/)?.[1];
  const activeAlumnus = alumni.find((profile) => profile.slug === alumniSlug);
  const mainProjectSlug = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
  const activeMainProject = mainProjects.find((project) => project.slug === mainProjectSlug);
  const isDetailPage = Boolean(activeProject || activeAlumnus || activeMainProject);
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem("boxtech-lang") === "en" ? "en" : "zh";
    } catch {
      return "zh";
    }
  });
  const [activeSection, setActiveSection] = useState(activeMainProject ? "projects" : activeProject ? "opportunities" : activeAlumnus ? "team" : "top");
  const [menuOpen, setMenuOpen] = useState(false);
  const [particlePaused, setParticlePaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [heroOpeningComplete, setHeroOpeningComplete] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [isCompactNav, setIsCompactNav] = useState(() => window.matchMedia("(max-width: 1180px)").matches);
  const [publicationFilter, setPublicationFilter] = useState<"all" | PublicationOwner>("all");
  const publicationViewportRef = useRef<HTMLDivElement>(null);
  const [publicationScrollPercent, setPublicationScrollPercent] = useState(0);
  const [publicationCanScroll, setPublicationCanScroll] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);

  usePageObservers(setActiveSection, `${publicationFilter}:${activeProject?.slug ?? activeAlumnus?.slug ?? activeMainProject?.slug ?? "home"}`);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    try { localStorage.setItem("boxtech-lang", lang); } catch { /* storage may be unavailable */ }
  }, [lang]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectReducedMotion = () => { if (media.matches) setParticlePaused(true); };
    media.addEventListener("change", respectReducedMotion);
    return () => media.removeEventListener("change", respectReducedMotion);
  }, []);

  useEffect(() => {
    if (isDetailPage) {
      document.title = activeProject
        ? `${t(activeProject.title, lang)} · I² Lab`
        : activeAlumnus
          ? `${activeAlumnus.name[lang]} · ${lang === "zh" ? "往届研究助理" : "RA Alumni"} · I²Lab`
          : `${t(activeMainProject!.title, lang)} · I² Lab`;
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      document.title = "智能交互技术研究实验室 · Intelligent Interaction Laboratory";
    }
  }, [activeProject, activeAlumnus, activeMainProject, isDetailPage, lang]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuToggleRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1180px)");
    const syncNavigationMode = () => {
      setIsCompactNav(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    syncNavigationMode();
    media.addEventListener("change", syncNavigationMode);
    return () => media.removeEventListener("change", syncNavigationMode);
  }, []);

  // The browser can resolve a returning #anchor before React mounts the homepage.
  useEffect(() => {
    if (isDetailPage || !window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    const frame = window.requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [isDetailPage]);

  const publicationGroups = useMemo(() => {
    const order: PublicationOwner[] = publicationFilter === "all" ? ["bryan", "lijie", "haonan", "renzhi"] : [publicationFilter];
    return order.map((owner) => ({ owner, items: publications.filter((paper) => paper.owner === owner) }));
  }, [publicationFilter]);

  const syncPublicationScroll = useCallback(() => {
    const viewport = publicationViewportRef.current;
    if (!viewport) return;
    const distance = viewport.scrollHeight - viewport.clientHeight;
    setPublicationCanScroll(distance > 1);
    setPublicationScrollPercent(distance > 0 ? Math.round((viewport.scrollTop / distance) * 100) : 0);
  }, []);

  useEffect(() => {
    const viewport = publicationViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = 0;
    const observer = new ResizeObserver(syncPublicationScroll);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    const frame = window.requestAnimationFrame(syncPublicationScroll);
    return () => { observer.disconnect(); window.cancelAnimationFrame(frame); };
  }, [publicationFilter, lang, syncPublicationScroll]);

  const movePublicationScroll = (percentage: number) => {
    const viewport = publicationViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = (percentage / 100) * (viewport.scrollHeight - viewport.clientHeight);
  };

  const toggleLanguage = () => setLang((current) => (current === "zh" ? "en" : "zh"));

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuToggleRef.current?.focus({ preventScroll: true }));
    } else {
      setMenuOpen(true);
      window.requestAnimationFrame(() => firstNavLinkRef.current?.focus({ preventScroll: true }));
    }
  };

  return (
    <div className={`site-shell ${isDetailPage ? "" : "has-particle-home"}`}>
      <UnifiedParticleBackdrop lang={lang} paused={particlePaused} detail={isDetailPage} onOpeningComplete={() => setHeroOpeningComplete(true)} />
      <a
        className="skip-link"
        href="#main"
        onClick={() => window.requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }))}
      >
        {lang === "zh" ? "跳到主要内容" : "Skip to content"}
      </a>
      <header className={`topbar ${!isDetailPage && activeSection === "top" ? "is-particle-top" : ""}`}>
        <a className="brand lab-brand" href={isDetailPage ? "/" : "#top"} aria-label={lang === "zh" ? "智能交互技术研究实验室首页" : "Intelligent Interaction Laboratory home"}>
          <span className="brand-mark" aria-hidden="true"><i /><b /></span>
          <span className="brand-name">
            <strong>{!isDetailPage && activeSection === "top" ? "I²Lab" : (lang === "zh" ? "智能交互技术研究实验室" : "Intelligent Interaction Laboratory")}</strong>
            <small>{lang === "zh" ? "Intelligent Interaction Laboratory" : "智能交互技术研究实验室"}</small>
          </span>
        </a>

        <nav
          id="primary-navigation"
          className={`desktop-nav ${menuOpen ? "is-open" : ""}`}
          aria-label={lang === "zh" ? "主要导航" : "Primary navigation"}
          aria-hidden={isCompactNav && !menuOpen ? true : undefined}
          inert={isCompactNav && !menuOpen ? true : undefined}
        >
          {navItems.map((item, index) => (
            <a
              ref={index === 0 ? firstNavLinkRef : undefined}
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              href={isDetailPage ? `/#${item.id}` : `#${item.id}`}
              onClick={() => {
                setMenuOpen(false);
                if (isCompactNav) window.requestAnimationFrame(() => menuToggleRef.current?.focus({ preventScroll: true }));
              }}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {t(item.label, lang)}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={lang === "zh" ? "Switch to English" : "切换至中文"}>
            <span className={lang === "zh" ? "selected" : ""}>中</span>
            <i />
            <span className={lang === "en" ? "selected" : ""}>EN</span>
          </button>
          <button
            ref={menuToggleRef}
            className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
            type="button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen
              ? (lang === "zh" ? "关闭导航菜单" : "Close navigation menu")
              : (lang === "zh" ? "打开导航菜单" : "Open navigation menu")}
          >
            <span /><span />
          </button>
        </div>
      </header>

      {activeProject ? (
        <OpportunityDetailPage project={activeProject} lang={lang} />
      ) : activeAlumnus ? (
        <AlumniDetailPage profile={activeAlumnus} lang={lang} />
      ) : activeMainProject ? (
        <MainProjectDetailPage project={activeMainProject} lang={lang} />
      ) : (
      <main id="main" tabIndex={-1}>
        <ParticleHome lang={lang} paused={particlePaused} openingComplete={heroOpeningComplete} onTogglePause={() => setParticlePaused((current) => !current)} />

        <section className="about-section light-section" id="about">
          <div className="section-frame about-grid">
            <div className="about-aside reveal">
              <span>01</span>
              <p>{lang === "zh" ? "关于 I²Lab" : "ABOUT I²Lab"}</p>
            </div>
            <div className="about-statement reveal">
              <p className="statement-lead">
                {lang === "zh" ? (
                  <>智能交互技术研究实验室（I²Lab）关注<em>人与智能系统的关系</em>，探索我们如何更自然、更安心地与数字世界和身边的环境互动。</>
                ) : (
                  <>I²Lab is an <em>intelligent interaction research laboratory</em> exploring more natural, trustworthy connections between people, digital worlds, and physical environments.</>
                )}
              </p>
              <div className="about-body">
                <p>
                  {lang === "zh"
                    ? "我们研究扩展现实、毫米波感知和智能传感，也动手做原型、开展实验。我们希望做出的交互系统能理解周围的情境，回应人的行为，并随着需求变化而调整。"
                    : "We investigate extended reality, millimetre-wave sensing, and intelligent sensors, combining human–computer interaction research, prototype development, and experimental evaluation to explore systems that perceive context, understand behaviour, and adapt to users’ needs."}
                </p>
                <p>
                  {lang === "zh"
                    ? "我们的起点是医疗和教育中的具体问题。通过用户研究和可重复的实验，我们寻找真正有用的解决办法：让学习、康复和长期健康管理更轻松，而不是给人增加负担。"
                    : "We begin with real needs in healthcare and education, connecting academic exploration with practical applications through user studies and reproducible experiments. Our laboratory aims to improve interaction without adding burden, supporting learning, rehabilitation, and long-term health management while bringing research into everyday life."}
                </p>
              </div>
            </div>
            <div className="about-principle reveal">
              <span>{lang === "zh" ? "实验室愿景" : "OUR VISION"}</span>
              <blockquote>
                {lang === "zh"
                  ? "让实验室里的好想法走进医疗和教育现场，在人们需要的时候，提供可靠的帮助。"
                  : "To make research-led intelligent interaction reliable—anytime, anywhere, and in any context—for healthcare and education."}
              </blockquote>
            </div>
          </div>
        </section>

        <OpportunitiesOverview lang={lang} />

        <AlumniSection lang={lang} />

        <OpportunityDirectory lang={lang} />

        <MainProjectsSection lang={lang} />

        <section className="work-section light-section" id="work">
          <div className="section-frame">
            <SectionHeading
              lang={lang}
              eyebrow={{ zh: "从实验室到真实场景", en: "FROM LAB TO LIVED EXPERIENCE" }}
              title={{ zh: "让研究走近真实生活。", en: "Research creates value when it enters real life." }}
            />

            <ResearchCarousel stories={researchStories} lang={lang} />

            <div className="applications-grid">
              {applications.map((application) => (
                <article className="application-card reveal" key={application.number}>
                  <span>{application.number}</span>
                  <h3>{t(application.title, lang)}</h3>
                  <p>{t(application.text, lang)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="team-section warm-section" id="team">
          <div className="section-frame">
            <SectionHeading
              lang={lang}
              eyebrow={{ zh: "认识团队", en: "TEAM PROFILE" }}
              title={{ zh: "不同专长，在这里相遇。", en: "Across research, engineering, and translation." }}
              description={{
                zh: "我们有不同的背景：计算机科学、人机交互、智能系统和产业实践。大家带着各自的专长，一起解决真实问题。",
                en: "Different perspectives across computer science, HCI, intelligent systems, and industry converge around a shared purpose.",
              }}
            />

            <div className="advisory-header reveal">
              <span>{lang === "zh" ? "顾问委员会" : "EXTERNAL ADVISORY BOARD"}</span>
              <p>{lang === "zh" ? "为研究和实际应用提供长期支持。" : "Long-term guidance for research depth and real-world translation."}</p>
            </div>
            <div className="advisor-grid">
              {advisors.map((advisor) => (
                <article className="advisor-card reveal" key={advisor.name.en}>
                  <img src={advisor.image} alt={t(advisor.name, lang)} loading="lazy" decoding="async" />
                  <div>
                    <p className="advisor-role">{t(advisor.role, lang)}</p>
                    <h3>{t(advisor.name, lang)}</h3>
                    <small>{lang === "zh" ? advisor.name.en : advisor.name.zh}</small>
                    <p>{t(advisor.bio, lang)}</p>
                    {advisor.profileUrl && <ArrowLink href={advisor.profileUrl}>{lang === "zh" ? "诺丁汉官方主页" : "Official Nottingham profile"}</ArrowLink>}
                  </div>
                </article>
              ))}
            </div>

            <div className="team-current-header reveal">
              <span>{lang === "zh" ? "研究团队" : "RESEARCH TEAM"}</span>
              <p>{lang === "zh" ? "带着不同的专长，一起探索更好的交互方式。" : "Different strengths, one shared research practice."}</p>
            </div>
            <div className="team-grid">
              {team.map((member, index) => (
                <article className="team-card reveal" key={member.name.en}>
                  <div className="team-image-wrap">
                    <img src={member.image} alt={t(member.name, lang)} style={{ objectPosition: member.imagePosition }} loading="lazy" decoding="async" />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="team-info">
                    <div className="team-name-row">
                      <div>
                        <h3>{t(member.name, lang)}</h3>
                        <small>{lang === "zh" ? member.name.en : member.name.zh}</small>
                      </div>
                    </div>
                    <p className="team-bio">{t(member.bio, lang)}</p>
                    <div className="tag-list">{member.tags.map((tag) => <span key={tag.en}>{t(tag, lang)}</span>)}</div>
                    <div className="team-links">
                      {"personalWebsite" in member && member.personalWebsite && (
                        <ArrowLink href={member.personalWebsite}>{lang === "zh" ? "个人网站" : "Personal website"}</ArrowLink>
                      )}
                      <ArrowLink href={member.profileUrl}>{lang === "zh" ? "诺丁汉官方研究目录" : "Official Nottingham research directory"}</ArrowLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="team-current-header research-assistant-header reveal">
              <span>{lang === "zh" ? "现任研究助理" : "CURRENT RESEARCH ASSISTANTS"}</span>
              <p>{lang === "zh" ? "参与项目，让实验室的研究持续向前。" : "Making the laboratory’s research visible in digital space."}</p>
            </div>
            <div className="research-assistant-list">
              {currentResearchAssistants.map((assistant, index) => (
                <article className="research-assistant-card reveal" key={assistant.name.en}>
                  <div className="research-assistant-portrait">
                    <img src={assistant.image} alt={t(assistant.name, lang)} loading="lazy" decoding="async" />
                    <span>{`RA / ${String(index + 1).padStart(2, "0")}`}</span>
                  </div>
                  <div className="research-assistant-info">
                    <p className="research-assistant-since">{t(assistant.start, lang)}</p>
                    <h3>{t(assistant.name, lang)}</h3>
                    <small>{lang === "zh" ? assistant.name.en : assistant.name.zh}</small>
                    <p className="research-assistant-bio">{t(assistant.bio, lang)}</p>
                    <div className="tag-list">{assistant.tags.map((tag) => <span key={tag.en}>{t(tag, lang)}</span>)}</div>
                    <ArrowLink href={assistant.personalWebsite}>{lang === "zh" ? "个人网站" : "Personal website"}</ArrowLink>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="publications-section light-section" id="publications">
          <div className="section-frame publications-frame">
            <div className="publications-heading-row">
              <SectionHeading
                lang={lang}
                eyebrow={{ zh: "精选论文", en: "SELECTED PUBLICATIONS" }}
                title={{ zh: "每一项研究，都有迹可循。", en: "Evidence for every step toward impact." }}
                description={{
                  zh: "这些论文按上方团队成员的出场顺序整理，今后还会继续更新。",
                  en: "Research is grouped in the same order as the team above, with room for the collection to keep growing.",
                }}
              />
              <div className="publication-filter reveal" role="group" aria-label={lang === "zh" ? "筛选论文" : "Filter publications"} aria-controls="publication-results">
                {(["all", "bryan", "lijie", "haonan", "renzhi"] as const).map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={publicationFilter === filter ? "active" : ""}
                    onClick={() => setPublicationFilter(filter)}
                    aria-pressed={publicationFilter === filter}
                  >
                    {filter === "all" ? (lang === "zh" ? "全部" : "All") : filter === "bryan" ? (lang === "zh" ? "李汶锦" : "Boon Giin Lee") : filter === "lijie" ? (lang === "zh" ? "郑力杰" : "Lijie") : filter === "haonan" ? (lang === "zh" ? "姚淏楠" : "Haonan") : (lang === "zh" ? "韩仁智" : "Renzhi")}
                  </button>
                ))}
              </div>
            </div>

            <div className="publication-scroll-shell">
              <div className="publication-groups" id="publication-results" ref={publicationViewportRef} onScroll={syncPublicationScroll} role="region" tabIndex={0} aria-label={lang === "zh" ? "可滚动的论文列表" : "Scrollable publication list"}>
              <div className="publication-groups-inner">
              <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {lang === "zh" ? `当前显示 ${publicationGroups.reduce((total, group) => total + group.items.length, 0)} 篇论文` : `Showing ${publicationGroups.reduce((total, group) => total + group.items.length, 0)} publications`}
              </span>
              {publicationGroups.map((group) => (
                <div className="publication-group" key={group.owner}>
                  <div className="publication-owner"><span>{t(ownerNames[group.owner], lang)}</span><i /></div>
                  <div className="publication-list">
                    {group.items.map((paper, index) => (
                      <article className="publication-item" key={paper.title}>
                        <div className="paper-index">{String(index + 1).padStart(2, "0")}</div>
                        <div className="paper-year"><strong>{paper.year}</strong><span>{t(paper.type, lang)}</span></div>
                        <div className="paper-main">
                          <h3 lang="en">
                            {paper.pdf ? <a className="paper-title-link" href={paper.pdf} target="_blank" rel="noopener noreferrer" aria-label={`${paper.title} · ${lang === "zh" ? "打开论文 PDF（新标签页）" : "open paper PDF in a new tab"}`}>{paper.title}<span aria-hidden="true">↗</span></a> : paper.title}
                          </h3>
                          <p lang="en">{paper.authors}</p>
                          <div className="paper-meta"><span lang="en">{paper.venue}</span>{paper.badge && <b lang="en">{paper.badge}</b>}</div>
                        </div>
                        <div className="paper-action">
                          <div className="paper-resource-links">
                            {paper.pdf ? (
                              <a className="paper-pdf-link" href={paper.pdf} target="_blank" rel="noopener noreferrer" aria-label={`PDF: ${paper.title} · ${lang === "zh" ? "在新标签页打开" : "opens in a new tab"}`}>
                                PDF <span aria-hidden="true">↗</span>
                              </a>
                            ) : (
                              <span className="link-pending"><b>PDF</b><small>{lang === "zh" ? "待补充" : "Pending"}</small></span>
                            )}
                            {paper.url && (
                              <a href={paper.url} target="_blank" rel="noopener noreferrer" aria-label={`DOI: ${paper.title} · ${lang === "zh" ? "在新标签页打开" : "opens in a new tab"}`}>
                                DOI <span aria-hidden="true">↗</span>
                              </a>
                            )}
                            {paper.resources?.map((resource) => (
                              <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`${resource.label}: ${paper.title} · ${lang === "zh" ? "在新标签页打开" : "opens in a new tab"}`}>{resource.label} <span aria-hidden="true">↗</span></a>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
              </div>
              </div>
              <div className="publication-scroll-control">
                <span aria-hidden="true">01</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={publicationScrollPercent}
                  onChange={(event) => movePublicationScroll(Number(event.target.value))}
                  disabled={!publicationCanScroll}
                  aria-controls="publication-results"
                  aria-label={lang === "zh" ? "拖动浏览论文列表" : "Drag to browse publications"}
                  aria-valuetext={lang === "zh" ? `已浏览 ${publicationScrollPercent}%` : `${publicationScrollPercent}% through the list`}
                />
                <span aria-hidden="true">{String(publicationGroups.reduce((total, group) => total + group.items.length, 0)).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-grid" aria-hidden="true" />
          <div className="closing-copy reveal">
            <span>{lang === "zh" ? "I²Lab · 宁波" : "I² LAB · NINGBO"}</span>
            <h2>{lang === "zh" ? <>下一代交互，<br />从真实问题开始。</> : <>The next interaction<br />starts with a real need.</>}</h2>
            <p>{lang === "zh" ? "与产业、学术和医疗伙伴一起，把新的交互方式带进真实生活。" : "Building the future of interaction with partners across industry, academia, and healthcare."}</p>
            <div>
              <a className="primary-button light-button" href="#team"><span>{lang === "zh" ? "认识团队" : "Meet the team"}</span><span aria-hidden="true">↑</span></a>
              <a className="text-button light-text-button" href="#publications">{lang === "zh" ? "浏览研究成果" : "Explore the research"}<span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="closing-mark reveal" aria-hidden="true"><span>I</span><sup>2</sup></div>
        </section>
      </main>
      )}

      <footer>
        <a className="brand footer-brand" href={isDetailPage ? "/" : "#top"}>
          <span className="brand-mark" aria-hidden="true"><i /><b /></span>
          <span className="brand-name"><strong>{lang === "zh" ? "纸合科技" : "BOXTECH"}</strong><small>{lang === "zh" ? "宁波纸合科技有限公司" : "NINGBO BOXTECH TECHNOLOGY CO., LTD."}</small></span>
        </a>
        <div className="footer-meta">
          <p>{lang === "zh" ? "中国 · 宁波" : "Ningbo · China"}</p>
          <p>{lang === "zh" ? "让研究走向真实世界。" : "Turning Research into Revolution."}</p>
        </div>
        <div className="footer-credits">
          <p className="producer-credit">
            <span>{lang === "zh" ? "网站设计与制作" : "DESIGN & CREATED BY"}</span>
            <a href="https://bingxuhou.com" target="_blank" rel="noopener noreferrer"><strong>Bingxu HOU</strong></a>
          </p>
          <p className="copyright">{lang === "zh" ? "© 2026 宁波纸合科技有限公司" : "© 2026 Ningbo Boxtech Technology Co., Ltd."}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
