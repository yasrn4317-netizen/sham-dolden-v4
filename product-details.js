const API = window.API_BASE_URL || "http://localhost:5000/api";

// ==========================================
// 2. التشغيل عند تحميل الصفحة
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    setDetailsStatus("جاري تحميل بيانات المشروع...", "loading");
    loadProjectDetails();
    initSidebarMenu();
    initThemeToggle();
});

// ==========================================
// 3. جلب بيانات المشروع مع المعالجة الجذرية للأخطاء
// ==========================================
async function loadProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");

    if (!projectId) {
        showErrorMessage("لم يتم تحديد مشروع لمعاينته في الرابط.");
        return;
    }

    try {
        const response = await fetch(`${API}/projects/${encodeURIComponent(projectId)}`);
        const project = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(project.error || "لم نتمكن من العثور على تفاصيل هذا المشروع.");

        renderProjectDetails(project);
        setDetailsStatus("تم تحميل تفاصيل المشروع", "success");

    } catch (err) {
        console.error("خطأ في التحميل:", err);
        showErrorMessage(err.message);
    }
}

function renderProjectDetails(project) {
    const titleText = project.title || "مشروع بدون عنوان";

    // تحديث العناوين الكبرى والوصف في هيكل product-details.html
    setElementText("project-title", titleText);
    setElementText("hero-title", titleText);
    setElementText("card-project-title", titleText);
    setElementText("project-desc", project.description || "لا يوجد وصف تفصيلي متوفر لهذا المشروع حالياً.");
    setElementText("hero-desc", project.description || "لا يوجد وصف تفصيلي متوفر لهذا المشروع حالياً.");

    // تحديث قيم الإحصائيات أو المواصفات داخل الكرت
    setElementText("category-val", project.category || "غير محدد");
    setElementText("materials-val", project.materials || "حسب الطلب");
    setElementText("duration-val", project.duration || "غير محددة");
    setElementText("city-val", project.city || "غير محددة");
    setElementText("model-code-val", project.model_code || (project.model_number ? `${String(project.category || "").toUpperCase()}-${project.model_number}` : "غير محدد"));

    // معالجة صور المعرض بشكل آمن وجذري (مصفوفة أو نص مخزن)
    let imagesList = [];
    try {
        if (Array.isArray(project.all_images)) {
            imagesList = project.all_images;
        } else if (typeof project.all_images === 'string' && project.all_images.trim() !== '') {
            imagesList = JSON.parse(project.all_images);
        }
    } catch (e) {
        console.error("خطأ في تحليل صور المعرض:", e);
    }

    const defaultImg = "https://placehold.co/600x400/141414/d4af37?text=صورة+غير+متوفرة";
    const primaryImage = normalizeImageUrl(project.cover_image || (imagesList.length > 0 ? imagesList[0] : "")) || defaultImg;

    const mainImg = document.getElementById("project-main-img");
    if (mainImg) {
        mainImg.src = primaryImage;
        mainImg.alt = titleText;
        mainImg.style.display = "block";
        mainImg.onerror = () => {
            mainImg.onerror = null;
            mainImg.src = defaultImg;
        };
        const downloadLink = document.getElementById("download-project-image");
        if (downloadLink) downloadLink.href = primaryImage;
    }

    // بناء معرض الصور المصغرة تحت الصورة الرئيسية
    renderImageGallery(imagesList, primaryImage);

    const whatsappMsg = encodeURIComponent(`مرحباً الشام الذهبي، أود الاستفسار عن الموديل: (${titleText}) - المدينة: ${project.city || 'عام'}`);
    const whatsappBtn = document.getElementById("btn-whatsapp");
    if (whatsappBtn) {
        whatsappBtn.dataset.whatsappMessage = decodeURIComponent(whatsappMsg);
    }

    // ربط زر العودة للقسم أو المعرض
    const categoryBtn = document.getElementById("btn-category-page");
    if (categoryBtn && project.category) {
        categoryBtn.href = categoryPage(project.category);
    }

    const shareButton = document.getElementById("share-project-btn");
    if (shareButton) {
        shareButton.onclick = async () => {
            const shareData = { title: titleText, text: `شاهد مشروع ${titleText}`, url: window.location.href };
            try {
                if (navigator.share) await navigator.share(shareData);
                else await navigator.clipboard.writeText(window.location.href);
                shareButton.innerHTML = '<i class="fa-solid fa-check"></i> تم نسخ الرابط';
                setTimeout(() => { shareButton.innerHTML = '<i class="fa-solid fa-share-nodes"></i> مشاركة المشروع'; }, 1800);
            } catch (_) {
                setDetailsStatus("لم تتم المشاركة", "error");
            }
        };
    }
}

// ==========================================
// معرض الصور المصغرة (Thumbnails)
// ==========================================
function renderImageGallery(images, activeImgSrc) {
    const galleryContainer = document.getElementById("project-gallery-thumbs");
    if (!galleryContainer) return;

    galleryContainer.innerHTML = "";
    if (!images || !Array.isArray(images) || images.length === 0) {
        galleryContainer.style.display = "none";
        return;
    }

    galleryContainer.style.display = "flex";

    images.forEach((imgUrl) => {
        if (!imgUrl) return;
        const thumb = document.createElement("img");
        thumb.src = normalizeImageUrl(imgUrl) || "https://placehold.co/120x90/141414/d4af37?text=صورة";
        thumb.alt = "صورة إضافية للمشروع";
        thumb.onerror = () => { thumb.onerror = null; thumb.src = "https://placehold.co/120x90/141414/d4af37?text=صورة"; };
        thumb.className = "thumb-img" + (thumb.src === activeImgSrc ? " active" : "");

        thumb.onclick = function () {
            const mainImg = document.getElementById("project-main-img");
            if (mainImg) mainImg.src = thumb.src;

            document.querySelectorAll(".thumb-img").forEach(el => el.classList.remove("active"));
            thumb.classList.add("active");
        };

        galleryContainer.appendChild(thumb);
    });
}

function normalizeImageUrl(value) {
    const image = String(value || "").trim();
    if (!image) return "";
    if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
    if (image.startsWith("./")) return "/" + image.slice(2);
    if (image.startsWith("images/")) return "/" + image;
    return "/images/" + image;
}

function categoryPage(category) {
    const value = String(category || "").toLowerCase();
    if (value === "gb" || value.includes("جبس")) return "gypsum.html";
    if (value === "kd" || value === "kids-room" || value === "bedroom" || value.includes("طفل")) return "kids-room.html";
    if (value === "kn" || value === "up" || value.includes("تنجيد") || value.includes("كنب")) return "upholstery.html";
    if (value === "dc" || value.includes("ثلاثي") || value.includes("ديكور")) return "3d.html";
    return "gallery.html";
}

// ==========================================
// 6. التحكم بالقائمة الجانبية (Sidebar)
// ==========================================
function initSidebarMenu() {
    const menuBtn = document.getElementById("open-menu-btn");
    const sidebar = document.getElementById("sidebar-menu");
    const overlay = document.getElementById("sidebar-overlay");
    const closeBtn = document.getElementById("close-sidebar");

    function openMenu() {
        if (sidebar) sidebar.classList.add("active");
        if (overlay) overlay.classList.add("active");
    }

    function closeMenu() {
        if (sidebar) sidebar.classList.remove("active");
        if (overlay) overlay.classList.remove("active");
    }

    if (menuBtn) menuBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);
}

// ==========================================
// 7. التحكم بالوضع المظلم/الفاتح (Theme Toggle)
// ==========================================
function initThemeToggle() {
    const themeBtn = document.getElementById("theme-toggle-btn");
    const savedTheme = localStorage.getItem("app-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        if (themeBtn) themeBtn.innerText = "☀️";
    } else {
        document.body.classList.remove("light-mode");
        if (themeBtn) themeBtn.innerText = "🌙";
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");

            themeBtn.innerText = isLight ? "☀️" : "🌙";
            localStorage.setItem("app-theme", isLight ? "light" : "dark");
        });
    }
}

// ==========================================
// 8. المساعد الآلي والتنبيهات
// ==========================================
function toggleRobotChat() {
    const modal = document.getElementById("robot-chat-modal");
    if (modal) {
        modal.style.display = (modal.style.display === "none" || modal.style.display === "") ? "flex" : "none";
    }
}

function sendRobotQuery(type) {
    const responseBox = document.getElementById("robot-response");
    if (!responseBox) return;

    if (type === 'help_choice') {
        responseBox.innerHTML = "<p>💡 يمكنك اختيار القسم المناسب من المعرض أو التواصل معنا مباشرة عبر الواتساب لاقتراح الموديل المطلوب.</p>";
    } else if (type === 'report_issue') {
        responseBox.innerHTML = "<p>⚠️ شكراً لتنبيهنا، يسعدنا تواصلك معنا لتوضيح المشكلة وسنعمل على معالجتها فوراً.</p>";
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function showErrorMessage(msg) {
    setDetailsStatus(msg, "error");
    setElementText("project-title", "⚠️ تعذر تحميل البيانات");
    setElementText("hero-title", "خطأ في التحميل");
    setElementText("card-project-title", "خطأ في الاتصال");
    setElementText("project-desc", msg);
    setElementText("hero-desc", msg);
}

function setDetailsStatus(message, type) {
    const status = document.getElementById("details-status");
    if (!status) return;
    status.textContent = message || "";
    status.className = `details-status ${type || ""}`;
}
