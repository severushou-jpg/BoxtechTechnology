type Localized = { zh: string; en: string };

export type AlumniProfile = {
  slug: string;
  name: Localized;
  institution: Localized;
  programme: Localized;
  summary: Localized;
  interests: Localized[];
  portrait: {
    source: string;
    width: number;
    height: number;
    crop: { x: number; y: number; width: number; height: number };
  };
  sections: Array<{ title: Localized; paragraphs: Localized[] }>;
};

// Source: the three alumni biographies supplied on 31 August 2026.
// Preserve the supplied photographs; the portrait component only frames their
// original pixels. Do not infer RA dates, graduation years, or honorifics.
export const alumni: AlumniProfile[] = [
  {
    slug: "shaoteng-ke",
    name: { zh: "柯绍腾", en: "Shaoteng Ke" },
    institution: { zh: "加州大学圣迭戈分校", en: "University of California, San Diego" },
    programme: { zh: "计算机科学硕士在读", en: "M.S. in Computer Science · In progress" },
    summary: {
      zh: "从 VR/AR、沉浸式协作与游戏化研究出发，如今也在为工业制造开发 AI 软件，现任 IndustrialMind.ai AI 工程师。",
      en: "Research in VR/AR, immersive collaboration, and gamification, alongside applied AI development for industrial manufacturing as an AI Engineer at IndustrialMind.ai.",
    },
    interests: [
      { zh: "VR / AR", en: "VR / AR" },
      { zh: "沉浸式协作", en: "Immersive collaboration" },
      { zh: "游戏化", en: "Gamification" },
    ],
    portrait: { source: "/images/alumni/shaoteng-ke-source.png", width: 2722, height: 1646, crop: { x: 390, y: 355, width: 486, height: 671 } },
    sections: [
      {
        title: { zh: "教育背景", en: "Education" },
        paragraphs: [{
          zh: "柯绍腾目前在加州大学圣迭戈分校攻读计算机科学硕士。他本科毕业于宁波诺丁汉大学计算机科学专业，获得一等荣誉学士学位和最佳毕业论文奖。",
          en: "Shaoteng Ke is pursuing an M.S. in Computer Science at the University of California, San Diego. Shaoteng graduated from the University of Nottingham Ningbo China with First-Class Honours in Computer Science and received the Best Dissertation Award.",
        }],
      },
      {
        title: { zh: "职业发展", en: "Professional Practice" },
        paragraphs: [{
          zh: "他目前在硅谷 AI 初创公司 IndustrialMind.ai 担任 AI 工程师，为工业制造开发软件，工作包括基于 CAD 的三维几何分析、工程图生成和制造特征提取。",
          en: "As an AI Engineer at IndustrialMind.ai, an AI startup in Silicon Valley, Shaoteng develops AI software for industrial manufacturing, including CAD-based 3D geometry analysis, engineering drawing generation, and manufacturing feature extraction.",
        }],
      },
      {
        title: { zh: "实验室经历与研究", en: "Laboratory Experience & Research" },
        paragraphs: [
          {
            zh: "他曾在 I²Lab 担任研究助理，在宁波诺丁汉大学李汶锦博士的指导下研究人机交互，也有 VR 和游戏开发经验。",
            en: "Shaoteng previously worked as a research assistant at I²Lab and conducted human–computer interaction research under the guidance of Dr. Boon Giin Lee at UNNC, with experience in VR and game development.",
          },
          {
            zh: "他的研究涉及 VR/AR、人机交互、沉浸式协作和游戏化设计，相关成果以第一作者或共同第一作者发表于 IEEE VR、ACM UIST 等 CCF-A 类国际会议。",
            en: "Research interests include VR/AR, HCI, immersive collaboration, and gamification, with first- and co-first-author publications at leading CCF-A conferences including IEEE VR and ACM UIST.",
          },
        ],
      },
    ],
  },
  {
    slug: "guoyueyang-cheng",
    name: { zh: "程过钥扬", en: "Guoyueyang Cheng" },
    institution: { zh: "伊利诺伊大学厄巴纳-香槟分校", en: "University of Illinois Urbana-Champaign" },
    programme: { zh: "计算机科学硕士在读", en: "M.S. in Computer Science · In progress" },
    summary: {
      zh: "关注 VR/AR 中的多人互动、协作学习和游戏化设计，相关成果发表于 IEEE VR 和 ACM UIST。",
      en: "Exploring multi-user interaction in VR and AR, collaborative immersive learning, and gamification, with research published at IEEE VR and ACM UIST.",
    },
    interests: [
      { zh: "多人交互", en: "Multi-user interaction" },
      { zh: "沉浸式学习", en: "Immersive learning" },
      { zh: "游戏化", en: "Gamification" },
    ],
    portrait: { source: "/images/alumni/guoyueyang-cheng-source.png", width: 2562, height: 1502, crop: { x: 268, y: 129, width: 484, height: 610 } },
    sections: [
      {
        title: { zh: "教育背景", en: "Education" },
        paragraphs: [
          {
            zh: "程过钥扬目前在伊利诺伊大学厄巴纳-香槟分校攻读计算机科学硕士。本科毕业于宁波诺丁汉大学计算机科学专业，获得一等荣誉学士学位。",
            en: "Guoyueyang Cheng is pursuing an M.S. in Computer Science at the University of Illinois Urbana-Champaign, after graduating from the University of Nottingham Ningbo China with First-Class Honours in Computer Science.",
          },
          {
            zh: "申请硕士期间，还曾收到芝加哥大学、西北大学、卡内基梅隆大学、达特茅斯学院和爱丁堡大学等院校的录取通知。",
            en: "Postgraduate offers also included the University of Chicago, Northwestern University, Carnegie Mellon University, Dartmouth College, and the University of Edinburgh.",
          },
        ],
      },
      {
        title: { zh: "实验室经历", en: "Laboratory Experience" },
        paragraphs: [{
          zh: "2024 年加入智能交互技术研究实验室担任研究助理，有 VR、AR 和游戏开发经验。",
          en: "Guoyueyang joined the Intelligent Interaction Laboratory as a research assistant in 2024 and has experience in VR, AR, and game development.",
        }],
      },
      {
        title: { zh: "研究方向与成果", en: "Research Interests & Contributions" },
        paragraphs: [{
          zh: "研究主要围绕 VR/AR 多人互动、沉浸式协作学习和游戏化设计展开。相关成果以第一作者或共同第一作者发表于 IEEE VR、ACM UIST 等 CCF-A 类国际会议。",
          en: "Research focuses on multi-user interaction in virtual and augmented reality, collaborative immersive learning, and gamification, with first- and co-first-author publications at leading CCF-A conferences including IEEE VR and ACM UIST.",
        }],
      },
    ],
  },
  {
    slug: "longyin-zhang",
    name: { zh: "张泷尹", en: "Longyin Zhang" },
    institution: { zh: "香港中文大学", en: "The Chinese University of Hong Kong" },
    programme: { zh: "课程与教学论硕士在读", en: "M.A. in Curriculum and Instruction · In progress" },
    summary: {
      zh: "结合国际教育、课程开发和技术辅助学习的经验，探索个性化学习与更包容的教学方式。",
      en: "Bringing interdisciplinary experience in international education, curriculum development, and technology-enhanced learning to personalised and inclusive education.",
    },
    interests: [
      { zh: "教育科技", en: "Educational technology" },
      { zh: "课程创新", en: "Curriculum innovation" },
      { zh: "全纳教育", en: "Inclusive education" },
    ],
    portrait: { source: "/images/alumni/longyin-zhang-source.png", width: 2586, height: 1568, crop: { x: 278, y: 140, width: 486, height: 732 } },
    sections: [
      {
        title: { zh: "教育背景", en: "Education" },
        paragraphs: [{
          zh: "张泷尹目前在香港中文大学攻读课程与教学论硕士，本科毕业于宁波诺丁汉大学英语与应用语言学专业。",
          en: "Longyin Zhang is pursuing an M.A. in Curriculum and Instruction at The Chinese University of Hong Kong and holds a B.A. in English Language and Applied Linguistics from the University of Nottingham Ningbo China.",
        }],
      },
      {
        title: { zh: "跨学科实践", en: "Interdisciplinary Practice" },
        paragraphs: [
          {
            zh: "她有国际教育、课程开发和技术辅助学习方面的实践经验，曾在国际学校、教育机构和大型企业参与课程开发、教学及人才培训。",
            en: "Longyin has practical experience in international education, curriculum development, and technology-enhanced learning, with previous involvement in curriculum design, teaching, and talent development across international schools, leading education organisations, and large enterprises.",
          },
          {
            zh: "她也长期参与自然教育、融合教育和科技教育项目，积累了跨学科项目开发经验。",
            en: "Extensive involvement in nature education, inclusive education, and technology-enhanced education projects has contributed to broad experience in interdisciplinary educational project development.",
          },
        ],
      },
      {
        title: { zh: "研究方向", en: "Research Interests" },
        paragraphs: [{
          zh: "她关注教育科技和课程创新，尤其希望探索个性化学习、全纳教育，以及技术如何帮助教学。",
          en: "Research interests focus on educational technology and curriculum innovation, particularly personalised learning, inclusive education, and technology-enhanced teaching.",
        }],
      },
    ],
  },
];
