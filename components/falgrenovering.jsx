/* global React, DCIcons, DCSections, DCHeader, DCTopBar */
const { useState } = React;
const { IconCheck, IconArrow, IconShield, IconSpark, IconWrench, IconTarget,
        IconRefresh, IconClock, IconPhone, IconPin, IconStar, IconRim } = DCIcons;
const { Footer, CTAStrip } = DCSections;

/* ── Hero ─────────────────────── */
function FrHero() {
  return (
    <section className="fr-hero">
      <div className="container">
        <div className="crumbs">
          <a href="index.html">Hem</a><span className="sep">/</span>
          <a href="#">Tjänster</a><span className="sep">/</span>
          <span style={{color:"var(--ink-2)"}}>Fälgrenovering</span>
        </div>
        <div className="fr-hero-grid">
          <div className="fr-hero-text">
            <span className="eyebrow">07 / Fälgrenovering</span>
            <h1>
              Renovera fälgen.<br/>
              <em>Inte plånboken.</em>
            </h1>
            <p className="fr-hero-lede">
              Trottoarkanten gör sitt. Vägsalt gör resten. Innan du köper nya fälgar
              för 12 000 kr — låt oss titta på de du har. Nio av tio gånger blir de
              som nya för en bråkdel av priset.
            </p>
            <div className="fr-hero-cta">
              <a href="#process" className="btn btn-accent">
                Så går det till
                <span className="arrow"><IconArrow size={16}/></span>
              </a>
              <a href="tel:0421608839" className="btn btn-ghost">
                <IconPhone size={16}/> 042-16 08 39
              </a>
            </div>
            <div className="fr-hero-stats">
              <div>
                <b>1 200+</b>
                <span>fälgar / år</span>
              </div>
              <div>
                <b>24h</b>
                <span>till offert</span>
              </div>
              <div>
                <b>12 mån</b>
                <span>garanti</span>
              </div>
            </div>
          </div>

          <div className="fr-hero-visual">
            <FrWheelArt/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Inline SVG of a rim — split before/after ── */
function FrWheelArt() {
  return (
    <div className="fr-wheel-frame">
      <svg viewBox="0 0 400 400" className="fr-wheel-svg" aria-hidden="true">
        <defs>
          <radialGradient id="fr-rim-after" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f4f5f7"/>
            <stop offset="55%" stopColor="#bdc1c8"/>
            <stop offset="100%" stopColor="#5a5d63"/>
          </radialGradient>
          <radialGradient id="fr-rim-before" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a8a59c"/>
            <stop offset="55%" stopColor="#6f6c66"/>
            <stop offset="100%" stopColor="#2e2d2a"/>
          </radialGradient>
          <clipPath id="fr-clip-left">
            <rect x="0" y="0" width="200" height="400"/>
          </clipPath>
          <clipPath id="fr-clip-right">
            <rect x="200" y="0" width="200" height="400"/>
          </clipPath>
        </defs>

        {/* Tire (base) */}
        <circle cx="200" cy="200" r="190" fill="#0a0a0b"/>
        <circle cx="200" cy="200" r="170" fill="#1a1a1c"/>
        <circle cx="200" cy="200" r="148" fill="#0a0a0b"/>

        {/* AFTER half (right) */}
        <g clipPath="url(#fr-clip-right)">
          <circle cx="200" cy="200" r="142" fill="url(#fr-rim-after)"/>
          {Array.from({length: 5}, (_, i) => {
            const a = i * 72 - 90;
            return (
              <g key={i} transform={`rotate(${a} 200 200)`}>
                <path d="M195 80 L205 80 L215 200 L185 200 Z"
                      fill="url(#fr-rim-after)"
                      stroke="#3a3d44" strokeWidth=".5"/>
              </g>
            );
          })}
          <circle cx="200" cy="200" r="40" fill="#2a2c30"/>
          <circle cx="200" cy="200" r="32" fill="url(#fr-rim-after)"/>
          <circle cx="200" cy="200" r="14" fill="#1a1a1c"/>
        </g>

        {/* BEFORE half (left) — dull, with scratches */}
        <g clipPath="url(#fr-clip-left)">
          <circle cx="200" cy="200" r="142" fill="url(#fr-rim-before)"/>
          {Array.from({length: 5}, (_, i) => {
            const a = i * 72 - 90;
            return (
              <g key={i} transform={`rotate(${a} 200 200)`}>
                <path d="M195 80 L205 80 L215 200 L185 200 Z"
                      fill="url(#fr-rim-before)"
                      stroke="#1f1d1a" strokeWidth=".5"/>
              </g>
            );
          })}
          <circle cx="200" cy="200" r="40" fill="#1a1815"/>
          <circle cx="200" cy="200" r="32" fill="url(#fr-rim-before)"/>
          <circle cx="200" cy="200" r="14" fill="#0d0c0a"/>

          {/* Curb-rash scratches */}
          <g stroke="#3a3733" strokeWidth="1.5" strokeLinecap="round" opacity=".75">
            <path d="M58 220 L82 215"/>
            <path d="M62 240 L88 232"/>
            <path d="M70 200 L92 198"/>
            <path d="M78 180 L98 182"/>
            <path d="M55 260 L78 252"/>
          </g>
          <g stroke="#5a554c" strokeWidth=".8" strokeLinecap="round" opacity=".55">
            <path d="M120 150 L142 168"/>
            <path d="M115 220 L138 214"/>
            <path d="M125 280 L148 270"/>
          </g>
        </g>

        {/* Center divider */}
        <line x1="200" y1="20" x2="200" y2="380"
              stroke="rgba(255,255,255,.4)"
              strokeWidth="1.5" strokeDasharray="3 4"/>

        {/* Lug nuts on AFTER side only for clean look */}
        <g clipPath="url(#fr-clip-right)">
          {Array.from({length: 5}, (_, i) => {
            const a = i * 72 - 90;
            const rad = 56;
            const x = 200 + Math.cos(a * Math.PI/180) * rad;
            const y = 200 + Math.sin(a * Math.PI/180) * rad;
            return <circle key={i} cx={x} cy={y} r="2.5" fill="#1a1a1c"/>;
          })}
        </g>
      </svg>

      <div className="fr-wheel-label fr-wheel-label-before">FÖRE</div>
      <div className="fr-wheel-label fr-wheel-label-after">EFTER</div>
    </div>
  );
}

/* ── Long-form text intro ── */
function FrIntro() {
  return (
    <section className="fr-intro">
      <div className="fr-intro-grid">
          <div className="fr-intro-eye">
            <span className="eyebrow">Vad är fälgrenovering?</span>
          </div>
          <div className="fr-intro-body">
            <p className="fr-intro-lead">
              En fälg utsätts för mer än vad de flesta tror. Salt, sten, trottoarkanter,
              bromsdamm, temperaturväxlingar — år efter år. Resultatet syns: matt yta,
              kantskador, krackelerande lack, små krökar som gör att hjulet inte
              balanserar längre.
            </p>
            <p>
              <b>Fälgrenovering</b> betyder att vi tar bort allt det. Fälgen
              demonteras från däcket, värms i kemiskt bad så gammal lack lossnar,
              skador svetsas eller slipas bort, fälgen riktas i hydraulisk press om
              den är skev — och får sedan ett helt nytt skikt pulverlack i den färg
              du väljer. Resultatet håller bättre än fabrikens originalbehandling.
            </p>
            <p>
              Det här är inte kosmetik. En riktigt åtgärdad fälg balanserar bättre,
              håller tätt mot däcket utan att läcka, och rostar inte längs ekrarna
              där sprickorna brukar komma. Du sparar bilen — och slipper köpa nytt
              för 10–15 000 kr per uppsättning.
            </p>
          </div>
        </div>
    </section>
  );
}

/* ── Process steps ── */
const STEPS = [
  {
    n: "01",
    t: "Inlämning & bedömning",
    d: "Du lämnar in fälgarna — eller hela hjulet, så demonterar vi däcket. Vi gör en visuell bedömning, mäter kast och dokumenterar skadorna.",
    icon: <IconTarget size={20} stroke={1.5}/>
  },
  {
    n: "02",
    t: "Offert inom 24 timmar",
    d: "Du får offert dagen efter med exakt vad som behöver göras, valfri färg eller finish, och fast pris. Inga förpliktelser — du bestämmer.",
    icon: <IconCheck size={20} stroke={2}/>
  },
  {
    n: "03",
    t: "Stripping & riktning",
    d: "Fälgen badas i kemiskt avlackningsbad. Krökar och buckor rätas i hydraulisk press. Sprickor svetsas av certifierad svetsare.",
    icon: <IconWrench size={20} stroke={1.5}/>
  },
  {
    n: "04",
    t: "Slipning & maskering",
    d: "Kantskador slipas och formas tillbaka. Detaljer som logotyper eller polerade ringar maskeras separat innan lackering.",
    icon: <IconSpark size={20} stroke={1.5}/>
  },
  {
    n: "05",
    t: "Pulverlackering",
    d: "Två-skikts pulverlack härdas i ugn vid 200 °C. Mycket tåligare än våtlack — håller mot stenskott, salt och kemikalier i 7–10 år.",
    icon: <IconShield size={20} stroke={1.5}/>
  },
  {
    n: "06",
    t: "Återmontering & balansering",
    d: "Däcket monteras tillbaka, hjulet balanseras med nya ventiler. Vi kvalitetsprovar varje fälg innan du hämtar.",
    icon: <IconRefresh size={20} stroke={1.5}/>
  }
];

function FrProcess() {
  return (
    <section className="fr-process" id="process">
        <div className="fr-process-head">
          <span className="eyebrow">Processen</span>
          <h2>Sex steg <em>från slitet till nyskick</em>.</h2>
          <p className="fr-process-sub">
            Hela renoveringen tar 1–3 arbetsdagar beroende på arbetets omfattning.
            Du hämtar dina fälgar — eller hela hjul — i bästa skick.
          </p>
        </div>
        <ol className="fr-steps">
          {STEPS.map(s => (
            <li key={s.n} className="fr-step">
              <div className="fr-step-num">{s.n}</div>
              <div className="fr-step-icon">{s.icon}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
    </section>
  );
}

/* ── Use cases / common problems ── */
const CASES = [
  { t: "Trottoarkant",  d: "Den klassiska. Skrap mot kant, ofta på framhjulen. Slipas och lackeras — ser nyfälgt ut." },
  { t: "Krökt fälg",    d: "Slag mot grop eller kantsten gör fälgen oval. Vibrationer i ratten i 80–100 km/h. Rätas i press." },
  { t: "Krackelerad lack", d: "Pulverlack från fabrik håller 5–7 år innan den spricker. Strippas och läggs om — håller längre." },
  { t: "Korrosion & salt", d: "Vägsalt äter sig in i aluminium och ger vita fläckar. Helstripp och nytt skikt återställer ytan." },
  { t: "Färgbyte",      d: "Trött på silver? Välj svart, antracit, brons, vit — vilken pulverfärg som helst, även matt eller satin." },
  { t: "Sprucken eker", d: "Mindre sprickor svetsas av certifierad svetsare. Större skador får en ärlig bedömning — vi säger till om vi inte rekommenderar reparation." }
];

function FrCases() {
  return (
    <section className="fr-cases">
        <div className="fr-cases-head">
          <span className="eyebrow">Det här fixar vi</span>
          <h2>Vanliga skador <em>vi ser varje vecka</em>.</h2>
        </div>
        <div className="fr-cases-grid">
          {CASES.map(c => (
            <div key={c.t} className="fr-case">
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
    </section>
  );
}

/* ── Pricing tiers ── */
function FrPricing() {
  const tiers = [
    {
      t: "Grundrenovering",
      p: "695 kr",
      sub: "/ fälg",
      d: "Slipning av kantskador, ren pulverlack i originalfärg, balansering.",
      f: ["Stripping i kemibad", "Slipning av kantskador", "Pulverlack (1 färg)", "Återmontering & balansering"]
    },
    {
      t: "Skadereparation",
      p: "995 kr",
      sub: "/ fälg",
      d: "Allt i grund + riktning av krökar och svetsning av sprickor.",
      f: ["Allt i Grundrenovering", "Riktning i hydraulpress", "Svetsning av sprickor", "Förstärkning av eker"],
      highlight: true
    },
    {
      t: "Custom & polering",
      p: "fr. 1 295 kr",
      sub: "/ fälg",
      d: "Fri färgval, polerade detaljer, två-tonsfinish eller diamantfräsning.",
      f: ["Fri färgval (RAL)", "Polerad ring eller läpp", "Matt / satin / metallic", "Diamantfräst yta (offert)"]
    }
  ];
  return (
    <section className="fr-pricing">
        <div className="fr-cases-head">
          <span className="eyebrow">Pris</span>
          <h2>Tre nivåer, <em>fast pris från start</em>.</h2>
          <p className="fr-process-sub">
            Priset gäller per fälg upp till 20″. Större fälgar och flerstegs-finish
            offereras separat. Ingen påslag i efterhand.
          </p>
        </div>
        <div className="fr-pricing-grid">
          {tiers.map(t => (
            <div key={t.t} className={"fr-tier" + (t.highlight ? " is-highlight" : "")}>
              {t.highlight && <span className="fr-tier-badge">Vanligast</span>}
              <h3>{t.t}</h3>
              <div className="fr-tier-price">
                {t.p}<span>{t.sub}</span>
              </div>
              <p className="fr-tier-desc">{t.d}</p>
              <ul>
                {t.f.map(x => (
                  <li key={x}>
                    <span className="check"><IconCheck size={11} stroke={2.6}/></span>
                    {x}
                  </li>
                ))}
              </ul>
              <a href="#boka" className={"btn " + (t.highlight ? "btn-accent" : "btn-ghost")}>
                Begär offert
                <span className="arrow"><IconArrow size={14}/></span>
              </a>
            </div>
          ))}
        </div>
    </section>
  );
}

/* ── FAQ ── */
const FAQS = [
  {
    q: "Hur lång tid tar det?",
    a: "1–3 arbetsdagar för standard. Custom-färger eller komplexa skador kan ta upp till en vecka — vi säger alltid till exakt när du får tillbaka dem."
  },
  {
    q: "Måste jag lämna in däcken också?",
    a: "Nej, men det är smidigare. Lämnar du hela hjulet sköter vi demontering och balansering här. Lämnar du bara fälgen, ordnar du själv montering på annat håll."
  },
  {
    q: "Hur länge håller pulverlack?",
    a: "Vår tvåskiktslackering klarar 7–10 år normalt bruk innan den behöver läggas om. Garantin är 12 månader mot färgsläpp eller bubblor."
  },
  {
    q: "Kan ni rädda alla fälgar?",
    a: "De flesta. Svår korrosion genom hela godset, eller stora sprickor i naven, gör vi en ärlig bedömning på — då rekommenderar vi en ny fälg istället."
  },
  {
    q: "Vad kostar det egentligen?",
    a: "Grundrenovering 695 kr/fälg, skadereparation 995 kr/fälg. För custom-färg och polerade detaljer fr. 1 295 kr. Du får alltid offert innan vi sätter igång."
  }
];

function FrFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="fr-faq">
        <div className="fr-cases-head">
          <span className="eyebrow">Frågor & svar</span>
          <h2>Det vi får frågor om <em>varje vecka</em>.</h2>
        </div>
        <div className="fr-faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={"fr-faq-item" + (open === i ? " is-open" : "")}>
              <button className="fr-faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="fr-faq-icon" aria-hidden="true"/>
              </button>
              <div className="fr-faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
    </section>
  );
}

/* ── Sidebar (reuses stub-side styles) ── */
function FrSidebar() {
  return (
    <aside className="stub-side fr-sticky">
      <div className="stub-side-tag">
        <span className="dot"/> Boka renovering
      </div>
      <div className="stub-side-price">
        <div className="stub-price">
          695<span className="currency"> kr / fälg</span>
        </div>
        <div className="stub-side-pricecap">Grundpris · offert inom 24h</div>
      </div>
      <div className="stub-side-meta">
        <span className="stub-side-meta-item"><IconClock size={15}/> 1–3 dagar</span>
        <span className="stub-side-meta-item"><IconShield size={15}/> 12 mån garanti</span>
      </div>
      <a href="#offert" className="btn btn-accent stub-side-cta">
        Begär offert
        <span className="arrow"><IconArrow size={16}/></span>
      </a>
      <div className="stub-side-divider"><span>Det här ingår</span></div>
      <ul className="stub-side-list">
        {["Mottagningskontroll", "Stripping i kemibad", "Slipning & riktning",
          "Pulverlackering", "Återmontering & balansering"].map(x => (
          <li key={x}>
            <span className="stub-side-check"><IconCheck size={12} stroke={2.6}/></span>
            {x}
          </li>
        ))}
      </ul>
      <div className="stub-side-divider"><span>Eller ring direkt</span></div>
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
            <em>Helsingborg</em>
          </span>
        </a>
      </div>
      <div className="stub-side-trust">
        <span className="stub-side-trust-item">
          <span className="stars">★★★★★</span>
          4,8 / 5 · 412 omdömen
        </span>
        <span className="stub-side-trust-item muted">Auktoriserad däckverkstad</span>
      </div>
    </aside>
  );
}

/* ── Layout combining everything ── */
function FalgrenoveringPage() {
  return (
    <>
      <DCTopBar/>
      <DCHeader activeIndex={5}/>
      <main>
        <FrHero/>
        <div className="container fr-body">
          <div className="fr-body-grid">
            <div className="fr-body-main">
              <FrIntro/>
              <FrProcess/>
              <FrCases/>
              <FrPricing/>
              <FrFaq/>
            </div>
            <div className="fr-body-side">
              <FrSidebar/>
            </div>
          </div>
        </div>
        <CTAStrip/>
      </main>
      <Footer/>
    </>
  );
}

window.DCFalgrenovering = FalgrenoveringPage;
