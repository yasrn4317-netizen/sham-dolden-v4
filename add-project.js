// ==========================================
// إضافة مشروع | متوافق مع السيرفر المحلي (MySQL)
// ==========================================

const form = document.getElementById("projectForm");
const coverInput = document.getElementById("cover_image");
const coverPreview = document.getElementById("coverPreview");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const categorySelect = document.getElementById("category");
const codeHint = document.getElementById("codeHint");
const statusMessage = document.getElementById("statusMessage");
const saveBtn = document.getElementById("saveBtn");

function buildModelCode(category, number) {
  return String(category || "XX").toUpperCase() + "-" + number;
}

// جلب الرقم التسلسلي التالي من السيرفر المحلي
async function getNextModelNumber(category) {
  try {
    const apiUrl = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);
    const res = await fetch(`${apiUrl}/projects`);
    const data = await res.json();

    // تصفية المشاريع حسب القسم الحالي فقط
    const categoryProjects = (data || []).filter(p => p.category === category);

    let max = 0;
    categoryProjects.forEach(p => {
      if (p.model_number != null && !isNaN(p.model_number)) {
        max = Math.max(max, Number(p.model_number));
      } else if (p.model_code) {
        const m = String(p.model_code).match(/(\d+)\s*$/);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      }
    });
    return max + 1;
  } catch (err) {
    console.error("getNextModelNumber:", err);
    return 1;
  }
}

function normalizeImagePath(raw) {
  let v = String(raw || "").trim().replace(/\s+/g, "");
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  v = v.replace(/^\.\//, "").replace(/^\//, "");
  if (v === "images" || v === "images/") return "";
  if (!v.includes("/") && /\.(jpg|jpeg|png|webp|gif)$/i.test(v)) {
    return "images/" + v;
  }
  return v;
}

function previewImageUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return "/" + path.replace(/^\/+/, "");
}

function isValidImageRef(v) {
  if (!v) return false;
  if (/^https?:\/\//i.test(v)) return true;
  if (v.startsWith("images/")) return true;
  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(v)) return true;
  return false;
}

if (coverInput) {
  coverInput.addEventListener("input", () => {
    const url = normalizeImagePath(coverInput.value);
    if (isValidImageRef(url)) {
      coverPreview.src = previewImageUrl(url);
      coverPreview.style.display = "block";
      previewPlaceholder.style.display = "none";
      coverPreview.onerror = () => {
        coverPreview.style.display = "none";
        previewPlaceholder.style.display = "block";
        previewPlaceholder.textContent = "تعذر تحميل الصورة — تأكد من المسار أو الرابط";
      };
    } else {
      coverPreview.style.display = "none";
      previewPlaceholder.style.display = "block";
      previewPlaceholder.textContent = "المعاينة تظهر هنا بعد إدخال المسار أو الرابط";
    }
  });
}

if (categorySelect) {
  categorySelect.addEventListener("change", async () => {
    const cat = categorySelect.value;
    if (!cat) {
      if (codeHint) codeHint.textContent = "";
      return;
    }
    const next = await getNextModelNumber(cat);
    const code = buildModelCode(cat, next);
    if (codeHint) {
      codeHint.textContent = "الكود التالي تلقائياً: " + code + " (يمكنك تعديله يدوياً)";
    }
    const codeInput = document.getElementById("model_code");
    if (codeInput && !codeInput.value.trim()) {
      codeInput.placeholder = code;
    }
  });
}

function showStatus(text, ok) {
  if (!statusMessage) return;
  statusMessage.style.display = "block";
  statusMessage.textContent = text;
  statusMessage.className = "status " + (ok ? "ok" : "err");
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title")?.value.trim();
    const category = categorySelect?.value;
    const cover_image = normalizeImagePath(coverInput?.value);

    if (!title) return showStatus("اكتب اسم المشروع", false);
    if (!category) return showStatus("اختر القسم", false);
    if (!isValidImageRef(cover_image)) {
      return showStatus("أدخل مسار صورة (images/..) أو رابط https صحيح", false);
    }

    let modelNumber = await getNextModelNumber(category);
    let model_code = (document.getElementById("model_code")?.value || "").trim().toUpperCase();

    if (!model_code) {
      model_code = buildModelCode(category, modelNumber);
    } else {
      const m = model_code.match(/(\d+)\s*$/);
      if (m) modelNumber = parseInt(m[1], 10) || modelNumber;
    }

    const row = {
      title,
      category,
      page_name: category,
      model_code,
      model_number: modelNumber,
      cover_image,
      all_images: JSON.stringify([cover_image]), // تحويل المصفوفة لنص لتتوافق مع MySQL
      description: document.getElementById("description")?.value.trim() || "",
      city: document.getElementById("city")?.value.trim() || "",
      price: document.getElementById("price")?.value.trim() || "",
      materials: document.getElementById("materials")?.value.trim() || "",
      duration: document.getElementById("duration")?.value.trim() || "",
      status: "منشور",
      featured: document.getElementById("featured")?.checked ? 1 : 0
    };

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = "جاري الحفظ...";
    }

    try {
      const apiUrl = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);
      const response = await fetch(`${apiUrl}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "فشل الحفظ");

      showStatus("تم نشر المشروع — الكود: " + model_code, true);
      form.reset();
      if (coverPreview) coverPreview.style.display = "none";
      if (previewPlaceholder) {
        previewPlaceholder.style.display = "block";
        previewPlaceholder.textContent = "المعاينة تظهر هنا بعد إدخال المسار أو الرابط";
      }
      if (codeHint) codeHint.textContent = "";
      console.log("تم الحفظ بنجاح:", result);
    } catch (err) {
      console.error(err);
      showStatus("خطأ: " + (err.message || "فشل الحفظ"), false);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-rocket"></i> نشر المشروع';
      }
    }
  });
}

document.getElementById("resetBtn")?.addEventListener("click", () => {
  if (coverPreview) coverPreview.style.display = "none";
  if (previewPlaceholder) {
    previewPlaceholder.style.display = "block";
    previewPlaceholder.textContent = "المعاينة تظهر هنا بعد إدخال المسار أو الرابط";
  }
  if (statusMessage) statusMessage.style.display = "none";
  if (codeHint) codeHint.textContent = "";
});