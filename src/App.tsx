import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

type Lang = "zh" | "en";
type Localized = { zh: string; en: string };
type PublicationOwner = "lijie" | "haonan" | "renzhi";

const t = (value: Localized, lang: Lang) => value[lang];

const navItems: Array<{ id: string; label: Localized }> = [
  { id: "about", label: { zh: "关于", en: "About" } },
  { id: "technology", label: { zh: "技术", en: "Technology" } },
  { id: "work", label: { zh: "实践", en: "Work" } },
  { id: "team", label: { zh: "团队", en: "Team" } },
  { id: "publications", label: { zh: "论文", en: "Publications" } },
];

const technologies = [
  {
    index: "01",
    code: "XR",
    name: { zh: "扩展现实", en: "Extended Reality" },
    description: {
      zh: "以沉浸式与空间化交互，把抽象知识转化为可操作、可复现的临床训练与学习体验。",
      en: "Immersive and spatial interaction turns abstract knowledge into practical, repeatable clinical training and learning experiences.",
    },
    signal: "spatial / immersive",
  },
  {
    index: "02",
    code: "mmW",
    name: { zh: "毫米波雷达", en: "Millimetre-wave Radar" },
    description: {
      zh: "在自然活动中进行非接触式动作感知，为居家康复、术后随访与长期健康管理提供客观依据。",
      en: "Contactless motion sensing captures natural activity, supporting objective home rehabilitation, follow-up care, and long-term health management.",
    },
    signal: "contactless / precise",
  },
  {
    index: "03",
    code: "S²",
    name: { zh: "智能传感", en: "Smart Sensors" },
    description: {
      zh: "融合多模态数据、智能反馈与个性化适配，持续理解过程、评估表现并优化体验。",
      en: "Multimodal data, intelligent feedback, and personalisation continuously interpret progress, assess performance, and improve experiences.",
    },
    signal: "multimodal / adaptive",
  },
];

const applications = [
  {
    number: "A.01",
    title: { zh: "康复与长期健康管理", en: "Rehabilitation & Long-term Health" },
    text: {
      zh: "在不增加用户负担的前提下捕捉动作质量与训练完成度，以直观反馈支持及时纠正和更早的风险识别。",
      en: "Capture movement quality and training completion without adding burden, enabling timely correction and earlier risk recognition.",
    },
  },
  {
    number: "A.02",
    title: { zh: "医学教育与技能训练", en: "Medical Education & Skills Training" },
    text: {
      zh: "用空间交互构建可操作、可重复的教学环境，降低复杂知识的理解门槛并提升训练效率。",
      en: "Spatial interaction creates actionable, repeatable learning environments that make complex knowledge clearer and training more efficient.",
    },
  },
  {
    number: "A.03",
    title: { zh: "无障碍与包容性交互", en: "Accessible & Inclusive Interaction" },
    text: {
      zh: "将前沿技术转化为可用、可及、可持续的真实场景方案，让更多人获得平等而有尊严的交互支持。",
      en: "Translate frontier technology into usable, accessible, and sustainable systems that support more equitable, dignified experiences.",
    },
  },
];

type ResearchFigure = {
  image: string;
  alt: Localized;
  label: string;
  title: Localized;
  pdf: string;
  source: string;
  fit?: "cover" | "contain";
  objectPosition?: string;
};

type ResearchStory = {
  id: string;
  tag: string;
  title: Localized;
  note: Localized;
  figures: [ResearchFigure, ResearchFigure];
};

const researchStories: ResearchStory[] = [
  {
    id: "rehabilitation-in-practice",
    tag: "ADAPTIVE REHAB / 01",
    title: { zh: "让训练强度跟随人的状态变化。", en: "Let training intensity move with the person." },
    note: {
      zh: "自适应并不是简单地变难或变容易，而是在挑战、信心与持续参与之间寻找动态平衡。",
      en: "Adaptation is not simply making a task harder or easier. It is a moving balance between challenge, confidence, and sustained participation.",
    },
    figures: [
      {
        image: "/images/research/xr-prototype-session.jpg",
        alt: { zh: "研究人员体验扩展现实康复原型", en: "Researcher experiencing an extended reality rehabilitation prototype" },
        label: "PROTOTYPE / 01A",
        title: { zh: "空间交互原型测试", en: "Spatial interaction prototyping" },
        pdf: "/papers/emotional-responses-adaptive-ivr-exergaming.pdf",
        source: "IEEE COMPSAC 2024",
        objectPosition: "50% 50%",
      },
      {
        image: "/images/research/xr-rehabilitation-exergame.jpg",
        alt: { zh: "虚拟现实康复训练游戏画面", en: "Virtual reality rehabilitation exergame scene" },
        label: "EXPERIMENT / 01B",
        title: { zh: "游戏化康复与动态反馈", en: "Gamified rehabilitation & adaptive feedback" },
        pdf: "/papers/emotional-responses-adaptive-ivr-exergaming.pdf",
        source: "IEEE COMPSAC 2024",
        objectPosition: "55% 50%",
      },
    ],
  },
  {
    id: "collaborative-immersion",
    tag: "SOCIAL PRESENCE / 02",
    title: { zh: "共同进入，也共同在场。", en: "Enter together. Feel present together." },
    note: {
      zh: "当人们共同进入沉浸式世界，界面不再只是一块屏幕，而会成为承载合作、熟悉感与社会临场感的空间。",
      en: "When people enter an immersive world together, the interface becomes a social space—carrying collaboration, familiarity, and presence beyond the screen.",
    },
    figures: [
      {
        image: "/images/research/collaborative-gameplay-conditions.png",
        alt: { zh: "协作式沉浸游戏的多种任务与场景条件", en: "Multiple tasks and scene conditions in a collaborative immersive game" },
        label: "GAMEPLAY / 02A",
        title: { zh: "协作游戏的实验条件", en: "Collaborative gameplay conditions" },
        pdf: "/papers/differential-effects-vr-ar-collaborative-gaming.pdf",
        source: "IEEE VR 2026",
        fit: "contain",
      },
      {
        image: "/images/research/collaborative-study-protocol.png",
        alt: { zh: "虚拟与增强现实协作游戏实验流程", en: "Study protocol for collaborative gaming in virtual and augmented reality" },
        label: "PROTOCOL / 02B",
        title: { zh: "从游戏阶段到参与者体验", en: "From gameplay phases to participant experience" },
        pdf: "/papers/differential-effects-vr-ar-collaborative-gaming.pdf",
        source: "IEEE VR 2026",
        fit: "contain",
      },
    ],
  },
  {
    id: "embodied-data",
    tag: "EMBODIED DATA / 03",
    title: { zh: "让双手成为数据的接口。", en: "Let the hands become the interface to data." },
    note: {
      zh: "当抽象数据获得尺度、方向与触感，理解不再只发生在屏幕上，而发生在身体与空间的协同之中。",
      en: "When abstract data gains scale, direction, and tactility, understanding moves beyond the screen and into the coordination of body and space.",
    },
    figures: [
      {
        image: "/images/research/embodied-two-handed-interactions.png",
        alt: { zh: "沉浸式数据探索中的双手交互条件", en: "Two-handed interaction conditions for immersive data exploration" },
        label: "INTERACTION / 03A",
        title: { zh: "具身双手交互设计空间", en: "Embodied two-handed interaction design space" },
        pdf: "/papers/embodied-two-handed-immersive-data-exploration.pdf",
        source: "ACM CHI 2024 EA",
        fit: "contain",
      },
      {
        image: "/images/research/tangible-data-cubes.png",
        alt: { zh: "混合现实中的可触数据立方体交互示意", en: "Tangible data-cube interactions in mixed reality" },
        label: "TANGIBLE / 03B",
        title: { zh: "手中的时空数据立方体", en: "Spatio-temporal data cubes in hand" },
        pdf: "/papers/data-cubes-in-hand-mixed-reality.pdf",
        source: "ACM CHI 2024",
        fit: "contain",
      },
    ],
  },
  {
    id: "gamified-collaboration",
    tag: "GAMIFIED COLLABORATION / 04",
    title: { zh: "把关系写进游戏机制。", en: "Write relationships into the game mechanics." },
    note: {
      zh: "参与者是否熟悉彼此，会改变他们对竞争、合作与奖励的偏好；设计需要把这种社会关系纳入证据链。",
      en: "Whether participants know one another changes how they respond to competition, cooperation, and reward. Design must bring those social relationships into the evidence loop.",
    },
    figures: [
      {
        image: "/images/research/gamification-preference-concept.png",
        alt: { zh: "人际关系如何影响沉浸式游戏化偏好的概念图", en: "Concept illustration of how interpersonal relationships shape immersive gamification preferences" },
        label: "CO-LEARNING / 04A",
        title: { zh: "关系如何塑造游戏化偏好", en: "How relationships shape gamification preferences" },
        pdf: "/papers/interpersonal-relationships-gamification-ivr.pdf",
        source: "IEEE VR 2025",
        fit: "contain",
      },
      {
        image: "/images/research/gamification-collaboration-study.png",
        alt: { zh: "协作式沉浸游戏的前测、三项任务与后测流程", en: "Pre-study, three-task, and post-study flow for collaborative immersive gaming" },
        label: "EVIDENCE LOOP / 04B",
        title: { zh: "从设计走向可复现证据", en: "From game design to reproducible evidence" },
        pdf: "/papers/interpersonal-relationships-gamification-ivr.pdf",
        source: "IEEE VR 2025",
        fit: "contain",
      },
    ],
  },
  {
    id: "social-intelligence",
    tag: "SOCIAL INTELLIGENCE / 05",
    title: { zh: "以差异促成共同理解。", en: "Let differences lead to shared understanding." },
    note: {
      zh: "非对称信息可以推动合作，虚拟同伴可以提供支持；社会智能来自对人与人之间差异、关系与需要的持续理解。",
      en: "Asymmetric information can prompt collaboration, while virtual peers can provide support. Social intelligence begins with understanding differences, relationships, and needs.",
    },
    figures: [
      {
        image: "/images/research/context-dependent-collaboration-scenes.png",
        alt: { zh: "数据、位置与视角三类非对称协作谜题", en: "Data-, position-, and perspective-based asymmetric collaboration puzzles" },
        label: "ASYMMETRY / 05A",
        title: { zh: "以差异驱动协作与共同理解", en: "Using asymmetry to drive collaboration" },
        pdf: "/papers/context-dependent-social-engagement-immersive-learning.pdf",
        source: "CHBR 2026",
        fit: "contain",
      },
      {
        image: "/images/research/virtual-peer-mentor-framework.png",
        alt: { zh: "虚拟同伴导师提供信息、动作与情感支持的框架", en: "Virtual peer mentor framework for informational, instrumental, and emotional support" },
        label: "PEER SUPPORT / 05B",
        title: { zh: "把同伴支持嵌入康复训练", en: "Embedding peer support into rehabilitation" },
        pdf: "/papers/virtual-peer-mentor-vr-rehabilitation.pdf",
        source: "IEEE TVCG 2026",
        fit: "contain",
      },
    ],
  },
  {
    id: "spatial-visualisation",
    tag: "SPATIAL VISUALISATION / 06",
    title: { zh: "让时间、人物与数据在空间相遇。", en: "Let time, people, and data meet in space." },
    note: {
      zh: "空间可视化把复杂信息变得可探索：一端是跨越时间的人物轨迹，另一端是从系统综述中提炼出的交互设计秩序。",
      en: "Spatial visualisation makes complex information explorable—from character trajectories across time to interaction patterns distilled through systematic review.",
    },
    figures: [
      {
        image: "/images/research/3dstoryline-trajectories.png",
        alt: { zh: "沉浸式故事线可视化的总览与细节视图", en: "Overview and detail views in immersive storyline visualization" },
        label: "STORYLINE / 06A",
        title: { zh: "在三维空间中阅读故事轨迹", en: "Reading story trajectories in three dimensions" },
        pdf: "/papers/3dstoryline-immersive-visual-storytelling.pdf",
        source: "Journal of Visualization 2025",
        fit: "contain",
      },
      {
        image: "/images/research/visualization-widget-taxonomy.png",
        alt: { zh: "实物数据探索任务、交互与可视化组件的分类图", en: "Taxonomy of tasks, interactions, and visualization widgets for tangible data exploration" },
        label: "DESIGN SPACE / 06B",
        title: { zh: "从研究证据中提炼交互秩序", en: "Distilling interaction patterns from evidence" },
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
    role: { zh: "创始人兼首席执行官", en: "Founder & Chief Executive Officer" },
    image: "/images/team/lijie-zheng.jpg",
    imagePosition: "50% 42%",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: ["XR", "Smart Healthcare", "EdTech"],
    bio: {
      zh: "宁波诺丁汉大学计算机与运筹学博士在读。本科专业为计算机科学与人工智能，2025 年以一等学位毕业后直升博士项目。研究聚焦扩展现实、智慧医疗与教育科技，成果发表于 IEEE VR、UIST 与 Computers in Human Behavior Reports。",
      en: "A PhD candidate in Computer Science and Operations Research at the University of Nottingham Ningbo China. After graduating with First-Class Honours in Computer Science with Artificial Intelligence in 2025, he progressed directly into doctoral study. His XR, smart healthcare, and EdTech research has appeared at IEEE VR, UIST, and Computers in Human Behavior Reports.",
    },
  },
  {
    name: { zh: "姚淏楠", en: "Haonan Yao" },
    role: { zh: "首席技术官", en: "Chief Technology Officer" },
    image: "/images/team/haonan-yao.jpg",
    imagePosition: "50% 42%",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: ["Tangible Interaction", "AI for Accessibility", "Digital Art"],
    bio: {
      zh: "宁波诺丁汉大学计算机科学博士在读、XR 独立开发者与数字艺术家。具备从概念设计、科研原型到迭代落地的完整能力，长期研究扩展现实、实物交互与面向无障碍的人工智能。",
      en: "A Computer Science PhD candidate at the University of Nottingham Ningbo China, independent XR developer, and digital artist. His end-to-end practice spans concept design, research prototypes, and iterative delivery, with a long-term focus on XR, tangible interaction, and AI for accessibility.",
    },
  },
  {
    name: { zh: "张小蕾", en: "Xiaolei Zhang" },
    role: { zh: "首席运营官", en: "Chief Operating Officer" },
    image: "/images/team/xiaolei-zhang.png",
    imagePosition: "50% 38%",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: ["AIoT", "Biomedical Systems", "Systems Design"],
    bio: {
      zh: "宁波诺丁汉大学计算机科学博士在读，拥有新加坡国立大学计算机工程硕士学位与加拿大阿尔伯塔大学学士学位。曾任博世 ADAS 泊车系统工程师，研究聚焦 AI 赋能的物联网、智能生物医学应用与健康福祉系统设计。",
      en: "A Computer Science PhD candidate at the University of Nottingham Ningbo China, with an M.Eng. from the National University of Singapore and a bachelor’s degree from the University of Alberta. A former BOSCH ADAS parking systems engineer, she researches AI-enabled IoT, intelligent biomedical applications, and systems for healthcare and wellbeing.",
    },
  },
  {
    name: { zh: "韩仁智", en: "Renzhi Han" },
    image: "/images/team/renzhi-han.jpg",
    imagePosition: "50% 25%",
    profileUrl: "https://www.nottingham.edu.cn/en/science-engineering/departments-schools/cs/research/aiop/aiop-people.aspx",
    tags: ["XR Rehabilitation", "Gamification", "Unity"],
    bio: {
      zh: "宁波诺丁汉大学计算机科学博士在读、XR 康复严肃游戏研发者。研究沉浸式虚拟现实智能康复，关注以游戏化、虚拟角色与交互设计提升康复体验，并持续与宁波医疗机构合作推动临床验证与应用转化。",
      en: "A Computer Science PhD candidate at the University of Nottingham Ningbo China and developer of XR rehabilitation serious games. His work explores immersive intelligent rehabilitation through gamification, virtual characters, and interaction design, alongside long-term clinical collaboration with healthcare institutions in Ningbo.",
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
      zh: "人机交互与人本智能感知学者，传感器、传感器网络与仪器技术研究组负责人，IEEE 资深会员，长期推动 XR 与智能交互在医疗和康复领域的研究转化。",
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
      zh: "在供应链管理与冷链物流领域拥有多年企业经营及项目落地经验，专长覆盖仓配网络、冷链运营、合作伙伴拓展以及成本与风险管理。",
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
  lijie: { zh: "郑力杰 · 精选研究", en: "Lijie Zheng · Selected research" },
  haonan: { zh: "姚淏楠 · 精选研究", en: "Haonan Yao · Selected research" },
  renzhi: { zh: "韩仁智 · 精选研究", en: "Renzhi Han · Selected research" },
};

function usePageObservers(setActiveSection: (id: string) => void, refreshKey: string) {
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.15, 0.5] },
    );

    document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
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
          <span className="research-frame-code">{figure.label}</span>
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
          aria-label={`${lang === "zh" ? "PDF 出处" : "PDF source"}: ${t(figure.title, lang)} · ${openLabel}`}
        >
          {lang === "zh" ? "PDF 出处" : "PDF source"}<i aria-hidden="true">↗</i>
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
          <span>I² / RESEARCH ATLAS</span>
          <p>{lang === "zh" ? "12 份视觉记录 · 6 组研究线索 · 每张图片直达来源 PDF" : "12 visual records · 6 research pairings · every image opens its source PDF"}</p>
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
                <span>{story.tag}</span>
                <strong>{t(story.title, lang)}</strong>
                <p>{t(story.note, lang)}</p>
                <small>RESEARCH · PROTOTYPE · TRANSLATION</small>
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

function IntroSequence({ onComplete, lang }: { onComplete: () => void; lang: Lang }) {
  const [leaving, setLeaving] = useState(false);
  const [scene, setScene] = useState(0);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [reducedMotion] = useState(() => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  });
  const finishedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setLeaving(true);
    exitTimerRef.current = window.setTimeout(onComplete, reducedMotion ? 280 : 720);
  }, [onComplete, reducedMotion]);

  useEffect(() => {
    const timers: number[] = [];
    if (reducedMotion) {
      setScene(3);
      timers.push(window.setTimeout(finish, 1250));
    } else {
      timers.push(window.setTimeout(() => setScene(1), 1880));
      timers.push(window.setTimeout(() => setScene(2), 4050));
      timers.push(window.setTimeout(() => setScene(3), 6050));
      timers.push(window.setTimeout(finish, 7750));
    }
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    };
  }, [finish, reducedMotion]);

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });

    const handleDialogKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      } else if (event.key === "Tab") {
        event.preventDefault();
        skipButtonRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleDialogKeydown);
    return () => {
      document.removeEventListener("keydown", handleDialogKeydown);
    };
  }, [finish]);

  return (
    <div
      ref={dialogRef}
      className={`intro-sequence scene-${scene} ${mediaReady ? "media-ready" : ""} ${mediaFailed ? "media-failed" : ""} ${reducedMotion ? "reduced" : ""} ${leaving ? "is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={lang === "zh" ? "纸合科技开场影片" : "Boxtech opening film"}
      tabIndex={-1}
    >
      <div className="intro-media" aria-hidden="true">
        {!reducedMotion && (
          <video
            className="intro-film"
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/media/intro-spatial.jpg"
            onLoadedData={() => setMediaReady(true)}
            onEnded={finish}
            onError={() => setMediaFailed(true)}
          >
            <source src="/media/boxtech-intro.mp4" type="video/mp4" />
          </video>
        )}
        <div className="intro-fallback">
          <i style={{ backgroundImage: "url('/media/intro-spatial.jpg')" }} />
          <i style={{ backgroundImage: "url('/media/intro-radar.jpg')" }} />
          <i style={{ backgroundImage: "url('/media/intro-xr.jpg')" }} />
        </div>
        <div className="intro-grade" />
        <div className="intro-grain" />
        <div className="intro-grid" />
        <div className="intro-scanline" />
      </div>

      <div className="intro-topline">
        <div className="intro-mini-brand">
          <span className="brand-mark" aria-hidden="true"><i /><b /></span>
          <span><strong>BOXTECH</strong><small>NINGBO / CHINA</small></span>
        </div>
        <p>RESEARCH FILM <span>·</span> 00:07 <span>·</span> I² / 2026</p>
      </div>

      <div className="intro-chapters" aria-hidden="true">
        <span><b>01</b><i />SPATIAL</span>
        <span><b>02</b><i />SENSING</span>
        <span><b>03</b><i />INTERACTION</span>
      </div>

      <div className="intro-narrative" aria-hidden="true">
        <div className="intro-copy-frame intro-copy-0"><span>EXTENDED REALITY</span><strong>Sense the<br />invisible.</strong></div>
        <div className="intro-copy-frame intro-copy-1"><span>mmWAVE RADAR</span><strong>Read motion<br />without contact.</strong></div>
        <div className="intro-copy-frame intro-copy-2"><span>HUMAN–SYSTEM LOOP</span><strong>Turn interaction<br />into evidence.</strong></div>
      </div>

      <div className="intro-sensor-lock" aria-hidden="true"><i /><i /><span>HCI</span></div>

      <div className="intro-final-brand" aria-hidden="true">
        <span className="brand-mark intro-brand-mark"><i /><b /></span>
        <div><strong>BOXTECH</strong><small>纸合科技 · TURNING RESEARCH INTO REVOLUTION</small></div>
      </div>

      <div className="intro-progress"><i /><span>XR&nbsp;&nbsp;/&nbsp;&nbsp;mmWAVE&nbsp;&nbsp;/&nbsp;&nbsp;SMART SENSING</span></div>
      <button ref={skipButtonRef} type="button" className="intro-skip" onClick={finish}>{lang === "zh" ? "跳过影片" : "SKIP FILM"}<span aria-hidden="true">↗</span></button>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem("boxtech-lang") === "en" ? "en" : "zh";
    } catch {
      return "zh";
    }
  });
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompactNav, setIsCompactNav] = useState(() => window.matchMedia("(max-width: 1180px)").matches);
  const [publicationFilter, setPublicationFilter] = useState<"all" | PublicationOwner>("all");
  const [introVisible, setIntroVisible] = useState(() => {
    try {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && sessionStorage.getItem("boxtech-intro-seen") !== "true";
    } catch {
      return true;
    }
  });
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);
  const introReplayTriggerRef = useRef<HTMLButtonElement | null>(null);

  usePageObservers(setActiveSection, publicationFilter);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    try { localStorage.setItem("boxtech-lang", lang); } catch { /* storage may be unavailable */ }
  }, [lang]);

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

  useEffect(() => {
    document.body.style.overflow = introVisible ? "hidden" : "";
    const backgroundElements = document.querySelectorAll<HTMLElement>(".site-shell > :not(.intro-sequence)");
    backgroundElements.forEach((element) => element.toggleAttribute("inert", introVisible));
    return () => {
      document.body.style.overflow = "";
      backgroundElements.forEach((element) => element.removeAttribute("inert"));
    };
  }, [introVisible]);

  useEffect(() => {
    if (introVisible || !introReplayTriggerRef.current) return;
    const replayTrigger = introReplayTriggerRef.current;
    introReplayTriggerRef.current = null;
    const focusTimer = window.setTimeout(() => replayTrigger.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(focusTimer);
  }, [introVisible]);

  const completeIntro = useCallback(() => {
    try { sessionStorage.setItem("boxtech-intro-seen", "true"); } catch { /* session storage may be unavailable */ }
    setIntroVisible(false);
  }, []);

  const publicationGroups = useMemo(() => {
    const order: PublicationOwner[] = publicationFilter === "all" ? ["lijie", "haonan", "renzhi"] : [publicationFilter];
    return order.map((owner) => ({ owner, items: publications.filter((paper) => paper.owner === owner) }));
  }, [publicationFilter]);

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
    <div className="site-shell">
      {introVisible && <IntroSequence onComplete={completeIntro} lang={lang} />}
      <a
        className="skip-link"
        href="#main"
        onClick={() => window.requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }))}
      >
        {lang === "zh" ? "跳到主要内容" : "Skip to content"}
      </a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label={lang === "zh" ? "纸合科技首页" : "Boxtech home"}>
          <span className="brand-mark" aria-hidden="true"><i /><b /></span>
          <span className="brand-name">
            <strong>{lang === "zh" ? "纸合科技" : "BOXTECH"}</strong>
            <small>{lang === "zh" ? "BOXTECH TECHNOLOGY" : "宁波纸合科技"}</small>
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
              href={`#${item.id}`}
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
          <button
            className="intro-replay"
            type="button"
            onClick={(event) => {
              introReplayTriggerRef.current = event.currentTarget;
              setIntroVisible(true);
            }}
            aria-label={lang === "zh" ? "重播开场影片" : "Replay opening film"}
          >
            <span aria-hidden="true">◎</span>{lang === "zh" ? "重播" : "REPLAY"}
          </button>
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

      <main id="main" tabIndex={-1}>
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-glow hero-glow-one" aria-hidden="true" />
          <div className="hero-glow hero-glow-two" aria-hidden="true" />
          <div className="hero-copy">
            <div className="hero-kicker reveal is-visible">
              <span className="status-dot" />
              {lang === "zh" ? "智能交互技术研究实验室 · 宁波" : "INTELLIGENT INTERACTION LABORATORY"}
            </div>
            <h1 className="reveal is-visible">
              {lang === "zh" ? (
                <>让交互技术，<br /><em>从可用走向可信</em></>
              ) : (
                <>Interaction,<br /><em>made trustworthy.</em></>
              )}
            </h1>
            <p className="hero-lead reveal is-visible">
              {lang === "zh"
                ? "智能交互技术研究实验室融合扩展现实、毫米波雷达与智能传感，研究可感知、可验证、可持续演进的人机交互系统，并在医疗与教育场景中验证其价值。"
                : "The Intelligent Interaction Laboratory combines Extended Reality, millimetre-wave radar, and intelligent sensing to build perceptive, verifiable, and adaptive human–computer systems for healthcare and education."}
            </p>
            <div className="hero-cta reveal is-visible">
              <a className="primary-button" href="#technology">
                <span>{lang === "zh" ? "探索研究方向" : "Explore our research"}</span><span aria-hidden="true">↓</span>
              </a>
              <a className="text-button" href="#publications">
                {lang === "zh" ? "阅读精选论文" : "Read selected research"}<span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="signal-stage reveal is-visible" aria-label={lang === "zh" ? "核心技术示意" : "Core technology diagram"}>
            <div className="stage-index">I² / 03</div>
            <div className="orbit orbit-outer"><span className="node node-xr">XR</span></div>
            <div className="orbit orbit-middle"><span className="node node-wave">mmW</span></div>
            <div className="orbit orbit-inner"><span className="node node-sense">S²</span></div>
            <div className="stage-core"><span>HCI</span><small>human / system</small></div>
            <div className="stage-scan" />
            <div className="stage-caption">
              <span>{lang === "zh" ? "智能交互技术研究实验室" : "INTELLIGENT INTERACTION LABORATORY"}</span>
              <span>Spatial · Sensing · Adaptive</span>
            </div>
          </div>

          <div className="hero-metrics reveal is-visible">
            <div><strong>I²</strong><span>{lang === "zh" ? "智能交互实验室" : "Intelligent Interaction Lab"}</span></div>
            <div><strong>03</strong><span>{lang === "zh" ? "核心研究方向" : "Research directions"}</span></div>
            <div><strong>02</strong><span>{lang === "zh" ? "重点验证场景" : "Validation domains"}</span></div>
            <p>Research · Prototype · Translation.</p>
          </div>
        </section>

        <section className="about-section light-section" id="about">
          <div className="section-frame about-grid">
            <div className="about-aside reveal">
              <span>01</span>
              <p>{lang === "zh" ? "关于纸合" : "ABOUT BOXTECH"}</p>
            </div>
            <div className="about-statement reveal">
              <p className="statement-lead">
                {lang === "zh" ? (
                  <>纸合科技是一家承接智能交互技术研究实验室科研成果、推动其进入真实场景的<em>研究转化型科技公司</em>。</>
                ) : (
                  <>Boxtech is a <em>research-driven technology company</em> translating work from the Intelligent Interaction Laboratory into real-world practice.</>
                )}
              </p>
              <div className="about-body">
                <p>
                  {lang === "zh"
                    ? "公司成立于 2023 年 3 月，围绕空间交互、毫米波感知与智能传感，打通从学术研究、原型验证到系统部署的路径，为医疗与教育提供新一代数字化解决方案。"
                    : "Founded in March 2023, Boxtech takes work in spatial interaction, millimetre-wave sensing, and intelligent sensing from research and prototype validation through to deployment in healthcare and education."}
                </p>
                <p>
                  {lang === "zh"
                    ? "我们从真实世界的复杂需求出发，将经过实验室验证的技术嵌入日常环境，在不增加额外负担的前提下优化体验、支持行为，并支持合作伙伴开展更早的风险识别与更有效的干预决策。"
                    : "We begin with complex real-world needs, embedding laboratory-validated technologies into everyday environments to improve experiences and support behaviour without added burden—supporting earlier risk detection and more effective intervention decisions."}
                </p>
              </div>
            </div>
            <div className="about-principle reveal">
              <span>{lang === "zh" ? "共同愿景" : "SHARED VISION"}</span>
              <blockquote>
                {lang === "zh"
                  ? "让源于实验室的高质量人机交互能力，在任何时间、任何地点、任何环境中，稳定服务于医疗与教育实践。"
                  : "To make research-led intelligent interaction reliable—anytime, anywhere, and in any context—for healthcare and education."}
              </blockquote>
            </div>
          </div>
        </section>

        <section className="technology-section dark-section" id="technology">
          <div className="section-frame">
            <SectionHeading
              lang={lang}
              eyebrow={{ zh: "核心技术", en: "CORE TECHNOLOGY" }}
              title={{ zh: "感知空间，理解行为，持续适配。", en: "Sense space. Understand behaviour. Adapt continuously." }}
              description={{
                zh: "三条技术路径彼此协同，构建从感知、理解到反馈的完整交互闭环。",
                en: "Three complementary technology tracks form a complete loop from sensing and interpretation to meaningful feedback.",
              }}
            />
            <div className="technology-list">
              {technologies.map((tech) => (
                <article className="technology-card reveal" key={tech.index}>
                  <div className="tech-number">{tech.index}</div>
                  <div className="tech-code">{tech.code}</div>
                  <div className="tech-copy">
                    <h3>{t(tech.name, lang)}</h3>
                    <p>{t(tech.description, lang)}</p>
                    <span>{tech.signal}</span>
                  </div>
                  <div className={`tech-visual tech-visual-${tech.index}`} aria-hidden="true">
                    <i /><i /><i /><i />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="work-section light-section" id="work">
          <div className="section-frame">
            <SectionHeading
              lang={lang}
              eyebrow={{ zh: "从实验室到真实场景", en: "FROM LAB TO LIVED EXPERIENCE" }}
              title={{ zh: "研究，只有进入生活才真正发生价值。", en: "Research creates value when it enters real life." }}
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
              eyebrow={{ zh: "团队概要", en: "TEAM PROFILE" }}
              title={{ zh: "跨越研究、工程与转化。", en: "Across research, engineering, and translation." }}
              description={{
                zh: "来自计算机科学、人机交互、智能系统与产业实践的多元经验，在同一目标下汇聚。",
                en: "Different perspectives across computer science, HCI, intelligent systems, and industry converge around a shared purpose.",
              }}
            />

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
                      {member.role && <p>{t(member.role, lang)}</p>}
                    </div>
                    <p className="team-bio">{t(member.bio, lang)}</p>
                    <div className="tag-list">{member.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <ArrowLink href={member.profileUrl}>{lang === "zh" ? "诺丁汉官方研究目录" : "Official Nottingham research directory"}</ArrowLink>
                  </div>
                </article>
              ))}
            </div>

            <div className="advisory-header reveal">
              <span>{lang === "zh" ? "顾问委员会" : "EXTERNAL ADVISORY BOARD"}</span>
              <p>{lang === "zh" ? "为科研深度与真实世界转化提供长期支持。" : "Long-term guidance for research depth and real-world translation."}</p>
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
          </div>
        </section>

        <section className="publications-section light-section" id="publications">
          <div className="section-frame">
            <div className="publications-heading-row">
              <SectionHeading
                lang={lang}
                eyebrow={{ zh: "精选发表论文集", en: "SELECTED PUBLICATIONS" }}
                title={{ zh: "用可验证的研究，支撑每一次转化。", en: "Evidence for every step toward impact." }}
                description={{
                  zh: "论文按团队成员在本页中的出场顺序呈现；后续研究成果可持续追加。",
                  en: "Research is grouped in the same order as the team above, with room for the collection to keep growing.",
                }}
              />
              <div className="publication-filter reveal" role="group" aria-label={lang === "zh" ? "筛选论文" : "Filter publications"} aria-controls="publication-results">
                {(["all", "lijie", "haonan", "renzhi"] as const).map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={publicationFilter === filter ? "active" : ""}
                    onClick={() => setPublicationFilter(filter)}
                    aria-pressed={publicationFilter === filter}
                  >
                    {filter === "all" ? (lang === "zh" ? "全部" : "All") : filter === "lijie" ? (lang === "zh" ? "郑力杰" : "Lijie") : filter === "haonan" ? (lang === "zh" ? "姚淏楠" : "Haonan") : (lang === "zh" ? "韩仁智" : "Renzhi")}
                  </button>
                ))}
              </div>
            </div>

            <div className="publication-groups" id="publication-results">
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
        </section>

        <section className="closing-section">
          <div className="closing-grid" aria-hidden="true" />
          <div className="closing-copy reveal">
            <span>I² LAB · NINGBO</span>
            <h2>{lang === "zh" ? <>下一代交互，<br />从真实问题开始。</> : <>The next interaction<br />starts with a real need.</>}</h2>
            <p>{lang === "zh" ? "与产业、学术和医疗伙伴共同构建面向未来的交互创新生态。" : "Building the future of interaction with partners across industry, academia, and healthcare."}</p>
            <div>
              <a className="primary-button light-button" href="#team"><span>{lang === "zh" ? "认识团队" : "Meet the team"}</span><span aria-hidden="true">↑</span></a>
              <a className="text-button light-text-button" href="#publications">{lang === "zh" ? "浏览研究成果" : "Explore the research"}<span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="closing-mark reveal" aria-hidden="true"><span>I</span><sup>2</sup></div>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true"><i /><b /></span>
          <span className="brand-name"><strong>{lang === "zh" ? "纸合科技" : "BOXTECH"}</strong><small>NINGBO BOXTECH TECHNOLOGY CO., LTD.</small></span>
        </a>
        <div className="footer-meta">
          <p>{lang === "zh" ? "中国 · 宁波" : "Ningbo · China"}</p>
          <p>Turning Research into Revolution.</p>
        </div>
        <div className="footer-credits">
          <p className="producer-credit"><span>DESIGN &amp; CREATED BY</span><strong>Bingxu HOU</strong></p>
          <p className="copyright">© 2026 Ningbo Boxtech Technology Co., Ltd.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
