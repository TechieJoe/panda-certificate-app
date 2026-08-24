function toggleCreateMenu() {

    const menu =
        document.getElementById('createMenu');

    const arrow =
        document.getElementById('arrow');

    if (!menu || !arrow) return;

    menu.classList.toggle('show');

    arrow.textContent =
        menu.classList.contains('show')
            ? '▲'
            : '▼';
}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.getElementById('sidebar');

    const overlay =
        document.getElementById('sidebarOverlay');

    if (!sidebar) return;


    /* MOBILE */

    if (window.innerWidth <= 768) {

        sidebar.classList.toggle('mobile-open');

        if (overlay) {
            overlay.classList.toggle(
                'show',
                sidebar.classList.contains('mobile-open')
            );
        }

        return;
    }


    /* DESKTOP */

    sidebar.classList.toggle('collapsed');
}


/* =====================================================
   CLOSE MOBILE SIDEBAR
===================================================== */

function closeSidebar() {

    const sidebar =
        document.getElementById('sidebar');

    const overlay =
        document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    sidebar.classList.remove('mobile-open');

    if (overlay) {
        overlay.classList.remove('show');
    }
}


/* =====================================================
   CLOSE SIDEBAR WHEN A LINK IS CLICKED ON MOBILE
===================================================== */

document.addEventListener('DOMContentLoaded', function () {

    const sidebar =
        document.getElementById('sidebar');

    if (!sidebar) return;

    const links =
        sidebar.querySelectorAll('nav a');

    links.forEach(link => {

        link.addEventListener('click', function () {

            if (window.innerWidth <= 768) {
                closeSidebar();
            }

        });

    });

});


/* =====================================================
   HANDLE SCREEN RESIZE
===================================================== */

window.addEventListener('resize', function () {

    const sidebar =
        document.getElementById('sidebar');

    const overlay =
        document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    if (window.innerWidth > 768) {

        sidebar.classList.remove('mobile-open');

        if (overlay) {
            overlay.classList.remove('show');
        }

    }

});