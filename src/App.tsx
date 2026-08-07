import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

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
  url?: string;
  local?: boolean;
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
    url: "https://doi.org/10.1109/VR67842.2026.00063",
    resources: [{ label: "UNNC", url: "https://research.nottingham.edu.cn/en/publications/differential-effects-of-virtual-and-augmented-reality-on-social-p/" }],
  },
  {
    owner: "lijie",
    year: "2026",
    type: { zh: "期刊论文", en: "Journal" },
    title: "Context-Dependent Roles of Familiarity, Discipline, and Personality in Shaping Social Engagement in Cooperative Immersive Learning",
    authors: "L. Zheng, S. Ke, Y. Zang, L. Sun, B. G. Lee & M. Pike",
    venue: "Computers in Human Behavior Reports",
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
    url: "https://doi.org/10.1109/VIS60296.2025.00058",
    resources: [{ label: "arXiv", url: "https://arxiv.org/abs/2507.00775" }],
  },
  {
    owner: "haonan",
    year: "2024",
    type: { zh: "会议论文", en: "Conference" },
    title: "Data Cubes in Hand: A Design Space of Tangible Cubes for Visualizing 3D Space-Time Data in Mixed Reality",
    authors: "S. He, H. Yao, L. Jiang, K. Li, N. Xiang, Y. Li, H. N. Liang & L. Yu",
    venue: "ACM CHI 2024",
    badge: "CCF-A",
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
    url: "/papers/renzhi-han-xr-rehabilitation-annual-review.pdf",
    local: true,
  },
  {
    owner: "renzhi",
    year: "2024",
    type: { zh: "会议论文", en: "Conference" },
    title: "Exploring Emotional Responses with Dynamic Difficulty Adjustment Adaptation in Immersive Virtual Reality Exergaming",
    authors: "R. Han, B. G. Lee, D. Towey, Y. Yao & M. Pike",
    venue: "IEEE COMPSAC 2024",
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

function usePageObservers(setActiveSection: (id: string) => void) {
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
  }, [setActiveSection]);
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
    <a className="arrow-link" href={href} target="_blank" rel="noreferrer" download={download}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const finishTimer = window.setTimeout(() => setLeaving(true), 3300);
    const removeTimer = window.setTimeout(onComplete, 4000);
    return () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(removeTimer);
    };
  }, [onComplete]);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(onComplete, 520);
  };

  return (
    <div className={`intro-sequence ${leaving ? "is-leaving" : ""}`} role="dialog" aria-label="Boxtech introduction">
      <div className="intro-grid" aria-hidden="true" />
      <div className="intro-field" aria-hidden="true">
        <i className="intro-ring intro-ring-one" />
        <i className="intro-ring intro-ring-two" />
        <i className="intro-ring intro-ring-three" />
        <span className="intro-channel intro-channel-xr"><b>XR</b></span>
        <span className="intro-channel intro-channel-wave"><b>mmWAVE</b></span>
        <span className="intro-channel intro-channel-sense"><b>SMART SENSING</b></span>
        <span className="brand-mark intro-brand-mark"><i /><b /></span>
        <span className="intro-scan" />
      </div>
      <div className="intro-wordmark">
        <span>NINGBO BOXTECH TECHNOLOGY</span>
        <strong>Turning Research<br />into Revolution.</strong>
      </div>
      <div className="intro-progress"><i /></div>
      <button type="button" className="intro-skip" onClick={skip}>SKIP <span>↗</span></button>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("boxtech-lang") === "en" ? "en" : "zh"));
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [publicationFilter, setPublicationFilter] = useState<"all" | PublicationOwner>("all");
  const [introVisible, setIntroVisible] = useState(() => {
    try {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && sessionStorage.getItem("boxtech-intro-seen") !== "true";
    } catch {
      return true;
    }
  });

  usePageObservers(setActiveSection);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    localStorage.setItem("boxtech-lang", lang);
  }, [lang]);

  useEffect(() => {
    document.body.style.overflow = introVisible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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

  return (
    <div className="site-shell">
      {introVisible && <IntroSequence onComplete={completeIntro} />}
      <a className="skip-link" href="#main">{lang === "zh" ? "跳到主要内容" : "Skip to content"}</a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label={lang === "zh" ? "纸合科技首页" : "Boxtech home"}>
          <span className="brand-mark" aria-hidden="true"><i /><b /></span>
          <span className="brand-name">
            <strong>{lang === "zh" ? "纸合科技" : "BOXTECH"}</strong>
            <small>{lang === "zh" ? "BOXTECH TECHNOLOGY" : "宁波纸合科技"}</small>
          </span>
        </a>

        <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`} aria-label={lang === "zh" ? "主要导航" : "Primary navigation"}>
          {navItems.map((item) => (
            <a
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
            >
              {t(item.label, lang)}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="intro-replay" type="button" onClick={() => setIntroVisible(true)}>
            <span aria-hidden="true">◎</span>{lang === "zh" ? "重播" : "REPLAY"}
          </button>
          <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={lang === "zh" ? "Switch to English" : "切换至中文"}>
            <span className={lang === "zh" ? "selected" : ""}>中</span>
            <i />
            <span className={lang === "en" ? "selected" : ""}>EN</span>
          </button>
          <button
            className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={lang === "zh" ? "打开导航菜单" : "Open navigation menu"}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-glow hero-glow-one" aria-hidden="true" />
          <div className="hero-glow hero-glow-two" aria-hidden="true" />
          <div className="hero-copy">
            <div className="hero-kicker reveal is-visible">
              <span className="status-dot" />
              {lang === "zh" ? "宁波 · 研究驱动型科技企业" : "NINGBO · RESEARCH-DRIVEN TECHNOLOGY"}
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
                ? "我们将扩展现实、毫米波雷达与智能传感，转化为可部署、可验证、可持续迭代的医疗与教育解决方案。"
                : "We translate Extended Reality, millimetre-wave radar, and smart sensing into deployable, verifiable, and continuously evolving solutions for healthcare and education."}
            </p>
            <div className="hero-cta reveal is-visible">
              <a className="primary-button" href="#technology">
                <span>{lang === "zh" ? "探索技术路径" : "Explore our technology"}</span><span aria-hidden="true">↓</span>
              </a>
              <a className="text-button" href="#publications">
                {lang === "zh" ? "查看精选论文" : "View selected research"}<span aria-hidden="true">↗</span>
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
              <span>{lang === "zh" ? "智能交互技术研究" : "INTELLIGENT INTERACTION"}</span>
              <span>Spatial · Sensing · Adaptive</span>
            </div>
          </div>

          <div className="hero-metrics reveal is-visible">
            <div><strong>2023</strong><span>{lang === "zh" ? "成立于宁波" : "Founded in Ningbo"}</span></div>
            <div><strong>03</strong><span>{lang === "zh" ? "核心技术路径" : "Core technology tracks"}</span></div>
            <div><strong>02</strong><span>{lang === "zh" ? "重点应用领域" : "Priority application fields"}</span></div>
            <p>Turning Research into Revolution.</p>
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
                  <>纸合科技是一家建立在科研成果与技术积累之上的<em>空间交互创新公司</em>。</>
                ) : (
                  <>Boxtech is a <em>spatial interaction company</em> built on scientific outcomes and deep technical practice.</>
                )}
              </p>
              <div className="about-body">
                <p>
                  {lang === "zh"
                    ? "公司成立于 2023 年 3 月，依托智能交互技术研究基础，聚焦空间交互技术的研发与落地，为医疗与教育提供新一代数字化实践与解决方案。"
                    : "Founded in March 2023 and grounded in intelligent interaction research, we develop and deploy spatial technologies that enable next-generation digital practice in healthcare and education."}
                </p>
                <p>
                  {lang === "zh"
                    ? "我们关注真实世界中的复杂需求：把技术嵌入日常环境，在不增加额外负担的前提下，持续优化体验、支持行为，并帮助形成更早的风险识别与更有效的干预决策。"
                    : "We address complex real-world needs by embedding technology into everyday environments—improving experiences and supporting behaviour without adding burden, while enabling earlier risk detection and more effective intervention decisions."}
                </p>
              </div>
            </div>
            <div className="about-principle reveal">
              <span>{lang === "zh" ? "我们的愿景" : "OUR VISION"}</span>
              <blockquote>
                {lang === "zh"
                  ? "让高质量的人机交互能力，在任何时间、任何地点、任何环境下，稳定服务于医疗与教育实践。"
                  : "High-quality interaction that works reliably—anytime, anywhere, and in any context—for healthcare and education."}
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

            <div className="research-showcase">
              <figure className="research-image research-image-primary reveal">
                <img src="/images/research/xr-prototype-session.jpg" alt={lang === "zh" ? "研究人员体验扩展现实原型" : "Researcher experiencing an extended reality prototype"} loading="lazy" decoding="async" />
                <figcaption><span>PROTOTYPE / 01</span><p>{lang === "zh" ? "空间交互原型测试" : "Spatial interaction prototyping"}</p></figcaption>
              </figure>
              <div className="research-note reveal">
                <span>I² LAB / FIELD NOTES</span>
                <p>{lang === "zh" ? "沉浸式环境并不是终点。真正重要的是，它能否理解人、适配人，并在复杂情境中持续可靠地工作。" : "Immersion is not the endpoint. What matters is whether a system can understand people, adapt to them, and remain dependable in complex contexts."}</p>
              </div>
              <figure className="research-image research-image-secondary reveal">
                <img src="/images/research/xr-rehabilitation-exergame.jpg" alt={lang === "zh" ? "扩展现实康复训练游戏画面" : "Extended reality rehabilitation exergame"} loading="lazy" decoding="async" />
                <figcaption><span>EXPERIMENT / 02</span><p>{lang === "zh" ? "游戏化康复与动态反馈" : "Gamified rehabilitation & adaptive feedback"}</p></figcaption>
              </figure>
            </div>

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
              <div className="publication-filter reveal" role="group" aria-label={lang === "zh" ? "筛选论文" : "Filter publications"}>
                {(["all", "lijie", "haonan", "renzhi"] as const).map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={publicationFilter === filter ? "active" : ""}
                    onClick={() => setPublicationFilter(filter)}
                  >
                    {filter === "all" ? (lang === "zh" ? "全部" : "All") : filter === "lijie" ? (lang === "zh" ? "郑力杰" : "Lijie") : filter === "haonan" ? (lang === "zh" ? "姚淏楠" : "Haonan") : (lang === "zh" ? "韩仁智" : "Renzhi")}
                  </button>
                ))}
              </div>
            </div>

            <div className="publication-groups">
              {publicationGroups.map((group) => (
                <div className="publication-group" key={group.owner}>
                  <div className="publication-owner reveal"><span>{t(ownerNames[group.owner], lang)}</span><i /></div>
                  <div className="publication-list">
                    {group.items.map((paper, index) => (
                      <article className="publication-item reveal" key={paper.title}>
                        <div className="paper-index">{String(index + 1).padStart(2, "0")}</div>
                        <div className="paper-year"><strong>{paper.year}</strong><span>{t(paper.type, lang)}</span></div>
                        <div className="paper-main">
                          <h3>
                            {paper.url ? <a className="paper-title-link" href={paper.url} target="_blank" rel="noreferrer">{paper.title}<span aria-hidden="true">↗</span></a> : paper.title}
                          </h3>
                          <p>{paper.authors}</p>
                          <div className="paper-meta"><span>{paper.venue}</span>{paper.badge && <b>{paper.badge}</b>}</div>
                        </div>
                        <div className="paper-action">
                          {paper.url ? (
                            <div className="paper-resource-links">
                              <a href={paper.url} target="_blank" rel="noreferrer">
                                {paper.local ? (lang === "zh" ? "研究报告" : "Report") : (lang === "zh" ? "论文" : "Paper")} <span>↗</span>
                              </a>
                              {paper.resources?.map((resource) => (
                                <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer">{resource.label} <span>↗</span></a>
                              ))}
                            </div>
                          ) : (
                            <span className="link-pending">{lang === "zh" ? "论文记录" : "Publication record"}</span>
                          )}
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
        <p className="copyright">© 2026 Ningbo Boxtech Technology Co., Ltd.</p>
      </footer>
    </div>
  );
}

export default App;
