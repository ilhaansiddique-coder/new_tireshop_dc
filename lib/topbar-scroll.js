// Topbar scroll hide/show behavior
// Hide topbar when scrolling down, show when scrolling up

(function() {
  let lastScrollY = 0;
  let isScrollingDown = false;
  let topbarTimeout;

  function updateTopbarVisibility() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    const topbarHeight = 38;
    const showThreshold = 200; // Hide topbar after scrolling down 200px

    // Scrolling down - hide topbar
    if (scrollDelta > 5 && currentScrollY > showThreshold) {
      if (!isScrollingDown) {
        isScrollingDown = true;
        topbar.classList.add('hidden');
      }
    }
    // Scrolling up or near top - show topbar
    else if (scrollDelta < -5 || currentScrollY <= showThreshold) {
      if (isScrollingDown) {
        isScrollingDown = false;
        topbar.classList.remove('hidden');
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
