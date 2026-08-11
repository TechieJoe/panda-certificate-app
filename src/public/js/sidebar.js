function toggleCreateMenu() {

    const menu =
        document.getElementById(
            'createMenu'
        );

    const arrow =
        document.getElementById(
            'arrow'
        );

    menu.classList.toggle('show');

    arrow.textContent =
        menu.classList.contains('show')
        ? '▲'
        : '▼';
}

function toggleSidebar() {

    document
        .getElementById('sidebar')
        .classList.toggle('collapsed');
}

