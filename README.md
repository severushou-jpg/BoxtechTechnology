# I²Lab · Intelligent Interaction Laboratory

智能交互技术研究实验室（Intelligent Interaction Laboratory）的中英双语网站，展示研究机会、主要项目、实践影像、团队与精选论文。纸合科技支持相关研究成果的转化与落地。

- 线上网站：[i2lab.vip](https://i2lab.vip)
- 技术栈：React、TypeScript、Vite
- 部署：GitHub 默认分支 `agent/build-company-website` → Vercel

## 当前版本

本版本保留网站现有的配色、版式、导航和大标题设计，完成了以下全站细节优化：

- 已浏览章节随自然滚动逐渐淡出并轻微模糊；上滑时恢复。移动端效果更轻，系统开启“减少动态效果”时关闭该效果，不使用强制翻页或滚动吸附。
- 补齐中文模式中的常见界面文案、研究方向标签和图像说明；论文标题、作者、期刊名、DOI、文件格式及必要的专有名词保持原样。
- 统一提高说明文字、卡片正文、标签与元数据的可读性，保留展示型大标题的原有层级。
- 保留现有开场视频及其静态后备画面；本版本**尚未**制作新的动态背景，也**尚未**替换开场视频。

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
- 研究影像位于 `public/images/research/`；现有开场视频及后备画面位于 `public/media/`。
- 韩仁智的公司职务尚未确认，网站暂不展示该职务。公司介绍等源材料仅供内容参考，不直接发布到网站。

## 下一阶段：等待协作者提交素材与代码

下一次计划更新是**动态背景**与**新的开场视频**。这两项所需元素和实现代码尚待协作者推送到本 GitHub 仓库；本版本不预先实现，也不猜测最终效果。

收到提交后，先核对其分支、提交记录、素材来源和运行方式，再在当前版本上整合；保留现有中英切换、响应式布局、自然滚动、减少动态效果支持，以及视频加载失败时的后备画面。最后运行生产构建，并在桌面、平板、手机上检查中英页面、开场播放与滚动性能，确认无误后再部署。

## 部署

仓库通过 `vercel.json` 配置静态站点与详情页重写规则。当前 GitHub 默认分支为 `agent/build-company-website`，其已连接到 Vercel 的 [i2lab.vip](https://i2lab.vip)。合并协作者代码前，请确认目标分支和 Vercel 部署设置，不要直接覆盖已发布的页面。
