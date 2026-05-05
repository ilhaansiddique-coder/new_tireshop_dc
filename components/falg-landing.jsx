/* global React, DCRegSearch, DCTire, DCIcons */
const { useState } = React;
const { IconArrow } = DCIcons;

/* ── Dimension data for rims ─────────────── */
const RIM_INCH   = ["15","16","17","18","19","20","21","22","23"];
const RIM_BOLT   = ["4x100","4x108","5x100","5x108","5x112","5x114.3","5x120","5x130","6x114.3","6x139.7"];
const RIM_WIDTH  = ["6.0","6.5","7.0","7.5","8.0","8.5","9.0","9.5","10.0"];

const BRANDS = [
  { name: "BBS",          tag: "Premium" },
  { name: "OZ Racing",    tag: "Sport" },
  { name: "Rotiform",     tag: "Premium" },
  { name: "Vossen",       tag: "Premium" },
  { name: "Enkei",        tag: "Sport" },
  { name: "Rial" },
  { name: "Ronal" },
  { name: "Borbet" },
  { name: "MAK" },
  { name: "ATS" },
  { name: "Brock" },
  { name: "DC Wheels",    tag: "Eget" }
];

/* ── Dimension search ── */
function FlDimSearch() {
  const [inch,  setInch]  = useState("19");
  const [bolt,  setBolt]  = useState("5x112");
  const [width, setWidth] = useState("8.0");

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ inch, bolt, width });
    window.location.href = `dackvalj.html?type=falg&${params.toString()}`;
  };

  return (
    <form className="dl-dim" onSubmit={submit}>
      <div className="dl-dim-label">SÖK PÅ DIMENSION</div>
      <div className="dl-dim-row">
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Tum</span>
          <select value={inch} onChange={(e) => setInch(e.target.value)}>
            {RIM_INCH.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <span className="dl-dim-sep" aria-hidden="true">·</span>
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Bultmönster</span>
          <select value={bolt} onChange={(e) => setBolt(e.target.value)}>
            {RIM_BOLT.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <span className="dl-dim-sep" aria-hidden="true">·</span>
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Bredd (J)</span>
          <select value={width} onChange={(e) => setWidth(e.target.value)}>
            {RIM_WIDTH.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <button type="submit" className="dl-dim-cta">
          Sök <IconArrow size={15}/>
        </button>
      </div>
      <div className="dl-dim-preview">
        Du söker: <b>{inch}″ · {bolt} · {width}J</b>
      </div>
    </form>
  );
}

/* ── Brand search ── */
function FlBrandSearch() {
  const [filter, setFilter] = useState("");
  const filtered = BRANDS.filter(b => b.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="fl-brands">
      <div className="dl-dim-label">SÖK PÅ VARUMÄRKE</div>
      <div className="fl-brand-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrera varumärken…"
          aria-label="Filtrera varumärken"
        />
      </div>
      <div className="fl-brand-grid">
        {filtered.map(b => (
          <a
            key={b.name}
            href={`dackvalj.html?type=falg&brand=${encodeURIComponent(b.name)}`}
            className="fl-brand-tile"
          >
            <span className="fl-brand-name">{b.name}</span>
            {b.tag && <span className="fl-brand-tag">{b.tag}</span>}
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="fl-brand-empty">Inga varumärken matchar "{filter}".</div>
        )}
      </div>
    </div>
  );
}

/* ── Tab switcher ── */
function FlSearchTabs() {
  const [tab, setTab] = useState("regnr"); // regnr | dim | brand
  const TABS = [
    { id: "regnr", label: "Regnummer" },
    { id: "dim",   label: "Dimension" },
    { id: "brand", label: "Varumärke" },
  ];

  return (
    <div className="fl-search">
      <div className="fl-tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`fl-tab ${tab === t.id ? "is-on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="fl-search-body">
        {tab === "regnr" && (
          <DCRegSearch
            label="Ditt regnummer"
            dark
            help="Vi visar fälgar som passar din bil — gratis, ingen registrering."
          />
        )}
        {tab === "dim"   && <FlDimSearch/>}
        {tab === "brand" && <FlBrandSearch/>}
      </div>
    </div>
  );
}

/* ── Hero ── */
function FalgHero() {
  return (
    <section className="dl-hero">
      <div className="container">
        <div className="dl-hero-inner">
          <div className="dl-hero-text">
            <span className="dl-hero-eyebrow">
              <span className="dot"/> Sök fälg
            </span>
            <h1>
              Hitta rätt fälg —<br/>
              <em>på tre sätt.</em>
            </h1>
            <p>
              Sök på regnummer för en exakt match till din bil, plocka fram en
              specifik dimension, eller bläddra direkt bland varumärkena.
            </p>

            <FlSearchTabs/>
          </div>

          <div className="dl-hero-visual">
            <DCTire size="86%"/>
            <div className="dl-hero-glow" aria-hidden="true"/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Popular sizes (rim-style) ── */
const POPULAR_RIMS = [
  '17″ · 5x112',
  '18″ · 5x112',
  '19″ · 5x112',
  '17″ · 5x108',
  '18″ · 5x108',
  '19″ · 5x114.3',
  '20″ · 5x120',
  '20″ · 5x114.3',
  '21″ · 5x112',
];

function FalgPopular() {
  return (
    <section className="dl-popular">
      <div className="container">
        <div className="dl-popular-head">
          <span className="eyebrow">Vanliga dimensioner</span>
          <h2>Hoppa direkt till en fälgstorlek</h2>
        </div>
        <div className="dl-popular-grid">
          {POPULAR_RIMS.map(s => (
            <a key={s} href={`dackvalj.html?type=falg&dim=${encodeURIComponent(s)}`} className="dl-popular-tile">
              <span className="dl-popular-size">{s}</span>
              <span className="dl-popular-arrow"><IconArrow size={14}/></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── USP ── */
function FalgUSP() {
  return (
    <section className="dl-usp">
      <div className="container">
        <div className="dl-usp-grid">
          <div className="dl-usp-item">
            <div className="dl-usp-num">01</div>
            <h3>Garanterat passform</h3>
            <p>Vi matchar fälgar mot bultmönster, ET och centrumhål — ingen risk för felköp.</p>
          </div>
          <div className="dl-usp-item">
            <div className="dl-usp-num">02</div>
            <h3>Renovering inhouse</h3>
            <p>Skadade fälgar? Vi riktar, slipar och pulverlackerar i egen verkstad.</p>
          </div>
          <div className="dl-usp-item">
            <div className="dl-usp-num">03</div>
            <h3>Komplett hjul-paket</h3>
            <p>Köp däck och fälg ihop — vi monterar, balanserar och skickar dig hem rullande.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Page wrapper ── */
function FalgLanding() {
  return (
    <>
      <FalgHero/>
      <FalgPopular/>
      <FalgUSP/>
    </>
  );
}

window.DCFalgLanding = FalgLanding;
