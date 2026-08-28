// Central contact and social links loaded by public pages.
(function () {
    const API_URL = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);

    const defaults = {
        phone: "",
        whatsapp: "",
        facebook: "https://www.facebook.com/share/1BjkjFqCdR/",
        instagram: "https://www.instagram.com/neccaryesir?igsi=MTV6cDVzZmw0bHczcg==",
        tiktok: "https://www.tiktok.com/@shamdolden?_r=1&_t=ZS-996jdiIObQG",
        x: "https://x.com/shamdolde"
    };
    let activeSettings = { ...defaults };

    function digitsOnly(value) {
        return String(value || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    }

    function phoneHref(value) {
        const phone = String(value || "").trim();
        return phone ? `tel:${phone}` : "#";
    }

    function whatsappHref(value, message = "") {
        const input = String(value || "").trim();
        if (!input) return "#";
        if (/^https?:\/\//i.test(input)) {
            return message ? `${input}${input.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}` : input;
        }
        const phone = digitsOnly(input);
        return phone ? `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}` : "#";
    }

    function updateLinks(settings) {
        const values = { ...defaults, ...settings };
        document.querySelectorAll('[data-contact-link="phone"]').forEach((link) => {
            link.href = phoneHref(values.phone);
        });
        document.querySelectorAll('[data-contact-link="whatsapp"]').forEach((link) => {
            link.href = whatsappHref(values.whatsapp, link.dataset.whatsappMessage || "");
        });
        document.querySelectorAll('.btn-whatsapp').forEach((link) => {
            link.href = whatsappHref(values.whatsapp, link.dataset.whatsappMessage || "");
        });
        ["facebook", "instagram", "tiktok", "x"].forEach((network) => {
            document.querySelectorAll(`[data-social-link="${network}"]`).forEach((link) => {
                if (values[network]) link.href = values[network];
            });
        });
    }

    updateLinks(activeSettings);
    fetch(`${API_URL}/settings`)
        .then((response) => response.ok ? response.json() : {})
        .then((settings) => {
            activeSettings = { ...defaults, ...(settings || {}) };
            updateLinks(activeSettings);
            if (activeSettings.favicon) {
                let favicon = document.querySelector('link[rel="icon"]');
                if (!favicon) {
                    favicon = document.createElement("link");
                    favicon.rel = "icon";
                    document.head.appendChild(favicon);
                }
                favicon.href = activeSettings.favicon;
            }
        })
        .catch(() => {
            updateLinks(activeSettings);
        });

    if (window.EventSource) {
        const stream = new EventSource(`${API_URL}/stream`);
        stream.addEventListener("settings", (event) => {
            try {
                activeSettings = { ...defaults, ...(JSON.parse(event.data) || {}) };
                updateLinks(activeSettings);
                if (activeSettings.favicon) {
                    let favicon = document.querySelector('link[rel="icon"]');
                    if (!favicon) {
                        favicon = document.createElement("link");
                        favicon.rel = "icon";
                        document.head.appendChild(favicon);
                    }
                    favicon.href = activeSettings.favicon;
                }
            } catch (_) { }
        });
        stream.onerror = () => stream.close();
    }

    new MutationObserver(() => updateLinks(activeSettings)).observe(document.body, {
        childList: true,
        subtree: true
    });
})();
