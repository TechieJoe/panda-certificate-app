function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar) return;

  /* MOBILE / TABLET */
  if (window.innerWidth <= 768) {
    const willOpen = !sidebar.classList.contains('mobile-open');

    sidebar.classList.toggle('mobile-open', willOpen);

    if (overlay) {
      overlay.classList.toggle('show', willOpen);
    }

    // prevent background scroll while menu is open
    document.body.style.overflow = willOpen ? 'hidden' : '';

    return;
  }

  /* DESKTOP */
  sidebar.classList.toggle('collapsed');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar) return;

  sidebar.classList.remove('mobile-open');

  if (overlay) {
    overlay.classList.remove('show');
  }

  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Close when a nav link is clicked (mobile)
  sidebar.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });

  // Close when user scrolls (mobile)
  let lastScrollY = window.scrollY;

  const onScroll = () => {
    if (window.innerWidth > 768) return;
    if (!sidebar.classList.contains('mobile-open')) return;

    const currentY = window.scrollY;

    // close on any meaningful scroll up or down
    if (Math.abs(currentY - lastScrollY) > 8) {
      closeMobileSidebar();
    }

    lastScrollY = currentY;
  };

  // window scroll
  window.addEventListener('scroll', onScroll, { passive: true });

  // also catch scroll inside main content (if that is the scroller)
  const main = document.querySelector('.main-content, main, #main-content');
  if (main) {
    main.addEventListener('scroll', () => {
      if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
        closeMobileSidebar();
      }
    }, { passive: true });
  }
});

window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar) return;

  if (window.innerWidth > 768) {
    sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
});