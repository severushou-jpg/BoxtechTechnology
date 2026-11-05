export type ProjectLanguage = "zh" | "en";
export type ProjectText = Record<ProjectLanguage, string>;
export type ProjectImage = {
  src: string;
  alt: ProjectText;
  caption: ProjectText;
};

export type MainProject = {
  slug: string;
  number: string;
  code: ProjectText;
  title: ProjectText;
  summary: ProjectText;
  setting: ProjectText;
  visual: string;
  visualAlt: ProjectText;
  visualCaption: ProjectText;
  sections: Array<{
    label: ProjectText;
    title: ProjectText;
    text: ProjectText;
    details?: ProjectText[];
    images?: ProjectImage[];
  }>;
};

// These are two distinct projects in the supplied perioperative collaboration decks.
// Keep patient education (AR) separate from postoperative exercise (VR).
export const mainProjects: MainProject[] = [
  {
    slug: "ar-perioperative-education",
    number: "01",
    code: { zh: "增强现实 / 患者宣教", en: "AR / EDUCATION" },
    title: { zh: "围术期 AR 患者宣教", en: "AR Perioperative Patient Education" },
    summary: {
      zh: "用可自主探索的三维场景，帮助患者了解术前准备、治疗过程和术后注意事项。",
      en: "Explorable 3D scenes help patients understand preparation, the care journey, and what happens after a procedure.",
    },
    setting: { zh: "心脏重症监护 · 妇科", en: "CARDIAC INTENSIVE CARE · GYNAECOLOGY" },
    visual: "/images/projects/ar-patient-education.jpg",
    visualAlt: { zh: "围术期增强现实患者宣教原型画面", en: "Prototype scene from the AR perioperative patient education project" },
    visualCaption: { zh: "早期 AR 患者宣教原型", en: "Early AR education prototype shown in the project materials" },
    sections: [
      {
        label: { zh: "研究问题", en: "THE QUESTION" },
        title: { zh: "让重要信息不只说一遍。", en: "Make essential information available beyond a single explanation." },
        text: {
          zh: "术前沟通的时间有限，患者却要记住不少内容：如何准备、治疗会怎样进行、恢复时要注意什么。我们从心脏重症监护和妇科的实际宣教场景出发，探索怎样把这些流程讲得更直观，也方便患者之后回看。",
          en: "Preoperative conversations are brief, while patients must absorb preparation steps, the care process, and recovery guidance. The project starts with education scenarios in cardiac intensive care and gynaecology, asking how complex information can be easier to grasp and revisit.",
        },
        details: [
          {
            zh: "项目从几个实际问题出发：患者可能感到焦虑，医护能用于讲解的时间有限，有些信息还需要反复解释。我们希望把重要内容做成患者可以自己探索的数字资源，同时保留医护面对面沟通和判断的空间。",
            en: "The collaboration materials identify preoperative anxiety, limited time for high-quality education, and repeated explanations as design challenges. The goal is a resource patients can explore themselves, while clinical judgement and conversation remain with care staff.",
          },
          {
            zh: "内容涵盖术前准备、手术流程和配合事项，也包括术后注意事项与康复动作展示。这些内容用于帮助患者理解，不会代替针对个人情况的医疗建议。",
            en: "The content spans preparation, the procedure pathway, patient participation, postoperative precautions, and demonstrations of recovery exercises. It supports education rather than replacing personalised medical advice.",
          },
        ],
        images: [{
          src: "/images/projects/ar-clinical-overview.jpg",
          alt: { zh: "合作汇报中的 AR 患者宣教项目临床场景与原型图", en: "Clinical context and AR education prototype from the collaboration deck" },
          caption: { zh: "项目场景 / 心脏重症监护与妇科宣教", en: "PROJECT CONTEXT / CARDIAC INTENSIVE CARE AND GYNAECOLOGY" },
        }],
      },
      {
        label: { zh: "交互设计", en: "THE INTERACTION" },
        title: { zh: "把治疗流程放进能探索的三维场景。", en: "Turn a care pathway into a spatial story to explore." },
        text: {
          zh: "增强现实绘本把三维演示、步骤说明、互动问答和知识回顾放在一起。患者可以按自己的节奏了解手术前后需要配合的事情，医护人员也能使用同一套材料讲解。",
          en: "The AR storybook combines 3D demonstrations, explanations of key steps, interactive questions, and knowledge review. Patients can explore at their own pace while clinicians use a consistent resource to support conversations.",
        },
        details: [
          {
            zh: "原型把抽象的流程拆成一个个看得见的步骤。患者可以回看重要信息，通过问答检查自己是否理解；医护人员讲解时，也可以使用这套能够反复调用的内容。",
            en: "Spatial scenes and demonstrations break abstract processes into visible steps. Patients can revisit key information within a coherent narrative and use questions and review prompts to check understanding; staff can draw on the same reusable material during consultations.",
          },
          {
            zh: "项目材料还提出了手术流程预演、医患同屏互动和 AI 辅助个性化问答等后续方向。这些仍是研究设想，不代表相关功能都已经投入使用。",
            en: "The wider project materials also propose procedure walkthroughs, shared-screen clinician–patient interaction, and AI-assisted personalised questions. These are design and research directions, not claims that every feature has been deployed.",
          },
        ],
        images: [
          {
            src: "/images/projects/ar-patient-journey.jpg",
            alt: { zh: "增强现实患者宣教的多场景视觉原型", en: "Multi-scene visual storyboard for AR patient education" },
            caption: { zh: "交互原型 / 可探索的三维宣教情境", en: "INTERACTION PROTOTYPE / EXPLORABLE 3D EDUCATION" },
          },
          {
            src: "/images/projects/ar-education-pillars.jpg",
            alt: { zh: "AR 术前宣教项目的四项设计方向示意", en: "Four design directions for the AR preoperative education project" },
            caption: { zh: "设计方向 / 理解、互动、标准化与复用", en: "DESIGN DIRECTIONS / UNDERSTANDING, INTERACTION, REUSE" },
          },
        ],
      },
      {
        label: { zh: "评估方向", en: "WHAT WE STUDY" },
        title: { zh: "不只展示技术，更要看患者是否真正理解。", en: "Study understanding and communication, not just the technology." },
        text: {
          zh: "我们关心患者是否更容易理解流程、能否方便地回看信息，也关心这套材料能否融入临床工作。原型的实际效果还需要评估，不能把设计目标当成已经证实的疗效。",
          en: "The research examines patients’ understanding, the value of revisiting information, and how the material fits clinical education. Prototype aims are presented as research questions rather than proven clinical outcomes.",
        },
        details: [
          {
            zh: "在真实的临床流程中，我们会观察患者是否更清楚地了解准备和配合要点，是否愿意回看内容，以及统一的材料能否减轻医护反复讲解的负担。不同科室需要的信息深度、用词和交互节奏，也值得分别研究。",
            en: "Within clinical workflows, we want to study whether patients understand preparation and participation more clearly, revisit content when useful, and how standardised material affects the burden of repeated explanations. The level of detail, language, and interaction pace must also fit different departments.",
          },
          {
            zh: "合作资料还介绍了更广泛的智慧围术期研究计划、试点和转化设想。这里仅把它们作为背景展示；其中的市场预测和规划数字，不代表这套 AR 系统已经取得的成果。",
            en: "The source deck also outlines a wider smart-perioperative programme, pilots, and possible translation. It is shown here as context: market forecasts and programme totals are not treated as outcomes delivered by this AR system.",
          },
        ],
        images: [{
          src: "/images/projects/perioperative-programme-overview.jpg",
          alt: { zh: "合作资料中的智慧围术期整体研究规划与预估图", en: "Wider smart-perioperative research programme and forecasts from the source presentation" },
          caption: { zh: "整体研究规划 / 图中数字来自合作资料，并非本项目验证结果", en: "WIDER PROGRAMME / FIGURES ARE FROM THE SOURCE DECK, NOT VERIFIED PROJECT OUTCOMES" },
        }],
      },
    ],
  },
  {
    slug: "vr-postoperative-rehabilitation",
    number: "02",
    code: { zh: "虚拟现实 / 术后康复", en: "VR / REHABILITATION" },
    title: { zh: "术后 VR 床旁康复", en: "Bedside VR Postoperative Rehabilitation" },
    summary: {
      zh: "把床旁的踝部和下肢练习变成沉浸式任务，让训练进度和反馈看得见。",
      en: "Bedside ankle and lower-limb movements become immersive rehabilitation tasks with clear progress and feedback.",
    },
    setting: { zh: "心脏重症监护 · 术后恢复", en: "CARDIAC INTENSIVE CARE · POSTOPERATIVE RECOVERY" },
    visual: "/images/projects/vr-bedside-rehabilitation.jpg",
    visualAlt: { zh: "床旁动作示意及虚拟现实康复游戏任务画面", en: "Bedside movement illustrations and virtual-reality rehabilitation game tasks" },
    visualCaption: { zh: "床旁康复动作与 VR 任务原型", en: "Bedside movements and VR task prototypes shown in the project materials" },
    sections: [
      {
        label: { zh: "研究问题", en: "THE QUESTION" },
        title: { zh: "在床边有限的空间里，怎样让训练更容易坚持？", en: "How can constrained bedside exercise feel more engaging?" },
        text: {
          zh: "心脏重症监护室的术后患者，可能需要在床边反复做踝部和下肢练习。我们想探索：在活动空间有限的情况下，怎样把动作讲清楚、及时给出反馈，让患者更愿意继续练习？",
          en: "After surgery in cardiac intensive care, patients may repeat ankle and lower-limb exercises at the bedside. This project explores how to provide clear movement guidance, immediate feedback, and reasons to keep participating within that constrained setting.",
        },
        details: [
          {
            zh: "床旁康复不只是告诉患者要做什么动作。患者可能担心疼痛，医护需要反复示范，训练完成得怎么样也不容易持续记录。因此，我们把动作指导、参与意愿和训练过程放在一起考虑。",
            en: "The source material frames bedside rehabilitation as more than a list of movements: patients may worry about pain, staff may need to demonstrate exercises repeatedly, and training quality and completion are difficult to record consistently. The research therefore treats guidance, motivation, and observation as one system-level question.",
          },
          {
            zh: "这个原型面向心脏重症监护室的术后恢复，重点是有限活动范围内的踝关节和下肢力量练习。具体怎么练、练到什么程度，仍由临床团队决定。",
            en: "The prototype is situated in postoperative cardiac intensive care and focuses on ankle mobility and lower-limb strengthening within a restricted bedside range. Exercise prescriptions and safety boundaries remain clinical decisions.",
          },
        ],
        images: [{
          src: "/images/projects/vr-clinical-overview.jpg",
          alt: { zh: "合作汇报中的 VR 床旁康复项目临床应用与设备示意", en: "Clinical context and equipment for the bedside VR rehabilitation project" },
          caption: { zh: "床旁场景 / 心脏重症监护室术后恢复", en: "BEDSIDE CONTEXT / CICU POSTOPERATIVE RECOVERY" },
        }],
      },
      {
        label: { zh: "系统原型", en: "THE PROTOTYPE" },
        title: { zh: "让真实动作带动游戏前进。", en: "Connect real rehabilitation movements to game tasks." },
        text: {
          zh: "在虚拟场景里，收集、播种和浇灌等任务对应着踝关节和下肢练习。进度与得分让训练过程看得见。原型还结合头显、动作感知和心率观察，帮助医护了解训练状态。",
          en: "Collecting, sowing, and watering in a virtual environment are mapped to ankle mobility and lower-limb strengthening. Progress and scores make the session visible. The prototype combines a headset, motion sensing, and heart-rate observation to support staff oversight.",
        },
        details: [
          {
            zh: "合作资料展示了从收集种子到播种、浇灌的一系列任务。患者真实的踝关节背屈、跖屈和下肢动作，会推动虚拟世界里的目标。进度、得分和反馈，让患者与医护都更容易了解训练进行到哪里。",
            en: "The collaboration deck shows a sequence of collecting seeds, sowing, and watering. Ankle dorsiflexion, plantarflexion, and lower-limb movements are translated into goals in the virtual environment. Progress, scores, and feedback make a session easier for patients and staff to follow.",
          },
          {
            zh: "原型使用 VR 头显、下肢动作传感和心率观察。这些反馈用于辅助安排训练和记录研究数据，不能代替临床监护，也不能单独判断患者适不适合运动。",
            en: "The technical approach brings together a VR headset, lower-limb motion sensing, and heart-rate observation. In the prototype these support session guidance and research records; they do not replace clinical monitoring or determine exercise suitability on their own.",
          },
        ],
        images: [{
          src: "/images/projects/vr-rehabilitation-pillars.jpg",
          alt: { zh: "VR 术后康复系统的任务、反馈、标准化及动作监测示意", en: "Diagram of tasks, feedback, standardisation, and motion observation in VR rehabilitation" },
          caption: { zh: "系统构成 / 沉浸任务与训练反馈", en: "SYSTEM DESIGN / IMMERSIVE TASKS AND TRAINING FEEDBACK" },
        }],
      },
      {
        label: { zh: "评估方向", en: "WHAT WE STUDY" },
        title: { zh: "看患者做得怎样，也看系统是否适合床旁使用。", en: "Evaluate movement, engagement, and bedside fit." },
        text: {
          zh: "我们会检查游戏任务是否准确对应训练动作，患者能否理解并持续参与，以及系统能否安全地融入现有康复流程。训练反馈并不等于已经证实的临床效果。",
          en: "The study asks whether virtual tasks correspond to intended movements, whether patients can understand and sustain participation, and how the system fits existing rehabilitation workflows. Feedback is not presented as proven clinical efficacy.",
        },
        details: [
          {
            zh: "评估会关注动作与游戏任务的对应关系是否清楚、患者是否理解并愿意持续练习、训练过程能否记录，以及医护使用系统时会不会增加额外负担。材料中提到的“提升积极性”“减轻负担”仍是研究目标，需要用实际结果验证。",
            en: "Evaluation looks at the clarity of movement-to-task mapping, patient understanding and sustained participation, whether sessions can be recorded, and how staff can use the system without extra complexity. Greater motivation and a lighter workload are goals in the source materials, not outcomes assumed here.",
          },
        ],
        images: [{
          src: "/images/projects/wearable-monitoring-context.jpg",
          alt: { zh: "更广泛围术期研究计划中的柔性可穿戴监测方向示意", en: "Flexible wearable monitoring concept from the wider perioperative research programme" },
          caption: { zh: "相关研究方向 / 柔性可穿戴监测是独立课题，不是本 VR 原型现成功能", en: "ADJACENT RESEARCH / FLEXIBLE WEARABLES ARE A SEPARATE PROJECT, NOT A CURRENT VR FEATURE" },
        }],
      },
      {
        label: { zh: "研究脉络", en: "WIDER CONTEXT" },
        title: { zh: "从一个床旁原型，看见更广的围术期研究。", en: "A bedside prototype within a wider perioperative research network." },
        text: {
          zh: "VR 床旁康复是实验室围术期研究的一条独立路径。它与 AR 患者宣教、可穿戴监测等课题相关，但各自解决的问题不同。合作材料也展示了实验室在沉浸交互、康复和智能感知方面的其他研究。",
          en: "Bedside VR rehabilitation is one distinct line of the lab’s perioperative work. It sits beside AR patient education and a separate wearable-sensing project, but should not be conflated with either. The collaboration materials also show the lab’s broader work in immersive interaction, rehabilitation, and sensing.",
        },
        details: [
          {
            zh: "下方图片沿用合作资料，帮助读者了解这些项目的背景。其中有些内容仍在规划或投稿阶段，不能算作这个 VR 项目已经发表的成果。已核实的论文和 PDF，可到网站的“精选论文”部分查看。",
            en: "The figures below retain the source deck’s visual map of related work to show the collaboration context. They include planned or submitted items and are not a list of confirmed publications from this VR project. Verified papers and PDFs appear in the site’s Selected Publications section.",
          },
        ],
        images: [
          {
            src: "/images/projects/perioperative-technology-map.jpg",
            alt: { zh: "合作资料展示的 AR 宣教、VR 锻炼及独立可穿戴监测三条研究线", en: "Source-deck map of AR education, VR exercise, and a separate wearable-monitoring research line" },
            caption: { zh: "合作研究布局 / 三条相邻但不同的技术路线", en: "COLLABORATION MAP / THREE RELATED BUT DISTINCT PATHWAYS" },
          },
          {
            src: "/images/projects/lab-research-outputs.jpg",
            alt: { zh: "合作资料中的实验室相关研究展示图", en: "Lab-wide research overview image from the source presentation" },
            caption: { zh: "实验室研究图示 / 包含规划或投稿内容，不代表已发表的本项目成果", en: "LAB RESEARCH OVERVIEW / INCLUDES PLANNED OR SUBMITTED WORK, NOT CONFIRMED OUTPUTS OF THIS PROJECT" },
          },
        ],
      },
    ],
  },
];
