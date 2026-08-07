# Boxtech Technology

Official bilingual company website for Ningbo Boxtech Technology Co., Ltd. (宁波纸合科技有限公司), presenting its research-driven work in extended reality, millimetre-wave radar, smart sensing, healthcare, and education.

## Local development

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Content maintenance

- Team, advisor, and publication records live in `src/App.tsx`.
- Add new papers to the `publications` array and keep the owner order `lijie`, `haonan`, `renzhi`.
- Put public downloadable documents in `public/papers/`, team images in `public/images/`, and opening-film assets in `public/media/`.
- Renzhi Han intentionally has no displayed company title until an official title is confirmed.
- Do not publish the source company-introduction PDF; it is an internal reference document.

## Deployment

The project is a Vite/React static site configured for Vercel through `vercel.json`. Import the repository into Vercel or run `vercel --prod` from the project root.

## Design and accessibility

The site includes a generated 7-second research film with a still-image fallback, a reduced-motion-safe opening state, keyboard skip link, semantic publication filters and links, responsive navigation, image lazy loading, and Chinese/English language persistence.
