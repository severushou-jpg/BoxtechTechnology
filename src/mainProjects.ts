export type ProjectLanguage = "zh" | "en";
export type ProjectText = Record<ProjectLanguage, string>;

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
      },
      {
        label: { zh: "交互设计", en: "THE INTERACTION" },
        title: { zh: "把流程变成可观看、可提问的空间叙事。", en: "Turn a care pathway into a spatial story to explore." },
        text: {
          zh: "增强现实绘本结合三维情境演示、关键步骤说明、互动问答与知识回顾。患者可以按自己的节奏理解手术前后的配合事项，医护人员也能借助统一的材料进行讲解。",
          en: "The AR storybook combines 3D demonstrations, explanations of key steps, interactive questions, and knowledge review. Patients can explore at their own pace while clinicians use a consistent resource to support conversations.",
        },
      },
      {
        label: { zh: "评估方向", en: "WHAT WE STUDY" },
        title: { zh: "检验理解与沟通体验，而非只展示技术。", en: "Study understanding and communication, not just the technology." },
        text: {
          zh: "研究关注患者对流程的理解、重复查看信息的便利性，以及宣教材料如何融入临床工作。相关原型与临床应用仍需通过研究评估，不将设计目标表述为已证实的疗效。",
          en: "The research examines patients’ understanding, the value of revisiting information, and how the material fits clinical education. Prototype aims are presented as research questions rather than proven clinical outcomes.",
        },
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
      },
      {
        label: { zh: "系统原型", en: "THE PROTOTYPE" },
        title: { zh: "用游戏任务承接真实的康复动作。", en: "Connect real rehabilitation movements to game tasks." },
        text: {
          zh: "虚拟场景中的收集、播种、浇灌等任务与踝关节活动和下肢力量练习对应；进度与得分让训练过程可见。原型结合头显、动作感知及心率观察，支持医护人员了解训练状态。",
          en: "Collecting, sowing, and watering in a virtual environment are mapped to ankle mobility and lower-limb strengthening. Progress and scores make the session visible. The prototype combines a headset, motion sensing, and heart-rate observation to support staff oversight.",
        },
      },
      {
        label: { zh: "评估方向", en: "WHAT WE STUDY" },
        title: { zh: "关注动作完成、参与体验与床旁适用性。", en: "Evaluate movement, engagement, and bedside fit." },
        text: {
          zh: "研究重点是任务是否能准确对应训练动作、患者能否理解并持续参与，以及系统如何安全地嵌入现有康复流程。页面不将训练反馈等同于已经证实的临床效果。",
          en: "The study asks whether virtual tasks correspond to intended movements, whether patients can understand and sustain participation, and how the system fits existing rehabilitation workflows. Feedback is not presented as proven clinical efficacy.",
        },
      },
    ],
  },
];
