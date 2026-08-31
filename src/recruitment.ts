export type RecruitmentLocalized = { zh: string; en: string };

export type OpportunityStatus = "open" | "upcoming" | "closed";

export type RecruitmentInfoGroup = {
  index: string;
  title: RecruitmentLocalized;
  items: RecruitmentLocalized[];
};

export type ProjectDetailSection = {
  id: string;
  title: RecruitmentLocalized;
  paragraphs?: RecruitmentLocalized[];
  items?: RecruitmentLocalized[];
};

export type ProjectReference = {
  title: string;
  citation?: string;
  doi?: string;
  pdf?: string;
};

export type ResearchOpportunity = {
  slug: string;
  order: number;
  published: boolean;
  status: OpportunityStatus;
  title: RecruitmentLocalized;
  summary: RecruitmentLocalized;
  leader: RecruitmentLocalized;
  email: string;
  tags: string[];
  sections: ProjectDetailSection[];
  closing?: RecruitmentLocalized;
  note?: RecruitmentLocalized;
  references?: ProjectReference[];
};

export const recruitmentHighlights: Array<{
  value: string;
  label: RecruitmentLocalized;
}> = [
  {
    value: "Y1–2",
    label: { zh: "主要申请年级", en: "Primary cohort" },
  },
  {
    value: "≥ 1Y",
    label: { zh: "建议参与周期", en: "Expected commitment" },
  },
  {
    value: "IN-PERSON",
    label: { zh: "线下协作与开发", en: "Research mode" },
  },
];

export const recruitmentInfoGroups: RecruitmentInfoGroup[] = [
  {
    index: "R.01",
    title: { zh: "申请对象", en: "Eligibility" },
    items: [
      {
        zh: "主要面向宁波诺丁汉大学 4+0 项目大一及大二本科生，其他申请者视具体情况考虑。",
        en: "Primarily open to Year 1 and Year 2 undergraduate students enrolled in the 4+0 programme at UNNC; other applicants may be considered on a case-by-case basis.",
      },
      {
        zh: "本次面向 CS/CSAI、EEE、PDM、MAM、ME 专业学生申请。",
        en: "Applications are open to students from CS/CSAI, EEE, PDM, MAM, and ME.",
      },
      {
        zh: "需能够参与线下科研会议与项目开发。",
        en: "Applicants should be able to participate in in-person research meetings and project development.",
      },
      {
        zh: "原则上需持续参与研究项目至少一年。",
        en: "A minimum commitment of one year to the research project is generally expected.",
      },
    ],
  },
  {
    index: "R.02",
    title: { zh: "参与方式", en: "Participation" },
    items: [
      {
        zh: "研究助理将加入实验室当前开展的具体科研项目。",
        en: "Research assistants will join one of the laboratory’s ongoing research projects.",
      },
      {
        zh: "具体工作内容将根据项目有所区别，可能涉及需求分析、算法或原型设计、系统开发及相关科研工作。",
        en: "Responsibilities vary by project and may include requirements analysis, algorithm or prototype design, system development, and related research tasks.",
      },
      {
        zh: "各项目的研究内容、具体职责及技能要求将在项目详情页中说明。",
        en: "The research scope, responsibilities, and required skills for each position are described on its project detail page.",
      },
    ],
  },
  {
    index: "R.03",
    title: { zh: "优先考虑", en: "Preferred Background" },
    items: [
      {
        zh: "有完整个人开发项目或作品集者优先。",
        en: "Applicants with complete personal development projects or a portfolio will be preferred.",
      },
      {
        zh: "具有 Unity、VR/AR、硬件开发或 3D 打印经验者优先。",
        en: "Experience with Unity, VR/AR, hardware development, or 3D printing is highly valued.",
      },
      {
        zh: "对科研具有持续兴趣，并能够参与长期、完整的研究项目。",
        en: "Applicants should have a sustained interest in research and be willing to contribute to long-term, complete research projects.",
      },
      {
        zh: "愿意持续学习，并参与从系统开发、实验研究到论文发表的完整研究过程。",
        en: "Willingness to keep learning and participate throughout the process—from system development to experimentation and publication—is expected.",
      },
    ],
  },
  {
    index: "R.04",
    title: { zh: "科研成长与支持", en: "Research Development & Support" },
    items: [
      {
        zh: "根据实际贡献，可以以第一作者或共同第一作者身份参与国际会议及期刊论文发表。",
        en: "Depending on actual contribution, opportunities may be available to publish at international conferences and journals as first author or co-first author.",
      },
      {
        zh: "提供一对一或小组形式的科研、实验与论文指导。",
        en: "One-to-one or small-group guidance is provided for research, experimentation, and academic writing.",
      },
      {
        zh: "参与真实科研项目，积累系统开发、实验设计与用户研究经验。",
        en: "Gain hands-on experience in real research projects, including system development, experimental design, and user studies.",
      },
      {
        zh: "为后续硕士、博士申请提供科研经历、学术指导及推荐支持。",
        en: "Build research experience with academic guidance and recommendation support for future Master’s and PhD applications.",
      },
    ],
  },
  {
    index: "R.05",
    title: { zh: "申请方式", en: "Application" },
    items: [
      {
        zh: "请将申请邮件发送至项目对应负责人。",
        en: "Please send your application to the project leader listed on the project detail page.",
      },
      {
        zh: "邮件标题格式：RA Application – 姓名 – 专业 – 年级。",
        en: "Email subject: RA Application – Name – Programme – Year.",
      },
      {
        zh: "邮件正文须使用英文要点形式撰写，总长度不超过 200 词。",
        en: "The email body must be written in English as bullet points and should not exceed 200 words.",
      },
      {
        zh: "请简要说明所申请的项目及选择该项目的原因。",
        en: "Briefly state the project you are applying for and why you are interested in it.",
      },
      {
        zh: "请附个人简历；如有个人项目、GitHub 或作品集，可一并提供相关链接。",
        en: "Please attach your CV and, where applicable, links to personal projects, GitHub, or a portfolio.",
      },
    ],
  },
];

export const researchOpportunities: ResearchOpportunity[] = [
  {
    slug: "explainable-llm-surveys-interviews",
    order: 1,
    published: true,
    status: "open",
    title: {
      zh: "基于可解释大语言模型的问卷与访谈替代",
      en: "Explainable LLM-Based Replacement of Surveys and Interviews",
    },
    summary: {
      zh: "开发一种可从简要研究背景出发，完成参与者对话、量化与质性分析，并提供细粒度证据追溯的通用研究工具。",
      en: "Develop a general-purpose research tool that turns a concise study brief into participant conversations, quantitative and qualitative findings, and a fine-grained traceable evidence chain.",
    },
    leader: { zh: "郑力杰", en: "Lijie Zheng" },
    email: "Lijie.Zheng@nottingham.edu.cn",
    tags: ["LLM", "UX RESEARCH", "EXPLAINABLE AI"],
    references: [
      {
        title: "The Emerging Use of GenAI for UX Research in Software Development: Challenges and Opportunities",
        citation: "Heloisa Candello et al. · arXiv preprint · 2025",
        doi: "https://doi.org/10.48550/arXiv.2512.15944",
        pdf: "/papers/related/genai-ux-research-challenges-opportunities.pdf",
      },
      {
        title: "Understand User Opinions of Large Language Models via LLM-Powered In-the-Moment User Experience Interviews",
        citation: "Mengqiao Liu, Tevin Wang, Cassandra A. Cohen, Sarah Li & Chenyan Xiong · Findings of ACL 2025 · pp. 13872–13893",
        doi: "https://doi.org/10.18653/v1/2025.findings-acl.714",
        pdf: "/papers/related/llm-in-the-moment-ux-interviews.pdf",
      },
      {
        title: "PaperTrail: A Claim-Evidence Interface for Grounding Provenance in LLM-based Scholarly Q&A",
        citation: "Anna Martin-Boyle, Cara Leckey, Martha Brown & Harmanpreet Kaur · ACM CHI 2026",
        doi: "https://doi.org/10.1145/3772318.3791101",
        pdf: "/papers/related/papertrail-claim-evidence-provenance.pdf",
      },
      {
        title: "AI Conversational Interviewing: Transforming Surveys with LLMs as Adaptive Interviewers",
        citation: "Alexander Wuttke, Matthias Aßenmacher, Christopher Klamm, Max M. Lang, Quirin Würschinger & Frauke Kreuter · LaTeCH-CLfL 2025",
        doi: "https://doi.org/10.18653/v1/2025.latechclfl-1.17",
        pdf: "/papers/related/ai-conversational-interviewing.pdf",
      },
      {
        title: "Tell Me About Yourself: Using an AI-Powered Chatbot to Conduct Conversational Surveys with Open-ended Questions",
        citation: "Ziang Xiao, Michelle X. Zhou, Q. Vera Liao, Gloria Mark, Changyan Chi, Wenxi Chen & Huahai Yang · ACM TOCHI 27(3), Article 15 · 2020",
        doi: "https://doi.org/10.1145/3381804",
        pdf: "/papers/related/tell-me-about-yourself-conversational-surveys.pdf",
      },
    ],
    sections: [
      {
        id: "context",
        title: { zh: "研究背景", en: "Research Context" },
        paragraphs: [
          {
            zh: "在大规模用户研究中，问卷与访谈长期存在“规模—深度”权衡：问卷易于扩展，却受限于预设选项；访谈能够揭示原因、情境与意外发现，却依赖研究者设计提纲、现场追问和人工编码。",
            en: "Large-scale user research has long faced a trade-off between scale and depth. Surveys are easy to deploy at scale but constrain participants to predefined responses, while interviews reveal underlying reasons, context, and unexpected findings but require protocols, follow-up questions, and manual coding.",
          },
          {
            zh: "已有工作证明聊天机器人可以针对开放式回答追问，大语言模型也可以承担自适应访谈者的角色。然而，现有系统通常只覆盖调查、访谈或分析中的单一阶段，仍缺少贯通问题生成、参与者对话以及量化与质性结果输出的轻量化流程。",
            en: "Prior work shows that chatbots can ask targeted follow-up questions and that LLMs can act as adaptive interviewers. Existing systems, however, usually cover only one stage—surveying, interviewing, or analysis—rather than a lightweight workflow spanning question generation, participant conversations, and integrated quantitative and qualitative outputs.",
          },
          {
            zh: "当大语言模型生成评分、主题和组间结论时，如果缺少证据追溯，研究者便难以判断结论是否得到原始数据支持。因此，系统需要建立从参与者原话到编码、主题与结论的细粒度证据链，使研究结果可解释、可核验、可纠错。",
            en: "When an LLM generates scores, themes, and between-group conclusions without traceable evidence, researchers cannot easily judge whether they are supported by the original data. A fine-grained chain from participant quotations to codes, themes, and conclusions is therefore essential for explainable, verifiable, and correctable findings.",
          },
        ],
      },
      {
        id: "objective",
        title: { zh: "研究目标", en: "Research Objective" },
        paragraphs: [
          {
            zh: "本项目将开发并验证一种轻量化、通用且可解释的研究工具。研究者仅需提供研究背景、研究问题和实验条件，系统即可与参与者对话，同时生成可统计比较的问卷式量化结果和可直接报告的访谈式质性结果。系统还将为每个测量维度、个体分数、研究主题及结论提供基于参与者原始表达的可视化、可追溯证据链，并探索其在主观体验、态度和感知研究中替代传统问卷与访谈流程的可行性。",
            en: "The project will develop and validate a lightweight, general-purpose, and explainable research tool. Researchers provide the study context, questions, and experimental conditions; the system then conducts participant conversations, produces survey-like quantitative results for comparison, and generates interview-like qualitative findings ready for reporting. Each dimension, individual score, theme, and conclusion will be grounded in a visual, traceable chain to participants’ original responses, allowing the project to evaluate whether such a tool can replace conventional survey and interview workflows for research into subjective experiences, attitudes, and perceptions.",
          },
        ],
      },
    ],
  },
  {
    slug: "wireless-sensing-smart-ageing",
    order: 2,
    published: true,
    status: "open",
    title: {
      zh: "智慧康养无线感知",
      en: "Wireless Sensing for Smart Ageing and Elderly Care",
    },
    summary: {
      zh: "探索隐私友好的毫米波无线感知，为独居老人的居家安全、健康监测与有尊严的长期照护提供新可能。",
      en: "Explore privacy-preserving millimetre-wave sensing for safer homes, health monitoring, and dignified long-term support for older adults living alone.",
    },
    leader: { zh: "张小蕾（Michelle）", en: "Michelle Xiaolei Zhang" },
    email: "Xiaolei.Zhang@nottingham.edu.cn",
    tags: ["mmWAVE", "SMART AGEING", "HEALTH SENSING"],
    sections: [
      {
        id: "context",
        title: { zh: "研究背景", en: "Research Context" },
        paragraphs: [
          {
            zh: "在人口老龄化不断加深的背景下，如何更好地照顾独居老人，让他们在保有隐私与尊严的同时获得及时、可靠的关怀，是智慧康养领域值得长期研究的重要课题。",
            en: "Against the backdrop of a rapidly ageing population, supporting older adults living alone—while preserving their privacy and dignity and ensuring timely, reliable care—remains an important long-term research challenge in smart ageing and elderly care.",
          },
          {
            zh: "毫米波无线感知具有非接触、隐私友好、对光照变化不敏感等优势，能够在不使用摄像头的情况下感知人体活动与细微动态。我们希望通过床周场景中的科研探索，为老年人的居家安全与健康照护提供新的技术可能，也为家属和照护人员减轻压力。",
            en: "Millimetre-wave wireless sensing is contactless, privacy-preserving, and robust to changing light. It can detect human activity and subtle movement without cameras. Through bedside sensing research, we aim to explore new possibilities for home safety and health monitoring while reducing the burden on families and caregivers.",
          },
        ],
      },
      {
        id: "eligibility",
        title: { zh: "申请要求", en: "Who We Are Looking For" },
        items: [
          {
            zh: "EEE（电子与电气工程）或 CS（计算机科学）专业学生。",
            en: "Students majoring in EEE (Electrical and Electronic Engineering) or CS (Computer Science).",
          },
          {
            zh: "本科三年级及以上。",
            en: "Undergraduate students in Year 3 or above.",
          },
          {
            zh: "在深度学习或信号处理相关课程中取得优异成绩。",
            en: "Students who have achieved excellent results in courses related to deep learning or signal processing.",
          },
        ],
      },
    ],
    closing: {
      zh: "如果你希望让科技为独居老人带来更多安全感与尊严，十分欢迎加入我们。",
      en: "If you would like to use technology to bring greater safety and dignity to older adults living alone, you are very welcome to join us.",
    },
    note: {
      zh: "项目将根据实际参与程度和学术贡献，提供参与论文研究、撰写及发表的机会。论文署名及顺序将遵循学术规范，依据实际贡献确定。",
      en: "Depending on participation and academic contribution, students may have opportunities to contribute to research, writing, and publication. Authorship and author order will follow established academic standards and be determined by actual contributions.",
    },
  },
  {
    slug: "ai-assisted-3d-content-mixed-reality",
    order: 3,
    published: true,
    status: "open",
    title: {
      zh: "AI 辅助下的混合现实三维内容创建、编辑与操控",
      en: "AI-Assisted 3D Content Creation, Editing, and Manipulation in Mixed Reality",
    },
    summary: {
      zh: "结合现有 AI 模型、实体交互与具身交互，探索在混合现实中更自然地创建、编辑和操控三维内容，欢迎具有设计与艺术兴趣的同学共同参与。",
      en: "Explore more natural ways to create, edit, and manipulate 3D content in mixed reality by combining existing AI tools with tangible and embodied interaction, with room for design and artistic exploration.",
    },
    leader: { zh: "姚淏楠", en: "Haonan Yao" },
    email: "Haonan.YAO@nottingham.edu.cn",
    tags: ["MIXED REALITY", "AI-ASSISTED CREATION", "TANGIBLE INTERACTION"],
    sections: [
      {
        id: "context",
        title: { zh: "研究背景", en: "Research Context" },
        paragraphs: [
          {
            zh: "扩展现实（XR）正在改变人们与数字内容交互的方式：数字内容不再局限于电脑或手机屏幕，而是让人们可以真正走进 3D 的虚拟世界。尤其是在混合现实（MR）中，虚拟与真实交织，将幻梦化作现实——数字物体可以真正出现在现实空间中，并与用户和周围环境发生交互。这为三维创作、办公、娱乐等应用带来了新的可能。如何让人们更加自然、高效地与三维内容进行交互，也因此成为沉浸式交互中的重要研究问题 [1]。",
            en: "Extended Reality (XR) is changing how people interact with digital content. Digital content is no longer confined to computers or phone screens; XR allows people to truly step into three-dimensional virtual worlds. Mixed Reality (MR), in particular, brings the virtual and physical worlds together—where the virtual and the real intertwine, turning imagination into reality. Digital objects can appear in physical space and interact with users and their surroundings, creating new possibilities for 3D creation, productivity, entertainment, and many other applications. How people can interact with and manipulate 3D content more naturally and effectively has therefore become an important research topic in immersive interaction [1].",
          },
        ],
      },
      {
        id: "directions",
        title: { zh: "研究方向", en: "Research Directions" },
        paragraphs: [
          {
            zh: "随着 XR 技术不断发展，我们的研究主要探索两个相互补充的方向：一是 AI 如何辅助用户在 XR 中创建、编辑和操控三维内容，二是如何通过实体交互、具身交互等 XR 交互技术更好地满足用户需求。已有研究探索了如何将现实中的日常物体转化为 AR 中的交互媒介 [2]、利用实体物体为虚拟内容操控提供物理支持 [3]，以及在 MR 中实现更加灵活的代理式空间交互 [4]。这两个方向也可以进一步结合，例如由 AI 生成或修改三维内容，再由用户通过双手和周围的实体物体直接调整结果。我们此前的研究也系统总结了实体物体及具身动作如何用于支持不同的交互任务 [5]。",
            en: "As XR technologies continue to develop, our research explores two complementary directions: how AI can assist users in creating, editing, and manipulating 3D content in XR, and how XR interaction techniques, such as tangible and embodied interaction, can better address users’ needs. Previous research has explored using everyday physical objects as interaction proxies in AR [2], tangible objects as physical support for manipulating virtual content [3], and flexible proxy-based interaction with spatial content in MR [4]. These two directions can also be combined—for example, AI may generate or modify 3D content, while users further adjust the result using their hands or surrounding physical objects. Our previous work has also systematically examined how tangible objects and embodied actions can support different interaction tasks [5].",
          },
          {
            zh: "因此，本项目主要关注如何将现有 AI 模型与工具应用于真实 XR 需求，以及新的 XR 交互技术与用户体验的设计、开发和评估；而不是从零训练大型 AI 模型，或高深的算法钻研。此外，还非常欢迎与我们一起进行具有艺术与创意属性的 XR 项目探索。",
            en: "Therefore, this project focuses on applying existing AI models and tools to real XR needs, as well as the design, development, and evaluation of new XR interaction techniques and user experiences, rather than training large AI models from scratch or primarily pursuing advanced algorithmic research. In addition, we also welcome students to explore XR projects with artistic and creative dimensions together with us.",
          },
        ],
      },
      {
        id: "participation",
        title: { zh: "申请背景与参与工作", en: "Who We Are Looking For & How You Can Contribute" },
        paragraphs: [
          {
            zh: "人机交互（Human–Computer Interaction, HCI）是融合计算机、心理学与设计等方向的交叉领域。我们欢迎对 XR 和交互技术感兴趣的同学加入，同时也特别欢迎具有设计、艺术及其他相关背景或特长的同学申请。具有与以下工作相关的经验或技能者优先，但均非强制要求。我们更看重对这一方向的兴趣、创造力、学习意愿和持续投入。参与本项目的学生将根据个人能力和参与阶段参与以下工作：",
            en: "Human–Computer Interaction (HCI) is an interdisciplinary field that brings together computing, psychology, design, and related areas. We welcome students who are interested in XR and interaction technologies, and particularly encourage students with design, art, or other relevant backgrounds or strengths to apply. Experience or skills related to the following activities will be considered an advantage, but none are mandatory requirements. We place greater emphasis on interest in the research direction, creativity, willingness to learn, and sustained participation. Depending on their abilities and stage of participation, students may contribute to:",
          },
        ],
        items: [
          {
            zh: "使用 Unity 进行 XR/MR 原型系统的设计与开发；",
            en: "Design and development of XR/MR prototype systems using Unity;",
          },
          {
            zh: "本地部署 AI 模型或使用 API 来解决实际需求；",
            en: "Local deployment of AI models or integration of APIs to address real needs;",
          },
          {
            zh: "用户实验的准备与开展；",
            en: "Preparation and execution of user studies;",
          },
          {
            zh: "学术论文配图、系统原型视频等科研视觉材料制作。",
            en: "Creation of research visual materials, including academic figures and prototype demonstration videos.",
          },
        ],
      },
    ],
    references: [
      {
        title: "A Survey on 3D Virtual Object Manipulation: From the Desktop to Immersive Virtual Environments",
        citation: "D. Mendes, F. M. Caputo, A. Giachetti, A. Ferreira & J. Jorge · Computer Graphics Forum 38, pp. 21–45 · 2019",
      },
      {
        title: "Annexing Reality: Enabling Opportunistic Use of Everyday Objects as Tangible Proxies in Augmented Reality",
        citation: "A. Hettiarachchi & D. Wigdor · ACM CHI 2016",
      },
      {
        title: "TanGi: Tangible Proxies for Embodied Object Exploration and Manipulation in Virtual Reality",
        citation: "M. Feick, S. Bateman, A. Tang, A. Miede & N. Marquardt · IEEE ISMAR 2020 · pp. 195–206",
      },
      {
        title: "Reality Proxy: Fluid Interactions with Real-World Objects in MR via Abstract Representations",
        citation: "X. Liu, D. Jia, X. C. Liu, M. Gonzalez-Franco & C. Zhu-Tian · ACM UIST 2025 · Article 186",
      },
      {
        title: "Designing Visualization Widgets for Tangible Data Exploration: A Systematic Review",
        citation: "H. Yao, L. Yu & L. Yao · IEEE VIS 2025 · pp. 261–265",
        doi: "https://doi.org/10.1109/VIS60296.2025.00058",
        pdf: "/papers/visualization-widgets-tangible-data-exploration.pdf",
      },
    ],
  },
];

export const visibleResearchOpportunities = researchOpportunities
  .filter((project) => project.published)
  .sort((a, b) => a.order - b.order);
