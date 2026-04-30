/* global React, DCIcons, DCTire, DCRegSearch */
const { IconArrow, IconShield, IconSpark, IconLeaf, IconCheck } = DCIcons;

function CountUp({ to, duration = 1600, suffix = "", prefix = "" }) {
  const [v, setV] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf, started = false;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !started) {
        started = true;
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setV(Math.round(eased * to));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
    }, { threshold: .4 });
    io.observe(el);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref}>{prefix}{v.toLocaleString("sv-SE")}{suffix}</span>;
}

function HeroEyebrow({ children }) {
  return <div className="hero-eyebrow"><span className="dot"/>{children}</div>;
}

function HeroStats({ items }) {
  return (
    <div className="hero-stats">
      {items.map((s, i) => (
        <div className="hero-stat" key={i}>
          <div className="num">{s.num}{s.plus && <span className="plus">+</span>}</div>
          <div className="label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Variant 1: classic light "allt under ett tak" ── */
function HeroV1() {
  return (
    <section className="hero" data-variant="1">
      <div className="container hero-grid">
        <div className="hero-text">
          <a href="#boka" className="hero-eyebrow hero-eyebrow-link">
            <span className="dot"/>
            <strong>Vårens däckskifte är öppet</strong>&nbsp;— boka tid
            <span className="arrow"><IconArrow size={14}/></span>
          </a>
          <h1 className="reveal in">
            <span className="ink">Däck, fälg och</span><br/>
            <span className="underline-accent ink">hjulservice</span><br/>
            <em>i samma verkstad.</em>
          </h1>
          <p className="hero-lede reveal in" data-delay="2">
            Vi säljer däck och fälg, sköter däckskifte och däckhotell, balanserar,
            lagar, och ställer in — allt i Helsingborg sedan 1992.
          </p>
          <div className="hero-cta reveal in" data-delay="3">
            <a href="#boka" className="btn btn-accent">Boka tid <span className="arrow"><IconArrow size={16}/></span></a>
            <a href="#tjanster" className="btn btn-ghost">Se tjänster</a>
          </div>
          <DCRegSearch label="Sök på regnummer (valfritt)" help="Hitta däck och fälg som passar exakt din bil."/>
          <div style={{height: 36}}/>
          <HeroStats items={[
            { num: <CountUp to={32} suffix=" år"/>, label: "i branschen" },
            { num: <CountUp to={48000} plus/>, label: "nöjda kunder" },
            { num: <CountUp to={4.9}/>, label: "betyg på Google" }
          ]}/>
        </div>
        <div className="hero-visual reveal in" data-delay="2">
          <DCTire size="100%" className="hero-tire"/>
          <div className="hero-card c1">
            <div className="ic"><IconShield size={18}/></div>
            <div><div className="t">14 dagars öppet köp</div><div className="s">på alla däck &amp; fälg</div></div>
          </div>
          <div className="hero-card c2">
            <div className="ic dark"><IconSpark size={18}/></div>
            <div><div className="t">Däckskifte 595 kr</div><div className="s">inkl. balansering</div></div>
          </div>
          <div className="hero-card c3">
            <div className="ic"><IconLeaf size={18}/></div>
            <div><div className="t">Däckhotell</div><div className="s">från 695 kr / säsong</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Variant 2: dark — "boka tid för säsongen" ── */
function HeroV2() {
  return (
    <section className="hero" data-variant="2">
      <div className="container hero-grid">
        <div className="hero-text">
          <HeroEyebrow><strong>Vårens däckskifte är öppet</strong> — vi hinner ta emot dig denna vecka</HeroEyebrow>
          <h1>
            <span className="ink">Vi tar hand om</span><br/>
            <em>varje millimeter —</em><br/>
            <span className="ink">så du kommer fram.</span>
          </h1>
          <p className="hero-lede">
            Däckskifte, balansering, hjulinställning, punktering och däckhotell.
            En verkstad. Ett team. Tjugo minuter från E4:an.
          </p>
          <div className="hero-cta">
            <a href="#boka" className="btn btn-accent">Boka tid nu <span className="arrow"><IconArrow size={16}/></span></a>
            <a href="#tjanster" className="btn btn-ghost">Våra tjänster</a>
          </div>
          <DCRegSearch label="Sök på regnummer" dark
            help="Visar däck och fälg som passar din bil."/>
          <div style={{height: 36}}/>
          <HeroStats items={[
            { num: <CountUp to={20} suffix=" min"/>, label: "från E4" },
            { num: <CountUp to={6}/>, label: "verkstadsplatser" },
            { num: <CountUp to={595} prefix="" suffix=" kr"/>, label: "däckskifte fr." }
          ]}/>
        </div>
        <div className="hero-visual">
          <DCTire size="92%" className="hero-tire" style={{top:"4%", left:"4%"}}/>
          <div className="hero-card c1">
            <div className="ic"><IconCheck size={18}/></div>
            <div><div className="t">Lediga tider denna vecka</div><div className="s">Mån–fre 07:30–17:00</div></div>
          </div>
          <div className="hero-card c2">
            <div className="ic dark"><IconSpark size={18}/></div>
            <div><div className="t">Hjulinställning</div><div className="s">3D-mätning, 4 hjul</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Variant 3: editorial — big type "Däckcentrum" ── */
function HeroV3() {
  return (
    <section className="hero" data-variant="3">
      <div className="container">
        <div className="hero-grid">
          <div>
            <HeroEyebrow><strong>Helsingborgs däckverkstad</strong> · sedan 1992</HeroEyebrow>
            <h1>
              Däck. Fälg.<br/>
              <em>Kvalitet</em> sedan <span className="underline-accent">1992</span>.
            </h1>
            <p className="hero-lede">
              Allt under ett tak — från första däcket vi rullade in till sista bulten vi drar.
            </p>
            <div className="hero-cta">
              <a href="#boka" className="btn btn-accent">Boka tid <span className="arrow"><IconArrow size={16}/></span></a>
              <a href="#tjanster" className="btn btn-ghost">Se sortiment</a>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="img tall">FOTO · Verkstad</div>
          <div className="center">
            <DCTire size="86%" className="hero-tire"/>
          </div>
          <div>
            <div className="img" style={{aspectRatio:"3/4"}}>FOTO · Däck</div>
            <div style={{height: 24}}/>
            <DCRegSearch label="Sök regnummer" help="Hitta produkter som passar din bil."/>
          </div>
        </div>
      </div>
    </section>
  );
}

window.DCHero = { HeroV1, HeroV2, HeroV3 };
