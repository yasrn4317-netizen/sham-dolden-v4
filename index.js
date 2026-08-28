// ==========================================
// الشام الذهبي | الملف البرمجي الشامل للرئيسية
// ==========================================

const API = window.API_BASE_URL || "http://localhost:5000/api";
let featuredProjects = [];
let featuredIndex = 0;
let featuredTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  // تهيئة الوضع المفضل
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-mode');
    if (themeToggleBtn) themeToggleBtn.innerText = '☀️';
  } else {
    body.classList.remove('light-mode');
    if (themeToggleBtn) themeToggleBtn.innerText = '🌙';
  }

  // تحميل المشاريع المميزة
  loadFeaturedProjects();
  listenForProjectUpdates();
});

function listenForProjectUpdates() {
  if (!window.EventSource) return;

  const stream = new EventSource(`${API}/stream`);
  stream.addEventListener("notification", event => {
    try {
      const notification = JSON.parse(event.data);
      if (notification.type === "project") loadFeaturedProjects();
    } catch (error) {
      console.error("تعذر قراءة تحديث المشاريع:", error);
    }
  });

  stream.onerror = () => {
    stream.close();
  };
}

// تبديل الوضع
function toggleTheme() {
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');

  body.classList.toggle('light-mode');

  if (body.classList.contains('light-mode')) {
    localStorage.setItem('theme', 'light');
    if (themeToggleBtn) themeToggleBtn.innerText = '☀️';
  } else {
    localStorage.setItem('theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.innerText = '🌙';
  }
}

// فتح/إغلاق القائمة
function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");

  if (menu && overlay) {
    menu.classList.toggle("open");
    overlay.classList.toggle("active");
  }
}

// إرسال الرسالة الأولى
async function submitFirstMessage() {
  const nameInput = document.getElementById('cust-name');
  const phoneInput = document.getElementById('cust-phone');
  const msgInput = document.getElementById('cust-msg');
  const submitBtn = document.querySelector('#contact .btn-primary');

  if (!nameInput || !phoneInput || !msgInput) return;

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const message = msgInput.value.trim();

  if (!name || !phone || !message) {
    showContactStatus("الرجاء تعبئة جميع الحقول (الاسم، الهاتف، الرسالة)", false);
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري الإرسال... ⏳";
  }

  try {
    const response = await fetch(`${API}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, message })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "فشل إرسال الرسالة");

    localStorage.setItem('user_phone', phone);
    localStorage.setItem('user_name', name);

    nameInput.value = '';
    phoneInput.value = '';
    msgInput.value = '';
    showContactStatus("شكرًا لك، تم استلام رسالتك وسنتواصل معك في أقرب وقت.", true);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "إرسال وبدء المحادثة 🚀";
    }

  } catch (err) {
    console.error('تفاصيل الخطأ:', err);
    showContactStatus("حدث خطأ أثناء الإرسال: " + (err.message || "تعذر الاتصال بالسيرفر"), false);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "إرسال وبدء المحادثة 🚀";
    }
  }
}

// ==========================================
// جلب وعرض المشاريع المميزة
// ==========================================
// ==========================================
// جلب وعرض المشاريع المميزة
// ==========================================
async function loadFeaturedProjects() {
  const container = document.getElementById("featured-carousel");
  if (!container) {
    console.error("عنصر featured-projects-grid غير موجود");
    return;
  }

  try {
    const response = await fetch(`${API}/projects?featured=1`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `فشل تحميل المشاريع (${response.status})`);

    if (!data || data.length === 0) {
      container.innerHTML = `<div class="featured-carousel-empty">لا توجد مشاريع مميزة حالياً</div>`;
      return;
    }

    featuredProjects = data.filter(project => project.status === "منشور" || project.status === "active");
    if (featuredTimer) window.clearInterval(featuredTimer);
    featuredIndex = 0;
    renderFeaturedSlide();
    if (featuredProjects.length > 1) {
      featuredTimer = window.setInterval(() => {
        featuredIndex = (featuredIndex + 1) % featuredProjects.length;
        renderFeaturedSlide();
      }, 5000);
    }

  } catch (err) {
    console.error("خطأ في جلب المشاريع المميزة:", err);
    container.innerHTML = `
      <div class="featured-carousel-error">
        تعذر تحميل المشاريع المميزة<br>
        <small style="font-size:12px;">${err.message || ''}</small>
      </div>`;
  }
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function projectImagePath(project) {
  const image = String(project.cover_image || "").trim();
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  return image ? "/" + image.replace(/^\.\//, "") : "https://placehold.co/900x520/18181c/d4af37?text=مشروع";
}

function renderFeaturedSlide() {
  const container = document.getElementById("featured-carousel");
  const project = featuredProjects[featuredIndex];
  if (!container || !project) return;

  const description = String(project.description || "");
  const shortDescription = description.length > 110 ? description.substring(0, 110) + "..." : description;
  container.innerHTML = `
    <article class="featured-slide">
      <img class="featured-slide-image" src="${projectImagePath(project)}" alt="${escapeHTML(project.title || "مشروع مميز")}" onerror="this.onerror=null;this.src='https://placehold.co/900x520/18181c/d4af37?text=صورة+غير+متوفرة';">
      <div class="featured-slide-overlay"></div>
      <div class="featured-slide-content">
        <span class="featured-slide-label">مشروع مميز ⭐</span>
        <h2>${escapeHTML(project.title || "مشروع مميز")}</h2>
        <p>${escapeHTML(shortDescription || "تنفيذ فاخر بتفاصيل دقيقة")}</p>
        <a href="product-details.html?id=${encodeURIComponent(project.id || "")}" class="featured-slide-link">عرض التفاصيل <i class="fa-solid fa-arrow-left"></i></a>
      </div>
      <button class="featured-control featured-prev" type="button" aria-label="المشروع السابق"><i class="fa-solid fa-chevron-right"></i></button>
      <button class="featured-control featured-next" type="button" aria-label="المشروع التالي"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="featured-dots" aria-label="اختيار المشروع">
        ${featuredProjects.map((_, index) => `<button type="button" class="featured-dot ${index === featuredIndex ? "active" : ""}" data-index="${index}" aria-label="المشروع ${index + 1}"></button>`).join("")}
      </div>
    </article>
  `;

  container.querySelector(".featured-prev")?.addEventListener("click", () => changeFeaturedSlide(-1));
  container.querySelector(".featured-next")?.addEventListener("click", () => changeFeaturedSlide(1));
  container.querySelectorAll(".featured-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      featuredIndex = Number(dot.dataset.index) || 0;
      renderFeaturedSlide();
      restartFeaturedTimer();
    });
  });
}

function changeFeaturedSlide(step) {
  featuredIndex = (featuredIndex + step + featuredProjects.length) % featuredProjects.length;
  renderFeaturedSlide();
  restartFeaturedTimer();
}

function restartFeaturedTimer() {
  if (featuredTimer) window.clearInterval(featuredTimer);
  if (featuredProjects.length > 1) {
    featuredTimer = window.setInterval(() => {
      featuredIndex = (featuredIndex + 1) % featuredProjects.length;
      renderFeaturedSlide();
    }, 5000);
  }
}

function showContactStatus(message, success) {
  const form = document.getElementById("contact");
  if (!form) return;
  let status = document.getElementById("contact-status");
  if (!status) {
    status = document.createElement("p");
    status.id = "contact-status";
    status.setAttribute("role", "status");
    form.querySelector(".contact-form")?.appendChild(status);
  }
  status.textContent = message;
  status.className = `contact-status ${success ? "success" : "error"}`;
}

function renderProjectsTable(projects) {
  const container = document.getElementById("admin-projects-table-body");
  if (!container) return;

  container.innerHTML = projects.map(p => `
    <tr>
      <td>
        <img src="${p.cover_image || ''}" 
             style="width:40px; height:40px; object-fit:cover; border-radius:6px;" 
             onerror="this.src='https://via.placeholder.com/40'">
      </td>
      <td>
        <strong>${p.title || 'بدون عنوان'}</strong>
        <div style="font-size:11px; color:var(--royal-muted);">${p.model_code || 'بدون كود'}</div>
      </td>
      <td>${p.category || 'عام'}</td>
      <td>${p.city || 'دمشق'}</td>
      <td>
        <span style="color:#2ecc71; font-weight:bold;">${p.status || 'منشور'}</span>
        ${p.featured ? '<br><span style="color:var(--royal-gold); font-size:11px;">⭐ مميز</span>' : ''}
      </td>
      <td>
        <div style="display:flex; gap:5px; flex-wrap:wrap;">
          <button onclick="toggleFeatured('${p.id}', ${p.featured ? 'true' : 'false'})" 
                  style="background:${p.featured ? '#e67e22' : 'var(--royal-gold)'}; color:#000; border:none; padding:5px 8px; border-radius:4px; font-size:11px; cursor:pointer;"
                  title="${p.featured ? 'إلغاء التمييز' : 'جعل مميز'}">
            <i class="fa-solid fa-star"></i> ${p.featured ? 'إلغاء' : 'مميز'}
          </button>
          <button onclick="editProjectModal('${p.id}')" 
                  style="background:#3498db; color:#fff; border:none; padding:5px 8px; border-radius:4px; font-size:11px; cursor:pointer;">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button onclick="deleteProjectRecord('\( {p.id}', ' \){(p.title || '').replace(/'/g, "\\'")}')" 
                  style="background:#e74c3c; color:#fff; border:none; padding:5px 8px; border-radius:4px; font-size:11px; cursor:pointer;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// تبديل حالة المشروع المميز
// ==========================================
async function toggleFeatured(id, currentStatus) {
  const newStatus = currentStatus === true || currentStatus === 'true' ? false : true;

  try {
    const response = await fetch(`${API}/projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: newStatus })
    });
    if (!response.ok) throw new Error("تعذر تحديث حالة المشروع");
    logAction(newStatus ? `تم جعل المشروع مميزاً` : `تم إلغاء تمييز المشروع`);
    loadAdminProjectsTable();
    loadDashboardStats();

    // تحديث الصفحة الرئيسية لو كانت مفتوحة (اختياري)
    if (typeof pushSystemNotification === 'function') {
      pushSystemNotification(newStatus ? "تم إضافة مشروع للمميزة ⭐" : "تم إزالة مشروع من المميزة");
    }
  } catch (error) {
    console.error("خطأ أثناء تحديث المشروع:", error);
    showContactStatus("خطأ أثناء تحديث المشروع: " + error.message, false);
  }
}