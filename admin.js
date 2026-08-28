// ==========================================
// لوحة التحكم - الشام الذهبي (admin.js) - نسخة Node.js & MySQL
// ==========================================

const API_URL = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);

let allProjectsData = [];
let activeCategoryFilter = 'all';

function showAdminStatus(message, type = "success") {
    let status = document.getElementById("admin-status-message");
    if (!status) {
        status = document.createElement("div");
        status.id = "admin-status-message";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        status.style.cssText = "position:fixed;top:18px;right:18px;z-index:3000;max-width:360px;padding:12px 16px;border-radius:9px;color:#fff;font-size:14px;font-weight:700;line-height:1.5;box-shadow:0 8px 24px rgba(0,0,0,.3);opacity:0;transform:translateY(-8px);transition:opacity .2s,transform .2s;direction:rtl;";
        document.body.appendChild(status);
    }
    status.textContent = message;
    status.style.background = type === "error" ? "#c0392b" : "#219653";
    status.style.opacity = "1";
    status.style.transform = "translateY(0)";
    clearTimeout(status.hideTimer);
    status.hideTimer = setTimeout(() => {
        status.style.opacity = "0";
        status.style.transform = "translateY(-8px)";
    }, 3500);
}

// القائمة الجانبية
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar && overlay) {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }
}

// الوضع المظلم والتحكم بالثيم
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');

    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        localStorage.setItem('admin_theme', 'light');
        if (themeBtn) themeBtn.innerText = '☀️';
    } else {
        localStorage.setItem('admin_theme', 'dark');
        if (themeBtn) themeBtn.innerText = '🌙';
    }
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('admin_theme');
    const themeBtn = document.getElementById('theme-toggle');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeBtn) themeBtn.innerText = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        if (themeBtn) themeBtn.innerText = '🌙';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    fetchProjects();
    fetchVisits();
});

// 1. جلب المشاريع من سيرفر Node.js
async function fetchProjects() {
    const categoriesList = document.getElementById("categories-list");
    if (!categoriesList) return;

    categoriesList.innerHTML = `<tr><td colspan="4" class="loading-td" style="text-align: center; padding: 20px;">جاري تحميل المشاريع من السيرفر... ⏳</td></tr>`;

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        allProjectsData = projects || [];
        updateStatsCounters();
        filterAndRenderProjects();
    } catch (error) {
        console.error("خطأ في جلب المشاريع:", error);
        categoriesList.innerHTML = `<tr><td colspan="4" style="color: red; text-align: center; padding: 20px;">حدث خطأ في الاتصال بسيرفر Node.js. تأكد من تشغيله.</td></tr>`;
    }
}

// تحديث الإحصائيات فوق الجدول
function updateStatsCounters() {
    const totalEl = document.getElementById("total-projects-count");
    const pubEl = document.getElementById("published-projects-count");

    if (totalEl) totalEl.textContent = allProjectsData.length;
    if (pubEl) {
        const pubCount = allProjectsData.filter(p => p.status === 'منشور' || p.status === 'active').length;
        pubEl.textContent = pubCount;
    }
}

// التصفية والبحث في المشاريع
function setCategoryFilter(catKey, btnElement) {
    activeCategoryFilter = catKey;

    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    filterAndRenderProjects();
}

function filterAndRenderProjects() {
    const searchInput = document.getElementById("admin-search-input");
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const categoriesList = document.getElementById("categories-list");

    if (!categoriesList) return;

    const filtered = allProjectsData.filter(project => {
        const titleMatch = (project.title || "").toLowerCase().includes(searchValue);
        const descMatch = (project.description || "").toLowerCase().includes(searchValue);
        const catTextMatch = (project.category || "").toLowerCase().includes(searchValue);
        const pageMatch = (project.page_name || "").toLowerCase().includes(searchValue);

        const matchesSearch = titleMatch || descMatch || catTextMatch || pageMatch;

        let matchesCategory = true;
        if (activeCategoryFilter !== 'all') {
            const cat = (project.category || "").toLowerCase();
            const page = (project.page_name || "").toLowerCase();

            if (activeCategoryFilter === 'غرف' || activeCategoryFilter === 'أطفال' || activeCategoryFilter === 'غرف نوم') {
                matchesCategory = cat.includes('غرف') || cat.includes('أطفال') || cat.includes('نوم') || page.includes('kids');
            } else {
                matchesCategory = cat.includes(activeCategoryFilter.toLowerCase()) || page.includes(activeCategoryFilter.toLowerCase());
            }
        }

        return matchesSearch && matchesCategory;
    });

    renderProjectsTable(filtered);
}

// عرض المشاريع في الجدول
function renderProjectsTable(projects) {
    const categoriesList = document.getElementById("categories-list");
    if (!categoriesList) return;

    categoriesList.innerHTML = "";

    if (projects.length === 0) {
        categoriesList.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: var(--text-muted);">لا توجد نتائج مطابقة.</td></tr>`;
        return;
    }

    projects.forEach(project => {
        const tr = document.createElement("tr");
        tr.id = `project-row-${project.id}`;

        const isPublished = project.status === "منشور" || project.status === "active";
        const statusText = isPublished ? "منشور 🚀" : "مخفي ⚪";

        const toggleBtnText = isPublished ? "🚫 إخفاء" : "🚀 نشر";
        const toggleBtnClass = isPublished ? "unpublish-btn" : "publish-btn";

        const categoryDisplay = project.category || "غير محدد";

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${project.cover_image || project.image_url || 'https://via.placeholder.com/50'}" 
                         alt="صورة" 
                         style="width: 45px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color, rgba(212,175,55,0.3));">
                    <span style="font-weight: bold;">${escapeHTML(project.title || "بدون عنوان")}</span>
                </div>
            </td>
            <td>
                <span class="category-badge">${escapeHTML(categoryDisplay)}</span>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">الصفحة: ${escapeHTML(project.page_name || "غير محدد")}</div>
            </td>
            <td id="status-cell-${project.id}">
                <span class="status-badge">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons-group">
                    <button onclick="openEditModal('${project.id}')" class="action-btn-table edit-btn">✏️ تعديل</button>
                    <button id="pub-btn-${project.id}" onclick="togglePublishStatus('${project.id}', '${project.status}', this)" class="action-btn-table ${toggleBtnClass}">${toggleBtnText}</button>
                    <button id="del-btn-${project.id}" onclick="deleteProject('${project.id}', this)" class="action-btn-table delete-btn">🗑️ حذف</button>
                </div>
            </td>
        `;
        categoriesList.appendChild(tr);
    });
}

// 2. تغيير حالة النشر (عبر إرسال طلب PUT لسيرفر Node.js)
async function togglePublishStatus(id, currentStatus, btnElement) {
    const isCurrentlyPublished = (currentStatus === "منشور" || currentStatus === "active");
    const newStatus = isCurrentlyPublished ? "مخفي" : "منشور";

    btnElement.disabled = true;
    btnElement.innerText = "⏳...";

    // إيجاد المشروع الحالي للحفاظ على باقي حقوله عند التحديث
    const project = allProjectsData.find(p => p.id == id);
    if (!project) return;

    const updatedPayload = { ...project, status: newStatus };

    try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPayload)
        });

        const result = await response.json();
        if (response.ok) {
            const pIndex = allProjectsData.findIndex(p => p.id == id);
            if (pIndex !== -1) allProjectsData[pIndex].status = newStatus;

            updateStatsCounters();
            filterAndRenderProjects();
            showAdminStatus(newStatus === "منشور" ? "تم نشر المشروع بنجاح" : "تم إخفاء المشروع بنجاح");
        } else {
            showAdminStatus("فشل التحديث: " + (result.error || "خطأ غير معروف"), "error");
        }
    } catch (error) {
        showAdminStatus("خطأ في الاتصال بسيرفر Node.js.", "error");
    } finally {
        btnElement.disabled = false;
        btnElement.innerText = isCurrentlyPublished ? "🚫 إخفاء" : "🚀 نشر";
    }
}

// 3. حذف مشروع (عبر طلب DELETE لسيرفر Node.js)
async function deleteProject(id, btnElement) {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟")) return;

    btnElement.disabled = true;
    btnElement.innerText = "⏳...";

    try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            allProjectsData = allProjectsData.filter(p => p.id != id);
            updateStatsCounters();
            filterAndRenderProjects();
            showAdminStatus("تم حذف المشروع بنجاح");
        } else {
            showAdminStatus("فشل الحذف: " + (result.error || "خطأ غير معروف"), "error");
        }
    } catch (error) {
        showAdminStatus("خطأ في الاتصال بسيرفر Node.js.", "error");
        btnElement.disabled = false;
        btnElement.innerText = "🗑️ حذف";
    }
}

// عداد الزيارات
async function fetchVisits() {
    const visitsCount = document.getElementById("visits-count");
    if (!visitsCount) return;
    let visits = parseInt(localStorage.getItem("site_visits") || "120");
    visitsCount.textContent = visits;
}

// النافذة المنبثقة للتعديل
function closeEditModal() {
    const modal = document.getElementById("editModal");
    if (modal) modal.style.display = "none";
}

async function openEditModal(id) {
    const modal = document.getElementById("editModal");
    if (modal) modal.style.display = "block";

    const project = allProjectsData.find(p => p.id == id);
    if (!project) return;

    document.getElementById("edit-project-id").value = project.id;
    document.getElementById("edit-title").value = project.title || "";
    document.getElementById("edit-category").value = project.category || "";
    document.getElementById("edit-description").value = project.description || "";
    document.getElementById("edit-city").value = project.city || "";
    document.getElementById("edit-status").value = project.status || "مخفي";

    const preview = document.getElementById("edit-preview");
    if (preview && (project.cover_image || project.image_url)) {
        preview.src = project.cover_image || project.image_url;
    }
}

// حفظ التعديلات عبر سيرفر Node.js (طلب PUT)
const editForm = document.getElementById("editProjectForm");
if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("edit-project-id").value;
        const existingProject = allProjectsData.find(p => p.id == id) || {};

        const updatedData = {
            ...existingProject, // دمج الحقول القديمة لضمان عدم ضياعها
            title: document.getElementById("edit-title").value,
            category: document.getElementById("edit-category").value,
            description: document.getElementById("edit-description").value,
            city: document.getElementById("edit-city").value,
            status: document.getElementById("edit-status").value
        };

        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            if (response.ok) {
                closeEditModal();
                fetchProjects();
                showAdminStatus("تم حفظ تعديلات المشروع بنجاح");
            } else {
                showAdminStatus("فشل التحديث: " + (result.error || ""), "error");
            }
        } catch (error) {
            showAdminStatus("خطأ في الاتصال بسيرفر Node.js.", "error");
        }
    });
}

function escapeHTML(str) {
    if (!str) return "";
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}