import { alumni, type AlumniProfile } from "./alumni";

type Lang = "zh" | "en";

function AlumniPortrait({ profile, lang, eager = false }: { profile: AlumniProfile; lang: Lang; eager?: boolean }) {
  const { source, width, height, crop } = profile.portrait;
  return (
    <div className="alumni-portrait">
      <div className="alumni-portrait-crop" style={{ aspectRatio: `${crop.width} / ${crop.height}` }}>
        <img
          src={source}
          alt={profile.name[lang]}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          style={{
            width: `${width / crop.width * 100}%`,
            height: `${height / crop.height * 100}%`,
            left: `${-crop.x / crop.width * 100}%`,
            top: `${-crop.y / crop.height * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function AlumniSection({ lang }: { lang: Lang }) {
  return (
    <section className="alumni-section warm-section" id="alumni" data-nav-section="team" aria-labelledby="alumni-title">
      <div className="section-frame">
        <div className="section-heading reveal">
          <div className="eyebrow"><span />{lang === "zh" ? "我们的往届成员" : "OUR ALUMNI"}</div>
          <h2 id="alumni-title">{lang === "zh" ? "往届研究助理与毕业去向" : "RA Alumni & Graduate Pathways"}</h2>
          <p>{lang === "zh" ? "从实验室里的研究问题，走向更广阔的学术与职业实践。认识曾与我们共同探索的研究助理，以及他们各自延续的方向。" : "From questions explored in the laboratory to new academic and professional settings. Meet former research assistants and discover where their interests have taken them."}</p>
        </div>
        <div className="alumni-grid">
          {alumni.map((profile, index) => (
            <a className="alumni-card reveal" href={`/alumni/${profile.slug}`} key={profile.slug} aria-labelledby={`alumni-name-${profile.slug}`}>
              <div className="alumni-card-photo">
                <AlumniPortrait profile={profile} lang={lang} />
                <span className="alumni-photo-index" aria-hidden="true">A.{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="alumni-card-content">
                <span className="alumni-role">{lang === "zh" ? "往届研究助理" : "FORMER RESEARCH ASSISTANT"}</span>
                <h3 id={`alumni-name-${profile.slug}`}>{profile.name[lang]}</h3>
                <small className="alumni-secondary-name">{profile.name[lang === "zh" ? "en" : "zh"]}</small>
                <div className="alumni-destination">
                  <span>{lang === "zh" ? "后续深造" : "GRADUATE STUDY"}</span>
                  <strong>{profile.institution[lang]}</strong>
                  <p>{profile.programme[lang]}</p>
                </div>
                <p className="alumni-summary">{profile.summary[lang]}</p>
                <span className="alumni-profile-link">{lang === "zh" ? "查看个人介绍" : "View profile"}<i aria-hidden="true">↗</i></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AlumniDetailPage({ profile, lang }: { profile: AlumniProfile; lang: Lang }) {
  return (
    <main className="alumni-detail-main" id="main" tabIndex={-1}>
      <section className="alumni-profile-hero dark-section" id="alumni-profile" data-nav-section="team" aria-labelledby="alumni-profile-name">
        <div className="section-frame">
          <a className="project-back-link" href="/#alumni"><span aria-hidden="true">←</span>{lang === "zh" ? "返回往届研究助理" : "Back to RA alumni"}</a>
          <div className="alumni-profile-hero-grid">
            <div className="alumni-profile-heading">
              <span className="alumni-role">I²Lab / {lang === "zh" ? "往届研究助理" : "RA ALUMNI"}</span>
              <h1 id="alumni-profile-name">{profile.name[lang]}</h1>
              <p className="alumni-profile-other-name">{profile.name[lang === "zh" ? "en" : "zh"]}</p>
              <div className="alumni-destination">
                <span>{lang === "zh" ? "后续深造" : "GRADUATE STUDY"}</span>
                <strong>{profile.institution[lang]}</strong>
                <p>{profile.programme[lang]}</p>
              </div>
              <p className="alumni-profile-summary">{profile.summary[lang]}</p>
            </div>
            <AlumniPortrait profile={profile} lang={lang} eager />
          </div>
        </div>
      </section>
      <section className="alumni-profile-body light-section">
        <div className="section-frame project-detail-content">
          <aside className="project-detail-aside alumni-interests">
            <span>{lang === "zh" ? "研究方向" : "RESEARCH INTERESTS"}</span>
            <ul>{profile.interests.map(interest => <li key={interest.en}>{interest[lang]}</li>)}</ul>
          </aside>
          <div className="project-detail-sections">
            {profile.sections.map((section, index) => (
              <article className="project-detail-section reveal" key={section.title.en}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.title[lang]}</h2>
                <div>{section.paragraphs.map(paragraph => <p key={paragraph.en}>{paragraph[lang]}</p>)}</div>
              </article>
            ))}
            <div className="alumni-profile-footer">
              <a className="text-button" href="/#alumni">{lang === "zh" ? "查看其他往届成员" : "Meet other RA alumni"}<span aria-hidden="true">↗</span></a>
              <a className="text-button" href="/#opportunities">{lang === "zh" ? "探索研究机会" : "Explore research opportunities"}<span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
