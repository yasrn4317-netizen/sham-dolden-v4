// ==========================================
// الشام الذهبي | معرض المشاريع والصور الشامل
// ==========================================

const API = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);

document.addEventListener("DOMContentLoaded", () => {
    loadGalleryProjects("الكل");
    initTheme();
    initSidebar();
    initCategoryButtons();
        listenForProjectUpdates();
});

    function listenForProjectUpdates() {
        if (!window.EventSource) return;
        const stream = new EventSource(`${API}/stream`);
        stream.addEventListener("notification", (event) => {
            try {
                const notification = JSON.parse(event.data);
                if (notification.type === "project") {
                    const activeCategory = document.querySelector(".cat-btn.active")?.dataset.category || "الكل";
                    loadGalleryProjects(activeCategory);
                }
            } catch (_) { }
        });
        stream.onerror = () => stream.close();
    }

// ==========================================
// جلب وعرض المشاريع (العادية والمميزة)
// ==========================================
async function loadGalleryProjects(category = "الكل") {
    const gallery = document.getElementById("projects-gallery");
    if (!gallery) return;

    gallery.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: var(--royal-gold, #d4af37); font-size: 18px;">
            <i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل الصور والمشاريع...
        </div>
    `;

    try {
        const response = await fetch(API + "/projects");
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `فشل الاتصال بالسيرفر المحلي (${response.status})`);
        }
        const allProjects = await response.json();
        const categoryAliases = {
            "kids-room": ["kids-room", "kd", "bedroom"]
        };
        const allowedCategories = categoryAliases[category] || [category];
        const projects = (Array.isArray(allProjects) ? allProjects : [])
            .filter(project => project.status === "منشور" || project.status === "active")
            .filter(project => category === "الكل" || allowedCategories.includes(String(project.category)));

        if (!projects || projects.length === 0) {
            gallery.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: var(--text-muted, #888);">
                    <i class="fa-solid fa-images" style="font-size: 40px; margin-bottom: 15px;"></i>
                    <h2>لا توجد صور أو مشاريع في هذا القسم حالياً</h2>
                </div>
            `;
            return;
        }

        gallery.innerHTML = "";

        projects.forEach(project => {
            const image = project.cover_image || "images/default-decor.png";
            const description = project.description
                ? (project.description.length > 90 ? project.description.substring(0, 90) + "..." : project.description)
                : "لا يوجد وصف إضافي.";

            // التحقق إذا كان المشروع مميزاً لإضافة شارة مميز عليه
            const isFeatured = project.featured === true || project.featured === 1 || project.featured === "1"
                ? `<span class="featured-badge" title="مشروع مميز" aria-label="مشروع مميز">مميز</span>`
                : '';

            gallery.innerHTML += `
            <div class="project-card ${isFeatured ? 'featured-card-item' : ''}">
                <div class="card-img-holder project-img-wrapper" style="position: relative;">
                    <span class="badge-category">${project.category || 'مشروع'}</span>
                    <span class="badge-code">${project.model_code || ''}</span>
                    <img src="${image}" 
                         alt="${project.title || 'صورة ديكور'}" 
                         loading="lazy"
                         onerror="this.src='images/default-decor.png'">
                    ${isFeatured}
                </div>
                <div class="project-info gallery-info">
                    <h3>${project.title || 'بدون عنوان'}</h3>
                    <p>${description}</p>
                    <div class="card-main-actions">
                        <a class="btn-preview" href="product-details.html?id=${encodeURIComponent(project.id)}">
                            <i class="fa-solid fa-eye"></i> معاينة والتفاصيل
                        </a>
                        <a class="btn-chat-icon" href="chat.html?code=${encodeURIComponent(project.model_code || '')}" title="محادثة">
                            <i class="fa-solid fa-comments"></i>
                        </a>
                    </div>
                    <div class="card-sub-actions">
                        <a data-contact-link="phone" href="#" class="btn-sub-action"><i class="fa-solid fa-phone"></i> اتصال</a>
                        <a data-contact-link="whatsapp" data-whatsapp-message="استفسار عن موديل: ${project.model_code || ''} - ${project.title || ''}" href="#" target="_blank" class="btn-sub-action"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
                        <a href="bot.html?code=${encodeURIComponent(project.model_code || '')}" class="btn-sub-action"><i class="fa-solid fa-robot"></i> استفسار</a>
                    </div>
                </div>
            </div>
            `;
        });

    } catch (err) {
        console.error("خطأ في جلب المعرض:", err);
        gallery.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
            تعذر تحميل المشاريع: ${err.message}
        </div>
        `;
    }
}

// ==========================================
// تفعيل أزرار التصنيفات
// ==========================================
function initCategoryButtons() {
    const buttons = document.querySelectorAll(".cat-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const selectedCategory = btn.getAttribute("data-category") || "الكل";
            loadGalleryProjects(selectedCategory);
        });
    });
}

// ==========================================
// الوضع الليلي / النهار
// ==========================================
function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    if (!themeBtn) return;

    const saved = localStorage.getItem("theme");
    if (saved === "light") {
        document.body.classList.remove("dark-mode");
        themeBtn.textContent = "☀️";
    } else {
        document.body.classList.add("dark-mode");
        themeBtn.textContent = "🌙";
    }

    themeBtn.onclick = () => {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeBtn.textContent = "🌙";
        } else {
            localStorage.setItem("theme", "light");
            themeBtn.textContent = "☀️";
        }
    };
}

// ==========================================
// القائمة الجانبية
// ==========================================
function initSidebar() {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".overlay");
    const closeBtn = document.getElementById("closeBtn");

    if (menuBtn && sidebar && overlay) {
        menuBtn.onclick = () => {
            sidebar.classList.add("active");
            overlay.classList.add("active");
        };
    }

    const closeSidebar = () => {
        if (sidebar) sidebar.classList.remove("active");
        if (overlay) overlay.classList.remove("active");
    };

    if (closeBtn) closeBtn.onclick = closeSidebar;
    if (overlay) overlay.onclick = closeSidebar;
}
