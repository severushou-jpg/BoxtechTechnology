# Boxtech Technology

Official bilingual website for the Intelligent Interaction Laboratory (智能交互技术研究实验室), presenting its work in extended reality, millimetre-wave radar, smart sensing, healthcare, and education, with Boxtech supporting research translation and real-world deployment.

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
- Former research assistant profiles live in `src/alumni.ts`, separately from current team members. `src/AlumniViews.tsx` renders the three-column directory and bilingual `/alumni/:slug` detail pages. Add a profile to the data list to create its page and directory entry; keep education, offers, and employment distinct, and only add verified dates.
- Alumni portrait framing uses the original supplied screenshots in `public/images/alumni/`, with source dimensions and photograph bounds stored in each profile. No generated portraits are used. Replace the source and update its dimensions/bounds if an original portrait becomes available.
- Add new papers to the `publications` array and keep the owner order `lijie`, `haonan`, `renzhi`.
- Put public downloadable documents in `public/papers/`, team images in `public/images/`, and opening-film assets in `public/media/`.
- Research opportunities and their bilingual detail-page content live in `src/recruitment.ts`. Add a record with a unique `slug` and `order`; set `published: false` to hide a project, or change `status` to `upcoming` / `closed`.
- Each project's optional `references` list supports a title, citation, DOI URL, and local PDF URL. Project-related PDFs are stored in `public/papers/related/`; omit `pdf` when no file is available. Titles open the PDF when available, otherwise the DOI. Keep reference order aligned with any numbered citations in the project text.
- Renzhi Han intentionally has no displayed company title until an official title is confirmed.
- Do not publish the source company-introduction PDF; it is an internal reference document.

## Deployment

The project is a Vite/React static site configured for Vercel through `vercel.json`. Import the repository into Vercel or run `vercel --prod` from the project root.

## Design and accessibility

The site includes a generated 7-second research film with a still-image fallback, a reduced-motion-safe opening state, keyboard skip link, semantic publication filters and links, responsive navigation, image lazy loading, and Chinese/English language persistence.
