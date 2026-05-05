/* global React, DCRegSearch, DCTire, DCIcons */
const { useState } = React;
const { IconArrow, IconCheck } = DCIcons;

/* ── Wheel package data ─────────────── */
const KH_INCH    = ["15","16","17","18","19","20","21"];
const KH_SEASON  = ["Sommar","Vinter (dubb)","Vinter (dubbfri)","Helår"];
const KH_PROFILE = ["Standard","Sport","Premium","SUV / 4x4"];

const CAR_BRANDS = [
  "Volvo", "BMW", "Audi", "Mercedes-Benz", "Volkswagen",
  "Tesla", "Skoda", "Ford", "Toyota", "Kia",
  "Hyundai", "Peugeot", "Renault", "Polestar", "Porsche",
  "Mini", "Land Rover", "Mazda", "Nissan", "Opel"
];

/* ── Dimension search (rim inch + season) ── */
function KhDimSearch() {
  const [inch,    setInch]    = useState("19");
  const [season,  setSeason]  = useState("Sommar");
  const [profile, setProfile] = useState("Premium");

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ inch, season, profile });
    window.location.href = `dackvalj.html?type=hjul&${params.toString()}`;
  };

  return (
    <form className="dl-dim" onSubmit={submit}>
      <div className="dl-dim-label">SÖK PÅ DIMENSION & SÄSONG</div>
      <div className="dl-dim-row">
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Tum</span>
          <select value={inch} onChange={(e) => setInch(e.target.value)}>
            {KH_INCH.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <span className="dl-dim-sep" aria-hidden="true">·</span>
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Säsong</span>
          <select value={season} onChange={(e) => setSeason(e.target.value)}>
            {KH_SEASON.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <span className="dl-dim-sep" aria-hidden="true">·</span>
        <div className="dl-dim-field">
          <span className="dl-dim-cap">Profil</span>
          <select value={profile} onChange={(e) => setProfile(e.target.value)}>
            {KH_PROFILE.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <button type="submit" className="dl-dim-cta">
          Sök <IconArrow size={15}/>
        </button>
      </div>
      <div className="dl-dim-preview">
        Du söker: <b>{inch}″ · {season} · {profile}</b>
      </div>
    </form>
  );
}

/* ── Car brand search ── */
function KhBrandSearch() {
  const [filter, setFilter] = useState("");
  const filtered = CAR_BRANDS.filter(b => b.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="fl-brands">
      <div className="dl-dim-label">SÖK PÅ BILMÄRKE</div>
      <div className="fl-brand-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrera bilmärken…"
          aria-label="Filtrera bilmärken"
        />
      </div>
      <div className="fl-brand-grid">
        {filtered.map(b => (
          <a
            key={b}
            href={`dackvalj.html?type=hjul&car=${encodeURIComponent(b)}`}
            className="fl-brand-tile"
          >
            <span className="fl-brand-name">{b}</span>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="fl-brand-empty">Inga bilmärken matchar "{filter}".</div>
        )}
      </div>
    </div>
  );
}

/* ── Tab switcher ── */
function KhSearchTabs() {
  const [tab, setTab] = useState("regnr");
  const TABS = [
    { id: "regnr", label: "Regnummer" },
    { id: "dim",   label: "Dimension" },
    { id: "brand", label: "Bilmärke"  },
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
            help="Vi visar kompletta hjul som passar din bil — gratis, ingen registrering."
          />
        )}
        {tab === "dim"   && <KhDimSearch/>}
        {tab === "brand" && <KhBrandSearch/>}
      </div>
    </div>
  );
}

/* ── Hero ── */
function KhHero() {
  return (
    <section className="dl-hero">
      <div className="container">
        <div className="dl-hero-inner">
          <div className="dl-hero-text">
            <span className="dl-hero-eyebrow">
              <span className="dot"/> Sök kompletta hjul
            </span>
            <h1>
              Däck och fälg —<br/>
              <em>klart att rulla.</em>
            </h1>
            <p>
              Färdigmonterade och balanserade hjul, levererade i set om fyra.
              Sök på regnummer, dimension eller bilmärke — vi hittar paketet som passar.
            </p>

            <KhSearchTabs/>
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

/* ── Popular packages ── */
const POPULAR_PACKAGES = [
  '17″ · Sommar · Volvo XC60',
  '18″ · Sommar · BMW 3-serie',
  '19″ · Sommar · Audi A6',
  '17″ · Vinter dubb · Volvo V70',
  '18″ · Vinter dubb · BMW X3',
  '19″ · Vinter dubbfri · Tesla Model 3',
  '20″ · Sommar · Audi Q5',
  '18″ · Helår · Skoda Kodiaq',
  '21″ · Sommar · Porsche Cayenne',
];

function KhPopular() {
  return (
    <section className="dl-popular">
      <div className="container">
        <div className="dl-popular-head">
          <span className="eyebrow">Populära paket</span>
          <h2>Färdiga set som många väljer</h2>
        </div>
        <div className="dl-popular-grid">
          {POPULAR_PACKAGES.map(s => (
            <a key={s} href={`dackvalj.html?type=hjul&pkg=${encodeURIComponent(s)}`} className="dl-popular-tile">
              <span className="dl-popular-size">{s}</span>
              <span className="dl-popular-arrow"><IconArrow size={14}/></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── What's included ── */
function KhIncluded() {
  const items = [
    "Däck monterade på fälg",
    "Balanserade och tryckkontrollerade",
    "Ventiler och muttrar (vid behov)",
    "Levererat i set om fyra",
    "Klart för montering — eller boka skifte hos oss",
    "14 dagars öppet köp"
  ];
  return (
    <section className="dl-usp" style={{paddingBottom: 0}}>
      <div className="container">
        <div className="dl-popular-head" style={{marginBottom: 28}}>
          <span className="eyebrow">Det här ingår</span>
          <h2>Ett komplett hjul, redo att monteras</h2>
        </div>
        <ul className="kh-included">
          {items.map(t => (
            <li key={t}>
              <span className="kh-check"><IconCheck size={14} stroke={2.5}/></span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── USP ── */
function KhUSP() {
  return (
    <section className="dl-usp">
      <div className="container">
        <div className="dl-usp-grid">
          <div className="dl-usp-item">
            <div className="dl-usp-num">01</div>
            <h3>Färdigt på en gång</h3>
            <p>Däck och fälg matchas, monteras och balanseras innan du hämtar. Ingen extra verkstadstid.</p>
          </div>
          <div className="dl-usp-item">
            <div className="dl-usp-num">02</div>
            <h3>Bättre pris ihop</h3>
            <p>Köp däck och fälg som paket — billigare än styckvis, och vi tar hand om hela monteringen.</p>
          </div>
          <div className="dl-usp-item">
            <div className="dl-usp-num">03</div>
            <h3>Plats kvar i hotellet</h3>
            <p>Lämna gamla hjulen hos oss för säsongen — 695 kr inkl. tvätt och kontroll.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Page wrapper ── */
function HjulLanding() {
  return (
    <>
      <KhHero/>
      <KhPopular/>
      <KhIncluded/>
      <KhUSP/>
    </>
  );
}

window.DCHjulLanding = HjulLanding;
