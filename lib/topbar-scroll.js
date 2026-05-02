// Topbar scroll hide/show behavior
// Hide topbar when scrolling down, show when scrolling up

(function() {
  let lastScrollY = 0;
  let isScrollingDown = false;
  let topbarTimeout;

  function updateTopbarVisibility() {
    const topbar = document.querySelector('.topbar');
    const header = document.querySelector('.header');
    if (!topbar) return;

    // On mobile the topbar is CSS-hidden (display: none) and the header sits
    // at top: 0 — don't manipulate inline top here or we'll re-introduce the gap.
    const topbarVisible = getComputedStyle(topbar).display !== 'none';
    if (!topbarVisible) {
      if (header) header.style.top = '';
      return;
    }

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    const showThreshold = 200; // Hide topbar after scrolling down 200px

    // Scrolling down - hide topbar and move header up
    if (scrollDelta > 5 && currentScrollY > showThreshold) {
      if (!isScrollingDown) {
        isScrollingDown = true;
        topbar.classList.add('hidden');
        if (header) header.style.top = '0px';
      }
    }
    // Scrolling up or near top - show topbar and move header down
    else if (scrollDelta < -5 || currentScrollY <= showThreshold) {
      if (isScrollingDown) {
        isScrollingDown = false;
        topbar.classList.remove('hidden');
        if (header) header.style.top = '38px';
      }
    }

    lastScrollY = currentScrollY;
  }

  // Use throttled scroll listener for better performance
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTopbarVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
