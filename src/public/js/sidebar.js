function toggleSidebar() {

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;


    /* MOBILE / TABLET */

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


function closeMobileSidebar() {

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    sidebar.classList.remove('mobile-open');

    if (overlay) {
        overlay.classList.remove('show');
    }
}


/* CLOSE MOBILE MENU WHEN A LINK IS CLICKED */

document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebar');

    if (!sidebar) return;

    sidebar.querySelectorAll('nav a').forEach(link => {

        link.addEventListener('click', () => {

            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }

        });

    });

});


/* HANDLE SCREEN RESIZE */

window.addEventListener('resize', () => {

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;


    if (window.innerWidth > 768) {

        sidebar.classList.remove('mobile-open');

        if (overlay) {
            overlay.classList.remove('show');
        }

    }

});