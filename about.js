function toggleMenu() {
    const sideMenu = document.getElementById("side-menu");
    const overlay = document.getElementById("menu-overlay");
    if (sideMenu && overlay) {
        sideMenu.classList.toggle("open");
        overlay.classList.toggle("active");
    }
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.innerText = isLight ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
        document.body.classList.add("light-mode");
        const btn = document.getElementById("theme-toggle");
        if (btn) btn.innerText = "☀️";
    }
});