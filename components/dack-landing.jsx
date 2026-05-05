/* global React, DCRegSearch, DCTire, DCIcons */
const { useState } = React;
const { IconArrow } = DCIcons;

/* ── Dimension search — width / profile / diameter selects ── */
const WIDTHS    = ["155","165","175","185","195","205","215","225","235","245","255","265","275","285","295"];
const PROFILES  = ["30","35","40","45","50","55","60","65","70","75","80"];
const DIAMETERS = ["13","14","15","16","17","18","19","20","21","22"];

function DimSearch() {
  const [w, setW] = useState("235");
  const [p, setP] = useState("35");
  const [d, setD] = useState("20");

  const submit = (e) => {
    e.preventDefault();
    const dim = `${w}/${p}R${d}`;
    window.location.href = `dackvalj.html?dim=${encodeURIComponent(dim)}`;
  };

  return (
    <form className="dl-dim" onSubmit={submit}>
      <div className="dl-dim-label">SÖK PÅ DIMENSION</div>
      <div className="dl-dim-row">
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Bredd</span>
          <select value={w} onChange={(e) => setW(e.target.value)}>
            {WIDTHS.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <span className="dl-dim-sep">/</span>
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Profil</span>
          <select value={p} onChange={(e) => setP(e.target.value)}>
            {PROFILES.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <span className="dl-dim-sep dl-dim-sep--R">R</span>
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Tum</span>
          <select value={d} onChange={(e) => setD(e.target.value)}>
            {DIAMETERS.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <button type="submit" className="dl-dim-cta">
          Sök <IconArrow size={15}/>
        </button>
      </div>
      <div className="dl-dim-preview">
        Du söker: <b>{w}/{p}R{d}</b>
      </div>
    </form>
  );
}

/* ── Popular sizes — quick links ── */
const POPULAR = [
  "205/55R16", "215/55R17", "225/45R17",
  "225/40R18", "235/35R19", "235/35R20",
  "245/40R18", "255/35R19", "275/40R20",
];

function PopularSizes() {
  return (
    <section className="dl-popular">
      <div className="container">
        <div className="dl-popular-head">
          <span className="eyebrow">Vanliga dimensioner</span>
          <h2>Hoppa direkt till en storlek</h2>
        </div>
        <div className="dl-popular-grid">
          {POPULAR.map(s => (
            <a key={s} href={`dackvalj.html?dim=${encodeURIComponent(s)}`} className="dl-popular-tile">
              <span className="dl-popular-size">{s}</span>
              <span className="dl-popular-arrow"><IconArrow size={14}/></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Three reassurance points ── */
function DackUSP() {
  return (
    <section className="dl-usp">
      <div className="container">
        <div className="dl-usp-grid">
          <div className="dl-usp-item">
            <div className="dl-usp-num">01</div>
            <h3>Passar din bil — garanterat</h3>
            <p>Vi matchar dimensioner mot din bilmodell. Inga felköp.</p>
          </div>
          <div className="dl-usp-item">
            <div className="dl-usp-num">02</div>
            <h3>Montering på samma adress</h3>
            <p>Köp däcken — vi monterar och balanserar i verkstaden bakom butiken.</p>
          </div>
          <div className="dl-usp-item">
            <div className="dl-usp-num">03</div>
            <h3>14 dagars öppet köp</h3>
            <p>Hittar du fel storlek eller modell? Vi byter, omonterat.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hero — dark, big regnr search ── */
function DackHero() {
  return (
    <section className="dl-hero">
      <div className="container">
        <div className="dl-hero-inner">
          <div className="dl-hero-text">
            <span className="dl-hero-eyebrow">
              <span className="dot"/> Sök på regnummer
            </span>
            <h1>
              Skriv in regnumret —<br/>
              <em>vi visar vad som passar.</em>
            </h1>
            <p>
              Skriv in ditt regnummer så hittar vi däcken som passar exakt din bil.
              Helt gratis. Ingen registrering. Och vi monterar i samma hus.
            </p>

            <DCRegSearch
              label="Ditt regnummer"
              dark
              help="Vi sparar inget — sökningen sker bara här."
            />

            <div className="dl-hero-or">
              <span>eller</span>
            </div>

            <DimSearch/>
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

/* ── Page wrapper ── */
function DackLanding() {
  return (
    <>
      <DackHero/>
      <PopularSizes/>
      <DackUSP/>
    </>
  );
}

window.DCDackLanding = DackLanding;
window.DCDackHero = DackHero;
