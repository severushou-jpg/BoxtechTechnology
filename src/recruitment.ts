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
  tags: RecruitmentLocalized[];
  sections: ProjectDetailSection[];
  closing?: RecruitmentLocalized;
  note?: RecruitmentLocalized;
  references?: ProjectReference[];
};

export const recruitmentHighlights: Array<{
  value: RecruitmentLocalized;
  label: RecruitmentLocalized;
}> = [
  {
    value: { zh: "大一至大二", en: "Y1–2" },
    label: { zh: "主要申请年级", en: "Primary cohort" },
  },
  {
    value: { zh: "至少一年", en: "≥ 1Y" },
    label: { zh: "建议参与周期", en: "Expected commitment" },
  },
  {
    value: { zh: "线下", en: "IN-PERSON" },
    label: { zh: "线下协作与开发", en: "Research mode" },
  },
];

export const recruitmentInfoGroups: RecruitmentInfoGroup[] = [
  {
    index: "R.01",
    title: { zh: "申请对象", en: "Eligibility" },
    items: [
      {
        zh: "主要面向宁波诺丁汉大学 4+0 项目的大一、大二本科生；其他申请者也会根据具体情况考虑。",
        en: "Primarily open to Year 1 and Year 2 undergraduate students enrolled in the 4+0 programme at UNNC; other applicants may be considered on a case-by-case basis.",
      },
      {
        zh: "欢迎 CS/CSAI、EEE、PDM、MAM、ME 专业的同学申请。",
        en: "Applications are open to students from CS/CSAI, EEE, PDM, MAM, and ME.",
      },
      {
        zh: "需要能参加线下科研会议，并参与项目开发。",
        en: "Applicants should be able to participate in in-person research meetings and project development.",
      },
      {
        zh: "原则上希望能持续参与项目至少一年。",
        en: "A minimum commitment of one year to the research project is generally expected.",
      },
    ],
  },
  {
    index: "R.02",
    title: { zh: "参与方式", en: "Participation" },
    items: [
      {
        zh: "研究助理会加入实验室正在开展的项目。",
        en: "Research assistants will join one of the laboratory’s ongoing research projects.",
      },
      {
        zh: "不同项目的工作内容有所不同，可能包括需求分析、算法或原型设计、系统开发，以及相关研究工作。",
        en: "Responsibilities vary by project and may include requirements analysis, algorithm or prototype design, system development, and related research tasks.",
      },
      {
        zh: "每个项目的研究内容、工作内容和技能要求，都可以在详情页查看。",
        en: "The research scope, responsibilities, and required skills for each position are described on its project detail page.",
      },
    ],
  },
  {
    index: "R.03",
    title: { zh: "优先考虑", en: "Preferred Background" },
    items: [
      {
        zh: "有完整的个人项目或作品集会更有优势。",
        en: "Applicants with complete personal development projects or a portfolio will be preferred.",
      },
      {
        zh: "有 Unity、VR/AR、硬件开发或 3D 打印经验会更有优势。",
        en: "Experience with Unity, VR/AR, hardware development, or 3D printing is highly valued.",
      },
      {
        zh: "对研究有持续的兴趣，也愿意投入长期项目。",
        en: "Applicants should have a sustained interest in research and be willing to contribute to long-term, complete research projects.",
      },
      {
        zh: "愿意边做边学，参与系统开发、实验研究到论文发表的完整过程。",
        en: "Willingness to keep learning and participate throughout the process—from system development to experimentation and publication—is expected.",
      },
    ],
  },
  {
    index: "R.04",
    title: { zh: "科研成长与支持", en: "Research Development & Support" },
    items: [
      {
        zh: "根据实际贡献，有机会以第一作者或共同第一作者身份在国际会议或期刊发表论文。",
        en: "Depending on actual contribution, opportunities may be available to publish at international conferences and journals as first author or co-first author.",
      },
      {
        zh: "提供一对一或小组指导，帮助你开展研究、设计实验和撰写论文。",
        en: "One-to-one or small-group guidance is provided for research, experimentation, and academic writing.",
      },
      {
        zh: "在真实项目中积累系统开发、实验设计和用户研究经验。",
        en: "Gain hands-on experience in real research projects, including system development, experimental design, and user studies.",
      },
      {
        zh: "为之后申请硕士或博士积累研究经历，并提供学术指导和推荐支持。",
        en: "Build research experience with academic guidance and recommendation support for future Master’s and PhD applications.",
      },
    ],
  },
  {
    index: "R.05",
    title: { zh: "申请方式", en: "Application" },
    items: [
      {
        zh: "请把申请邮件发给你想加入的项目负责人。",
        en: "Please send your application to the project leader listed on the project detail page.",
      },
      {
        zh: "邮件标题格式：RA Application – 姓名 – 专业 – 年级。",
        en: "Email subject: RA Application – Name – Programme – Year.",
      },
      {
        zh: "请用英文要点写邮件正文，不超过 200 个英文词。",
        en: "The email body must be written in English as bullet points and should not exceed 200 words.",
      },
      {
        zh: "简要说明你想申请哪个项目，以及为什么对它感兴趣。",
        en: "Briefly state the project you are applying for and why you are interested in it.",
      },
      {
        zh: "请附上简历；如果有个人项目、GitHub 或作品集，也欢迎附上链接。",
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
      zh: "开发一款研究工具：研究者提供简要背景，工具便能与参与者对话、整理量化和质性结果，并让每个结论都能找到依据。",
      en: "Develop a general-purpose research tool that turns a concise study brief into participant conversations, quantitative and qualitative findings, and a fine-grained traceable evidence chain.",
    },
    leader: { zh: "郑力杰", en: "Lijie Zheng" },
    email: "Lijie.Zheng@nottingham.edu.cn",
    tags: [
      { zh: "大语言模型", en: "LLM" },
      { zh: "用户体验研究", en: "UX RESEARCH" },
      { zh: "可解释人工智能", en: "EXPLAINABLE AI" },
    ],
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
            zh: "做大规模用户研究时，问卷能覆盖更多人，却很难听到选项之外的想法；访谈能问出原因和细节，却需要研究者花很多时间准备问题、现场追问和整理回答。",
            en: "Large-scale user research has long faced a trade-off between scale and depth. Surveys are easy to deploy at scale but constrain participants to predefined responses, while interviews reveal underlying reasons, context, and unexpected findings but require protocols, follow-up questions, and manual coding.",
          },
          {
            zh: "已有研究表明，聊天机器人可以根据开放式回答继续追问，大语言模型也能灵活地开展访谈。但现有工具大多只负责其中一环，还缺少一套从生成问题、与参与者对话，到整理量化和质性结果的简便流程。",
            en: "Prior work shows that chatbots can ask targeted follow-up questions and that LLMs can act as adaptive interviewers. Existing systems, however, usually cover only one stage—surveying, interviewing, or analysis—rather than a lightweight workflow spanning question generation, participant conversations, and integrated quantitative and qualitative outputs.",
          },
          {
            zh: "模型给出的评分、主题或组间结论，如果找不到原始回答作依据，就很难判断是否可靠。因此，我们希望每一步分析都能追溯到参与者的原话，让研究者看得清、查得到，也能及时纠正。",
            en: "When an LLM generates scores, themes, and between-group conclusions without traceable evidence, researchers cannot easily judge whether they are supported by the original data. A fine-grained chain from participant quotations to codes, themes, and conclusions is therefore essential for explainable, verifiable, and correctable findings.",
          },
        ],
      },
      {
        id: "objective",
        title: { zh: "研究目标", en: "Research Objective" },
        paragraphs: [
          {
            zh: "我们计划开发并验证一款轻便、通用、能说明结论从何而来的研究工具。研究者提供背景、问题和实验条件后，系统将与参与者对话，整理出便于统计比较的量化结果，以及可以用于报告的质性发现。无论是测量维度、个人分数，还是研究主题和结论，都应能回到参与者的原始表达。项目也会检验：在研究主观体验、态度和感知时，这种方式能否替代传统问卷与访谈的部分工作。",
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
      zh: "探索不依赖摄像头的毫米波感知技术，帮助独居老人更安全地生活，也为健康监测和长期照护提供新的可能。",
      en: "Explore privacy-preserving millimetre-wave sensing for safer homes, health monitoring, and dignified long-term support for older adults living alone.",
    },
    leader: { zh: "张小蕾（Michelle）", en: "Michelle Xiaolei Zhang" },
    email: "Xiaolei.Zhang@nottingham.edu.cn",
    tags: [
      { zh: "毫米波雷达", en: "mmWAVE" },
      { zh: "智慧养老", en: "SMART AGEING" },
      { zh: "健康感知", en: "HEALTH SENSING" },
    ],
    sections: [
      {
        id: "context",
        title: { zh: "研究背景", en: "Research Context" },
        paragraphs: [
          {
            zh: "随着人口老龄化，越来越多老人独自生活。如何在照顾他们安全与健康的同时，尊重他们的隐私和生活尊严，是我们关心的问题。",
            en: "Against the backdrop of a rapidly ageing population, supporting older adults living alone—while preserving their privacy and dignity and ensuring timely, reliable care—remains an important long-term research challenge in smart ageing and elderly care.",
          },
          {
            zh: "毫米波无线感知不需要接触身体，也不依赖摄像头或稳定的光线，就能感知人体活动和细微动作。我们从床边场景入手，探索它能否帮助守护老人的居家安全与健康，并减轻家属和照护人员的压力。",
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
      zh: "如果你希望用技术让独居老人生活得更安心、更有尊严，欢迎加入我们。",
      en: "If you would like to use technology to bring greater safety and dignity to older adults living alone, you are very welcome to join us.",
    },
    note: {
      zh: "根据参与程度和实际贡献，你将有机会参与论文研究、写作与发表。论文署名和顺序会遵循学术规范，按实际贡献确定。",
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
      zh: "把现有 AI 工具与双手、实物交互结合起来，探索在混合现实中更自然地创作和操作三维内容。对设计与艺术感兴趣的同学也欢迎加入。",
      en: "Explore more natural ways to create, edit, and manipulate 3D content in mixed reality by combining existing AI tools with tangible and embodied interaction, with room for design and artistic exploration.",
    },
    leader: { zh: "姚淏楠", en: "Haonan Yao" },
    email: "Haonan.YAO@nottingham.edu.cn",
    tags: [
      { zh: "XR+AI", en: "XR+AI" },
      { zh: "有形交互", en: "Tangible Interaction" },
      { zh: "数字艺术", en: "Digital Art" },
    ],
    sections: [
      {
        id: "context",
        title: { zh: "研究背景", en: "Research Context" },
        paragraphs: [
          {
            zh: "扩展现实（XR）让数字内容走出电脑和手机屏幕。在混合现实（MR）里，三维物体仿佛出现在身边，还能与人和周围环境互动。这为创作、工作和娱乐带来了新的可能，也让一个问题变得更重要：怎样才能更自然、更轻松地使用这些三维内容？[1]",
            en: "Extended Reality (XR) is changing how people interact with digital content. Digital content is no longer confined to computers or phone screens; XR allows people to truly step into three-dimensional virtual worlds. Mixed Reality (MR), in particular, brings the virtual and physical worlds together—where the virtual and the real intertwine, turning imagination into reality. Digital objects can appear in physical space and interact with users and their surroundings, creating new possibilities for 3D creation, productivity, entertainment, and many other applications. How people can interact with and manipulate 3D content more naturally and effectively has therefore become an important research topic in immersive interaction [1].",
          },
        ],
      },
      {
        id: "directions",
        title: { zh: "研究方向", en: "Research Directions" },
        paragraphs: [
          {
            zh: "我们从两个方向探索这个问题：用 AI 帮助人们在 XR 中创建、编辑和操作三维内容；也用实体交互和身体动作，让操作更贴近人的习惯。已有研究尝试把日常物品变成 AR 交互工具 [2]，借助实物操作虚拟内容 [3]，或在 MR 中更灵活地使用现实物体 [4]。两种方法也可以结合：先由 AI 生成或修改内容，再让人用双手和身边的物体调整结果。我们此前的研究还梳理了实物与身体动作在不同交互任务中的作用 [5]。",
            en: "As XR technologies continue to develop, our research explores two complementary directions: how AI can assist users in creating, editing, and manipulating 3D content in XR, and how XR interaction techniques, such as tangible and embodied interaction, can better address users’ needs. Previous research has explored using everyday physical objects as interaction proxies in AR [2], tangible objects as physical support for manipulating virtual content [3], and flexible proxy-based interaction with spatial content in MR [4]. These two directions can also be combined—for example, AI may generate or modify 3D content, while users further adjust the result using their hands or surrounding physical objects. Our previous work has also systematically examined how tangible objects and embodied actions can support different interaction tasks [5].",
          },
          {
            zh: "这个项目重在把已有 AI 工具用到真实的 XR 场景，并设计、开发和评估新的交互体验；我们不打算从零训练大型模型，也不以复杂算法研究为主要目标。如果你喜欢艺术和创意实践，也很欢迎一起探索。",
            en: "Therefore, this project focuses on applying existing AI models and tools to real XR needs, as well as the design, development, and evaluation of new XR interaction techniques and user experiences, rather than training large AI models from scratch or primarily pursuing advanced algorithmic research. In addition, we also welcome students to explore XR projects with artistic and creative dimensions together with us.",
          },
        ],
      },
      {
        id: "participation",
        title: { zh: "申请背景与参与工作", en: "Who We Are Looking For & How You Can Contribute" },
        paragraphs: [
          {
            zh: "人机交互（Human–Computer Interaction，HCI）连接计算机、心理学和设计等领域。只要你对 XR 和交互技术感兴趣，都欢迎申请；有设计、艺术或其他相关特长的同学也非常适合。下面的经验会有帮助，但不是硬性要求。我们更看重兴趣、创造力、学习意愿和持续投入。你会根据自己的能力和参与阶段，加入以下工作：",
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
