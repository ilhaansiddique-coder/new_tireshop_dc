/* global React, ReactDOM, DCHeader, DCTopBar, DCHero, DCSections, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakToggle */

const { useEffect, useRef } = React;
const { Marquee, Services, RegBanner, HotelPush, AboutTeaser, FAQ, Contact, CTAStrip, Footer } = DCSections;
const { HeroV1, HeroV2, HeroV3 } = DCHero;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hero": "1",
  "accent": "green",
  "theme": "light",
  "font": "inter"
}/*EDITMODE-END*/;

function useReveal() {
  useEffect(() => {
    // Run twice: once after mount to grab everything currently in DOM,
    // and once on window load for any late mounts.
    const sweep = () => {
      const els = document.querySelectorAll(".reveal:not(.in)");
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: .05, rootMargin: "0px 0px -40px 0px" });
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          // already in viewport — reveal immediately
          el.classList.add("in");
        } else {
          io.observe(el);
        }
      });
      return io;
    };
    const io1 = sweep();
    const t = setTimeout(sweep, 300);
    return () => { io1.disconnect(); clearTimeout(t); };
  }, []);
}

function useMagnetic() {
  useEffect(() => {
    const handler = (e) => {
      const btn = e.target.closest(".btn, .book-btn, .cart-pill, .icon-btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", (e.clientX - r.left) + "px");
      btn.style.setProperty("--my", (e.clientY - r.top) + "px");
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);
}

const FONT_STACKS = {
  inter: { display: '"Inter Tight", "Inter", system-ui, sans-serif', body: '"Inter", system-ui, sans-serif' },
  serif: { display: '"Instrument Serif", "Cormorant Garamond", Georgia, serif', body: '"Inter", system-ui, sans-serif' },
  grotesk: { display: '"Space Grotesk", "Inter", system-ui, sans-serif', body: '"Space Grotesk", "Inter", system-ui, sans-serif' }
};

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useReveal();
  useMagnetic();

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.accent = tweaks.accent;
    const f = FONT_STACKS[tweaks.font] || FONT_STACKS.inter;
    document.documentElement.style.setProperty("--font-display", f.display);
    document.documentElement.style.setProperty("--font-body", f.body);
  }, [tweaks]);

  const Hero = tweaks.hero === "2" ? HeroV2 : tweaks.hero === "3" ? HeroV3 : HeroV1;

  return (
    <>
      <DCTopBar/>
      <DCHeader activeIndex={0}/>
      <main>
        <Hero/>
        <Marquee/>
        <Services/>
        <RegBanner/>
        <HotelPush/>
        <AboutTeaser/>
        <FAQ/>
        <Contact/>
        <CTAStrip/>
      </main>
      <Footer/>
      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="Hero-variant">
          <TweakRadio value={tweaks.hero}
            onChange={v => setTweak("hero", v)}
            options={[
              { value:"1", label:"1 · Allt under ett tak" },
              { value:"2", label:"2 · Mörk · Boka säsong" },
              { value:"3", label:"3 · Editorial · 1992" }
            ]}/>
        </TweakSection>
        <TweakSection title="Tema">
          <TweakRadio value={tweaks.theme}
            onChange={v => setTweak("theme", v)}
            options={[ { value:"light", label:"Ljust" }, { value:"dark", label:"Mörkt" } ]}/>
        </TweakSection>
        <TweakSection title="Accentfärg">
          <TweakRadio value={tweaks.accent}
            onChange={v => setTweak("accent", v)}
            options={[
              { value:"green", label:"Grön" },
              { value:"orange", label:"Orange" },
              { value:"blue", label:"Blå" }
            ]}/>
        </TweakSection>
        <TweakSection title="Typsnitt">
          <TweakSelect value={tweaks.font}
            onChange={v => setTweak("font", v)}
            options={[
              { value:"inter", label:"Inter Tight (default)" },
              { value:"grotesk", label:"Space Grotesk" },
              { value:"serif", label:"Instrument Serif" }
            ]}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// Wrap render in a timeout to ensure Babel finishes transpiling all components
setTimeout(() => {
  try {
    console.log('🚀 Starting App render...');
    const rootElement = document.getElementById("root");
    console.log('Root element found:', rootElement);
    if (!rootElement) throw new Error('Root element not found!');

    // Check if components are loaded
    console.log('Checking components:', {
      DCHeader: typeof window.DCHeader,
      DCTopBar: typeof window.DCTopBar,
      DCSections: typeof window.DCSections,
      DCHero: typeof window.DCHero,
      useTweaks: typeof window.useTweaks,
      TweaksPanel: typeof window.TweaksPanel
    });

    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ ReactDOM root created');

    root.render(<App/>);
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render App:', error);
    document.body.innerHTML = '<div style="color:red; padding:20px; font-family:monospace;"><h2>App Error</h2><pre>' + error.message + '</pre></div>';
  }
}, 2000); // Increased timeout to 2 seconds to allow Babel to transpile all components
