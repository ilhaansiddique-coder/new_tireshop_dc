/* global React, ReactDOM, DCHeader, DCTopBar, DCSections, DCIcons, DCRegSearch, DCTire, DCBookingModal */
const { Footer, CTAStrip } = DCSections;
const { IconCheck, IconArrow, IconShield, IconClock, IconSpark } = DCIcons;
const { useState } = React;

window.DCStub = function StubPage({
  title, titleEm, subtitle, lede, price, time, includes,
  features, navIndex
}) {
  const [modalOpen, setModalOpen] = useState(false);

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
      <DCHeader activeIndex={navIndex || 3}/>
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
                  <button
                    onClick={() => setModalOpen(true)}
                    className="btn btn-accent"
                    style={{border:'none',background:'inherit',cursor:'pointer',padding:'inherit'}}
                  >
                    Boka tid <span className="arrow"><IconArrow size={16}/></span>
                  </button>
                  <a href="index.html" className="btn btn-ghost">Andra tjänster</a>
                </div>
              </div>
              <div className="stub-side">
                <div className="eyebrow" style={{marginBottom:8}}>Pris &amp; tid</div>
                <div className="stub-price">{price.split(' ')[0]}<span className="currency"> {price.split(' ').slice(1).join(' ')}</span></div>
                <div className="meta">{time}</div>
                <ul>
                  {includes.map((x,i) => <li key={i}><IconCheck size={18}/> {x}</li>)}
                </ul>
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn btn-accent"
                  style={{width:"100%", justifyContent:"center",border:'none',background:'inherit',cursor:'pointer',padding:'inherit'}}
                >
                  Boka nu
                </button>
              </div>
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
      <DCBookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceTitle={title}
      />
      <Footer/>
    </>
  );
};
