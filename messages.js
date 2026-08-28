/* =========================================================
   مركز الإشعارات والرسائل - الشام الذهبي (messages.js)
========================================================= */

const API = window.API_BASE_URL || "http://localhost:5000/api";
let statusTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    fetchNotifications();
    setupRealtimeSubscription();
});

async function fetchNotifications() {
    const container = document.getElementById("messages-container");
    const countElement = document.getElementById("total-messages-count");

    try {
        const response = await fetch(`${API}/messages`);
        const notifications = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(notifications.error || "تعذر تحميل الرسائل");

        if (countElement) {
            countElement.innerText = notifications ? notifications.length : 0;
        }

        if (!notifications || notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📭 لا توجد إشعارات أو طلبات جديدة حالياً.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notifications.map(item => createNotificationCard(item)).join("");

    } catch (err) {
        console.error("Error fetching notifications:", err);
        showStatus("أحمر: تعذر تحميل الرسائل. تأكد أن السيرفر يعمل.", "error");
        container.innerHTML = `
            <div class="error-state">
                <p>⚠️ حدث خطأ أثناء تحميل الإشعارات: ${err.message}</p>
            </div>
        `;
    }
}

function createNotificationCard(item) {
    const createdDate = item.created_at
        ? new Date(item.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })
        : "تاريخ غير معروف";

    const senderName = item.name || item.sender_name || "زائر / زبون";
    const senderPhone = item.phone || item.phone_number || item.user_id || "";
    const sourcePage = item.source_page || "نموذج اتصل بنا";
    const userMessage = item.message || item.text || "";

    const isImage = userMessage.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || userMessage.includes("/chat-");

    let messageContent = "";
    if (isImage) {
        messageContent = `
            <div class="media-preview-box">
                <p class="media-preview-title">📷 <strong>مرفق صورة:</strong></p>
                <a href="${escapeHtml(userMessage)}" target="_blank" title="انقر لتكبير الصورة">
                    <img src="${escapeHtml(userMessage)}" alt="مرفق صورة" class="notif-img-preview" loading="lazy">
                </a>
            </div>
        `;
    } else {
        messageContent = `<p class="message-text">💬 <strong>الرسالة/الطلب:</strong> ${escapeHtml(userMessage || "لا يوجد نص")}</p>`;
    }

    const chatUrl = `chat.html?phone=${encodeURIComponent(senderPhone)}&name=${encodeURIComponent(senderName)}`;

    return `
        <div class="notification-card" id="notif-${item.id}">
            <div class="notif-header">
                <div class="notif-user-info">
                    <span class="user-name">👤 ${escapeHtml(senderName)}</span>
                    <span class="notif-source">📍 المصدر: ${escapeHtml(sourcePage)}</span>
                </div>
                <span class="notif-date">⏱️ ${createdDate}</span>
            </div>

            <div class="notif-body">
                ${messageContent}
                ${senderPhone ? `<p class="phone-info">📞 <strong>رقم الهاتف / المعرّف:</strong> ${escapeHtml(senderPhone)}</p>` : ''}
            </div>

            <div class="notif-actions">
                <a href="${chatUrl}" class="btn-start-chat">
                    💬 البدء بمحادثة خاصة
                </a>
                <button onclick="deleteNotification('${item.id}')" class="btn-delete-notif">
                    🗑️ حذف
                </button>
            </div>
        </div>
    `;
}

function setupRealtimeSubscription() {
    if (!window.EventSource) return;
    const stream = new EventSource(`${API}/stream`);
    ["message", "notification", "reply"].forEach(eventName => {
        stream.addEventListener(eventName, () => fetchNotifications());
    });
    stream.onerror = () => stream.close();
}

async function deleteNotification(id) {
    if (!confirm("هل أنت تأكد من حذف هذا الإشعار؟")) return;

    try {
        const response = await fetch(`${API}/messages/${encodeURIComponent(id)}`, { method: "DELETE" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "تعذر حذف الرسالة");

        showStatus("تم حذف الرسالة بنجاح.", "success");

        const cardNode = document.getElementById(`notif-${id}`);
        if (cardNode) cardNode.remove();

        const countElement = document.getElementById("total-messages-count");
        if (countElement) {
            let currentCount = parseInt(countElement.innerText) || 0;
            countElement.innerText = Math.max(0, currentCount - 1);
        }

    } catch (err) {
        console.error("Error deleting notification:", err);
        showStatus("فشل حذف الرسالة: " + err.message, "error");
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebar && overlay) {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    }
}

function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = text;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function showStatus(text, type) {
    const status = document.getElementById("messages-status");
    if (!status) return;
    status.textContent = text;
    status.className = `messages-status visible ${type}`;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => status.classList.remove("visible"), 4000);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
