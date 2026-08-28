// ==========================================
// الشام الذهبي | صفحة التنجيد والكنبايات (kn)
// ==========================================

const API = window.API_BASE_URL || "http://localhost:5000/api";

let upholsteryProjects = [];

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await fetchUpholsteryProjects();
  setupContactForm();
  listenForProjectUpdates();
});

// ==========================================
// القائمة والوضع
// ==========================================
function toggleMenu() {
  const menu = document.getElementById("side-menu");
  const overlay = document.getElementById("menu-overlay") || document.getElementById("side-menu-overlay");

  if (menu) {
    menu.classList.toggle("open");
    menu.classList.toggle("active");
  }
  if (overlay) overlay.classList.toggle("active");
}

function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById("theme-icon");

  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    if (icon) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
    localStorage.setItem("theme", "light");
  } else {
    if (icon) {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
    localStorage.setItem("theme", "dark");
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const icon = document.getElementById("theme-icon");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (icon) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
  }
}

// ==========================================
// جلب المشاريع
// ==========================================
async function fetchUpholsteryProjects() {
  const container = document.getElementById("projects-container");
  if (!container) return;

  container.innerHTML =
    `<div style="grid-column:1/-1;text-align:center;color:var(--gold-primary,#d4af37);padding:40px;font-weight:bold;">⏳ جاري تحميل موديلات الكنبايات...</div>`;

  try {
    const response = await fetch(`${API}/projects`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `فشل تحميل المشاريع (${response.status})`);

    upholsteryProjects = (Array.isArray(data) ? data : []).filter(project => {
      const values = [project.category, project.page_name].map(value => String(value || "").toLowerCase());
      return values.some(value => ["kn", "up"].includes(value) || value.includes("كنب") || value.includes("تنجيد")) &&
        ["منشور", "active"].includes(String(project.status || ""));
    });
    renderModels(upholsteryProjects);
  } catch (err) {
    console.error("خطأ جلب التنجيد:", err);
    container.innerHTML =
      `<div style="grid-column:1/-1;text-align:center;color:#ff4d4d;padding:40px;">❌ حدث خطأ أثناء تحميل البيانات</div>`;
  }
}

function listenForProjectUpdates() {
  if (!window.EventSource) return;
  const stream = new EventSource(`${API}/stream`);
  stream.addEventListener("notification", event => {
    try {
      const notification = JSON.parse(event.data);
      if (notification.type === "project") fetchUpholsteryProjects();
    } catch (error) {
      console.error("تعذر قراءة تحديث المشاريع:", error);
    }
  });
  stream.onerror = () => stream.close();
}

function getImageUrl(item) {
  let imageList = item.all_images;
  if (typeof imageList === "string") {
    try { imageList = JSON.parse(imageList); } catch { imageList = []; }
  }
  let imageUrl = item.cover_image || item.image_url || (Array.isArray(imageList) && imageList[0]) || "";
  imageUrl = String(imageUrl).trim().replace(/\s+/g, "");

  if (!imageUrl) {
    return "https://placehold.co/600x400/18181c/d4af37?text=الشام+الذهبي";
  }

  // 1) رابط خارجي (ImgBB / Cloudinary)
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // 2) صورة محلية من مجلد images داخل المشروع
  // في قاعدة البيانات ضع مثلاً: images/sofa1.jpg
  if (
    imageUrl.startsWith("images/") ||
    imageUrl.startsWith("./images/") ||
    imageUrl.startsWith("/images/")
  ) {
    return imageUrl.replace(/^\.\//, "").replace(/^\//, "");
  }

  // 3) اسم ملف فقط → نفترض داخل images/
  if (!imageUrl.includes("/") && /\.(jpg|jpeg|png|webp|gif)$/i.test(imageUrl)) {
    return "images/" + imageUrl;
  }

  return imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl;
}

function renderModels(projects) {
  const container = document.getElementById("projects-container");
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML =
      `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted,#a1a1a6);padding:50px;font-size:1.1rem;">لا توجد موديلات في قسم الكنبايات حالياً 🛋️</div>`;
    return;
  }

  container.innerHTML = projects.map(item => {
    const imageUrl = getImageUrl(item);
    const modelCode = item.model_code || (item.model_number ? `KN-${item.model_number}` : "KN");
    const title = escapeHTML(item.title || "طقم كنب فاخر");
    const desc = escapeHTML(item.description || "تنجيد وتفصيل بأعلى الخامات");
    const price = item.price ? escapeHTML(item.price) : "حسب المقاس";
    const phone = "";
    const waText = encodeURIComponent(`مرحبا، استفسار عن: ${item.title || ""} (${modelCode})`);

    return `
      <div class="project-card">
        <div class="card-img-holder">
          <span class="badge-category">تنجيد</span>
          <span class="badge-code">${escapeHTML(modelCode)}</span>
          <img src="${imageUrl}" alt="${title}"
               onerror="this.onerror=null;this.src='https://placehold.co/600x400/18181c/d4af37?text=صورة+غير+متوفرة';">
        </div>
        <div class="gallery-info">
          <h3>${title}</h3>
          <p>${desc}</p>
          <div style="color:var(--gold-primary);font-weight:700;font-size:0.9rem;">${price}</div>

          <div class="card-main-actions">
            <a href="product-details.html?id=${encodeURIComponent(item.id)}" class="btn-preview">
              <i class="fa-solid fa-eye"></i> معاينة والتفاصيل
            </a>
            <a href="chat.html?code=${encodeURIComponent(modelCode)}&title=${encodeURIComponent(item.title || "")}" class="btn-chat-icon" title="محادثة">
              <i class="fa-solid fa-comments"></i>
            </a>
          </div>

          <div class="card-sub-actions">
            <a data-contact-link="phone" href="tel:${phone}" class="btn-sub-action"><i class="fa-solid fa-phone"></i> اتصال</a>
            <a data-contact-link="whatsapp" data-whatsapp-message="${decodeURIComponent(waText)}" href="#" target="_blank" class="btn-sub-action"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
            <a href="bot.html?code=${encodeURIComponent(modelCode)}" class="btn-sub-action"><i class="fa-solid fa-robot"></i> استفسار</a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function filterUpholsteryModels() {
  const input = document.getElementById("search-input");
  if (!input) return;

  const q = input.value.toLowerCase().trim();
  const filtered = upholsteryProjects.filter(item => {
    return (
      (item.title || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      (item.model_code || "").toLowerCase().includes(q)
    );
  });
  renderModels(filtered);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// نموذج التواصل
// ==========================================
function setupContactForm() {
  const msgForm = document.getElementById("visitor-msg-form");
  const successMsg = document.getElementById("form-success-msg");
  if (!msgForm) return;

  msgForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("visitor-name")?.value.trim() || "";
    const phone = document.getElementById("visitor-phone")?.value.trim() || "";
    const message = document.getElementById("visitor-message")?.value.trim() || "";
    const btn = document.getElementById("send-msg-btn");

    if (!name || !message) {
      if (successMsg) {
        successMsg.style.display = "block";
        successMsg.style.color = "#dc3545";
        successMsg.textContent = "يرجى تعبئة الاسم والرسالة";
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "جاري الإرسال...";
    }
    if (successMsg) successMsg.style.display = "none";

    try {
      const response = await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `فشل الإرسال (${response.status})`);

      if (successMsg) {
        successMsg.style.display = "block";
        successMsg.style.background = "rgba(40,167,69,0.15)";
        successMsg.style.border = "1px solid #28a745";
        successMsg.style.color = "#28a745";
        successMsg.textContent = "تم استلام رسالتك بنجاح، شكراً لتواصلك معنا!";
      }
      msgForm.reset();
    } catch (err) {
      console.error(err);
      if (successMsg) {
        successMsg.style.display = "block";
        successMsg.style.background = "rgba(220,53,69,0.15)";
        successMsg.style.border = "1px solid #dc3545";
        successMsg.style.color = "#dc3545";
        successMsg.textContent = "حدث خطأ أثناء الإرسال، حاول لاحقاً.";
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "إرسال الرسالة";
      }
    }
  });
}
