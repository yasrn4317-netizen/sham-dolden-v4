// ==========================================
// لوحة البارون | الشام الذهبي
// سيرفر محلي فقط — بدون Supabase
// ==========================================
const LOCAL_API = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);

async function api(path, options = {}) {
  const opts = { ...options };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  opts.signal = options.signal || controller.signal;
  opts.headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  if (opts.body && typeof opts.body === "object") {
    opts.body = JSON.stringify(opts.body);
  }
  let res;
  try {
    res = await fetch(LOCAL_API + path, opts);
  } catch (error) {
    if (error.name === "AbortError") throw new Error("انتهت مهلة الاتصال بالسيرفر");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  let data = null;
  try { data = await res.json(); } catch (_) { data = null; }
  if (!res.ok) {
    const msg = (data && data.error) || ("خطأ " + res.status);
    throw new Error(msg);
  }
  return data;
}

async function localFetch(path, options) {
  return api(path, options);
}

let globalProjectsData = [];
let settingRowId = null;
let pendingProjectDelete = null;

function showActionMessage(message, type = "success") {
  let notice = document.getElementById("baron-action-message");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "baron-action-message";
    notice.setAttribute("role", "status");
    notice.style.cssText = "position:fixed;top:20px;right:20px;z-index:3000;max-width:360px;padding:12px 18px;border-radius:10px;color:#fff;font-size:14px;font-weight:700;line-height:1.5;box-shadow:0 8px 24px rgba(0,0,0,.3);transition:opacity .25s ease;direction:rtl;";
    document.body.appendChild(notice);
  }
  notice.textContent = message;
  notice.style.background = type === "error" ? "#c0392b" : "#219653";
  notice.style.opacity = "1";
  clearTimeout(notice.hideTimer);
  notice.hideTimer = setTimeout(() => { notice.style.opacity = "0"; }, 3500);
}

// ==========================================
// التشغيل عند التحميل
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  checkDatabaseConnection();
  loadDashboardStats();
  loadAdminProjectsTable();
  loadAdminMessages();
  loadBotRepliesList();
  loadSiteSettings();
  loadAuditLogs();
  setupFormsHandlers();
  loadNotifications();
  subscribeToNotifications();

  const editForm = document.getElementById("edit-project-form");
  if (editForm) editForm.addEventListener("submit", saveEditedProject);
});

// ==========================================
// التنقل بين الصفحات
// ==========================================
function switchPage(pageId) {
  document.querySelectorAll(".page-section, .royal-section").forEach(s => {
    s.classList.remove("active");
    s.classList.remove("active-section");
    s.style.display = "none";
  });

  const section =
    document.getElementById("page-" + pageId) ||
    document.getElementById("sec-" + pageId) ||
    document.getElementById(pageId);

  if (section) {
    section.classList.add("active");
    section.classList.add("active-section");
    section.style.display = "block";
  }

  const notificationsDropdown = document.getElementById("notifications-dropdown");
  if (notificationsDropdown) {
    notificationsDropdown.classList.remove("open");
    notificationsDropdown.style.display = "none";
  }

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const navBtn = document.getElementById("nav-" + pageId);
  if (navBtn) navBtn.classList.add("active");

  document.querySelectorAll(".royal-tab").forEach(b => b.classList.remove("active"));
  const tabBtn = document.querySelector(`.royal-tab[onclick*="'${pageId}'"]`);
  if (tabBtn) tabBtn.classList.add("active");

  const titles = {
    dashboard: "لوحة التحكم",
    projects: "إدارة المشاريع",
    messages: "الرسائل",
    pages: "إدارة الصفحات",
    bot: "ذكاء البوت",
    settings: "إعدادات الموقع",
    reports: "التقارير",
    admins: "المديرين"
  };
  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = titles[pageId] || "لوحة التحكم";

  if (pageId === "messages" && typeof loadAdminMessages === "function") loadAdminMessages();
  if (pageId === "projects" && typeof loadAdminProjectsTable === "function") loadAdminProjectsTable();
  if (pageId === "dashboard" && typeof loadDashboardStats === "function") loadDashboardStats();

  if (window.innerWidth < 900) toggleSidebar(true);
}

function switchRoyalTab(pageId, btnEl) {
  if (pageId === "pages") setTimeout(() => { if (typeof loadPagesMap === "function") loadPagesMap(); }, 0);
  switchPage(pageId);
  if (btnEl && btnEl.classList) {
    document.querySelectorAll(".nav-btn, .royal-tab").forEach(b => b.classList.remove("active"));
    btnEl.classList.add("active");
    const sideBtn = document.getElementById("nav-" + pageId);
    if (sideBtn) sideBtn.classList.add("active");
  }
}

function toggleSidebar(forceClose) {
  const sidebar = document.getElementById("mainSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (!sidebar) return;

  if (forceClose === true) {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
    return;
  }

  const isOpen = sidebar.classList.contains("open");
  if (isOpen) {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  } else {
    sidebar.classList.add("open");
    if (overlay) overlay.classList.add("active");
    if (window.innerWidth < 900) document.body.style.overflow = "hidden";
  }
}

// ==========================================
// فحص الاتصال
// ==========================================
async function checkDatabaseConnection() {
  const el = document.getElementById("db-status") || document.getElementById("connection-status");
  try {
    await api("/health");
    if (el) {
      el.textContent = "متصل بالسيرفر المحلي";
      el.style.color = "#2ecc71";
    }
  } catch (err) {
    if (el) {
      el.textContent = "السيرفر غير متصل — شغّل node server.js";
      el.style.color = "#e74c3c";
    }
    console.error(err);
  }
}

// ==========================================
// العدادات
// ==========================================
function animateCounter(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("skeleton");
  let current = 0;
  const step = Math.ceil(value / 20) || 1;
  const timer = setInterval(() => {
    current += step;
    if (current >= value) {
      el.innerText = value;
      clearInterval(timer);
    } else {
      el.innerText = current;
    }
  }, 40);
}

async function loadDashboardStats() {
  try {
    const projects = await api("/projects");
    const list = Array.isArray(projects) ? projects : [];
    const messages = await api("/messages").catch(() => []);
    const msgList = Array.isArray(messages) ? messages : [];
    const settings = await api("/settings").catch(() => ({}));

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("stat-projects", list.length);
    set("stat-featured", list.filter(p => p.featured == 1 || p.featured === true).length);
    set("stat-messages", msgList.length);
    set("visits-count", settings.visits != null ? settings.visits : "—");
    set("stat-visits", settings.visits != null ? settings.visits : "—");
  } catch (err) {
    console.error("stats:", err);
  }
}

function buildModelCode(category, number) {
  return String(category || "XX").toUpperCase() + "-" + number;
}

async function getNextModelNumber(category) {
  try {
    const data = await api("/projects?category=" + encodeURIComponent(category));
    const list = Array.isArray(data) ? data : [];
    let max = 0;
    list.forEach(p => {
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

async function loadAdminProjectsTable() {
  const container = document.getElementById("admin-projects-table-body");
  if (!container) return;

  try {
    const data = await api("/projects");
    globalProjectsData = Array.isArray(data) ? data : [];

    if (globalProjectsData.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--muted);">لا توجد مشاريع</td></tr>`;
      return;
    }
    renderProjectsTable(globalProjectsData);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#e74c3c;">خطأ في الجلب</td></tr>`;
  }
}

function renderProjectsTable(projects) {
  const container = document.getElementById("admin-projects-table-body");
  if (!container) return;

  const catNames = { kn: "كنبايات", gb: "جبس", dc: "3D", kd: "أطفال", "3d": "3D", bedroom: "أطفال", upholstery: "كنبايات", Gypsum: "جبس" };

  container.innerHTML = projects.map(p => {
    const isFeatured = p.featured === true || p.featured === 1 || p.featured === "1";
    const status = p.status || "منشور";
    const isPublished = status === "منشور" || status === "active";
    const safeTitle = String(p.title || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");

    return `
    <tr>
      <td>
        <img src="${p.cover_image || ""}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"
             onerror="this.src='https://placehold.co/40x40/18181c/d4af37?text=—'">
      </td>
      <td>
        <strong>${p.title || "بدون عنوان"}</strong>
        <div style="font-size:11px;color:var(--muted);">${p.model_code || ""}</div>
      </td>
      <td>${catNames[p.category] || p.category || "—"}</td>
      <td>${p.city || "—"}</td>
      <td>
        <span style="color:${isPublished ? "#2ecc71" : "#e74c3c"};font-weight:bold;">
          ${isPublished ? "منشور" : "مخفي"}
        </span>
        ${isFeatured ? '<br><span style="color:var(--gold);font-size:11px;">⭐ مميز</span>' : ""}
      </td>
      <td>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
          <button onclick="toggleFeatured('${p.id}', ${isFeatured})"
            style="width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;background:${isFeatured ? "#f39c12" : "#2a2a2e"};color:${isFeatured ? "#111" : "#d4af37"};border:1px solid ${isFeatured ? "#f39c12" : "#444"};border-radius:8px;font-size:14px;cursor:pointer;padding:0;"
            title="${isFeatured ? "إلغاء التمييز" : "تمييز"}">
            <i class="fa-solid fa-star"></i>
          </button>
          <button onclick="togglePublishStatus('${p.id}', '${status}')"
            style="width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;background:${isPublished ? "#5a5a5a" : "#27ae60"};color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;padding:0;"
            title="${isPublished ? "إخفاء" : "نشر"}">
            <i class="fa-solid ${isPublished ? "fa-eye-slash" : "fa-eye"}"></i>
          </button>
          <button onclick="openEditModal('${p.id}')"
            style="width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;background:#3498db;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;padding:0;"
            title="تعديل">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button onclick="deleteProjectRecord('${p.id}', '${safeTitle}')"
            style="width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;background:#e74c3c;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;padding:0;"
            title="حذف">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

function filterProjectsTable() {
  const search = (document.getElementById("proj-search")?.value || "").toLowerCase();
  const cat = document.getElementById("proj-filter-cat")?.value || "all";
  const filtered = globalProjectsData.filter(p => {
    const matchSearch =
      (p.title || "").toLowerCase().includes(search) ||
      (p.model_code || "").toLowerCase().includes(search);
    const matchCat = cat === "all" || p.category === cat || p.page_name === cat;
    return matchSearch && matchCat;
  });
  renderProjectsTable(filtered);
}

async function toggleFeatured(id, current) {
  try {
    await api("/projects/" + id, { method: "PATCH", body: { featured: !current } });
  } catch (error) {
    console.error("toggleFeatured:", error);
    showActionMessage("تعذر تغيير تمييز المشروع", "error");
    return;
  }
  const message = !current ? "تم إضافة المشروع إلى المشاريع المميزة" : "تم إلغاء تمييز المشروع";
  showActionMessage(message);
  logAction(message);
  loadAdminProjectsTable();
  loadDashboardStats();
}

async function togglePublishStatus(id, status) {
  const isPub = status === "منشور" || status === "active";
  const newStatus = isPub ? "مخفي" : "منشور";
  try {
    await api("/projects/" + id, { method: "PATCH", body: { status: newStatus } });
  } catch (error) { showActionMessage("خطأ: " + error.message, "error"); return; }
  showActionMessage(newStatus === "منشور" ? "تم نشر المشروع" : "تم إخفاء المشروع");
  logAction(newStatus === "منشور" ? "تم نشر مشروع" : "تم إخفاء مشروع");
  loadAdminProjectsTable();
  loadDashboardStats();
}

async function deleteProjectRecord(id, title) {
  pendingProjectDelete = { id, title };
  const modal = document.getElementById("delete-project-confirm");
  const name = document.getElementById("delete-project-name");
  if (name) name.textContent = title ? "المشروع: " + title : "لا يمكن التراجع عن هذا الإجراء.";
  if (modal) {
    modal.style.display = "flex";
    return;
  }
  await confirmProjectDelete();
}

async function confirmProjectDelete() {
  if (!pendingProjectDelete) return;
  const { id, title } = pendingProjectDelete;
  pendingProjectDelete = null;
  cancelProjectDelete();
  try {
    await api("/projects/" + id, { method: "DELETE" });
  } catch (error) { showActionMessage("خطأ: " + error.message, "error"); return; }
  showActionMessage("تم حذف المشروع");
  logAction("تم حذف مشروع: " + title);
  loadAdminProjectsTable();
  loadDashboardStats();
}

function cancelProjectDelete() {
  const modal = document.getElementById("delete-project-confirm");
  if (modal) modal.style.display = "none";
  pendingProjectDelete = null;
}

async function openEditModal(id) {
  const p = globalProjectsData.find(x => String(x.id) === String(id));
  if (!p) {
    showActionMessage("المشروع غير موجود في القائمة", "error");
    return;
  }
  const modal = document.getElementById("edit-project-modal");
  if (!modal) {
    showActionMessage("نافذة التعديل غير موجودة في الصفحة", "error");
    return;
  }
  const set = (idEl, val) => {
    const el = document.getElementById(idEl);
    if (el) el.value = val;
  };
  set("edit-id", p.id);
  set("edit-title", p.title || "");
  set("edit-code", p.model_code || "");
  set("edit-category", p.category || "kn");
  set("edit-city", p.city || "");
  set("edit-image", p.cover_image || "");
  set("edit-status", p.status || "منشور");
  set("edit-desc", p.description || "");
  modal.style.display = "flex";
}

function closeEditModal() {
  const m = document.getElementById("edit-project-modal");
  if (m) m.style.display = "none";
}

async function saveEditedProject(e) {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;
  const cat = document.getElementById("edit-category").value;
  const data = {
    title: document.getElementById("edit-title").value,
    model_code: document.getElementById("edit-code").value,
    category: cat,
    page_name: cat,
    city: document.getElementById("edit-city").value,
    cover_image: document.getElementById("edit-image").value,
    status: document.getElementById("edit-status").value,
    description: document.getElementById("edit-desc").value
  };
  try {
    await api("/projects/" + id, { method: "PATCH", body: data });
  } catch (error) { showActionMessage("خطأ: " + error.message, "error"); return; }
  showActionMessage("تم حفظ تعديلات المشروع");
  logAction("تم تعديل مشروع: " + data.title);
  closeEditModal();
  loadAdminProjectsTable();
  loadDashboardStats();
}

// ==========================================
// الرسائل
// ==========================================


async function loadAdminMessages() {
  const box = document.getElementById("admin-messages-container");
  if (!box) return;

  try {
    let data = [];
    try {
      const local = await localFetch("/messages");
      data = Array.isArray(local) ? local : (local.data || []);
    } catch (e) {
      throw e;
    }

    if (!data || data.length === 0) {
      box.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">لا توجد رسائل</p>';
      window.__adminMessages = [];
      return;
    }

    window.__adminMessages = data;
    window.__msgFull = {};
    let html = "";

    data.forEach(function (m) {
      const id = m.id;
      const name = m.name || "زائر";
      const phone = m.phone || m.email || "";
      const fullText = m.message || m.content || "";
      const short = fullText.length > 60 ? fullText.slice(0, 60) + "…" : fullText;
      const date = m.created_at
        ? new Date(m.created_at).toLocaleDateString("ar-GB")
        : "";

      window.__msgFull[id] = fullText;

      const title = phone ? (name + " (" + phone + ")") : name;
      const idAttr = String(id).replace(/"/g, "");

      html += '<div data-msg-id="' + idAttr + '" class="msg-card" style="background:#1a1a1f;border:1px solid rgba(212,175,55,0.22);border-radius:14px;padding:14px;margin-bottom:12px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px;">';
      html += '<span style="font-size:12px;color:#888;">' + date + '</span>';
      html += '<strong style="color:#d4af37;font-size:15px;text-align:right;">' + title + '</strong>';
      html += '</div>';
      html += '<p id="msg-text-' + idAttr + '" style="margin:0 0 12px;font-size:13px;color:#ddd;line-height:1.6;text-align:right;">' + short.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</p>';
      html += '<div style="display:flex;gap:10px;justify-content:flex-start;flex-wrap:wrap;">';
      html += '<a href="messages.html" target="_blank" style="background:#d4af37;color:#111;text-decoration:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:800;"><i class="fa-solid fa-comments"></i> فتح الرسائل</a>';
      html += '<button type="button" onclick="deleteMessage(\'' + idAttr + '\')" style="background:#e74c3c;color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;"><i class="fa-solid fa-trash"></i> حذف</button>';
      html += '<button type="button" onclick="toggleMessageFull(\'' + idAttr + '\')" style="background:linear-gradient(135deg,#d4af37,#f0d77b);color:#111;border:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;">اضغط هنا للقراءة المزيد</button>';
      html += '</div>';
      html += '<div id="msg-full-' + idAttr + '" style="display:none;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:13px;color:#eee;line-height:1.7;text-align:right;"></div>';
      html += '</div>';
    });

    box.innerHTML = html;
  } catch (err) {
    console.error(err);
    box.innerHTML = '<p style="text-align:center;color:#e74c3c;">خطأ في جلب الرسائل</p>';
  }
}

function filterMessages(filter) {
  const rows = Array.isArray(window.__adminMessages) ? window.__adminMessages : [];
  const box = document.getElementById("admin-messages-container");
  if (!box) return;

  const filtered = rows.filter((message) => {
    const hasReply = Boolean(String(message.reply || "").trim());
    if (filter === "unread") return !hasReply;
    if (filter === "read") return hasReply;
    if (filter === "important") return String(message.message || message.content || "").includes("مهم");
    return true;
  });

  if (!filtered.length) {
    box.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">لا توجد رسائل ضمن هذا التصنيف</p>';
    return;
  }

  const previous = window.__adminMessages;
  window.__adminMessages = filtered;
  loadAdminMessagesFromRows(filtered, box);
  window.__adminMessages = previous;
}

function loadAdminMessagesFromRows(rows, box) {
  const previous = window.__msgFull;
  window.__msgFull = {};
  box.innerHTML = rows.map((m) => {
    const id = String(m.id).replace(/"/g, "");
    const title = (m.phone ? (m.name || "زائر") + " (" + m.phone + ")" : (m.name || "زائر"));
    const text = String(m.message || m.content || "");
    const short = text.length > 60 ? text.slice(0, 60) + "…" : text;
    window.__msgFull[id] = text;
    return '<div data-msg-id="' + id + '" class="msg-card" style="background:#1a1a1f;border:1px solid rgba(212,175,55,0.22);border-radius:14px;padding:14px;margin-bottom:12px;">' +
      '<div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;"><strong style="color:#d4af37;">' + escapeMessageHtml(title) + '</strong><span style="color:#888;font-size:12px;">' + formatMessageDate(m.created_at) + '</span></div>' +
      '<p style="margin:0 0 12px;color:#ddd;line-height:1.6;">' + escapeMessageHtml(short) + '</p>' +
      (m.reply ? '<p style="margin:0 0 12px;color:#2ecc71;font-size:12px;">تم الرد</p>' : '<p style="margin:0 0 12px;color:#ff8a80;font-size:12px;">بانتظار الرد</p>') +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;"><a href="messages.html" target="_blank" style="background:#d4af37;color:#111;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:800;">فتح الرسائل</a><button type="button" onclick="deleteMessage(\'' + id + '\')" style="background:#e74c3c;color:#fff;border:none;padding:10px 18px;border-radius:10px;cursor:pointer;">حذف</button></div></div>';
  }).join("");
  window.__msgFull = previous;
}

function escapeMessageHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatMessageDate(value) {
  return value ? new Date(value).toLocaleDateString("ar-GB") : "";
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadDatabaseJSON() {
  try {
    const [projects, messages, settings, botReplies] = await Promise.all([
      api("/projects"), api("/messages"), api("/settings"), api("/bot-replies")
    ]);
    downloadJsonFile("sham-golden-backup.json", { exported_at: new Date().toISOString(), projects, messages, settings, botReplies });
  } catch (error) {
    showActionMessage("تعذر تحميل النسخة: " + error.message, "error");
  }
}

async function createSystemBackup() {
  await downloadDatabaseJSON();
}

async function restoreSystemBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  showActionMessage("تم اختيار النسخة الاحتياطية، لكن الاستعادة التلقائية غير مفعلة.", "error");
  event.target.value = "";
}

function toggleMessageFull(id) {
  const fullBox = document.getElementById("msg-full-" + id);
  if (!fullBox) return;
  const open = fullBox.style.display === "block";
  if (open) {
    fullBox.style.display = "none";
    fullBox.textContent = "";
  } else {
    fullBox.textContent = (window.__msgFull && window.__msgFull[id]) || "";
    fullBox.style.display = "block";
  }
}

async function deleteMessage(id) {
  if (!confirm("حذف هذه الرسالة؟")) return;
  try {
    try {
      await fetch(LOCAL_API + "/messages/" + id, { method: "DELETE" });
    } catch (_) {
      await api("/messages/" + id, { method: "DELETE" });
    }
    logAction("تم حذف رسالة");
    loadAdminMessages();
    loadDashboardStats();
    loadNotifications();
  } catch (err) {
    showActionMessage("خطأ: " + (err.message || "فشل الحذف"), "error");
  }
}

// ==========================================
// البوت
// ==========================================
async function loadBotRepliesList() {
  const box = document.getElementById("bot-replies-list");
  if (!box) return;
  try {
    const data = await api("/bot-replies");
    if (!data || !data.length) {
      box.innerHTML = `<p style="text-align:center;color:var(--muted,#888);">لا توجد ردود</p>`;
      return;
    }
    box.innerHTML = data.map(b => {
      const active = b.is_active !== false;
      const id = b.id;
      return `
      <div style="background:var(--input,#1a1a1f);padding:12px;border-radius:10px;border:1px solid ${active ? "rgba(212,175,55,0.25)" : "#444"};margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap;">
          <div style="flex:1;min-width:140px;">
            <div style="margin-bottom:4px;">
              <span style="color:#d4af37;font-weight:700;">[${b.target_page || "general"}]</span>
              <strong style="margin-right:6px;">"${b.trigger_keyword || ""}"</strong>
              ${active ? '<span style="color:#2ecc71;font-size:11px;margin-right:6px;">● منشور</span>' : '<span style="color:#e74c3c;font-size:11px;margin-right:6px;">● مخفي</span>'}
            </div>
            <p style="font-size:12px;color:#bbb;margin:0;line-height:1.5;">${b.reply_text || ""}</p>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" onclick="editBotReply(${id})" title="تعديل"
              style="background:#3498db;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer;">تعديل</button>
            <button type="button" onclick="toggleBotReply(${id}, ${active})" title="${active ? "إخفاء" : "نشر"}"
              style="background:${active ? "#7f8c8d" : "#27ae60"};color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer;">
              ${active ? "إخفاء" : "نشر"}
            </button>
            <button type="button" onclick="deleteBotReply(${id})" title="حذف"
              style="background:#e74c3c;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer;">حذف</button>
          </div>
        </div>
      </div>`;
    }).join("");
  } catch (err) {
    console.error(err);
  }
}

async function deleteBotReply(id) {
  if (!confirm("حذف هذا الرد؟")) return;
  try {
    await api("/bot-replies/" + id, { method: "DELETE" });
  } catch (error) { showActionMessage(error.message, "error"); return; }
  showActionMessage("تم حذف الرد الآلي");
  logAction("تم حذف رد آلي");
  loadBotRepliesList();
}

async function toggleBotReply(id, isActive) {
  try {
    await api("/bot-replies/" + id, { method: "PATCH", body: { is_active: !isActive } });
  } catch (error) { showActionMessage(error.message, "error"); return; }
  showActionMessage(isActive ? "تم إخفاء الرد الآلي" : "تم نشر الرد الآلي");
  logAction(isActive ? "تم إخفاء رد بوت" : "تم نشر رد بوت");
  loadBotRepliesList();
}

async function editBotReply(id) {
  try {
    const all = await api("/bot-replies");
    const data = (all || []).find(x => String(x.id) === String(id));
    if (!data) return showActionMessage("تعذر جلب الرد", "error");
    document.getElementById("bot-edit-id").value = data.id;
    document.getElementById("bot-target").value = data.target_page || "general";
    document.getElementById("bot-trigger").value = data.trigger_keyword || "";
    document.getElementById("bot-reply").value = data.reply_text || "";
    const label = document.getElementById("bot-save-label");
    if (label) label.textContent = "تحديث الرد";
    const cancel = document.getElementById("bot-cancel-edit");
    if (cancel) cancel.style.display = "block";
    document.getElementById("quick-bot-form")?.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error(err);
  }
}

function cancelBotEdit() {
  document.getElementById("bot-edit-id").value = "";
  document.getElementById("quick-bot-form")?.reset();
  const label = document.getElementById("bot-save-label");
  if (label) label.textContent = "حفظ ونشر الرد";
  const cancel = document.getElementById("bot-cancel-edit");
  if (cancel) cancel.style.display = "none";
}

// ==========================================
// الإعدادات
// ==========================================
async function loadSiteSettings() {
  try {
    const s = await api("/settings");
    if (s && s.id) {
      settingRowId = s.id;
      renderRoyalContactLinks(s);
      const map = {
        "set-name": s.site_name || s.name || "",
        "set-logo": s.logo || "",
        "set-favicon": s.favicon || "",
        "set-email": s.email || "",
        "set-city": s.city || "",
        "set-color": s.color || "#d4af37"
      };
      Object.keys(map).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = map[id];
      });
      updateBrandPreview("set-logo", "set-logo-preview");
      updateBrandPreview("set-favicon", "set-favicon-preview");
      applyFavicon(s.favicon);
    }
  } catch (err) {
    console.error(err);
  }
}

async function saveAllSettings(e) {
  e.preventDefault();
  const data = {
    site_name: document.getElementById("set-name")?.value || "",
    logo: document.getElementById("set-logo")?.value || "",
    favicon: document.getElementById("set-favicon")?.value || "",
    email: document.getElementById("set-email")?.value || "",
    city: document.getElementById("set-city")?.value || ""
  };
  try {
    const d = await api("/settings", { method: "POST", body: data });
    if (d && d.id) settingRowId = d.id;
    updateBrandPreview("set-logo", "set-logo-preview");
    updateBrandPreview("set-favicon", "set-favicon-preview");
    applyFavicon(d.favicon);
    showActionMessage("تم حفظ الإعدادات");
    logAction("تم تحديث الإعدادات");
  } catch (err) {
    showActionMessage("خطأ: " + err.message, "error");
  }
}

function updateBrandPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;
  const path = input.value.trim();
  preview.hidden = !path;
  if (path) preview.src = path;
  preview.onerror = () => { preview.hidden = true; };
}

function applyFavicon(path) {
  if (!path) return;
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = path;
}

const royalContactLabels = {
  phone: "رقم الهاتف للاتصال",
  whatsapp: "رقم الواتساب",
  facebook: "رابط فيسبوك",
  instagram: "رابط إنستغرام",
  tiktok: "رابط تيك توك",
  x: "رابط منصة X"
};

function escapeRoyalContact(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}

function renderRoyalContactLinks(settings) {
  const body = document.getElementById("royal-contact-links-body");
  if (!body) return;
  const entries = Object.keys(royalContactLabels).filter((field) => String(settings[field] || "").trim());
  body.innerHTML = entries.length ? entries.map((field) => `
    <tr>
      <td>${royalContactLabels[field]}</td>
      <td class="royal-contact-value">${escapeRoyalContact(settings[field])}</td>
      <td class="royal-contact-actions">
        <button type="button" class="royal-btn-main royal-contact-edit" data-field="${field}">تعديل</button>
        <button type="button" class="royal-contact-delete" data-field="${field}">حذف</button>
      </td>
    </tr>
  `).join("") : '<tr><td colspan="3" class="royal-contact-empty">لا توجد أرقام أو روابط مضافة حاليًا</td></tr>';

  body.querySelectorAll(".royal-contact-edit").forEach((button) => {
    button.addEventListener("click", () => editRoyalContact(button.dataset.field, settings[button.dataset.field]));
  });
  body.querySelectorAll(".royal-contact-delete").forEach((button) => {
    button.addEventListener("click", () => deleteRoyalContact(button.dataset.field));
  });
}

async function getRoyalSettings() {
  return api("/settings");
}

function resetRoyalContactForm() {
  const type = document.getElementById("royal-contact-type");
  const value = document.getElementById("royal-contact-value");
  const button = document.getElementById("royal-save-contact-btn");
  if (!type || !value || !button) return;
  type.disabled = false;
  type.value = "phone";
  value.value = "";
  button.innerHTML = '<i class="fa-solid fa-plus"></i> إضافة';
  delete button.dataset.editingField;
}

async function saveRoyalContact() {
  const type = document.getElementById("royal-contact-type");
  const value = document.getElementById("royal-contact-value");
  if (!type || !value || !value.value.trim()) return showActionMessage("أدخل الرقم أو الرابط أولًا", "error");
  try {
    const settings = await api("/settings", { method: "POST", body: { [type.value]: value.value.trim() } });
    renderRoyalContactLinks(settings);
    resetRoyalContactForm();
    showActionMessage("تم حفظ بيانات التواصل");
    logAction("تم تحديث رقم أو رابط تواصل");
  } catch (err) {
    showActionMessage("تعذر حفظ بيانات التواصل: " + err.message, "error");
  }
}

function editRoyalContact(field, value) {
  const type = document.getElementById("royal-contact-type");
  const input = document.getElementById("royal-contact-value");
  const button = document.getElementById("royal-save-contact-btn");
  type.value = field;
  type.disabled = true;
  input.value = value || "";
  button.dataset.editingField = field;
  button.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> حفظ التعديل';
  document.getElementById("royal-contact-entry-form")?.scrollIntoView({ behavior: "smooth" });
}

async function deleteRoyalContact(field) {
  if (!confirm(`هل أنت متأكد من حذف ${royalContactLabels[field]}؟`)) return;
  try {
    const settings = await api("/settings", { method: "POST", body: { [field]: "" } });
    renderRoyalContactLinks(settings);
    resetRoyalContactForm();
    showActionMessage("تم حذف بيانات التواصل");
    logAction("تم حذف رقم أو رابط تواصل");
  } catch (err) {
    showActionMessage("تعذر حذف بيانات التواصل: " + err.message, "error");
  }
}

// ==========================================
// سجل النشاط
// ==========================================
function logAction(text) {
  const logs = JSON.parse(localStorage.getItem("royal_audit_logs") || "[]");
  logs.unshift({ text, time: new Date().toLocaleString("ar") });
  if (logs.length > 50) logs.length = 50;
  localStorage.setItem("royal_audit_logs", JSON.stringify(logs));
  loadAuditLogs();
}

function loadAuditLogs() {
  const box = document.getElementById("audit-log-container");
  if (!box) return;
  const logs = JSON.parse(localStorage.getItem("royal_audit_logs") || "[]");
  if (logs.length === 0) {
    box.innerHTML = `<p style="text-align:center;color:var(--muted);">لا توجد نشاطات</p>`;
    return;
  }
  box.innerHTML = logs.map(l => `
    <div style="background:var(--input);padding:10px;border-radius:8px;border-right:3px solid var(--gold);margin-bottom:6px;display:flex;justify-content:space-between;font-size:13px;">
      <span>${l.text}</span>
      <span style="color:var(--muted);font-size:11px;">${l.time}</span>
    </div>
  `).join("");
}

// ==========================================
// النماذج
// ==========================================
function setupFormsHandlers() {
  // معاينة صورة المشروع
  const pImage = document.getElementById("p-image");
  if (pImage) {
    pImage.addEventListener("input", () => {
      let url = (pImage.value || "").trim();
      const img = document.getElementById("p-preview-img");
      const ph = document.getElementById("p-preview-ph");
      if (!img) return;
      if (!url) {
        img.style.display = "none";
        if (ph) ph.style.display = "block";
        return;
      }
      if (!/^https?:\/\//i.test(url) && !url.startsWith("images/")) {
        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) url = "images/" + url.replace(/^\/+/, "");
      }
      img.src = url;
      img.style.display = "block";
      if (ph) ph.style.display = "none";
      img.onerror = () => {
        img.style.display = "none";
        if (ph) { ph.style.display = "block"; ph.textContent = "تعذر تحميل الصورة"; }
      };
    });
  }

  // عند تغيير القسم: اقترح الكود التالي (GB-3 ...)
  const pCat = document.getElementById("p-category");
  if (pCat) {
    pCat.addEventListener("change", async () => {
      const cat = pCat.value;
      const codeInput = document.getElementById("p-code");
      if (!cat || !codeInput) return;
      if (codeInput.value.trim()) return; // لا تستبدل كود أدخله المستخدم
      try {
        const next = await getNextModelNumber(cat);
        codeInput.placeholder = "تلقائي: " + buildModelCode(cat, next);
        codeInput.dataset.nextNumber = String(next);
      } catch (err) {
        console.error(err);
      }
    });
  }

  const projForm = document.getElementById("quick-project-form");
  if (projForm) {
    projForm.addEventListener("submit", async e => {
      e.preventDefault();
      const category = document.getElementById("p-category").value;
      if (!category) return showActionMessage("اختر القسم", "error");

      let cover = (document.getElementById("p-image").value || "").trim();
      if (cover && !/^https?:\/\//i.test(cover) && !cover.startsWith("images/")) {
        cover = "images/" + cover.replace(/^\/+/, "");
      }

      // تسلسل الكود: GB-1 ثم GB-2 ... داخل نفس القسم
      let modelNumber = await getNextModelNumber(category);
      let modelCode = (document.getElementById("p-code")?.value || "").trim().toUpperCase();

      if (!modelCode) {
        modelCode = buildModelCode(category, modelNumber);
      } else {
        // إذا كتب كود يدوياً مثل GB-30 استخرج الرقم إن أمكن
        const m = modelCode.match(/(\d+)\s*$/);
        if (m) modelNumber = parseInt(m[1], 10) || modelNumber;
      }

      const row = {
        title: document.getElementById("p-title").value.trim(),
        model_code: modelCode,
        model_number: modelNumber,
        category,
        page_name: category,
        city: document.getElementById("p-city")?.value.trim() || "",
        price: document.getElementById("p-price")?.value.trim() || "",
        materials: document.getElementById("p-materials")?.value.trim() || "",
        duration: document.getElementById("p-duration")?.value.trim() || "",
        cover_image: cover,
        all_images: cover ? [cover] : [],
        description: document.getElementById("p-desc")?.value.trim() || "",
        status: "منشور",
        featured: !!(document.getElementById("p-featured")?.checked)
      };

      try {
        await api("/projects", { method: "POST", body: row });
      } catch (error) {
        showActionMessage("خطأ: " + error.message, "error");
        return;
      }
      if (true) {
        showActionMessage("تم نشر المشروع بالكود " + modelCode);
        logAction("تم إضافة مشروع: " + row.title + " (" + modelCode + ")");
        projForm.reset();
        const img = document.getElementById("p-preview-img");
        const ph = document.getElementById("p-preview-ph");
        if (img) img.style.display = "none";
        if (ph) { ph.style.display = "block"; ph.textContent = "المعاينة تظهر هنا"; }
        loadAdminProjectsTable();
        loadDashboardStats();
      } else showActionMessage("خطأ غير معروف", "error");
    });
  }

  const botForm = document.getElementById("quick-bot-form");
  if (botForm) {
    botForm.addEventListener("submit", async e => {
      e.preventDefault();
      const editId = document.getElementById("bot-edit-id")?.value;
      const row = {
        target_page: document.getElementById("bot-target").value,
        trigger_keyword: document.getElementById("bot-trigger").value.trim(),
        reply_text: document.getElementById("bot-reply").value.trim(),
        is_active: true
      };

      let error;
      if (editId) {
        await api("/bot-replies/" + editId, { method: "PATCH", body: row });
        error = null;
      } else {
        await api("/bot-replies", { method: "POST", body: row });
        error = null;
      }

      if (!error) {
        showActionMessage(editId ? "تم تحديث الرد" : "تم حفظ ونشر الرد");
        logAction(editId ? "تم تعديل رد بوت" : "تم إضافة رد بوت");
        cancelBotEdit();
        loadBotRepliesList();
      } else showActionMessage("خطأ غير معروف", "error");
    });
  }

  document.querySelectorAll(".royal-setting-save").forEach((button) => {
    button.addEventListener("click", () => saveSingleSiteSetting(button.dataset.settingField, button.dataset.settingInput));
  });
  document.getElementById("royal-save-contact-btn")?.addEventListener("click", saveRoyalContact);
  document.getElementById("set-logo")?.addEventListener("input", () => updateBrandPreview("set-logo", "set-logo-preview"));
  document.getElementById("set-favicon")?.addEventListener("input", () => updateBrandPreview("set-favicon", "set-favicon-preview"));
}

async function saveSingleSiteSetting(field, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const value = input.value.trim();
  if (!value) return showActionMessage("لا يمكن حفظ قيمة فارغة", "error");
  try {
    const settings = await api("/settings", { method: "POST", body: { [field]: value } });
    if (field === "favicon") applyFavicon(value);
    if (field === "logo") updateBrandPreview("set-logo", "set-logo-preview");
    input.value = "";
    if (field === "logo" || field === "favicon") {
      const preview = document.getElementById(`${inputId}-preview`);
      if (preview) preview.hidden = true;
    }
    if (field === "color") input.value = "#d4af37";
    showActionMessage("تم حفظ الحقل بنجاح");
    logAction("تم تحديث إعداد: " + field);
    if (settings && settings.id) settingRowId = settings.id;
  } catch (err) {
    showActionMessage("تعذر حفظ الحقل: " + err.message, "error");
  }
}


// ==========================================
// خريطة صفحات الموقع (ثابتة + روابط فتح)
// ==========================================
function loadPagesMap() {
  const tbody = document.getElementById("pages-management-tbody");
  if (!tbody) return;

  const pages = [
    { name: "الرئيسية", file: "index.html", status: "نشطة" },
    { name: "التنجيد", file: "upholstery.html", status: "نشطة" },
    { name: "الجبس بورد", file: "gypsum.html", status: "نشطة" },
    { name: "ثلاثي الأبعاد", file: "3d.html", status: "نشطة" },
    { name: "غرف الأطفال", file: "kids-room.html", status: "نشطة" },
    { name: "من نحن", file: "about.html", status: "نشطة" },
    { name: "تواصل / رسائل", file: "messages.html", status: "نشطة" },
    { name: "المجيب الآلي", file: "bot.html", status: "نشطة" },
    { name: "إضافة مشروع", file: "add-project.html", status: "إدارة" },
    { name: "البارون", file: "baron.html", status: "إدارة" }
  ];

  tbody.innerHTML = pages.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td style="font-size:12px;color:#aaa;">${p.file}</td>
      <td>—</td>
      <td>—</td>
      <td><span style="color:#2ecc71;font-weight:bold;">${p.status}</span></td>
      <td>
        <a href="${p.file}" target="_blank" class="royal-btn-main" style="padding:6px 10px;font-size:12px;text-decoration:none;">
          فتح
        </a>
      </td>
    </tr>
  `).join("");
}

// ==========================================
// نظام إشعارات حقيقي — جدول notifications
// ==========================================
let notificationsRealtime = null;

async function loadNotifications() {
  const list = document.getElementById("notifications-list-body");
  const tableBody = document.getElementById("notifications-table-body");
  const badge = document.getElementById("notif-badge");
  if (!list && !tableBody) return;

  try {
    let rows = [];
    // 1) السيرفر المحلي أولاً
    try {
      const local = await localFetch("/notifications");
      rows = Array.isArray(local) ? local : (local.data || []);
    } catch (e) {
      console.error(e);
      rows = [];
    }

    const unread = rows.filter(n => !n.is_read).length;

    renderNotificationsTable(rows);

    if (badge) {
      badge.textContent = unread > 99 ? "99+" : String(unread);
      badge.style.display = unread > 0 ? "inline-block" : "none";
    }

    if (rows.length === 0) {
      list.innerHTML = `<div style="text-align:center;color:var(--muted,#a1a1a6);padding:16px;font-size:13px;">لا توجد إشعارات</div>`;
      return;
    }

    list.innerHTML = rows.map(n => {
      const icon =
        n.type === "message" || n.type === "chat" ? "fa-envelope" :
          n.type === "project" ? "fa-folder-plus" :
            "fa-bell";
      const bg = n.is_read ? "transparent" : "rgba(212,175,55,0.10)";
      return `
      <div class="notif-item"
           role="button"
           tabindex="0"
         data-notification-id="${escapeNotif(n.id)}"
         data-notification-type="${escapeNotif(n.type || "system")}" 
         data-related-id="${escapeNotif(n.related_id == null ? "" : n.related_id)}"
         data-message="${escapeNotif(n.message || "")}" 
           style="cursor:pointer;opacity:${n.is_read ? "0.72" : "1"};padding:12px 10px;border-bottom:1px solid rgba(255,255,255,0.06);border-radius:8px;background:${bg};margin-bottom:2px;">
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <span style="color:#d4af37;font-size:14px;margin-top:2px;width:18px;text-align:center;"><i class="fa-solid ${icon}"></i></span>
          <div style="flex:1;min-width:0;">
            <strong style="color:var(--royal-gold,var(--gold,#d4af37));font-size:12px;display:block;">${escapeNotif(n.title || n.type || "إشعار")}</strong>
            <div style="font-size:12px;margin-top:4px;line-height:1.5;color:#ddd;">${escapeNotif(n.message || "")}</div>
            <div style="font-size:10px;color:#888;margin-top:5px;">
              ${n.created_at ? new Date(n.created_at).toLocaleString("ar") : ""}
            </div>
          </div>
          ${!n.is_read ? '<span style="width:8px;height:8px;background:#e74c3c;border-radius:50%;flex-shrink:0;margin-top:6px;"></span>' : ""}
        </div>
      </div>`;
    }).join("");

    list.querySelectorAll(".notif-item").forEach(item => {
      const activate = () => openNotification(
        item.dataset.notificationId,
        item.dataset.notificationType,
        item.dataset.relatedId || null,
        item.dataset.message || ""
      );
      item.addEventListener("click", activate);
      item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  } catch (err) {
    console.error("notifications:", err);
    list.innerHTML = `<div style="text-align:center;color:#e74c3c;padding:12px;font-size:12px;">خطأ في جلب الإشعارات</div>`;
  }
}

function renderNotificationsTable(rows) {
  const tableBody = document.getElementById("notifications-table-body");
  if (!tableBody) return;
  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد إشعارات</td></tr>';
    return;
  }
  tableBody.innerHTML = rows.map((notification) => `
    <tr class="${notification.is_read ? "notification-read" : "notification-unread"}">
      <td>${escapeNotif(notification.type || "system")}</td>
      <td>${escapeNotif(notification.title || "إشعار")}</td>
      <td>${escapeNotif(notification.message || "")}</td>
      <td>${notification.created_at ? new Date(notification.created_at).toLocaleString("ar") : ""}</td>
      <td>${notification.is_read ? "مقروء" : "جديد"}</td>
    </tr>
  `).join("");
}

function escapeNotif(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function openNotification(id, type, relatedId, messageText) {
  // 1) تعليم الإشعار مقروء
  try {
    await fetch(LOCAL_API + "/notifications/read-all", { method: "POST" });
  } catch (_) {
    try {
      await api("/notifications/" + id + "/read", { method: "PATCH" });
    } catch (err) {
      console.error(err);
    }
  }

  // 2) إغلاق القائمة
  const d = document.getElementById("notifications-dropdown");
  if (d) d.style.display = "none";

  // 3) التوجيه حسب نوع الإشعار
  if (type === "message" || type === "chat") {
    const params = new URLSearchParams();
    if (relatedId != null && relatedId !== "null" && relatedId !== "") params.set("id", relatedId);
    if (messageText) params.set("message", messageText);
    window.location.href = "messages.html" + (params.toString() ? "?" + params.toString() : "");
    return;
  } else if (type === "project") {
    switchRoyalTab("projects");
    if (typeof loadAdminProjectsTable === "function") loadAdminProjectsTable();
  } else {
    switchRoyalTab("dashboard");
  }

  // 4) تحديث الرقم
  await loadNotifications();
}

function highlightMessageRow(relatedId) {
  const box = document.getElementById("admin-messages-container");
  if (!box) return;
  const el = box.querySelector(`[data-msg-id="${relatedId}"]`);
  if (el) {
    el.style.outline = "2px solid #d4af37";
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => { el.style.outline = ""; }, 3000);
  }
}

async function toggleNotificationsMenu(event) {
  if (event && event.stopPropagation) event.stopPropagation();

  const d = document.getElementById("notifications-dropdown");
  if (!d) return;

  const isOpen = d.classList.contains("open") || d.style.display === "block";
  if (isOpen) {
    d.classList.remove("open");
    d.style.display = "none";
  } else {
    d.classList.add("open");
    d.style.display = "block";
    await loadNotifications();
  }
}

async function clearAllNotifications(event) {
  if (event && event.stopPropagation) event.stopPropagation();
  // تحديد الكل كمقروء (مو حذف)
  try {
    await api("/notifications/read-all", { method: "POST" });
  } catch (err) {
    console.error(err);
  }
  await loadNotifications();
}

async function deleteAllNotifications(event) {
  if (event && event.stopPropagation) event.stopPropagation();
  if (!confirm("حذف كل الإشعارات نهائياً؟")) return;
  try {
    await api("/notifications", { method: "DELETE" });
  } catch (err) {
    console.error(err);
  }
  await loadNotifications();
  const d = document.getElementById("notifications-dropdown");
  if (d) {
    d.classList.remove("open");
    d.style.display = "none";
  }
}

async function createNotification({ type, title, message, related_id = null }) {
  try {
    await api("/notifications", {
      method: "POST",
      body: {
        type: type || "system",
        title: title || "إشعار",
        message: message || "",
        related_id
      }
    });
    await loadNotifications();
  } catch (err) {
    console.error("createNotification:", err);
  }
}

// تحديث فوري: SSE من السيرفر المحلي + احتياطي
function subscribeToNotifications() {
  // بث السيرفر المحلي
  try {
    const es = new EventSource(LOCAL_API + "/stream");
    const refresh = (event) => {
      loadNotifications();
      if (typeof loadAdminMessages === "function") loadAdminMessages();
      if (typeof loadDashboardStats === "function") loadDashboardStats();
      if (event?.data) {
        try {
          const data = JSON.parse(event.data);
          if (data.title) showActionMessage(data.title + (data.message ? ": " + data.message : ""));
        } catch (_) {
          // تجاهل حدث بث غير قابل للقراءة
        }
      }
    };
    es.addEventListener("message", refresh);
    es.addEventListener("notification", refresh);
    es.addEventListener("reply", refresh);
    es.addEventListener("heartbeat", () => { });
    es.onerror = () => {
      // لا تغلق نهائياً — المتصفح يعيد المحاولة
    };
    notificationsRealtime = es;
  } catch (err) {
    console.warn("SSE local failed", err);
  }
  // تحديث دوري كل 15 ثانية
  setInterval(() => {
    loadNotifications();
  }, 15000);

  // إذن إشعارات المتصفح
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => { });
  }
}

window.addEventListener("click", e => {
  const bell = document.querySelector(".bell-container");
  const d = document.getElementById("notifications-dropdown");
  if (!d) return;

  // أغلق القائمة فقط عند الضغط خارج صندوق الجرس
  if (bell && !bell.contains(e.target)) {
    d.classList.remove("open");
    d.style.display = "none";
  }
});

window.toggleFeatured = toggleFeatured;
window.togglePublishStatus = togglePublishStatus;
window.deleteProjectRecord = deleteProjectRecord;
window.confirmProjectDelete = confirmProjectDelete;
window.cancelProjectDelete = cancelProjectDelete;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.switchPage = switchPage;
window.switchRoyalTab = switchRoyalTab;
window.loadPagesMap = loadPagesMap;
