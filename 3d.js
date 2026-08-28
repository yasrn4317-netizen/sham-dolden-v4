// ==========================================
// 1. إدارة القائمة الجانبية (Side Menu & Overlay) - معرفة عالمياً
// ==========================================
function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    if (sideMenu && overlay) {
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

// ==========================================
// 2. إدارة وضع الإضاءة (الوضع المظلم / الفاتح) - معرفة عالمياً
// ==========================================
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon(isLight);
}

function updateThemeIcon(isLight) {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerText = isLight ? '☀️' : '🌙';
    }
}

// ==========================================
// 3. دالة جلب وعرض المشاريع ثلاثية الأبعاد (DC) - السيرفر المحلي MySQL
// ==========================================
async function load3DProjects() {
    try {
        const apiUrl = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);
        const response = await fetch(`${apiUrl}/projects`);
        if (!response.ok) throw new Error("فشل الاتصال بالسيرفر المحلي");

        const allProjects = await response.json();

        // تصفية المشاريع الخاصة بقسم dc أو page_name تساوي dc وتكون منشورة
        const projects = (allProjects || []).filter(item => {
            const isDc = (String(item.category).toLowerCase() === 'dc' || String(item.page_name).toLowerCase() === 'dc');
            const isPublished = (item.status === 'منشور' || item.status === 'active');
            return isDc && isPublished;
        });

        const container = document.getElementById('projects-container') || document.querySelector('.gallery-grid');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = `<div style="text-align: center; width: 100%; padding: 40px; color: var(--text-muted);">لا توجد مشاريع منشورة حالياً في هذا القسم</div>`;
            return;
        }

        // معالجة البيانات وتحويلها إلى كروت HTML عرضية
        container.innerHTML = projects.map(item => {
            let imgUrl = item.cover_image;

            if (imgUrl && imgUrl.trim() !== "") {
                if (!imgUrl.startsWith('http') && !imgUrl.startsWith('images/') && !imgUrl.startsWith('./images/')) {
                    imgUrl = 'images/' + imgUrl.replace(/^\//, '');
                }
            } else {
                imgUrl = 'https://placehold.co/600x400/18181c/d4af37?text=الشام+الذهبي';
            }

            const projectTitle = item.title || 'تصميم ثلاثي الأبعاد';
            const fullModelCode = item.model_code || `DC-1`;
            const categoryName = item.category_name || item.category_display || 'ديكور ثلاثي الأبعاد';

            return `
            <div class="gallery-card" data-project-title="${projectTitle}">
              <div class="card-img-holder">
                <img src="${imgUrl}" 
                     alt="${projectTitle}" 
                     onerror="this.onerror=null; this.src='https://placehold.co/600x400/18181c/d4af37?text=صورة+غير+متوفرة';" />
                
                <span class="badge-category">${categoryName}</span>
                <span class="badge-code">${fullModelCode}</span>
              </div>

              <div class="gallery-info">
                <h3>${projectTitle}</h3>
                <p>${item.description || ''}</p>

                <div class="card-main-actions">
                  <a href="chat.html?project=${item.id}&code=${fullModelCode}" class="btn-chat-icon" title="محادثة">
                    <i class="fa-solid fa-comments"></i>
                  </a>
                  <a href="product-details.html?id=${item.id}" class="btn-preview">
                    <i class="fa-solid fa-eye"></i> معاينة والتفاصيل
                  </a>
                </div>

                <div class="card-sub-actions">
                  <a data-contact-link="phone" href="#" class="btn-sub-action btn-phone-call">
                    <i class="fa-solid fa-phone"></i> اتصال
                  </a>
                  <a data-contact-link="whatsapp" href="#" target="_blank" class="btn-sub-action btn-whatsapp-link" data-title="${projectTitle} - كود: ${fullModelCode}" data-whatsapp-message="مرحباً، أود الاستفسار عن ${projectTitle} - كود: ${fullModelCode}">
                    <i class="fa-brands fa-whatsapp"></i> واتساب
                  </a>
                  <a href="bot.html?code=${fullModelCode}" class="btn-sub-action btn-bot-chat">
                    <i class="fa-solid fa-robot"></i> للأستفسار
                  </a>
                </div>
              </div>
            </div>
            `;
        }).join('');

    } catch (err) {
        console.error("خطأ أثناء جلب المشاريع من السيرفر المحلي:", err);
        const container = document.getElementById('projects-container') || document.querySelector('.gallery-grid');
        if (container) {
            container.innerHTML = `<div style="text-align: center; width: 100%; padding: 40px; color: #dc3545;">تعذر الاتصال بالسيرفر المحلي لجلب المشاريع</div>`;
        }
    }
}

// ==========================================
// 4. الحدث الأساسي عند اكتمال تحميل الصفحة
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    load3DProjects();

    // استرجاع الثيم المحفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon(true);
    }
});