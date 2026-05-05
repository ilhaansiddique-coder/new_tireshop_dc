/* global React, DCIcons, DCSections, DCHeader, DCTopBar */
const { useState, useMemo } = React;
const { IconCheck, IconArrow, IconShield, IconSpark, IconWrench, IconTarget,
        IconClock, IconPhone, IconStar, IconRim } = DCIcons;
const { Footer, CTAStrip } = DCSections;

/* ─────────────────────────────────────
   MODELS — fyra DC Wheels-modeller
   ───────────────────────────────────── */
const MODELS = [
  {
    id: "dc47",
    name: "DC47",
    finish: "Black Machined Face",
    img: "assets/dc-wheels/dc47-black-machined.png",
    tag: "Flerspeke",
    tagline: "Klassisk Y-spoke. Kompromisslös elegans.",
    desc: "DC47 är vår mest tidlösa modell — en evolution av den klassiska Y-spoken med skarpare kanter och djupare konkavitet. Maskinpolerade ekrar mot svartblänk skapar ett dramatiskt djup som passar lika bra på en Audi RS som en Porsche Cayenne.",
    priceFrom: 8900,
    sizes: ["19″", "20″", "21″"],
    widths: ["8.5J", "9.0J", "9.5J", "10.0J", "10.5J"],
    bolts: ["5x108", "5x112", "5x114.3", "5x120"],
    et: "ET25–ET45",
    weight: "10.8 kg (19″)",
    load: "850 kg",
    centerHole: "66.6 mm",
    construction: "Lågtrycksgjuten, T6-värmebehandlad",
    finishes: [
      { id: "bmf", name: "Black Machined Face", swatch: "linear-gradient(135deg, #2a2a2a 0%, #888 50%, #1a1a1a 100%)", available: true },
      { id: "gb", name: "Gloss Black", swatch: "linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 50%, #0a0a0a 100%)", available: true },
      { id: "mgm", name: "Matt Gun Metal", swatch: "linear-gradient(135deg, #4a4a52 0%, #6a6a72 50%, #2a2a32 100%)", available: false }
    ],
    compat: ["Audi A4 / A5 / S4 / RS4", "BMW 3-serie / 4-serie", "Mercedes C-Klass / E-Klass", "Volvo V60 / V90", "Tesla Model 3 / Model Y", "Porsche Macan"]
  },
  {
    id: "dc51",
    name: "DC51",
    finish: "Black Machined Face",
    img: "assets/dc-wheels/dc51-black-machined.png",
    tag: "Mesh",
    tagline: "Aggressiv mesh. Inspirerad av motorsport.",
    desc: "DC51 tar inspiration från GT3-banbilen — komplex mesh-struktur med ekrar som korsar varandra i tre lager. Maskinpolerade kanter mot djupsvart bas. Den passar bilar med attityd: M-paket, AMG, RS — eller den som vill ge en vanlig premium-bil ett ordentligt visuellt avtryck.",
    priceFrom: 9900,
    sizes: ["19″", "20″", "21″", "22″"],
    widths: ["8.5J", "9.0J", "9.5J", "10.0J", "10.5J", "11.0J"],
    bolts: ["5x108", "5x112", "5x114.3", "5x120", "5x130"],
    et: "ET20–ET50",
    weight: "11.4 kg (19″)",
    load: "900 kg",
    centerHole: "66.6 mm",
    construction: "Lågtrycksgjuten, flow-formed läpp",
    finishes: [
      { id: "bmf", name: "Black Machined Face", swatch: "linear-gradient(135deg, #2a2a2a 0%, #888 50%, #1a1a1a 100%)", available: true },
      { id: "gb", name: "Gloss Black", swatch: "linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 50%, #0a0a0a 100%)", available: true },
      { id: "mgm", name: "Matt Gun Metal", swatch: "linear-gradient(135deg, #4a4a52 0%, #6a6a72 50%, #2a2a32 100%)", available: false }
    ],
    compat: ["BMW M3 / M4 / M5", "Mercedes-AMG C63 / E63", "Audi RS4 / RS6", "Porsche 911 / Panamera", "Tesla Model S / Model X", "Range Rover Sport"]
  },
  {
    id: "dc60",
    name: "DC60",
    finish: "Matt Gun Metal Machined Face",
    img: "assets/dc-wheels/dc60-matt-gun-metal.png",
    tag: "Flerspeke",
    tagline: "Stillsamt uttryck. Tekniskt utförd.",
    desc: "DC60 delar grundgeometri med DC47 men i en mer återhållsam ton. Matt gun metal-bas med maskinpolerade aksenter — en mer industriell, teknisk känsla. Idealisk för bilar i mellangrå eller mörka kulörer där en aggressiv finish skulle bli för mycket.",
    priceFrom: 8900,
    sizes: ["19″", "20″", "21″"],
    widths: ["8.5J", "9.0J", "9.5J", "10.0J"],
    bolts: ["5x108", "5x112", "5x114.3", "5x120"],
    et: "ET25–ET45",
    weight: "10.8 kg (19″)",
    load: "850 kg",
    centerHole: "66.6 mm",
    construction: "Lågtrycksgjuten, T6-värmebehandlad",
    finishes: [
      { id: "mgm", name: "Matt Gun Metal Machined", swatch: "linear-gradient(135deg, #4a4a52 0%, #888 50%, #2a2a32 100%)", available: true },
      { id: "bmf", name: "Black Machined Face", swatch: "linear-gradient(135deg, #2a2a2a 0%, #888 50%, #1a1a1a 100%)", available: true },
      { id: "gb", name: "Gloss Black", swatch: "linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 50%, #0a0a0a 100%)", available: false }
    ],
    compat: ["Audi A4 / A6 / Q5", "BMW 5-serie / X3 / X5", "Mercedes E-Klass / GLC", "Volvo V90 / XC60", "Tesla Model Y", "VW Touareg"]
  },
  {
    id: "dc51-gb",
    name: "DC51",
    finish: "Gloss Black",
    img: "assets/dc-wheels/dc51-gloss-black.png",
    tag: "Mesh · Stealth",
    tagline: "All-black. Ren statement.",
    desc: "Samma DC51-design men i full gloss black. Inga maskinpolerade detaljer — bara djupt, blanksvart från läpp till nav. För dig som vill ha mesh-uttrycket utan kontrast: en mörk, sammanhållen helhet som låter formen tala för sig själv.",
    priceFrom: 9900,
    sizes: ["19″", "20″", "21″", "22″"],
    widths: ["8.5J", "9.0J", "9.5J", "10.0J", "10.5J", "11.0J"],
    bolts: ["5x108", "5x112", "5x114.3", "5x120", "5x130"],
    et: "ET20–ET50",
    weight: "11.4 kg (19″)",
    load: "900 kg",
    centerHole: "66.6 mm",
    construction: "Lågtrycksgjuten, flow-formed läpp",
    finishes: [
      { id: "gb", name: "Gloss Black", swatch: "linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 50%, #0a0a0a 100%)", available: true },
      { id: "bmf", name: "Black Machined Face", swatch: "linear-gradient(135deg, #2a2a2a 0%, #888 50%, #1a1a1a 100%)", available: true },
      { id: "mgm", name: "Matt Gun Metal", swatch: "linear-gradient(135deg, #4a4a52 0%, #6a6a72 50%, #2a2a32 100%)", available: false }
    ],
    compat: ["BMW M3 / M4 / M5", "Mercedes-AMG", "Audi RS-modeller", "Porsche 911 / Panamera", "Tesla Model S / Model X", "Range Rover Sport"]
  }
];

/* ─────────────────────────────────────
   HERO
   ───────────────────────────────────── */
function DcwHero({ heroLayout, heroModelId, setHeroModelId }) {
  const model = MODELS.find(m => m.id === heroModelId) || MODELS[0];

  return (
    <section className="dcw-hero" data-layout={heroLayout}>
      <div className="container">
        <div className="crumbs">
          <a href="index.html">Hem</a><span className="sep">/</span>
          <a href="falg.html">Fälgar</a><span className="sep">/</span>
          <span style={{color:"rgba(255,255,255,.7)"}}>DC Wheels</span>
        </div>

        <div className="dcw-hero-grid">
          <div className="dcw-hero-text">
            <span className="eyebrow">
              <span className="dot"/> DC Wheels — vår egen kollektion
            </span>
            <h1>
              Unika fälgar.<br/>
              <em>Från Däckcentrum.</em>
            </h1>
            <p className="dcw-hero-lede">
              DC Wheels är utvecklade och designade av Däckcentrum — skapade för
              dig som vill ha mer än standard. Varje modell är specialbyggd, från
              första skiss till färdig fälg, med fokus på ren design och
              kompromisslös kvalitet.
            </p>
            <div className="dcw-hero-cta">
              <a href="#kollektion" className="btn btn-accent">
                Se kollektionen
                <span className="arrow"><IconArrow size={16}/></span>
              </a>
              <a href="tel:0421608839" className="btn btn-ghost">
                <IconPhone size={16}/> 042-16 08 39
              </a>
            </div>
            <div className="dcw-hero-stats">
              <div>
                <b>4</b>
                <span>specialbyggda modeller</span>
              </div>
              <div>
                <b>19″–22″</b>
                <span>storlekar</span>
              </div>
              <div>
                <b>2 år</b>
                <span>garanti</span>
              </div>
            </div>
          </div>

          <div className="dcw-hero-visual">
            {heroLayout === "centered" ? (
              <div className="dcw-hero-imgwrap">
                {MODELS.map(m => (
                  <img key={m.id} src={m.img} alt={`${m.name} ${m.finish}`}
                       className="dcw-hero-img" loading="eager"/>
                ))}
              </div>
            ) : (
              <div className="dcw-hero-imgwrap is-spinning">
                <div className="dcw-hero-glow"/>
                <img src={model.img} alt={`${model.name} ${model.finish}`}
                     className="dcw-hero-img"/>
                <div className="dcw-hero-strip">
                  {MODELS.map(m => (
                    <button
                      key={m.id}
                      className={`dcw-hero-thumb ${m.id === model.id ? "is-on" : ""}`}
                      onClick={() => setHeroModelId(m.id)}
                      aria-label={`${m.name} ${m.finish}`}
                      title={`${m.name} · ${m.finish}`}
                    >
                      <img src={m.img} alt=""/>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────
   INTRO / MANIFEST
   ───────────────────────────────────── */
function DcwIntro() {
  return (
    <section className="dcw-intro">
      <div className="container">
        <div className="dcw-intro-grid">
          <div>
            <span className="eyebrow">Manifestet</span>
            <h2>
              Det handlar inte<br/>
              <em>bara om fälgar.</em>
            </h2>
          </div>
          <div className="dcw-intro-body">
            <p>
              DC Wheels är ett uttryck. En markering. En möjlighet att göra din
              bil unik — på riktigt.
            </p>
            <p>
              Kollektionen består av <b>fyra distinkta modeller</b>. Alla med sin
              egen karaktär, men med samma DNA: precision, styrka och estetik i
              perfekt balans. Ingen av dem är en kopia av något annat — varje
              fälg är ritad från grunden av oss, gjuten under lågt tryck och
              T6-värmebehandlad för att klara svensk vinter och tysk autobahn
              lika bra.
            </p>
            <p>
              Vi gör inte fälgar för att fylla en hylla. Vi gör dem för dig som
              ser bilen som något mer än ett transportmedel — som en förlängning
              av smaken. Det är därför vi bara har fyra modeller. Vi vill att
              varje en ska kännas värd valet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────
   MODELS GRID — med layoutväxlare
   ───────────────────────────────────── */
function DcwModels({ gridLayout, setGridLayout, onSelect }) {
  return (
    <section className="dcw-models" id="kollektion">
      <div className="container">
        <div className="dcw-models-head">
          <div>
            <span className="eyebrow">Kollektionen</span>
            <h2>
              Fyra specialbyggda modeller.<br/>
              <em>En kollektion utan like.</em>
            </h2>
          </div>
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12}}>
            <p>Klicka på en modell för specifikationer, varianter och bilkompatibilitet.</p>
            <div className="dcw-layout-switch" role="tablist" aria-label="Layout">
              {[
                { id: "grid", label: "Grid" },
                { id: "row", label: "Rad" },
                { id: "carousel", label: "Karusell" }
              ].map(opt => (
                <button
                  key={opt.id}
                  role="tab"
                  aria-selected={gridLayout === opt.id}
                  className={gridLayout === opt.id ? "is-on" : ""}
                  onClick={() => setGridLayout(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {gridLayout === "carousel" ? (
          <div className="dcw-models-carousel">
            <div className="dcw-carousel-track">
              {MODELS.map(m => <ModelCard key={m.id} m={m} onSelect={onSelect}/>)}
            </div>
          </div>
        ) : (
          <div className="dcw-models-grid" data-layout={gridLayout}>
            {MODELS.map(m => <ModelCard key={m.id} m={m} onSelect={onSelect}/>)}
          </div>
        )}
      </div>
    </section>
  );
}

function ModelCard({ m, onSelect }) {
  return (
    <a href="#detalj" className="dcw-model-card"
       onClick={(e) => { e.preventDefault(); onSelect(m.id);
         document.getElementById("detalj")?.scrollIntoView({behavior:"smooth", block:"start"}); }}>
      <div className="dcw-model-imgwrap">
        <img src={m.img} alt={`${m.name} ${m.finish}`} className="dcw-model-img" loading="lazy"/>
      </div>
      <div className="dcw-model-info">
        <div className="dcw-model-meta">
          <span>{m.name}</span>
          <span className="tag">{m.tag}</span>
          <span>{m.sizes[0]}–{m.sizes[m.sizes.length-1]}</span>
        </div>
        <div className="dcw-model-name">{m.name}</div>
        <div className="dcw-model-finish">{m.finish}</div>
        <div className="dcw-model-foot">
          <div className="dcw-model-price">
            <span className="from">FRÅN</span>
            <b>{m.priceFrom.toLocaleString("sv-SE")} kr</b>
          </div>
          <span className="dcw-model-arrow"><IconArrow size={16}/></span>
        </div>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────
   DETAIL — full produktsida för vald modell
   ───────────────────────────────────── */
function DcwDetail({ selectedId, setSelectedId }) {
  const model = MODELS.find(m => m.id === selectedId) || MODELS[0];
  const [size, setSize] = useState(model.sizes[1] || model.sizes[0]);
  const [width, setWidth] = useState(model.widths[2] || model.widths[0]);
  const [bolt, setBolt] = useState(model.bolts[1] || model.bolts[0]);
  const [finishId, setFinishId] = useState(model.finishes[0].id);

  // Reset variant pickers when model changes
  React.useEffect(() => {
    setSize(model.sizes[1] || model.sizes[0]);
    setWidth(model.widths[2] || model.widths[0]);
    setBolt(model.bolts[1] || model.bolts[0]);
    setFinishId(model.finishes[0].id);
  }, [selectedId]);

  // Calculate dynamic price (bigger size = more expensive)
  const sizeIdx = model.sizes.indexOf(size);
  const dynamicPrice = model.priceFrom + sizeIdx * 1200;

  return (
    <section className="dcw-detail" id="detalj">
      <div className="container">
        <div className="dcw-detail-grid">
          <div className="dcw-detail-img">
            <div className="dcw-detail-tabs">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  className={`dcw-detail-tab ${m.id === model.id ? "is-on" : ""}`}
                  onClick={() => setSelectedId(m.id)}
                >
                  {m.name}{m.id === "dc51-gb" ? " GB" : ""}
                </button>
              ))}
            </div>
            <img src={model.img} alt={`${model.name} ${model.finish}`} key={model.id}/>
          </div>

          <div className="dcw-detail-content">
            <span className="eyebrow">DC Wheels · {model.name}</span>
            <h2 className="dcw-detail-name">{model.name}</h2>
            <div className="dcw-detail-finish">{model.finish}</div>
            <p className="dcw-detail-desc">{model.desc}</p>

            {/* Specs */}
            <div className="dcw-specs">
              <div className="dcw-spec">
                <span className="label">Konstruktion</span>
                <span className="value">{model.construction}</span>
              </div>
              <div className="dcw-spec">
                <span className="label">Vikt</span>
                <span className="value">{model.weight}</span>
              </div>
              <div className="dcw-spec">
                <span className="label">Lastindex</span>
                <span className="value">{model.load}</span>
              </div>
              <div className="dcw-spec">
                <span className="label">Centrumhål</span>
                <span className="value">{model.centerHole}</span>
              </div>
              <div className="dcw-spec">
                <span className="label">ET-spann</span>
                <span className="value">{model.et}</span>
              </div>
              <div className="dcw-spec">
                <span className="label">Garanti</span>
                <span className="value">2 år · Material &amp; finish</span>
              </div>
            </div>

            {/* Variant pickers */}
            <div className="dcw-variant-row">
              <span className="dcw-variant-label">Storlek</span>
              <div className="dcw-variant-options">
                {model.sizes.map(s => (
                  <button key={s}
                          className={`dcw-variant-chip ${s === size ? "is-on" : ""}`}
                          onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="dcw-variant-row">
              <span className="dcw-variant-label">Bredd (J)</span>
              <div className="dcw-variant-options">
                {model.widths.map(w => (
                  <button key={w}
                          className={`dcw-variant-chip ${w === width ? "is-on" : ""}`}
                          onClick={() => setWidth(w)}>
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="dcw-variant-row">
              <span className="dcw-variant-label">Bultmönster</span>
              <div className="dcw-variant-options">
                {model.bolts.map(b => (
                  <button key={b}
                          className={`dcw-variant-chip ${b === bolt ? "is-on" : ""}`}
                          onClick={() => setBolt(b)}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="dcw-variant-row">
              <span className="dcw-variant-label">Finish</span>
              <div className="dcw-variant-options">
                {model.finishes.map(f => (
                  <button key={f.id}
                          className={`dcw-variant-chip ${f.id === finishId ? "is-on" : ""} ${!f.available ? "disabled" : ""}`}
                          onClick={() => f.available && setFinishId(f.id)}
                          disabled={!f.available}
                          title={f.available ? f.name : `${f.name} — kommer snart`}>
                    <span style={{
                      display:"inline-block",
                      width:14, height:14,
                      borderRadius:"50%",
                      background:f.swatch,
                      verticalAlign:"middle",
                      marginRight:8,
                      border:"1px solid rgba(0,0,0,.2)"
                    }}/>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy strip */}
            <div className="dcw-detail-buy">
              <div className="price">
                <span className="label">DITT VAL · 4 FÄLGAR</span>
                <b>{(dynamicPrice * 4).toLocaleString("sv-SE")} kr</b>
                <span className="note">
                  {dynamicPrice.toLocaleString("sv-SE")} kr / fälg · {size} · {width} · {bolt}
                </span>
              </div>
              <a href="#kundvagn" className="btn btn-accent">
                Lägg i kundvagn
                <span className="arrow"><IconArrow size={16}/></span>
              </a>
            </div>

            <div className="dcw-detail-trust">
              <div><IconShield size={16} stroke={1.6}/> 2 års garanti</div>
              <div><IconCheck size={16} stroke={2}/> Fri frakt</div>
              <div><IconClock size={16}/> 3–5 dagars leverans</div>
            </div>

            {/* Compatibility */}
            <div className="dcw-compat">
              <h4>Passar bland annat</h4>
              <div className="dcw-compat-list">
                {model.compat.map(c => (
                  <span key={c} className="dcw-compat-chip">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────
   PROCESS — designprocess
   ───────────────────────────────────── */
const PROCESS_STEPS = [
  {
    n: "01",
    t: "Skiss",
    d: "Varje modell börjar som en idé. Vi tecknar för hand, testar proportioner, balanserar ekrar mot rim och nav."
  },
  {
    n: "02",
    t: "3D-modellering",
    d: "Skissen översätts till 3D. Vi simulerar hållfasthet, vikt och belastning innan en gram material gjuts."
  },
  {
    n: "03",
    t: "Lågtrycksgjutning",
    d: "Fälgen gjuts under lågt tryck för homogen struktur — samma teknik som premiumtillverkare i Tyskland och Italien."
  },
  {
    n: "04",
    t: "T6 + finish",
    d: "Värmebehandling enligt T6-standard. Sedan maskinbearbetning och pulverlack i tvåskiktssystem."
  }
];
function DcwProcess() {
  return (
    <section className="dcw-process">
      <div className="container">
        <div className="dcw-process-head">
          <span className="eyebrow">Designprocessen</span>
          <h2>Från första skiss <em>till färdig fälg</em>.</h2>
          <p>
            Vi designar inte fälgar i en katalog. Varje DC Wheels-modell går
            igenom samma fyra steg — från handritad skiss till färdig produkt.
            Det är därför vi bara har fyra modeller.
          </p>
        </div>
        <ol className="dcw-process-steps">
          {PROCESS_STEPS.map(s => (
            <li key={s.n} className="dcw-process-step">
              <div className="num">STEG {s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────
   GALLERY — kundbilar (placeholders)
   ───────────────────────────────────── */
const GALLERY = [
  { size: "large",  car: "Audi RS6 Avant",       model: "DC51 BMF",    color: "#1a1a1a" },
  { size: "medium", car: "BMW M4 Competition",   model: "DC51 GB",     color: "#0d1a2a" },
  { size: "tall",   car: "Tesla Model Y",        model: "DC60 MGM",    color: "#3a3a3a" },
  { size: "wide",   car: "Mercedes E63 AMG",     model: "DC47 BMF",    color: "#1c1410" },
  { size: "medium", car: "Porsche Cayenne",      model: "DC47 BMF",    color: "#2a2018" },
  { size: "tall",   car: "Range Rover Sport",    model: "DC51 GB",     color: "#0e1a14" }
];
function DcwGallery() {
  return (
    <section className="dcw-gallery">
      <div className="container">
        <div className="dcw-gallery-head">
          <div>
            <span className="eyebrow">Kundgalleri</span>
            <h2>Bilar med <em>DC Wheels</em>.</h2>
          </div>
          <p style={{color:"var(--ink-3)", maxWidth:"36ch"}}>
            Ett urval kunder som valt DC Wheels — taggade på Instagram med
            #dcwheels.
          </p>
        </div>
        <div className="dcw-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`dcw-gallery-tile ${g.size}`} style={{background:`linear-gradient(135deg, ${g.color} 0%, #000 100%)`}}>
              <div className="dcw-gallery-placeholder" style={{background:`linear-gradient(135deg, ${g.color} 0%, #000 100%)`}}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5">
                  <path d="M5 28 L8 18 a4 4 0 0 1 4 -3 h16 a4 4 0 0 1 4 3 L35 28 z"/>
                  <circle cx="11" cy="28" r="3"/>
                  <circle cx="29" cy="28" r="3"/>
                </svg>
                <span style={{color:"rgba(255,255,255,.5)"}}>FOTO</span>
              </div>
              <div className="dcw-gallery-meta">
                {g.car} · {g.model}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────
   TRUST / GARANTI
   ───────────────────────────────────── */
function DcwTrust() {
  const items = [
    { icon: <IconShield size={18} stroke={1.6}/>, t: "2 års garanti",        d: "På material och finish. Sprickor eller färgsläpp byts utan diskussion." },
    { icon: <IconCheck size={18} stroke={2}/>,    t: "Testade & godkända",   d: "Belastningstestade enligt JWL och VIA — samma standard som premiumtillverkare." },
    { icon: <IconClock size={18}/>,               t: "3–5 dagars leverans",  d: "Egen lagerhållning i Helsingborg. Ingen väntan på import." },
    { icon: <IconWrench size={18} stroke={1.5}/>, t: "Montering ingår",      d: "Köper du fyra fälgar monterar och balanserar vi gratis i vår verkstad." }
  ];
  return (
    <section className="dcw-trust">
      <div className="container">
        <div className="dcw-trust-grid">
          {items.map(i => (
            <div key={i.t} className="dcw-trust-item">
              <div className="dcw-trust-icon">{i.icon}</div>
              <div className="dcw-trust-text">
                <h4>{i.t}</h4>
                <p>{i.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────
   FAQ
   ───────────────────────────────────── */
const FAQS = [
  {
    q: "Passar DC Wheels min bil?",
    a: "Vi har bultmönster från 5x108 till 5x130 och bredder från 8.5J till 11J — vilket täcker de flesta premiumbilar från Audi, BMW, Mercedes, Porsche, Tesla, Volvo och Range Rover. Skriv in regnumret eller ring oss så bekräftar vi exakt passform."
  },
  {
    q: "Vad ingår i priset?",
    a: "Priset gäller per fälg. Köper du fyra fälgar ingår montering och balansering kostnadsfritt i vår verkstad i Helsingborg. Däck offereras separat — vi har avtal med alla större varumärken och kan paketera kompletta hjul."
  },
  {
    q: "Hur lång leveranstid?",
    a: "3–5 arbetsdagar för standardstorlekar (19–21″) som vi har i lager. För mer ovanliga kombinationer (22″, ovanliga ET) kan det ta 2–3 veckor. Du får alltid besked innan vi tar betalt."
  },
  {
    q: "Vad gäller för garantin?",
    a: "2 års garanti mot materialfel och finish-defekter (sprickor, färgsläpp, korrosion under lacken). Skador från trottoarkant eller olyckor täcks inte — men då gör vi gärna en renovering till bra pris."
  },
  {
    q: "Kan jag prova innan jag köper?",
    a: "Vi har showroom-fälgar att titta och känna på i verkstaden på Musköstgatan 2. Vill du se dem monterade på en specifik bil — boka en konsultation så lägger vi upp dem på en av våra demo-bilar."
  },
  {
    q: "Säljer ni bara till privatpersoner?",
    a: "Nej. Vi har återförsäljarpriser för verkstäder och bilhandlare i Sverige. Kontakta oss för återförsäljaravtal."
  }
];
function DcwFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="dcw-faq">
      <div className="container">
        <div className="dcw-faq-grid">
          <div className="dcw-faq-side">
            <span className="eyebrow">Frågor &amp; svar</span>
            <h2>Det vi får frågor om <em>varje vecka</em>.</h2>
            <p>
              Hittar du inte svaret? Ring 042-16 08 39 eller kom förbi
              verkstaden på Musköstgatan 2 i Helsingborg.
            </p>
          </div>
          <div className="dcw-faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={"dcw-faq-item" + (open === i ? " is-open" : "")}>
                <button className="dcw-faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="dcw-faq-icon" aria-hidden="true"/>
                </button>
                <div className="dcw-faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────
   PAGE WRAPPER (with Tweaks)
   ───────────────────────────────────── */
function DcWheelsPage() {
  // Production: use the design's defaults (no tweaks panel).
  // The DcwModels grid layout switcher (Grid / Rad / Karusell) is still a
  // user-facing feature inside the page — this state is just the initial value.
  const [heroLayout, setHeroLayout] = useState("showcase");
  const [gridLayout, setGridLayout] = useState("grid");
  const [heroModelId, setHeroModelId] = useState(MODELS[0].id);
  const [selectedId, setSelectedId] = useState(MODELS[0].id);

  return (
    <>
      <DCTopBar/>
      <DCHeader activeIndex={4}/>
      <main>
        <DcwHero heroLayout={heroLayout} heroModelId={heroModelId} setHeroModelId={setHeroModelId}/>
        <DcwIntro/>
        <DcwModels gridLayout={gridLayout} setGridLayout={setGridLayout} onSelect={setSelectedId}/>
        <DcwDetail selectedId={selectedId} setSelectedId={setSelectedId}/>
        <DcwProcess/>
        <DcwGallery/>
        <DcwTrust/>
        <DcwFaq/>
        <CTAStrip/>
      </main>
      <Footer/>
    </>
  );
}

window.DCWheelsPage = DcWheelsPage;
