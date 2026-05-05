/* global React, ReactDOM, DCHeader, DCTopBar, DCSections, DCIcons, DCRegSearch, DCTire */
const { Footer, CTAStrip } = DCSections;
const { IconCheck, IconArrow, IconShield, IconClock, IconSpark, IconPhone, IconPin } = DCIcons;

window.DCStub = function StubPage({
  title, titleEm, subtitle, lede, price, time, includes,
  features, navIndex
}) {
  React.useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("in");
    });
  }, []);
  return (
    <>
      <DCTopBar/>
      <DCHeader {...(typeof navIndex === "number" ? {activeIndex: navIndex} : {})}/>
      <main>
        <section className="hero-stub">
          <div className="container">
            <div className="crumbs">
              <a href="index.html">Hem</a><span className="sep">/</span>
              <a href="#">Tjänster</a><span className="sep">/</span>
              <span style={{color:"var(--ink-2)"}}>{title}</span>
            </div>
            <div className="stub-grid">
              <div>
                <span className="eyebrow">{subtitle}</span>
                <h1 style={{marginTop:14}}>{title} <em>{titleEm}</em>.</h1>
                <p className="stub-lede">{lede}</p>
                <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
                  <a href="#" className="btn btn-accent">Boka tid <span className="arrow"><IconArrow size={16}/></span></a>
                  <a href="index.html" className="btn btn-ghost">Andra tjänster</a>
                </div>
              </div>
              <aside className="stub-side">
                <div className="stub-side-tag">
                  <span className="dot"/> Boka tjänst
                </div>

                <div className="stub-side-price">
                  <div className="stub-price">
                    {price.split(' ')[0]}
                    <span className="currency"> {price.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="stub-side-pricecap">Fast pris · inga överraskningar</div>
                </div>

                <div className="stub-side-meta">
                  <span className="stub-side-meta-item">
                    <IconClock size={15}/> {time}
                  </span>
                  <span className="stub-side-meta-item">
                    <IconShield size={15}/> Garanti
                  </span>
                </div>

                <a href="#boka" className="btn btn-accent stub-side-cta">
                  Boka tid online
                  <span className="arrow"><IconArrow size={16}/></span>
                </a>

                <div className="stub-side-divider">
                  <span>Det här ingår</span>
                </div>

                <ul className="stub-side-list">
                  {includes.map((x, i) => (
                    <li key={i}>
                      <span className="stub-side-check"><IconCheck size={12} stroke={2.6}/></span>
                      {x}
                    </li>
                  ))}
                </ul>

                <div className="stub-side-divider">
                  <span>Eller ring direkt</span>
                </div>

                <div className="stub-side-contact">
                  <a className="stub-side-contact-row" href="tel:0421608839">
                    <span className="ic"><IconPhone size={15}/></span>
                    <span>
                      <b>042-16 08 39</b>
                      <em>Mån–fre 07:30–17:00</em>
                    </span>
                  </a>
                  <a className="stub-side-contact-row" href="kontakta-oss.html">
                    <span className="ic"><IconPin size={15}/></span>
                    <span>
                      <b>Musköstgatan 2</b>
                      <em>Helsingborg · drop-in OK</em>
                    </span>
                  </a>
                </div>

                <div className="stub-side-trust">
                  <span className="stub-side-trust-item">
                    <span className="stars" aria-hidden="true">★★★★★</span>
                    4,8 / 5 · 412 omdömen
                  </span>
                  <span className="stub-side-trust-item muted">Auktoriserad däckverkstad</span>
                </div>
              </aside>
            </div>
            <div className="stub-features">
              {features.map((f, i) => (
                <div className="stub-feature" key={i}>
                  <div className="num">0{i+1} / 0{features.length}</div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTAStrip/>
      </main>
      <Footer/>
    </>
  );
};
