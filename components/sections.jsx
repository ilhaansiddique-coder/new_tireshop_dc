/* global React, DCIcons, DCRegSearch, DCTire */
const { IconArrow, IconArrowUR, IconCheck, IconPlus, IconShield, IconSpark, IconLeaf,
        IconBox, IconWrench, IconGauge, IconTarget, IconRefresh, IconStar, IconTire, IconRim,
        IconPin, IconPhone, IconMail, IconClock, IconFB, IconIG, IconYT } = DCIcons;

/* ── Marquee ── */
function Marquee() {
  const items = [
    "Continental", "Michelin", "Pirelli", "Bridgestone", "Goodyear",
    "Nokian", "Hankook", "Dunlop", "Vredestein", "Yokohama",
    "DC Wheels", "Audi Genuine", "BMW Original", "Volvo Authorized"
  ];
  const all = [...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {all.map((x, i) => (
          <span className="marquee-item" key={i}>
            <span className="star"><IconStar size={14}/></span>{x}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Services rows ── */
const SERVICES_SV = [
  { num:"01", icon: <IconRefresh size={36} stroke={1.4}/>, name:"Däckskifte", desc:"Hjulskifte med balansering, kontroll och slutmoment. Drop-in eller bokad tid.", from:"595 kr", time:"~30 min", href:"tjanst-dackskifte.html" },
  { num:"02", icon: <IconBox size={36} stroke={1.4}/>,  name:"Däckhotell", desc:"Vi förvarar dina däck över säsongen — tvättat, märkt och redo.", from:"695 kr / säs.", time:"vår &amp; höst", href:"dackhotell.html" },
  { num:"03", icon: <IconGauge size={36} stroke={1.4}/>, name:"Balansering", desc:"Precisionsbalansering på Hofmann-maskin för jämn rullning.", from:"99 kr / hjul", time:"~5 min / hjul", href:"tjanst-balansering.html" },
  { num:"04", icon: <IconShield size={36} stroke={1.4}/>, name:"Punktering", desc:"Snabb kontroll och bedömning, oftast medan du väntar.", from:"245 kr", time:"15–30 min", href:"tjanst-punktering.html" },
  { num:"05", icon: <IconWrench size={36} stroke={1.4}/>, name:"Lagning", desc:"Ångtätning eller plugg — vi rekommenderar rätt åtgärd.", from:"395 kr", time:"30 min", href:"tjanst-lagning.html" },
  { num:"06", icon: <IconTarget size={36} stroke={1.4}/>, name:"Hjulinställning", desc:"3D-mätning och justering av camber, toe och caster på alla fyra hjul.", from:"895 kr", time:"45–60 min", href:"tjanst-hjulinstallning.html" },
  { num:"07", icon: <IconRim size={36} stroke={1.4}/>,   name:"Fälgservice", desc:"Renovering, riktning och målning av aluminium- och stålfälg.", from:"offert", time:"1–3 dagar", href:"tjanst-falgservice.html" }
];

const SERVICES_EN = [
  { num:"01", icon: <IconRefresh size={36} stroke={1.4}/>, name:"Tyre Fitting", desc:"Wheel replacement with balancing, inspection and torque. Walk-in or booked appointment.", from:"595 kr", time:"~30 min", href:"tjanst-dackskifte.html" },
  { num:"02", icon: <IconBox size={36} stroke={1.4}/>,  name:"Tyre Hotel", desc:"We store your tyres over the season — cleaned, marked and ready.", from:"695 kr / season", time:"spring &amp; fall", href:"dackhotell.html" },
  { num:"03", icon: <IconGauge size={36} stroke={1.4}/>, name:"Balancing", desc:"Precision balancing on Hofmann machine for smooth rolling.", from:"99 kr / wheel", time:"~5 min / wheel", href:"tjanst-balansering.html" },
  { num:"04", icon: <IconShield size={36} stroke={1.4}/>, name:"Puncture Repair", desc:"Quick check and assessment, usually while you wait.", from:"245 kr", time:"15–30 min", href:"tjanst-punktering.html" },
  { num:"05", icon: <IconWrench size={36} stroke={1.4}/>, name:"Repair", desc:"Steam sealing or plugging — we recommend the right solution.", from:"395 kr", time:"30 min", href:"tjanst-lagning.html" },
  { num:"06", icon: <IconTarget size={36} stroke={1.4}/>, name:"Wheel Alignment", desc:"3D measurement and adjustment of camber, toe and caster on all four wheels.", from:"895 kr", time:"45–60 min", href:"tjanst-hjulinstallning.html" },
  { num:"07", icon: <IconRim size={36} stroke={1.4}/>,   name:"Rim Service", desc:"Renovation, straightening and painting of aluminum and steel rims.", from:"quote", time:"1–3 days", href:"tjanst-falgservice.html" }
];

function getServices() {
  const lang = window.DC_LANG?.current || 'sv';
  return lang === 'en' ? SERVICES_EN : SERVICES_SV;
}

function Services() {
  const [lang, setLang] = React.useState(window.DC_LANG?.current || 'sv');

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLang(window.DC_LANG?.current || 'sv');
    };
    document.addEventListener('languagechange', handleLanguageChange);
    window.addEventListener('dc-language-changed', handleLanguageChange);
    return () => {
      document.removeEventListener('languagechange', handleLanguageChange);
      window.removeEventListener('dc-language-changed', handleLanguageChange);
    };
  }, []);

  const SERVICES = getServices();
  const eyebrow = lang === 'en' ? 'Our Services' : 'Våra tjänster';
  const title = lang === 'en' ? 'Workshop, for real.' : 'Verkstad, på riktigt.';
  const subtitle = lang === 'en'
    ? 'Seven services — all performed in the same workshop by the same team. No middleman, no nonsense.'
    : 'Sju tjänster — alla utförda i samma verkstad av samma team. Ingen mellanhand, inga konstigheter.';
  const fromLabel = lang === 'en' ? 'FROM' : 'FRÅN';

  return (
    <section className="services" id="tjanster">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 style={{marginTop:14}}>{title}</h2>
          </div>
          <p className="sub">{subtitle}</p>
        </div>
        <div className="service-rows">
          {SERVICES.map((s) => (
            <a href={s.href} className="service-row" key={s.num}>
              <div className="service-num">{s.num} / 07</div>
              <div className="service-title-block">
                <div className="service-icon">{s.icon}</div>
                <div className="service-title">{s.name}</div>
              </div>
              <div className="service-desc" dangerouslySetInnerHTML={{__html: s.desc}}/>
              <div style={{display:"flex", alignItems:"center", gap:24}}>
                <div className="service-meta">
                  <div>{fromLabel} {s.from}</div>
                  <div dangerouslySetInnerHTML={{__html: s.time}}/>
                </div>
                <div className="service-arrow"><IconArrowUR size={18}/></div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Reg banner #2 ── */
function RegBanner() {
  const [lang, setLang] = React.useState(window.DC_LANG?.current || 'sv');

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLang(window.DC_LANG?.current || 'sv');
    };
    document.addEventListener('languagechange', handleLanguageChange);
    window.addEventListener('dc-language-changed', handleLanguageChange);
    return () => {
      document.removeEventListener('languagechange', handleLanguageChange);
      window.removeEventListener('dc-language-changed', handleLanguageChange);
    };
  }, []);

  const eyebrow = lang === 'en' ? 'Search by Registration' : 'Sök på regnummer';
  const title = lang === 'en' ? 'Enter your license plate — we show what fits.' : 'Skriv in regnumret — vi visar vad som passar.';
  const subtitle = lang === 'en'
    ? 'We match your wheels against tyres, rims and complete wheels in our range. Completely free, no registration required.'
    : 'Vi matchar dina hjul mot däck, fälg och kompletta hjul i sortimentet. Helt gratis, ingen registrering.';
  const searchLabel = lang === 'en' ? 'Your Registration' : 'Ditt regnummer';
  const searchHelp = lang === 'en'
    ? 'We save nothing — the search only happens here.'
    : 'Vi sparar inget — sökningen sker bara här.';

  return (
    <section className="regbanner">
      <div className="container">
        <div className="regbanner-inner">
          <div>
            <span className="eyebrow" style={{color:"rgba(255,255,255,.6)"}}>{eyebrow}</span>
            <h2 style={{marginTop:14}}>
              {lang === 'en' ? 'Enter your registration — ' : 'Skriv in regnumret — '}<br/>
              <em>{lang === 'en' ? 'we show what fits.' : 'vi visar vad som passar.'}</em>
            </h2>
            <p>{subtitle}</p>
            <DCRegSearch label={searchLabel} dark help={searchHelp}/>
          </div>
          <div className="regbanner-visual">
            <DCTire size="78%"/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Däckhotell push ── */
function HotelPush() {
  const [lang, setLang] = React.useState(window.DC_LANG?.current || 'sv');

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLang(window.DC_LANG?.current || 'sv');
    };
    document.addEventListener('languagechange', handleLanguageChange);
    window.addEventListener('dc-language-changed', handleLanguageChange);
    return () => {
      document.removeEventListener('languagechange', handleLanguageChange);
      window.removeEventListener('dc-language-changed', handleLanguageChange);
    };
  }, []);

  const eyebrow = lang === 'en' ? 'Tyre Hotel' : 'Däckhotell';
  const title = lang === 'en' ? 'Drop off your tyres — we take care of the rest.' : 'Lämna in dina däck — vi tar hand om resten.';
  const description = lang === 'en'
    ? 'Cleaned, marked and stored in temperature-controlled warehouse. When the season changes we call you — or book online yourself.'
    : 'Tvättat, märkt och förvarat i temperaturkontrollerat lager. När säsongen vänder ringer vi dig — eller boka själv online.';
  const features = lang === 'en'
    ? ['Cleaning & inspection at drop-off', 'Climate-controlled storage — prevent cracks', 'Reminder before season change', '4 wheels from 695 kr / season']
    : ['Tvätt & kontroll vid inlämning', 'Klimatlager — slipp sprickor', 'Påminnelse innan säsongsskifte', '4 hjul från 695 kr / säsong'];
  const learnMoreText = lang === 'en' ? 'Learn more about tyre hotel' : 'Läs mer om däckhotell';
  const bookButtonText = lang === 'en' ? 'Book drop-off' : 'Boka inlämning';

  return (
    <section className="hotel">
      <div className="container">
        <div className="hotel-card">
          <div className="hotel-content">
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p className="lede">{description}</p>
            <ul className="hotel-features">
              {features.map((f, i) => (
                <li key={i}><IconCheck size={18}/> {f}</li>
              ))}
            </ul>
            <div className="hotel-cta">
              <a href="dackhotell.html" className="btn btn-accent">{learnMoreText} <span className="arrow"><IconArrow size={16}/></span></a>
              <a href="#boka" className="btn btn-ghost">{bookButtonText}</a>
            </div>
          </div>
          <div className="hotel-visual">
            <div className="hotel-stack">
              <DCTire size="100%"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── About teaser ── */
function AboutTeaser() {
  return (
    <section className="about" id="om-oss">
      <div className="container">
        <div className="about-grid">
          <div className="about-img">FOTO · Teamet i verkstaden</div>
          <div>
            <span className="eyebrow">Om oss</span>
            <h2 style={{marginTop:14}}>Familjeägt sedan <em style={{fontStyle:"italic", fontWeight:500, color:"var(--ink-3)"}}>1992</em>.</h2>
            <p className="about-lede">
              Däckcentrum startade som en liten verkstad på Musköstgatan i Helsingborg. Idag är vi sju mekaniker, tre receptionister — och fortfarande på exakt samma adress.
            </p>
            <ul className="about-bullets">
              <li>Auktoriserad verkstad — Däckspecialisten &amp; Continental Premium Partner</li>
              <li>Egen lagerhållning — sällan väntetid på däck eller fälg</li>
              <li>Skadar du fälgen? Vi renoverar inhouse, behöver inte skickas iväg</li>
            </ul>
            <a href="om-oss.html" className="link-arrow">Läs hela historien <IconArrow size={16}/></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ── */
const FAQS = [
  { q:"När ska jag byta till sommardäck?", a:"När dygnsmedeltemperaturen stadigt ligger över +7 °C — i Skåne brukar det vara från mitten av april. Lagstadgat senast 30 april (förutsatt vinterväglag inte råder)." },
  { q:"Vad kostar däckskifte hos er?", a:"Hjulskifte (skifte på fälg) börjar på 595 kr inkl. balansering och kontroll. För omontering med nya däck tillkommer monteringspriset — vi ger alltid totalpris innan vi påbörjar arbetet." },
  { q:"Hur fungerar däckhotellet?", a:"Du lämnar in dina hjul, vi tvättar, kontrollerar slitage och märker upp dem. När säsongen vänder kallar vi automatiskt in dig för skifte. 695 kr / säsong för 4 hjul." },
  { q:"Behöver jag boka tid för punktering?", a:"Vanligtvis tar vi emot drop-in för punktering — men ring gärna 042-16 08 39 så ser vi att vi hinner ta emot dig direkt." },
  { q:"Säljer ni begagnade däck?", a:"Ja, vi har ett urval testade och godkända begagnade däck (minst 5 mm mönsterdjup). Sortimentet varierar — ring eller kom förbi för dagens utbud." },
  { q:"Kan ni renovera mina fälgar?", a:"Absolut. Vi gör allt från enkel kantmålning till fullständig pulverlackering. Lämna in fälgarna, så återkommer vi med offert inom 24 timmar." }
];

function FAQ() {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="faq-grid">
          <div className="faq-side">
            <span className="eyebrow">Vanliga frågor</span>
            <h2 style={{marginTop:14}}>Frågor vi får — varje vecka.</h2>
            <p>Hittar du inte svaret? Ring oss på 042-16 08 39 eller kom förbi verkstaden på Musköstgatan 2.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div className="faq-item" key={i} data-open={open === i}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="faq-toggle"><IconPlus size={16}/></span>
                </button>
                <div className="faq-a"><div><p>{f.a}</p></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Contact + map ── */
function Contact() {
  return (
    <section className="contact" id="kontakt">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Kontakta oss</span>
            <h2 style={{marginTop:14}}>Kom förbi —<br/>eller ring.</h2>
          </div>
          <p className="sub">Vi sitter på Musköstgatan 2 i Helsingborg, drop-in välkommet under öppettider.</p>
        </div>
        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-info">
              <div className="contact-info-row">
                <IconPin size={20}/>
                <div>
                  <div className="label">Adress</div>
                  <div className="value">Musköstgatan 2, 252 28 Helsingborg</div>
                </div>
              </div>
              <div className="contact-info-row">
                <IconPhone size={20}/>
                <div>
                  <div className="label">Telefon</div>
                  <div className="value"><a href="tel:0421608839">042-16 08 39</a></div>
                </div>
              </div>
              <div className="contact-info-row">
                <IconMail size={20}/>
                <div>
                  <div className="label">E-post</div>
                  <div className="value"><a href="mailto:info@dc.se">info@dc.se</a></div>
                </div>
              </div>
              <div className="contact-info-row">
                <IconClock size={20}/>
                <div style={{flex:1}}>
                  <div className="label">Öppettider</div>
                  <div className="contact-hours">
                    <div className="row today"><span>Mån–Tor</span><span>07:30 – 17:00</span></div>
                    <div className="row"><span>Fredag</span><span>07:30 – 16:00</span></div>
                    <div className="row"><span>Lördag</span><span>09:00 – 13:00</span></div>
                    <div className="row"><span>Söndag</span><span>Stängt</span></div>
                  </div>
                </div>
              </div>
            </div>
            <a href="#boka" className="btn btn-accent" style={{alignSelf:"flex-start"}}>
              Boka tid online <span className="arrow"><IconArrow size={16}/></span>
            </a>
          </div>
          <div className="map">
            <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C5CFB6" strokeWidth=".5"/>
                </pattern>
              </defs>
              <rect width="800" height="600" fill="#E2E7D6"/>
              <rect width="800" height="600" fill="url(#mapGrid)"/>
              {/* roads */}
              <path d="M0 200 Q 200 220 400 240 T 800 280" stroke="#FFFFFF" strokeWidth="14" fill="none"/>
              <path d="M0 200 Q 200 220 400 240 T 800 280" stroke="#D7DCC9" strokeWidth="1" fill="none"/>
              <path d="M120 0 L 200 600" stroke="#FFFFFF" strokeWidth="10" fill="none"/>
              <path d="M520 0 Q 540 300 600 600" stroke="#FFFFFF" strokeWidth="12" fill="none"/>
              <path d="M0 460 L 800 480" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
              {/* park */}
              <path d="M580 80 q 60 -20 110 30 q 30 60 -20 100 q -80 30 -120 -40 q -10 -60 30 -90 z" fill="#BFD3A4"/>
              {/* water */}
              <path d="M0 540 Q 200 510 400 530 T 800 540 L 800 600 L 0 600 Z" fill="#A9C4D6"/>
              {/* buildings */}
              {[[100,310,40,40],[160,330,30,30],[260,290,50,40],[330,310,30,30],[420,330,40,30],[480,300,50,50],[230,400,40,40],[300,420,50,30],[400,400,30,40],[480,420,40,30],[640,360,40,40],[700,340,30,40]].map(([x,y,w,h],i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="#F2EFE6" stroke="#D8D2C2" strokeWidth=".8"/>
              ))}
              {/* highlighted block */}
              <rect x="380" y="250" width="60" height="50" fill="#FFFFFF" stroke="#8BC53F" strokeWidth="2"/>
            </svg>
            <div className="map-pin">
              <svg viewBox="0 0 60 80" width="56" height="76">
                <path d="M30 78 C 30 78 6 50 6 28 a 24 24 0 1 1 48 0 c 0 22 -24 50 -24 50 z" fill="#0A0A0A"/>
                <circle cx="30" cy="28" r="11" fill="#8BC53F"/>
                <text x="30" y="32" fontSize="13" fontWeight="800" textAnchor="middle" fill="#1A2410" fontFamily="Inter Tight, Inter">DC</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA strip ── */
function CTAStrip() {
  return (
    <section className="cta-strip" id="boka">
      <div className="container">
        <div className="cta-strip-inner">
          <span className="eyebrow" style={{color:"var(--accent-ink)"}}>Boka tid</span>
          <h2 style={{marginTop:14}}>Boka <em>direkt</em> — vi <em>hör av oss</em>.</h2>
          <p>Välj tjänst, datum och tid. Får du inte plats den dagen ringer vi dig så vi hittar något som funkar.</p>
          <div className="cta-services">
            {["Däckskifte", "Däckhotell", "Balansering", "Punktering", "Lagning", "Hjulinställning", "Fälgservice"].map(s => (
              <a key={s} href="#" className="cta-pill">{s}</a>
            ))}
          </div>
          <a href="#" className="btn btn-dark">Öppna bokning <span className="arrow"><IconArrow size={16}/></span></a>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-logo"><span className="d1" style={{color:"#FFF"}}>D</span><span style={{color:"#FFF"}}>äckcentrum</span></span>
            <p>Din däck- och fälgverkstad i Helsingborg sedan 1992. Allt under ett tak — verkstad, butik, däckhotell.</p>
            <form className="footer-newsletter" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="din@email.se"/>
              <button type="submit">Prenumerera</button>
            </form>
          </div>
          <div className="footer-col">
            <h4>Sortiment</h4>
            <ul>
              <li><a href="#">Däck</a></li>
              <li><a href="#">Fälg</a></li>
              <li><a href="#">Kompletta hjul</a></li>
              <li><a href="#">DC Wheels</a></li>
              <li><a href="#">Kampanjer</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Tjänster</h4>
            <ul>
              <li><a href="tjanst-dackskifte.html">Däckskifte</a></li>
              <li><a href="dackhotell.html">Däckhotell</a></li>
              <li><a href="tjanst-balansering.html">Balansering</a></li>
              <li><a href="tjanst-punktering.html">Punktering</a></li>
              <li><a href="tjanst-lagning.html">Lagning</a></li>
              <li><a href="tjanst-hjulinstallning.html">Hjulinställning</a></li>
              <li><a href="tjanst-falgservice.html">Fälgservice</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Företaget</h4>
            <ul>
              <li><a href="om-oss.html">Om oss</a></li>
              <li><a href="#kontakt">Kontakt</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#">Lediga jobb</a></li>
              <li><a href="#">Återförsäljare</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kontakt</h4>
            <ul>
              <li>Musköstgatan 2<br/>252 28 Helsingborg</li>
              <li><a href="tel:0421608839">042-16 08 39</a></li>
              <li><a href="mailto:info@dc.se">info@dc.se</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Däckcentrum AB · Org.nr 556123-4567</div>
          <div className="footer-legal">
            <a href="#">Integritetspolicy</a>
            <a href="#">Cookies</a>
            <a href="#">Köpvillkor</a>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><IconFB size={16}/></a>
            <a href="#" aria-label="Instagram"><IconIG size={16}/></a>
            <a href="#" aria-label="Youtube"><IconYT size={16}/></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

window.DCSections = { Marquee, Services, RegBanner, HotelPush, AboutTeaser, FAQ, Contact, CTAStrip, Footer };
