// ==========================================
// الشام الذهبي | صفحة الجبس بورد (gb)
// ==========================================

const API = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);
let allGypsumProjects = [];

function toggleMenu() {
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  if (sideMenu) sideMenu.classList.toggle("open");
  if (overlay) overlay.classList.toggle("active");
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  updateThemeIcon(isLight);
}

function updateThemeIcon(isLight) {
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.innerText = isLight ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  fetchGypsumProjects();
  setupContactForm();
});

async function fetchGypsumProjects() {
  const galleryGrid = document.getElementById("galleryGrid");

  try {
    const response = await fetch(`${API}/projects`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `فشل تحميل المشاريع (${response.status})`);

    allGypsumProjects = (Array.isArray(data) ? data : []).filter(project =>
      [project.category, project.page_name].some(value => {
        const category = String(value || "").toLowerCase();
        return category === "gb" || category === "جبس بورد" || category.includes("جبس");
      }) && ["منشور", "active"].includes(String(project.status || ""))
    );
    renderProjects(allGypsumProjects);
  } catch (err) {
    console.error("خطأ جلب الجبس:", err);
    if (galleryGrid) {
      galleryGrid.innerHTML = `
        <p style="text-align:center;grid-column:1/-1;color:var(--text-muted);padding:30px 0;">
          حدث خطأ أثناء تحميل البيانات
        </p>`;
    }
  }
}

function getImageUrl(item) {
  let imageUrl = item.cover_image || item.image_url || (item.all_images && item.all_images[0]) || "";
  imageUrl = String(imageUrl).trim().replace(/\s+/g, "");

  if (!imageUrl) {
    return "https://placehold.co/600x400/18181c/d4af37?text=الشام+الذهبي";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (
    imageUrl.startsWith("images/") ||
    imageUrl.startsWith("./images/") ||
    imageUrl.startsWith("/images/")
  ) {
    return imageUrl.replace(/^\.\//, "").replace(/^\//, "");
  }

  if (!imageUrl.includes("/") && /\.(jpg|jpeg|png|webp|gif)$/i.test(imageUrl)) {
    return "images/" + imageUrl;
  }

  return imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl;
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

function renderProjects(projects) {
  const galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;

  if (!projects || projects.length === 0) {
    galleryGrid.innerHTML = `
      <p style="text-align:center;grid-column:1/-1;color:var(--text-muted);padding:40px 0;">
        لا توجد تصاميم في قسم الجبس بورد حالياً
      </p>`;
    return;
  }

  const phone = "";

  galleryGrid.innerHTML = projects.map(item => {
    const imageUrl = getImageUrl(item);
    const modelCode = item.model_code || (item.model_number ? `GB-${item.model_number}` : "GB");
    const title = escapeHTML(item.title || "تصميم جبس بورد");
    const desc = escapeHTML(item.description || "تصميم دقيق وتنفيذ باحترافية");
    const waText = encodeURIComponent(`مرحبا، استفسار عن: ${item.title || ""} (${modelCode})`);
    const safeImg = imageUrl.replace(/'/g, "\\'");

    return `
      <div class="gallery-card">
        <div style="overflow:hidden;position:relative;">
          <span style="position:absolute;top:12px;right:12px;background:rgba(15,15,17,0.85);border:1px solid rgba(212,175,55,0.4);color:#d4af37;padding:5px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;z-index:2;">جبس بورد</span>
          <span style="position:absolute;top:12px;left:12px;background:rgba(15,15,17,0.85);border:1px solid rgba(212,175,55,0.4);color:#d4af37;padding:5px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;z-index:2;">${escapeHTML(modelCode)}</span>
          <img src="${imageUrl}" alt="${title}"
               style="cursor:pointer;"
               onclick="openLightbox('${safeImg}')"
               onerror="this.onerror=null;this.src='https://placehold.co/600x400/18181c/d4af37?text=صورة+غير+متوفرة';">
        </div>
        <div class="gallery-info" style="padding:15px;">
          <h3 style="margin-bottom:6px;font-size:1.05rem;color:#fff;">${title}</h3>
          <p style="font-size:0.85rem;color:#a1a1a8;margin-bottom:12px;">${desc}</p>

          <div style="display:flex;gap:8px;margin-top:8px;">
            <a href="product-details.html?id=${encodeURIComponent(item.id)}"
               style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.35);color:#d4af37;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.85rem;">
              <i class="fa-solid fa-eye"></i> معاينة والتفاصيل
            </a>
            <a href="chat.html?code=${encodeURIComponent(modelCode)}&title=${encodeURIComponent(item.title || "")}"
               style="width:45px;display:flex;align-items:center;justify-content:center;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.35);color:#d4af37;border-radius:10px;text-decoration:none;"
               title="محادثة">
              <i class="fa-solid fa-comments"></i>
            </a>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;">
            <a data-contact-link="phone" href="tel:${phone}"
               style="text-align:center;padding:10px 4px;background:linear-gradient(135deg,#bf953f,#fcf6ba,#b38728);color:#000;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.75rem;">
              <i class="fa-solid fa-phone"></i> اتصال
            </a>
            <a data-contact-link="whatsapp" data-whatsapp-message="${decodeURIComponent(waText)}" href="#" target="_blank"
               style="text-align:center;padding:10px 4px;background:linear-gradient(135deg,#bf953f,#fcf6ba,#b38728);color:#000;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.75rem;">
              <i class="fa-brands fa-whatsapp"></i> واتساب
            </a>
            <a href="bot.html?code=${encodeURIComponent(modelCode)}"
               style="text-align:center;padding:10px 4px;background:linear-gradient(135deg,#bf953f,#fcf6ba,#b38728);color:#000;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.75rem;">
              <i class="fa-solid fa-robot"></i> استفسار
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function filterCategory(subCategory, btnElement) {
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");

  if (subCategory === "الكل") {
    renderProjects(allGypsumProjects);
  } else {
    const filtered = allGypsumProjects.filter(p =>
      (p.title && p.title.includes(subCategory)) ||
      (p.description && p.description.includes(subCategory))
    );
    renderProjects(filtered);
  }
}

function openLightbox(imgSrc) {
  if (!imgSrc) return;
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  if (lightbox && lightboxImg) {
    lightboxImg.src = imgSrc;
    lightbox.classList.add("active");
  }
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) lightbox.classList.remove("active");
}

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
