const CONTACT_API = window.API_BASE_URL || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "5000" ? "http://localhost:5000/api" : `${location.origin}/api`);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const button = document.getElementById("submitBtn");
  const status = document.getElementById("contact-status");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("userName")?.value.trim();
    const phone = document.getElementById("userPhone")?.value.trim();
    const message = document.getElementById("userMsg")?.value.trim();

    if (!name || !phone || !message) {
      showStatus("يرجى تعبئة الاسم ورقم الهاتف والرسالة.", "error");
      return;
    }

    button.disabled = true;
    button.textContent = "جاري الإرسال...";
    showStatus("جاري إرسال رسالتك...", "pending");

    try {
      const response = await fetch(CONTACT_API + "/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "فشل إرسال الرسالة");

      form.reset();
      showStatus("تم إرسال رسالتك بنجاح، وستظهر مباشرة لدى إدارة الموقع.", "success");
    } catch (error) {
      console.error("contact message:", error);
      showStatus("تعذر الإرسال. تأكد أن السيرفر يعمل على المنفذ 5000.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "إرسال الرسالة 🚀";
    }
  });

  function showStatus(message, type) {
    if (!status) return;
    status.style.display = "block";
    status.textContent = message;
    status.style.borderStyle = "solid";
    status.style.background = type === "error" ? "#fff4f4" : type === "success" ? "#e9f7ef" : "rgba(212, 175, 55, 0.08)";
    status.style.borderColor = type === "error" ? "#e74c3c" : type === "success" ? "#2ecc71" : "#d4af37";
    status.style.color = type === "error" ? "#ff8a80" : type === "success" ? "#2ecc71" : "#d4af37";
  }
});
