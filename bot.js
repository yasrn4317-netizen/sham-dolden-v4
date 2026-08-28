// ==========================================
// مجيب الشام الذهبي | bot.js (النسخة المتوافقة مع سيرفر Node.js المحلي)
// ==========================================

const API_URL = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const quickButtonsContainer = document.getElementById("quick-buttons");
const BOT_AVATAR = "images/icon.png";
const USER_AVATAR = "images/icon.png";

let botResponsesData = [];

// ==================== التشغيل ====================
document.addEventListener("DOMContentLoaded", async () => {
    await fetchBotResponses();

    // إذا جاء كود من الرابط ?code=DC-1 أو dc-1
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get("code");
    if (codeParam) {
        sendUserMessage(codeParam);
    }
});

if (sendBtn) {
    sendBtn.addEventListener("click", handleInputSend);
}

if (userInput) {
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleInputSend();
    });
}

function handleInputSend() {
    const text = (userInput?.value || "").trim();
    if (!text) return;
    sendUserMessage(text);
    userInput.value = "";
}

function sendUserMessage(text) {
    appendUserMsg(text);
    processQuery(text);
}

// ==================== عرض الرسائل ====================
function appendUserMsg(text) {
    const msg = document.createElement("div");
    msg.className = "message user-message";
    msg.innerHTML =
        '<div class="avatar"><img src="' + USER_AVATAR + '" alt="صورة المستخدم" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';"><i class="fas fa-user" aria-hidden="true"></i></div>' +
        '<div class="text">' + escapeHtml(text) + "</div>";
    chatBox.appendChild(msg);
    scrollToBottom();
}

function appendBotMsg(htmlContent) {
    const msg = document.createElement("div");
    msg.className = "message bot-message";
    msg.innerHTML =
        '<div class="avatar"><img src="' + BOT_AVATAR + '" alt="صورة المجيب الآلي" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';"><i class="fas fa-robot" aria-hidden="true"></i></div>' +
        '<div class="text">' + htmlContent + "</div>";
    chatBox.appendChild(msg);
    scrollToBottom();
}

function showTyping() {
    const el = document.createElement("div");
    el.className = "message bot-message typing-indicator";
    el.innerHTML =
        '<div class="avatar"><img src="' + BOT_AVATAR + '" alt="صورة المجيب الآلي" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';"><i class="fas fa-robot" aria-hidden="true"></i></div>' +
        '<div class="text"><div class="typing"><span></span><span></span><span></span></div></div>';
    chatBox.appendChild(el);
    scrollToBottom();
    return el;
}

function scrollToBottom() {
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ==================== جلب الردود السريعة من السيرفر المحلي ====================
async function fetchBotResponses() {
    try {
        const response = await fetch(`${API_URL}/bot-replies`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            // تصفية الردود المفعلة فقط
            botResponsesData = data.filter(item => item.is_active == 1 || item.is_active === true);
            renderQuickButtonsFromData(botResponsesData);
        } else if (quickButtonsContainer) {
            quickButtonsContainer.innerHTML = "";
        }
    } catch (err) {
        console.error("خطأ في جلب الردود الآلية:", err);
    }
}

function renderQuickButtonsFromData(data) {
    if (!quickButtonsContainer) return;
    quickButtonsContainer.innerHTML = "";

    data.forEach((item) => {
        if (!item.trigger_keyword) return;
        const btnText = item.trigger_keyword.trim();
        const btn = document.createElement("button");
        btn.className = "quick-btn";
        btn.textContent = btnText;
        btn.onclick = () => sendUserMessage(btnText);
        quickButtonsContainer.appendChild(btn);
    });
}

// ==================== معالجة السؤال والبحث الذكي ====================
async function processQuery(userText) {
    const typing = showTyping();
    const textLower = userText.toLowerCase().trim();

    await new Promise((r) => setTimeout(r, 450));

    // 1) فحص كود الموديل مثل DC-1 أو KD-1 أو GB-2
    const codeMatch = userText.match(/([A-Za-z]+)[-\s]?(\d+)/i);
    if (codeMatch) {
        typing.remove();
        const fullQueryCode = codeMatch[1].toLowerCase() + "-" + codeMatch[2];
        await fetchModelByCode(fullQueryCode);
        return;
    }

    // 2) مطابقة الكلمات المفتاحية من الردود المحملة
    let matchedResponse = null;
    for (const item of botResponsesData) {
        if (!item.trigger_keyword) continue;

        const keywords = item.trigger_keyword
            .split(",")
            .map((k) => k.trim().toLowerCase())
            .filter(Boolean);

        const isMatched = keywords.some(
            (keyword) => textLower.includes(keyword) || keyword.includes(textLower)
        );

        if (isMatched) {
            matchedResponse = item;
            break;
        }
    }

    typing.remove();

    if (matchedResponse) {
        appendBotMsg(matchedResponse.reply_text || "تم العثور على رد.");
    } else {
        appendBotMsg(
            "أهلاً بك! اختر سؤالاً سريعاً من الأزرار أعلاه أو اكتب كود الموديل مثل <b>DC-1</b> أو <b>KD-1</b>." +
            '<br><a href="https://wa.me/" target="_blank" class="action-btn-inline btn-whatsapp" style="margin-top:10px;">' +
            '<i class="fa-brands fa-whatsapp"></i> تواصل عبر الواتساب</a>'
        );
    }
}

// ==================== جلب الموديل من قاعدة البيانات عبر السيرفر ====================
async function fetchModelByCode(modelCode) {
    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        if (!Array.isArray(projects)) {
            appendBotMsg("عذراً، حدث خطأ في استقبال بيانات المشاريع.");
            return;
        }

        // البحث عن المشروع الذي يتطابق معه الـ model_code
        const foundProject = projects.find(p =>
            p.model_code && p.model_code.toLowerCase() === modelCode.toLowerCase()
        );

        if (!foundProject) {
            appendBotMsg(
                "لم نتمكن من العثور على الموديل <b>" +
                modelCode.toUpperCase() +
                "</b>. تأكد من الكود وحاول مرة أخرى."
            );
            return;
        }

        renderProductCard(foundProject, modelCode.toUpperCase());
    } catch (err) {
        console.error(err);
        appendBotMsg("حدث خطأ أثناء الاتصال بالسيرفر لجلب تفاصيل الموديل.");
    }
}

// ==================== عرض بطاقة الموديل ====================
function renderProductCard(item, fullCode) {
    let imgUrl = item.cover_image || "";

    if (!imgUrl || imgUrl.trim() === "") {
        imgUrl = "https://placehold.co/600x400/18181c/d4af37?text=الشام+الذهبي";
    }

    const priceText = item.price ? item.price + " ل.س" : "حسب المقاس والطلب";
    const title = item.title || "موديل ديكور";
    const city = item.city || "";

    const waText = encodeURIComponent("استفسار عن موديل: " + fullCode + " - " + title);

    appendBotMsg(
        "طلب استفسار عن موديل 🖼️<br>" +
        "• <b>الاسم:</b> " + escapeHtml(title) + "<br>" +
        "• <b>رقم الموديل:</b> " + fullCode + "<br>" +
        "• <b>السعر:</b> " + priceText +
        (city ? "<br>• <b>المدينة:</b> " + escapeHtml(city) : "") +
        '<div style="margin-top:8px;">' +
        '<img src="' + imgUrl + '" style="width:100%;height:160px;object-fit:cover;border-radius:8px;border:1px solid rgba(212,175,55,0.3);" onerror="this.src=\'https://placehold.co/600x400/18181c/d4af37?text=الشام+الذهبي\'">' +
        "</div>" +
        '<a href="https://wa.me/?text=' + waText + '" target="_blank" class="action-btn-inline btn-whatsapp" style="width:100%;margin-top:10px;">' +
        '<i class="fa-brands fa-whatsapp"></i> تواصل عبر الواتساب</a>'
    );
}