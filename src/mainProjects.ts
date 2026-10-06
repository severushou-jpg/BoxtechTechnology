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
  code: string;
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
    code: "AR / EDUCATION",
    title: { zh: "围术期 AR 患者宣教", en: "AR Perioperative Patient Education" },
    summary: {
      zh: "用可探索的三维情境，帮助患者理解术前准备、治疗过程与术后配合。",
      en: "Explorable 3D scenes help patients understand preparation, the care journey, and what happens after a procedure.",
    },
    setting: { zh: "心脏重症监护 · 妇科", en: "CARDIAC INTENSIVE CARE · GYNAECOLOGY" },
    visual: "/images/projects/ar-patient-education.jpg",
    visualAlt: { zh: "围术期增强现实患者宣教原型画面", en: "Prototype scene from the AR perioperative patient education project" },
    visualCaption: { zh: "PPT 中的早期 AR 宣教原型画面", en: "Early AR education prototype shown in the project materials" },
    sections: [
      {
        label: { zh: "研究问题", en: "THE QUESTION" },
        title: { zh: "让关键信息不再只停留于一次口头讲解。", en: "Make essential information available beyond a single explanation." },
        text: {
          zh: "术前沟通时间有限，患者需要理解的内容却涉及准备事项、治疗步骤和恢复期注意事项。项目从心脏重症监护与妇科的实际宣教场景出发，研究如何让复杂流程更直观、便于回看。",
          en: "Preoperative conversations are brief, while patients must absorb preparation steps, the care process, and recovery guidance. The project starts with education scenarios in cardiac intensive care and gynaecology, asking how complex information can be easier to grasp and revisit.",
        },
        details: [
          {
            zh: "合作材料把术前焦虑、有限的优质宣教时间，以及需要反复解释的诊疗信息列为设计起点。团队希望将关键内容从一次性口头说明转化为患者可自主探索的数字资源，同时让医护保留面对面沟通中的判断与解释。",
            en: "The collaboration materials identify preoperative anxiety, limited time for high-quality education, and repeated explanations as design challenges. The goal is a resource patients can explore themselves, while clinical judgement and conversation remain with care staff.",
          },
          {
            zh: "项目关注术前准备、手术流程及配合事项，也延伸至术后注意事项与康复动作展示；这些是患者教育内容，并非替代个体化医疗建议。",
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
        title: { zh: "把流程变成可观看、可提问的空间叙事。", en: "Turn a care pathway into a spatial story to explore." },
        text: {
          zh: "增强现实绘本结合三维情境演示、关键步骤说明、互动问答与知识回顾。患者可以按自己的节奏理解手术前后的配合事项，医护人员也能借助统一的材料进行讲解。",
          en: "The AR storybook combines 3D demonstrations, explanations of key steps, interactive questions, and knowledge review. Patients can explore at their own pace while clinicians use a consistent resource to support conversations.",
        },
        details: [
          {
            zh: "原型通过空间化的场景和操作演示，把抽象流程拆解为看得见的步骤。患者能够在相对熟悉的叙事中回看重要信息，使用问答与知识巩固环节检查理解；医护人员则可在讲解时调用同一套可重复使用的内容。",
            en: "Spatial scenes and demonstrations break abstract processes into visible steps. Patients can revisit key information within a coherent narrative and use questions and review prompts to check understanding; staff can draw on the same reusable material during consultations.",
          },
          {
            zh: "另一份项目材料还提出了手术流程预演、医患同屏互动及 AI 辅助个性化问答等进一步方向。这些属于方案与研究目标，页面不把它们表述为全部已部署的功能。",
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
        title: { zh: "检验理解与沟通体验，而非只展示技术。", en: "Study understanding and communication, not just the technology." },
        text: {
          zh: "研究关注患者对流程的理解、重复查看信息的便利性，以及宣教材料如何融入临床工作。相关原型与临床应用仍需通过研究评估，不将设计目标表述为已证实的疗效。",
          en: "The research examines patients’ understanding, the value of revisiting information, and how the material fits clinical education. Prototype aims are presented as research questions rather than proven clinical outcomes.",
        },
        details: [
          {
            zh: "在临床工作流程中，我们希望观察患者是否更清楚地理解准备与配合要点、是否愿意重复查看内容，以及医护使用标准化素材时的讲解负担。研究也关注不同科室对内容深度、用词和交互节奏的实际需求。",
            en: "Within clinical workflows, we want to study whether patients understand preparation and participation more clearly, revisit content when useful, and how standardised material affects the burden of repeated explanations. The level of detail, language, and interaction pace must also fit different departments.",
          },
          {
            zh: "原始 PPT 描述了更广泛的智慧围术期研究计划、试点及转化设想。这里仅将其作为项目背景；市场预测或规划数量不作为本 AR 系统已实现的结果。",
            en: "The source deck also outlines a wider smart-perioperative programme, pilots, and possible translation. It is shown here as context: market forecasts and programme totals are not treated as outcomes delivered by this AR system.",
          },
        ],
        images: [{
          src: "/images/projects/perioperative-programme-overview.jpg",
          alt: { zh: "原始演示文稿中的智慧围术期整体研究规划与预估图", en: "Wider smart-perioperative research programme and forecasts from the source presentation" },
          caption: { zh: "整体研究规划 / 图中数字为原始 PPT 资料，并非本项目验证结果", en: "WIDER PROGRAMME / FIGURES ARE FROM THE SOURCE DECK, NOT VERIFIED PROJECT OUTCOMES" },
        }],
      },
    ],
  },
  {
    slug: "vr-postoperative-rehabilitation",
    number: "02",
    code: "VR / REHABILITATION",
    title: { zh: "术后 VR 床旁康复", en: "Bedside VR Postoperative Rehabilitation" },
    summary: {
      zh: "将床旁踝部与下肢练习转化为有进度、有反馈的沉浸式康复任务。",
      en: "Bedside ankle and lower-limb movements become immersive rehabilitation tasks with clear progress and feedback.",
    },
    setting: { zh: "心脏重症监护 · 术后恢复", en: "CARDIAC INTENSIVE CARE · POSTOPERATIVE RECOVERY" },
    visual: "/images/projects/vr-bedside-rehabilitation.jpg",
    visualAlt: { zh: "床旁动作示意及虚拟现实康复游戏任务画面", en: "Bedside movement illustrations and virtual-reality rehabilitation game tasks" },
    visualCaption: { zh: "PPT 中的床旁动作与 VR 任务原型", en: "Bedside movements and VR task prototypes shown in the project materials" },
    sections: [
      {
        label: { zh: "研究问题", en: "THE QUESTION" },
        title: { zh: "在有限活动空间内，如何让训练更可参与？", en: "How can constrained bedside exercise feel more engaging?" },
        text: {
          zh: "心脏重症监护中的术后患者可能需要在床旁完成重复的踝部与下肢运动。项目研究如何在这一受限环境中提供清晰的动作引导、即时反馈与持续参与的动机。",
          en: "After surgery in cardiac intensive care, patients may repeat ankle and lower-limb exercises at the bedside. This project explores how to provide clear movement guidance, immediate feedback, and reasons to keep participating within that constrained setting.",
        },
        details: [
          {
            zh: "项目材料指出，床旁康复的挑战不仅是“做什么动作”：患者可能担心活动造成疼痛，医护需要反复示范，而训练质量与完成情况又不易持续记录。研究因此把动作指导、参与意愿和过程观察放在同一个系统问题中。",
            en: "The source material frames bedside rehabilitation as more than a list of movements: patients may worry about pain, staff may need to demonstrate exercises repeatedly, and training quality and completion are difficult to record consistently. The research therefore treats guidance, motivation, and observation as one system-level question.",
          },
          {
            zh: "原型面向心脏重症监护室的术后恢复情境，强调在有限活动范围内进行踝关节活动与下肢肌力练习。具体运动处方与安全边界仍由临床团队决定。",
            en: "The prototype is situated in postoperative cardiac intensive care and focuses on ankle mobility and lower-limb strengthening within a restricted bedside range. Exercise prescriptions and safety boundaries remain clinical decisions.",
          },
        ],
        images: [{
          src: "/images/projects/vr-clinical-overview.jpg",
          alt: { zh: "合作汇报中的 VR 床旁康复项目临床应用与设备示意", en: "Clinical context and equipment for the bedside VR rehabilitation project" },
          caption: { zh: "床旁场景 / CICU 术后恢复", en: "BEDSIDE CONTEXT / CICU POSTOPERATIVE RECOVERY" },
        }],
      },
      {
        label: { zh: "系统原型", en: "THE PROTOTYPE" },
        title: { zh: "用游戏任务承接真实的康复动作。", en: "Connect real rehabilitation movements to game tasks." },
        text: {
          zh: "虚拟场景中的收集、播种、浇灌等任务与踝关节活动和下肢力量练习对应；进度与得分让训练过程可见。原型结合头显、动作感知及心率观察，支持医护人员了解训练状态。",
          en: "Collecting, sowing, and watering in a virtual environment are mapped to ankle mobility and lower-limb strengthening. Progress and scores make the session visible. The prototype combines a headset, motion sensing, and heart-rate observation to support staff oversight.",
        },
        details: [
          {
            zh: "合作 PPT 展示了收集种子、播种、浇灌等连续任务，将真实的踝关节背屈、跖屈和下肢动作转译为虚拟环境中的目标。任务进度、得分和反馈使患者与医护都更容易看见一次训练如何推进。",
            en: "The collaboration deck shows a sequence of collecting seeds, sowing, and watering. Ankle dorsiflexion, plantarflexion, and lower-limb movements are translated into goals in the virtual environment. Progress, scores, and feedback make a session easier for patients and staff to follow.",
          },
          {
            zh: "技术组合包括 VR 头显、下肢动作传感与心率观察。这里的传感和反馈是用于支持训练组织与研究记录的原型能力，不能替代临床监护或自行判断运动是否适宜。",
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
        title: { zh: "关注动作完成、参与体验与床旁适用性。", en: "Evaluate movement, engagement, and bedside fit." },
        text: {
          zh: "研究重点是任务是否能准确对应训练动作、患者能否理解并持续参与，以及系统如何安全地嵌入现有康复流程。页面不将训练反馈等同于已经证实的临床效果。",
          en: "The study asks whether virtual tasks correspond to intended movements, whether patients can understand and sustain participation, and how the system fits existing rehabilitation workflows. Feedback is not presented as proven clinical efficacy.",
        },
        details: [
          {
            zh: "评估重点包括动作与虚拟任务映射是否清晰、患者对任务的理解和持续参与、训练过程能否被记录，以及医护如何在不增加额外复杂度的前提下使用系统。材料中的“提升积极性”“减轻负担”是研究目标，需要以具体研究结果验证。",
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
        title: { zh: "从床旁原型，延伸到更完整的围术期研究网络。", en: "A bedside prototype within a wider perioperative research network." },
        text: {
          zh: "VR 床旁康复是实验室围术期研究的一条明确路径，与 AR 患者宣教及独立的可穿戴监测课题相邻，但不等同。合作材料还汇集了实验室在沉浸交互、康复与智能感知方面的研究展示。",
          en: "Bedside VR rehabilitation is one distinct line of the lab’s perioperative work. It sits beside AR patient education and a separate wearable-sensing project, but should not be conflated with either. The collaboration materials also show the lab’s broader work in immersive interaction, rehabilitation, and sensing.",
        },
        details: [
          {
            zh: "下方图示保留原始 PPT 对多项研究的视觉梳理，以帮助读者理解项目所属的合作背景；其中包含规划或投稿中的内容，不作为这一个 VR 项目已发表成果清单。经核实的论文与 PDF 可在网站“精选发表论文集”中查看。",
            en: "The figures below retain the source deck’s visual map of related work to show the collaboration context. They include planned or submitted items and are not a list of confirmed publications from this VR project. Verified papers and PDFs appear in the site’s Selected Publications section.",
          },
        ],
        images: [
          {
            src: "/images/projects/perioperative-technology-map.jpg",
            alt: { zh: "原始 PPT 展示的 AR 宣教、VR 锻炼及独立可穿戴监测三条研究线", en: "Source-deck map of AR education, VR exercise, and a separate wearable-monitoring research line" },
            caption: { zh: "合作研究布局 / 三条相邻但不同的技术路线", en: "COLLABORATION MAP / THREE RELATED BUT DISTINCT PATHWAYS" },
          },
          {
            src: "/images/projects/lab-research-outputs.jpg",
            alt: { zh: "原始 PPT 中的实验室相关学术研究展示图", en: "Lab-wide research overview image from the source presentation" },
            caption: { zh: "实验室研究图示 / 包含规划或投稿内容，不代表已发表的本项目成果", en: "LAB RESEARCH OVERVIEW / INCLUDES PLANNED OR SUBMITTED WORK, NOT CONFIRMED OUTPUTS OF THIS PROJECT" },
          },
        ],
      },
    ],
  },
];
