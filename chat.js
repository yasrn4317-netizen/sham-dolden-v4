const API = window.API_BASE_URL || "http://localhost:5000/api";
let allMessages = [];
let activeId = null;
const initialParams = new URLSearchParams(location.search);
const initialMessageText = initialParams.get("message") || "";
const initialPhone = initialParams.get("phone") || "";
let statusTimer = null;
const USER_AVATAR = "images/icon.png";
const ADMIN_AVATAR = "images/icon.png";

const $ = (id) => document.getElementById(id);

function showStatus(message, type = "error") {
    const status = $("chat-status");
    if (!status) return;
    status.textContent = message;
    status.className = `chat-status visible ${type}`;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => status.classList.remove("visible"), 3500);
}

function esc(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function letter(name) {
    return String(name || "ز").trim().charAt(0) || "ز";
}

function timeText(val) {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 16);
    return d.toLocaleString("ar-EG", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
}

function filtered() {
    const q = ($("search-input").value || "").trim().toLowerCase();
    if (!q) return allMessages;
    return allMessages.filter((m) =>
        String(m.name || "").toLowerCase().includes(q) ||
        String(m.phone || "").includes(q) ||
        String(m.message || m.content || "").toLowerCase().includes(q)
    );
}

function renderList() {
    const box = $("chat-list");
    const items = filtered();
    if (!items.length) {
        box.innerHTML = '<div class="hint">لا توجد رسائل</div>';
        return;
    }
    box.innerHTML = items.map((m) => {
        const preview = m.reply
            ? "ردك: " + String(m.reply).slice(0, 42)
            : String(m.message || m.content || "").slice(0, 50);
        return `
      <article class="chat-item ${String(m.id) === String(activeId) ? "active" : ""} ${m.reply ? "replied" : ""}" data-id="${m.id}">
        <div class="av"><img src="${USER_AVATAR}" alt="صورة ${esc(m.name || "الزبون")}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span>${esc(letter(m.name))}</span></div>
        <div class="meta">
          <div class="row1">
            <span class="name">${esc(m.name || "زائر")}</span>
            <span class="time">${esc(timeText(m.created_at))}</span>
          </div>
          <div class="preview">${esc(preview || "—")}</div>
        </div>
      </article>`;
    }).join("");

    box.querySelectorAll(".chat-item").forEach((el) => {
        el.onclick = () => openChat(el.dataset.id);
    });
}

function openChat(id) {
    const m = allMessages.find((x) => String(x.id) === String(id));
    if (!m) return;
    activeId = id;

    $("welcome").hidden = true;
    $("chat-screen").hidden = false;
    $("app").classList.add("chat-open");

    $("contact-name").textContent = m.name || "زائر";
    $("contact-phone").textContent = m.phone || "بدون رقم";
        $("contact-avatar").innerHTML = `<img src="${USER_AVATAR}" alt="صورة ${esc(m.name || "الزبون")}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span>${esc(letter(m.name))}</span>`;

    let html = `
        <div class="bubble-row in-row">
            <div class="message-avatar"><img src="${USER_AVATAR}" alt="صورة ${esc(m.name || "الزبون")}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span>${esc(letter(m.name))}</span></div>
            <div class="bubble in">
                <span class="tag">${esc(m.name || "الزبون")}</span>
                ${esc(m.message || m.content || initialMessageText)}
                <span class="when">${esc(timeText(m.created_at))}</span>
            </div>
    </div>`;
    if (m.reply) {
        html += `
            <div class="bubble-row out-row">
                <div class="message-avatar"><img src="${ADMIN_AVATAR}" alt="صورة الإدارة" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span>إ</span></div>
                <div class="bubble out">
                    <span class="tag">أنت (الإدارة)</span>
                    ${esc(m.reply)}
                </div>
      </div>`;
    }
    $("chat-messages").innerHTML = html;
    $("chat-messages").scrollTop = $("chat-messages").scrollHeight;
    renderList();
}

function closeChat() {
    activeId = null;
    $("chat-screen").hidden = true;
    $("welcome").hidden = false;
    $("app").classList.remove("chat-open");
    renderList();
}

async function loadMessages() {
    try {
        const query = initialPhone ? `?phone=${encodeURIComponent(initialPhone)}` : "";
        const res = await fetch(API + "/messages" + query);
        if (!res.ok) throw new Error("تعذر تحميل الرسائل");
        allMessages = await res.json();
        if (!Array.isArray(allMessages)) allMessages = [];
        renderList();
        if (initialPhone && !activeId && allMessages[0]) openChat(allMessages[0].id);
    } catch (e) {
        console.error(e);
        $("chat-list").innerHTML = '<div class="hint">تعذر الاتصال بالسيرفر<br>شغّل: node server.js</div>';
        showStatus(e.message);
    }
}

function listenForUpdates() {
    if (!window.EventSource) return;
    const stream = new EventSource(API + "/stream");
    ["message", "reply", "notification"].forEach(eventName => {
        stream.addEventListener(eventName, () => loadMessages());
    });
    stream.onerror = () => stream.close();
}

async function sendReply(e) {
    e.preventDefault();
    const input = $("reply-input");
    const text = input.value.trim();
    if (!text || !activeId) return;
    try {
        const res = await fetch(API + "/messages/reply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message_id: activeId,
                reply_text: text,
                sender_type: "admin"
            })
        });
        if (!res.ok) throw new Error("fail");
        const i = allMessages.findIndex((x) => String(x.id) === String(activeId));
        if (i >= 0) allMessages[i].reply = text;
        input.value = "";
        openChat(activeId);
    } catch (err) {
        showStatus("فشل الإرسال — تأكد أن السيرفر شغال");
    }
}

async function deleteChat() {
    if (!activeId || !confirm("حذف المحادثة؟")) return;
    try {
        const res = await fetch(API + "/messages/" + activeId, { method: "DELETE" });
        if (!res.ok) throw new Error("fail");
        allMessages = allMessages.filter((x) => String(x.id) !== String(activeId));
        closeChat();
    } catch {
        showStatus("تعذر حذف المحادثة");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadMessages();
    listenForUpdates();
    $("reply-form").addEventListener("submit", sendReply);
    $("back-btn").addEventListener("click", closeChat);
    $("delete-btn").addEventListener("click", deleteChat);
    $("search-input").addEventListener("input", renderList);

    const id = initialParams.get("id");
    if (id) {
        const t = setInterval(() => {
            if (allMessages.length || $("chat-list").querySelector(".hint")) {
                clearInterval(t);
                if (allMessages.some((m) => String(m.id) === String(id))) openChat(id);
            }
        }, 150);
    }
});
