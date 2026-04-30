<!doctype html>
<html lang="sv" data-theme="light" data-accent="green">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Däckhotell — Däckcentrum</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="styles/tokens.css?v=12"/>
<link rel="stylesheet" href="styles/header.css?v=12"/>
<link rel="stylesheet" href="styles/sections.css?v=12"/>
<link rel="stylesheet" href="styles/subpage.css?v=12"/>
<style>
  .hotel-hero { padding: 96px 0 80px; background: var(--ink); color: #fff; position: relative; overflow: hidden; }
  .hotel-hero::before { content: ""; position: absolute; right: -10%; top: -20%; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(139,197,63,.16), transparent 70%); filter: blur(40px); }
  .hotel-hero h1 { color: #fff; font-size: clamp(56px, 7vw, 120px); line-height: .96; max-width: 14ch; margin-bottom: 24px; }
  .hotel-hero h1 em { font-style: italic; font-weight: 500; color: var(--accent); }
  .hotel-hero .lede { font-size: 19px; color: rgba(255,255,255,.7); max-width: 56ch; margin-bottom: 32px; line-height: 1.55; }
  .hotel-hero .crumbs { color: rgba(255,255,255,.55); }
  .hotel-hero .crumbs a:hover { color: #fff; }
  .hotel-hero .crumbs .sep { color: rgba(255,255,255,.3); }
  .hotel-flow { padding: var(--pad-section) 0; background: var(--bg); }
  .flow-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 64px; counter-reset: step; }
  .flow-step { padding: 32px 24px; border-left: 1px solid var(--line); position: relative; counter-increment: step; }
  .flow-step:first-child { border-left: 0; }
  .flow-step::before { content: "0" counter(step); display: block; font-family: var(--font-mono); font-size: 12px; letter-spacing: .14em; color: var(--accent-strong); margin-bottom: 16px; font-weight: 600; }
  .flow-step h3 { margin-bottom: 12px; font-size: 22px; }
  .flow-step p { color: var(--ink-3); font-size: 15px; line-height: 1.55; }
  @media (max-width: 880px) { .flow-steps { grid-template-columns: 1fr 1fr; } .flow-step { border-top: 1px solid var(--line); border-left: 0; padding: 24px 16px; } }
  .pricing { padding: var(--pad-section) 0; background: var(--bg-alt); }
  .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 56px; }
  .price-card { background: var(--bg); border: 1px solid var(--line); border-radius: var(--r-xl); padding: 40px; transition: transform var(--t-med) var(--ease-emph), box-shadow var(--t-med); }
  .price-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-2); }
  .price-card.featured { background: var(--ink); color: #fff; border-color: transparent; box-shadow: var(--shadow-3); }
  .price-card h3 { font-size: 28px; margin-bottom: 8px; }
  .price-card .sub { font-size: 14px; color: var(--ink-3); margin-bottom: 28px; }
  .price-card.featured .sub { color: rgba(255,255,255,.6); }
  .price-card .amount { font-family: var(--font-display); font-size: 64px; font-weight: 600; letter-spacing: -.03em; line-height: 1; margin-bottom: 8px; }
  .price-card .amount .cur { font-size: 18px; color: var(--ink-3); }
  .price-card.featured .amount .cur { color: rgba(255,255,255,.7); }
  .price-card .per { font-size: 13px; color: var(--ink-4); margin-bottom: 28px; }
  .price-card.featured .per { color: rgba(255,255,255,.55); }
  .price-card ul { list-style: none; padding: 0; margin: 0 0 28px; display: grid; gap: 12px; }
  .price-card li { display: flex; gap: 10px; font-size: 14px; align-items: flex-start; }
  .price-card li svg { color: var(--accent-strong); flex-shrink: 0; margin-top: 3px; }
  .price-card.featured li svg { color: var(--accent); }
  .price-tag { display: inline-block; padding: 4px 10px; border-radius: var(--r-pill); background: var(--accent); color: var(--accent-ink); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; font-weight: 700; margin-bottom: 16px; }
  @media (max-width: 880px) { .price-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYyYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

<script src="lib/init-lang.js"></script>
<script type="text/babel" src="components/icons.jsx"></script>
<script type="text/babel" src="components/header.jsx"></script>
<script type="text/babel" src="components/regsearch.jsx"></script>
<script type="text/babel" src="components/tire.jsx"></script>
<script type="text/babel" src="components/sections.jsx"></script>
<script type="text/babel">
  const { Footer, CTAStrip, FAQ } = window.DCSections;
  const { IconCheck, IconArrow } = window.DCIcons;

  function HotelPage() {
    return (
      <>
        <window.DCTopBar/>
        <window.DCHeader activeIndex={3}/>
        <main>
          <section className="hotel-hero">
            <div className="container">
              <div className="crumbs">
                <a href="/">Hem</a><span className="sep">/</span>
                <span style={{color:"#fff"}}>Däckhotell</span>
              </div>
              <div style={{marginTop: 32, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "center"}}>
                <div>
                  <span className="eyebrow" style={{color:"rgba(255,255,255,.6)"}}>Däckhotell · sedan 2003</span>
                  <h1 style={{marginTop: 14}}>Däcken får ett <em>eget rum</em>.</h1>
                  <p className="lede">Vi tvättar, kontrollerar och förvarar dina hjul tryggt mellan säsongerna — och säger till när det är dags att skifta. Ingen källare, inga sprickor i gummit, inga "var lade jag dem?".</p>
                  <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
                    <a href="#priser" className="btn btn-accent">Se priser <span className="arrow"><IconArrow size={16}/></span></a>
                    <a href="#flow" className="btn btn-ghost" style={{borderColor:"rgba(255,255,255,.2)", color:"#fff"}}>Hur det funkar</a>
                  </div>
                </div>
                <div style={{aspectRatio:"1/1", display:"grid", placeItems:"center"}}>
                  <window.DCTire size="80%"/>
                </div>
              </div>
            </div>
          </section>
          <section className="hotel-flow" id="flow">
            <div className="container">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Hur det funkar</span>
                  <h2 style={{marginTop:14}}>Fyra steg.<br/>Inget krångel.</h2>
                </div>
                <p className="sub">Lämna in nu, vi tar hand om resten — säsong efter säsong. Du får sms när det är dags.</p>
              </div>
              <div className="flow-steps">
                <div className="flow-step"><h3>Lämna in</h3><p>Drop-in eller bokad tid. Vi noterar däcken på ditt namn och regnummer.</p></div>
                <div className="flow-step"><h3>Tvätt &amp; kontroll</h3><p>Vi tvättar, mäter mönsterdjupet och flaggar det om något ser ut att inte hålla en till säsong.</p></div>
                <div className="flow-step"><h3>Förvaring</h3><p>I klimatkontrollerat lager med rätt fukt och temperatur. Stående på rätt sätt så gummit inte deformeras.</p></div>
                <div className="flow-step"><h3>Påminnelse</h3><p>När säsongen vänder skickar vi sms med förslag på tider — eller boka själv online.</p></div>
              </div>
            </div>
          </section>
          <section className="pricing" id="priser">
            <div className="container">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Priser</span>
                  <h2 style={{marginTop:14}}>En säsong<br/>åt gången.</h2>
                </div>
                <p className="sub">Alla priser per säsong (ca 6 månader). Inkluderar tvätt, kontroll och påminnelse.</p>
              </div>
              <div className="price-grid">
                <div className="price-card">
                  <h3>Lös däck</h3>
                  <div className="sub">Utan fälg, 4 st</div>
                  <div className="amount">495<span className="cur"> kr</span></div>
                  <div className="per">per säsong · ca 6 mån</div>
                  <ul>
                    <li><IconCheck size={16}/> Förvaring i klimatlager</li>
                    <li><IconCheck size={16}/> Mönsterdjupskontroll</li>
                    <li><IconCheck size={16}/> Sms-påminnelse</li>
                  </ul>
                  <a href="#" className="btn btn-ghost" style={{width:"100%", justifyContent:"center"}}>Välj</a>
                </div>
                <div className="price-card featured">
                  <span className="price-tag">Mest valt</span>
                  <h3>Hjul på fälg</h3>
                  <div className="sub">4 hjul med fälg</div>
                  <div className="amount">695<span className="cur"> kr</span></div>
                  <div className="per">per säsong · ca 6 mån</div>
                  <ul>
                    <li><IconCheck size={16}/> Tvätt av samtliga hjul</li>
                    <li><IconCheck size={16}/> Kontroll &amp; uppmärkning</li>
                    <li><IconCheck size={16}/> Klimatkontrollerad förvaring</li>
                    <li><IconCheck size={16}/> Sms-påminnelse innan skifte</li>
                  </ul>
                  <a href="#" className="btn btn-accent" style={{width:"100%", justifyContent:"center"}}>Boka inlämning</a>
                </div>
                <div className="price-card">
                  <h3>Premium</h3>
                  <div className="sub">Hjul + skifte ingår</div>
                  <div className="amount">1 195<span className="cur"> kr</span></div>
                  <div className="per">per säsong · ca 6 mån</div>
                  <ul>
                    <li><IconCheck size={16}/> Allt i Hjul på fälg</li>
                    <li><IconCheck size={16}/> Skifte vid säsongsbyte</li>
                    <li><IconCheck size={16}/> Förtur i bokningskön</li>
                    <li><IconCheck size={16}/> Gratis balanskoll</li>
                  </ul>
                  <a href="#" className="btn btn-ghost" style={{width:"100%", justifyContent:"center"}}>Välj</a>
                </div>
              </div>
            </div>
          </section>
          <FAQ/>
          <CTAStrip/>
        </main>
        <Footer/>
      </>
    );
  }
  ReactDOM.createRoot(document.getElementById("root")).render(<HotelPage/>);
</script>
</body>
</html>
