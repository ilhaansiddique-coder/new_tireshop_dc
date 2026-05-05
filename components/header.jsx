/* global React, DCIcons */
const { IconSearch, IconUser, IconCart, IconPin, IconPhone, IconArrow, IconChev } = DCIcons;

function ThemeToggle() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.dataset.theme || localStorage.getItem("dc-theme") || "light";
  });
  React.useEffect(() => {
    const onChange = () => setTheme(document.documentElement.dataset.theme || "light");
    const obs = new MutationObserver(onChange);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("dc-theme", next); } catch(e) {}
    // Notify Tweaks panel if it's listening
    window.parent?.postMessage?.({type:"__edit_mode_set_keys", edits:{theme: next}}, "*");
    setTheme(next);
  };
  const isDark = theme === "dark";
  return (
    <button className="topbar-theme" onClick={flip}
      aria-label={isDark ? "Byt till ljust läge" : "Byt till mörkt läge"}
      title={isDark ? "Ljust läge" : "Mörkt läge"}>
      <span className="ic" aria-hidden="true">
        {isDark ? (
          // moon
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z"/>
          </svg>
        ) : (
          // sun
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="3"/>
            <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.5 3.5l-1 1M4.5 11.5l-1 1M12.5 12.5l-1-1M4.5 4.5l-1-1"/>
          </svg>
        )}
      </span>
      <span className="lbl">{isDark ? "Ljust" : "Mörkt"}</span>
    </button>
  );
}

function TopBar() {
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

  const fastDelivery = lang === 'en' ? 'Fast delivery' : 'Snabb leverans';
  const returnPolicy = lang === 'en' ? '14 days return policy' : '14 dagars öppet köp';
  const address = 'Musköstgatan 2, Helsingborg';
  const phone = '042-16 08 39';

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-left">
          <span className="topbar-pill"><span className="dot"/> {fastDelivery} · {returnPolicy}</span>
        </div>
        <div className="topbar-right">
          <a className="topbar-info" href="#kontakt"><IconPin size={14}/> {address}</a>
          <a className="topbar-info" href="tel:0421608839"><IconPhone size={14}/> {phone}</a>
          <span className="topbar-lang" data-component="language-switcher">
            <button className={lang === 'sv' ? 'active' : ''} data-lang="sv">SV</button>
            <span className="sep">|</span>
            <button className={lang === 'en' ? 'active' : ''} data-lang="en">EN</button>
          </span>
          <span className="topbar-divider" aria-hidden="true"/>
          <ThemeToggle/>
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="brand" aria-label="Däckcentrum - Gå till startsida">
      <span className="brand-logo">
        <span className="d1">D</span>äckcentrum
      </span>
    </a>
  );
}

const NAV_SV = [
  { label: "Däck", href: "dack.html", active: true, mega: [
    { name: "Sommardäck", tag: "Säsong" },
    { name: "Vinterdäck" }, { name: "Helårsdäck" },
    { name: "Begagnade däck" }, { name: "Kampanjer", tag: "Rea" }
  ]},
  { label: "Fälg", href: "falg.html", mega: [
    { name: "Stålfälg" }, { name: "Aluminiumfälg" },
    { name: "DC Wheels", tag: "Nytt", href: "dc-wheels.html" }
  ]},
  { label: "Kompletta hjul", href: "kompletta-hjul.html" },
  { label: "Tjänster", mega: [
    { name: "Däckskifte", href: "tjanst-dackskifte.html" },
    { name: "Balansering", href: "tjanst-balansering.html" },
    { name: "Punktering", href: "tjanst-punktering.html" },
    { name: "Lagning", href: "tjanst-lagning.html" },
    { name: "Hjulinställning", href: "tjanst-hjulinstallning.html" },
    { name: "Fälgrenovering", href: "tjanst-falgrenovering.html" },
    { name: "Fälgservice", href: "tjanst-falgservice.html" },
    { name: "Däckhotell", href: "dackhotell.html" }
  ]},
  { label: "DC Wheels", href: "dc-wheels.html" }
];

const NAV_EN = [
  { label: "Tyres", href: "dack.html", active: true, mega: [
    { name: "Summer Tyres", tag: "Season" },
    { name: "Winter Tyres" }, { name: "All-Season Tyres" },
    { name: "Used Tyres" }, { name: "Sale", tag: "Sale" }
  ]},
  { label: "Rims", href: "falg.html", mega: [
    { name: "Steel Rims" }, { name: "Aluminum Rims" },
    { name: "DC Wheels", tag: "New", href: "dc-wheels.html" }
  ]},
  { label: "Complete Wheels", href: "kompletta-hjul.html" },
  { label: "Services", mega: [
    { name: "Tyre Change", href: "tjanst-dackskifte.html" },
    { name: "Balancing", href: "tjanst-balansering.html" },
    { name: "Puncture Repair", href: "tjanst-punktering.html" },
    { name: "Repair", href: "tjanst-lagning.html" },
    { name: "Wheel Alignment", href: "tjanst-hjulinstallning.html" },
    { name: "Rim Renovation", href: "tjanst-falgrenovering.html" },
    { name: "Rim Service", href: "tjanst-falgservice.html" },
    { name: "Tyre Hotel", href: "dackhotell.html" }
  ]},
  { label: "DC Wheels", href: "dc-wheels.html" }
];

function getNav() {
  const lang = window.DC_LANG?.current || localStorage.getItem('dc-lang') || 'sv';
  return lang === 'en' ? NAV_EN : NAV_SV;
}

function Header({ activeIndex = 0 }) {
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

  const NAV = getNav();
  const bookButtonText = lang === 'en' ? 'Book service' : 'Boka tid';
  const searchAriaLabel = lang === 'en' ? 'Search' : 'Sök';
  const accountAriaLabel = lang === 'en' ? 'My account' : 'Mitt konto';
  const cartAriaLabel = lang === 'en' ? 'Cart' : 'Varukorg';

  return (
    <header className="header">
      <div className="container header-inner">
        <Brand/>
        <nav className="nav">
          {NAV.map((item, i) => (
            <div key={item.label} className={"nav-item" + (i === activeIndex ? " active" : "")}
                 tabIndex={0} role="button">
              <a href={item.href || "#"}>{item.label}</a>
              {item.mega && <span className="caret" aria-hidden="true"><svg viewBox="0 0 8 8" width="8" height="8"><path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
              {item.mega && (
                <div className="nav-mega">
                  {item.mega.map(m => (
                    <a key={m.name} href={m.href || "#"}>
                      <span>{m.name}</span>
                      {m.tag && <span className="tag">{m.tag}</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="header-right">
          <button className="icon-btn" aria-label={searchAriaLabel}><IconSearch/></button>
          <button className="icon-btn" aria-label={accountAriaLabel}><IconUser/></button>
          <div id="mini-cart-root" style={{display: 'contents'}}></div>
          <a href="#boka" className="book-btn">{bookButtonText}</a>
        </div>
      </div>
    </header>
  );
}

window.DCHeader = Header;
window.DCTopBar = TopBar;
