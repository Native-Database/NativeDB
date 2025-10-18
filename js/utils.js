function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    container.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 10);

    setTimeout(() => {
        notif.classList.remove('show');
        notif.addEventListener('transitionend', () => notif.remove());
    }, duration);
}

function applyTheme(theme) {
    const themeSwitch = document.getElementById('themeSwitch');
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        if (themeSwitch) themeSwitch.checked = true;
    } else {
        document.body.classList.remove('light-theme');
        if (themeSwitch) themeSwitch.checked = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }
    applyTheme(localStorage.getItem('theme') || 'dark');
});