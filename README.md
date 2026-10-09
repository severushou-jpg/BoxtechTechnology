# I²Lab · Intelligent Interaction Laboratory

智能交互技术研究实验室（Intelligent Interaction Laboratory）的中英双语网站，展示研究机会、主要项目、实践影像、团队与精选论文。纸合科技支持相关研究成果的转化与落地。

- 线上网站：[i2lab.vip](https://i2lab.vip)
- 技术栈：React、TypeScript、Vite
- 部署：GitHub 默认分支 `agent/build-company-website` → Vercel

## 全站粒子实验分支

`feat/sitewide-particle-dark` 是独立的视觉预览分支，**不改变默认分支或正式站点**。它将学哥的 WebGL2 人机点云作为全站唯一的背景画布：从首页到各个章节及详情页，始终是同一片红色点云，不再在章节边界切换小型粒子图。内容页在同一场景上平滑扩大画面、适当降低亮度，以保留点云的空间感和正文的可读性。旧的浅色阅读界面在这个分支中改为近黑色，并针对正文、卡片、筛选器、链接、滑块和移动端重新调整对比度。

实现文件：`src/UnifiedParticleBackdrop.tsx`、`src/unified-particle-backdrop.css`、`src/PointCloudScene.tsx`、`src/dark-system.css`。桌面共用画布沿用首页的约 10 万粒子配置；窄屏降低采样量，渲染分辨率会在持续掉帧时逐级下降。辉光强度为零时不再执行无效的模糊通道；内容页的粒子流动更明显，但移动端幅度较小。首页点云成形后直接显示实验室名称、研究主张及通往 About 的下一章提示，不使用淡入效果。隐藏标签页时动画暂停，系统设置“减少动态效果”时从静止的成形点云开始。通过 `/#section` 直达后续板块或打开详情页时，跳过首页开场并关闭加载蒙层，避免遮挡内容。全站持续使用 WebGL，性能仍需在目标设备上实测；首页保留手动暂停按钮。

## 当前版本

本版本保留网站现有的配色、版式、导航和大标题设计，完成了以下全站细节优化：

- 实验分支已移除章节滚动虚化、淡入及位移动画；内容始终直接显示，不使用强制翻页或滚动吸附。
- 补齐中文模式中的常见界面文案、研究方向标签和图像说明；论文标题、作者、期刊名、DOI、文件格式及必要的专有名词保持原样。
- 统一提高说明文字、卡片正文、标签与元数据的可读性，保留展示型大标题的原有层级。
- 首页采用网站标志粒子开场，随后形成人机接触点云与三维扩散流场；保留鼠标视角变化、力场扰动及减少动态效果支持。
- 首页使用固定的粒子配置，保留暂停与鼠标交互。姚淏楠的团队照片、双语介绍及团队／研究机会标签已更新。

## 本地开发

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

发布前检查：

```bash
npm run build
```

`npm run build` 会先运行 TypeScript 检查，再生成 Vite 生产文件。可用 `npm run preview` 在本地预览生产构建。

## 页面与内容维护

- 首页章节依次包含 About、Research Opportunities、Main Projects、Work、Team 和 Publications；另外有 `/alumni/:slug`、`/opportunities/:slug`、`/projects/:slug` 详情页。
- 导航、团队、顾问、论文与研究影像内容主要位于 `src/App.tsx`；全站样式位于 `src/styles.css`。
- 往届研究助理资料位于 `src/alumni.ts`，页面组件位于 `src/AlumniViews.tsx`；人像素材位于 `public/images/alumni/`。请区分已完成的学历、在读项目、录取机会与就业经历，仅添加核实过的日期和事实。
- 可申请研究项目及其中英双语详情位于 `src/recruitment.ts`。新增项目时使用唯一 `slug` 和 `order`；`published: false` 可暂时隐藏，`status` 可标为 `open`、`upcoming` 或 `closed`。
- 主要项目及其中英双语详情位于 `src/mainProjects.ts`，配图位于 `public/images/projects/`。围术期 AR 患者宣教与术后 VR 床旁康复是目标不同的两个项目，不应混写成果。
- 论文记录位于 `src/App.tsx` 的 `publications` 数据中；“全部”的展示顺序是李汶锦、郑力杰、姚淏楠、韩仁智。公开 PDF 位于 `public/papers/`；没有 PDF 时不要显示可点击的 PDF 链接。
- 项目相关文献可在 `src/recruitment.ts` 的 `references` 中填写题目、引用、DOI 和 PDF；公开文件位于 `public/papers/related/`。文内序号须与文献顺序一致。
- 研究影像位于 `public/images/research/`；旧开场视频素材保留在 `public/media/`，首页改用粒子开场。点云资源位于 `public/point-cloud/`。
- 韩仁智的公司职务尚未确认，网站暂不展示该职务。公司介绍等源材料仅供内容参考，不直接发布到网站。

## 首页与构建

已移除调参面板、参数保存与恢复、调试预览和重播功能。首页使用固定配置，不读取浏览器中旧的调参数据。源码保持可读，不进行额外混淆。

生产构建关闭源码映射，并移除控制台日志与调试语句。生成工具、详细技术记录和诊断资料保存在维护者本地备份中，不随公开仓库发布。

发布前运行 `npm run build`，并确认首页加载及中英详情页正常。

## 部署

仓库通过 `vercel.json` 配置静态站点与详情页重写规则。当前 GitHub 默认分支为 `agent/build-company-website`，其已连接到 Vercel 的 [i2lab.vip](https://i2lab.vip)。合并协作者代码前，请确认目标分支和 Vercel 部署设置，不要直接覆盖已发布的页面。
