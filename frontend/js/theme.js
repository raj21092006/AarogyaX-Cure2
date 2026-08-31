/* ==========================================================================
   AAROGYAX CURE - GLOBAL THEME CONTROLLER (LIGHT / DARK MODE)
   ========================================================================== */

(function() {
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Update toggle button text if present
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }

  // Load saved theme or system preference
  const savedTheme = localStorage.getItem('aarogyax_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // Immediate execution before DOM render to prevent white flash
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(savedTheme);

    // Bind toggle buttons
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('aarogyax_theme', newTheme);
        applyTheme(newTheme);
      });
    });
  });
})();
