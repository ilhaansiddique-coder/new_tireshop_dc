// Global Page Loader & Navigation Progress

(function() {
  'use strict';

  // Hide initial page loader
  function hideInitialLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('hidden');
      document.body.classList.remove('loading-page');
    }
  }

  // Show page loader for navigation
  function showLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.remove('hidden');
      document.body.classList.add('loading-page');
    }
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(hideInitialLoader, 800);
    });
  } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(hideInitialLoader, 800);
  }

  // Handle navigation
  window.addEventListener('beforeunload', () => {
    showLoader();
  });

  // Listen for link clicks
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');

    // Only show loader for navigation (not anchors or external links)
    if (href &&
        !href.startsWith('#') &&
        !href.startsWith('http') &&
        !href.startsWith('//') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:')) {

      // Give a tiny delay so user sees the loader
      setTimeout(() => {
        showLoader();
      }, 50);
    }
  });

  // Expose functions globally
  window.hidePageLoader = hideInitialLoader;
  window.showPageLoader = showLoader;
})();
