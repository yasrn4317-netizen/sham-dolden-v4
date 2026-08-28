/**
 * الشام الذهبي | سيرفر محلي
 * Node.js + Express + PostgreSQL
 *
 * التشغيل:
 *   npm install express pg cors
 *   node server.js
 *
 * العنوان: http://localhost:5000
 */

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// تقديم ملفات HTML/CSS/JS من نفس المجلد (اختياري)
app.use(express.static(path.join(__dirname)));
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ==========================================
// الاتصال بقاعدة البيانات
// عدّل كلمة المرور إذا عندك password لـ root
// ==========================================
const databaseUrl = process.env.DATABASE_URL;
const db = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false }
}) : null;

let dbConnected = false;

if (db) db.connect((err, client, release) => {
  if (err) {
    console.error("خطأ في الاتصال بقاعدة البيانات:", err);
    console.error("تأكد من ضبط DATABASE_URL وقاعدة PostgreSQL.");
  } else {
    release();
    dbConnected = true;
    console.log("متصل بقاعدة البيانات PostgreSQL");
    ensureSettingsContactColumns();
  }
});
else console.error("DATABASE_URL غير مضبوط. أضف رابط Neon في Environment على Render.");

async function ensureSettingsContactColumns() {
  for (const column of ["site_name", "logo", "telegram", "instagram", "tiktok", "x", "favicon", "city", "color", "visits"]) {
    try {
      await q(`ALTER TABLE settings ADD COLUMN ${column} TEXT NULL`);
    } catch (err) {
      if (err.code !== "42701") {
        console.error(`تعذر تجهيز حقل ${column}:`, err.message);
      }
    }
  }
}

function q(sql, params = []) {
  if (!db) return Promise.reject(new Error("DATABASE_URL غير مضبوط"));
  let parameterIndex = 0;
  const postgresSql = sql.replace(/\?/g, () => `$${++parameterIndex}`);
  return db.query(postgresSql, params).then((result) => result.rows);
}

// ==========================================
// فحص السيرفر
// ==========================================

// ==========================================
// بث فوري (SSE) للإشعارات والرسائل
// ==========================================
const sseClients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (_) {
      sseClients.delete(res);
    }
  }
}

async function publishNotification({ type, title, message, related_id = null }) {
  const payload = {
    type: type || "system",
    title: title || "إشعار جديد",
    message: message || "",
    related_id
  };
  try {
    const result = await q(
      "INSERT INTO notifications (type, title, content, is_seen, user_id) VALUES (?, ?, ?, FALSE, ?) RETURNING id",
      [payload.type, payload.title, payload.message, related_id == null ? null : String(related_id)]
    );
    const id = result[0].id;
    const rows = await q(
      "SELECT id, title, content AS message, type, is_seen AS is_read, created_at, user_id AS related_id FROM notifications WHERE id = ?",
      [id]
    );
    broadcast("notification", rows[0] || payload);
  } catch (_) {
    broadcast("notification", payload);
  }
}

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

setInterval(() => broadcast("heartbeat", { time: Date.now() }), 25000);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    databaseConnected: dbConnected,
    name: "الشام الذهبي",
    port: PORT,
    db: process.env.DATABASE_URL ? "postgresql" : "not configured"
  });
});

// ==========================================
// المشاريع
// ==========================================
app.get("/api/projects", async (req, res) => {
  try {
    let sql = "SELECT * FROM projects WHERE 1=1";
    const params = [];

    if (req.query.category) {
      sql += " AND (category = ? OR page_name = ?)";
      params.push(req.query.category, req.query.category);
    }
    if (req.query.status) {
      sql += " AND status = ?";
      params.push(req.query.status);
    }
    if (req.query.featured === "1" || req.query.featured === "true") {
      sql += " AND featured = TRUE";
    }
    if (req.query.code) {
      sql += " AND UPPER(model_code) = UPPER(?)";
      params.push(req.query.code);
    }

    sql += " ORDER BY created_at DESC";
    const rows = await q(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("فشل جلب المشاريع:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    const rows = await q("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "المشروع غير موجود" });
    res.json(rows[0]);
  } catch (err) {
    console.error("فشل حفظ إعدادات الموقع:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.category) {
      return res.status(400).json({ error: "title و category مطلوبان" });
    }

    const category = String(b.category).toLowerCase();

    // الرقم التالي لنفس القسم
    const nums = await q(
      "SELECT model_number, model_code FROM projects WHERE category = ?",
      [category]
    );
    let max = 0;
    nums.forEach((p) => {
      if (p.model_number != null) max = Math.max(max, Number(p.model_number));
      else if (p.model_code) {
        const m = String(p.model_code).match(/(\d+)\s*$/);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      }
    });
    const modelNumber = max + 1;
    let modelCode = (b.model_code || "").trim().toUpperCase();
    if (!modelCode) {
      modelCode = category.toUpperCase() + "-" + modelNumber;
    }

    const id = require("crypto").randomUUID();
    const cover = b.cover_image || "";

    await q(
      `INSERT INTO projects
        (id, title, category, page_name, model_code, model_number,
         description, city, duration, materials, price,
         cover_image, status, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        b.title,
        category,
        b.page_name || category,
        modelCode,
        modelNumber,
        b.description || "",
        b.city || "",
        b.duration || "",
        b.materials || "",
        b.price || "",
        cover,
        b.status || "منشور",
        Boolean(b.featured)
      ]
    );

    const rows = await q("SELECT * FROM projects WHERE id = ?", [id]);
    await publishNotification({
      type: "project",
      title: "مشروع جديد",
      message: (rows[0].title || "مشروع") + " تمت إضافته للموقع",
      related_id: id
    });
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/projects/:id", async (req, res) => {
  try {
    const b = req.body || {};
    const fields = [];
    const params = [];
    const map = [
      "title",
      "category",
      "page_name",
      "model_code",
      "model_number",
      "description",
      "city",
      "duration",
      "materials",
      "price",
      "cover_image",
      "status"
    ];

    map.forEach((k) => {
      if (b[k] !== undefined) {
        fields.push(`${k} = ?`);
        params.push(b[k]);
      }
    });
    if (b.featured !== undefined) {
      fields.push("featured = ?");
      params.push(Boolean(b.featured));
    }
    if (!fields.length) return res.status(400).json({ error: "لا توجد حقول للتحديث" });

    params.push(req.params.id);
    await q(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`, params);
    const rows = await q("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    await publishNotification({
      type: "project",
      title: "تم تحديث مشروع",
      message: (rows[0]?.title || "مشروع") + " تم تحديث بياناته",
      related_id: req.params.id
    });
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    await q("DELETE FROM projects WHERE id = ?", [req.params.id]);
    await publishNotification({
      type: "project",
      title: "تم حذف مشروع",
      message: "تم حذف مشروع من الموقع",
      related_id: req.params.id
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// الرسائل
// ==========================================
app.get("/api/messages", async (req, res) => {
  try {
    let sql = "SELECT * FROM messages";
    const params = [];
    if (req.query.phone) {
      sql += " WHERE phone = ?";
      params.push(String(req.query.phone).trim());
    }
    sql += req.query.phone ? " ORDER BY id ASC" : " ORDER BY id DESC";
    const rows = await q(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/messages/:id", async (req, res) => {
  try {
    const rows = await q("SELECT * FROM messages WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "الرسالة غير موجودة" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// رسالة جديدة من الزائر
app.post("/api/messages", async (req, res) => {
  try {
    const b = req.body || {};
    const name = b.name || "زائر";
    const phone = b.phone || "";
    const message = String(b.message || b.content || "").trim();
    if (!message) {
      return res.status(400).json({ error: "الرسالة مطلوبة" });
    }

    const result = await q(
      "INSERT INTO messages (name, phone, message) VALUES (?, ?, ?) RETURNING id",
      [name, phone, message]
    );

    const insertId = result[0].id;

    const rows = await q("SELECT * FROM messages WHERE id = ?", [insertId]);
    await publishNotification({
      type: "message",
      title: "رسالة جديدة",
      message: "من " + name + ": " + String(message).slice(0, 80),
      related_id: String(insertId)
    });
    broadcast("message", rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// رد الإدارة (حفظ في عمود reply)
app.post("/api/messages/reply", async (req, res) => {
  try {
    const { message_id, reply_text, sender_type } = req.body || {};
    if (!message_id || !reply_text) {
      return res.status(400).json({ error: "message_id و reply_text مطلوبان" });
    }

    await q("UPDATE messages SET reply = ?, sender_type = ? WHERE id = ?", [
      reply_text,
      sender_type || "admin",
      message_id
    ]);

    await publishNotification({
      type: "reply",
      title: "تم الرد على رسالة",
      message: "تم إرسال رد الإدارة على رسالة الزائر",
      related_id: String(message_id)
    });
    broadcast("reply", { message_id, reply_text });
    res.json({ success: true, message: "تم حفظ الرد بنجاح" });
  } catch (err) {
    res.status(500).json({ error: "فشل حفظ الرد: " + err.message });
  }
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    await q("DELETE FROM messages WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// الإشعارات
// ==========================================
app.get("/api/notifications", async (req, res) => {
  try {
    const rows = await q(
      "SELECT id, title, content AS message, type, is_seen AS is_read, created_at, user_id AS related_id FROM notifications ORDER BY created_at DESC LIMIT 50"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications/read-all", async (req, res) => {
  try {
    await q("UPDATE notifications SET is_seen = TRUE WHERE is_seen = FALSE OR is_seen IS NULL");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// الإعدادات
// ==========================================
app.get("/api/settings", async (req, res) => {
  try {
    const rows = await q("SELECT * FROM settings LIMIT 1");
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ردود البوت
// ==========================================
app.get("/api/bot-replies", async (req, res) => {
  try {
    const rows = await q("SELECT * FROM bot_replies ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// إشعارات إضافية
// ==========================================
app.post("/api/notifications", async (req, res) => {
  try {
    const b = req.body || {};
    const result = await q(
      "INSERT INTO notifications (type, title, content, is_seen, user_id) VALUES (?, ?, ?, FALSE, ?) RETURNING id",
      [b.type || "system", b.title || "إشعار", b.message || "", b.related_id == null ? null : String(b.related_id)]
    );
    const id = result[0].id;
    const rows = await q(
      "SELECT id, title, content AS message, type, is_seen AS is_read, created_at, user_id AS related_id FROM notifications WHERE id = ?",
      [id]
    );
    broadcast("notification", rows[0] || b);
    res.status(201).json(rows[0] || { ok: true });
  } catch (err) {
    console.error("فشل إنشاء الإشعار:", err.message);
    res.status(500).json({ error: "فشل إنشاء الإشعار" });
  }
});

app.delete("/api/notifications", async (req, res) => {
  try {
    await q("DELETE FROM notifications");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    await q("UPDATE notifications SET is_seen = TRUE WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// إعدادات حفظ
// ==========================================
app.post("/api/settings", async (req, res) => {
  try {
    const b = req.body || {};
    const existing = await q("SELECT id FROM settings LIMIT 1");
    if (existing.length) {
      await q(
        `UPDATE settings SET
          site_name = COALESCE(?, site_name),
          logo = COALESCE(?, logo),
          favicon = COALESCE(?, favicon),
          phone = COALESCE(?, phone),
          whatsapp = COALESCE(?, whatsapp),
          telegram = COALESCE(?, telegram),
          facebook = COALESCE(?, facebook),
          instagram = COALESCE(?, instagram),
          tiktok = COALESCE(?, tiktok),
          x = COALESCE(?, x),
          email = COALESCE(?, email),
          city = COALESCE(?, city),
          color = COALESCE(?, color),
          visits = COALESCE(?, visits)
         WHERE id = ?`,
        [
          b.site_name ?? null, b.logo ?? null, b.favicon ?? null, b.phone ?? null,
          b.whatsapp ?? null, b.telegram ?? null, b.facebook ?? null,
          b.instagram ?? null, b.tiktok ?? null, b.x ?? null,
          b.email ?? null, b.city ?? null, b.color ?? null, b.visits ?? null, existing[0].id
        ]
      );
      const rows = await q("SELECT * FROM settings WHERE id = ?", [existing[0].id]);
      res.json(rows[0]);
    } else {
      const result = await q(
        `INSERT INTO settings (site_name, logo, favicon, phone, whatsapp, telegram, facebook, instagram, tiktok, x, email, city, color, visits)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [
          b.site_name || "الشام الذهبي", b.logo || "", b.favicon || "", b.phone || "",
          b.whatsapp || "", b.telegram || "", b.facebook || "",
          b.instagram || "", b.tiktok || "", b.x || "",
          b.email || "", b.city || "", b.color || "", b.visits || 0
        ]
      );
      const rows = await q("SELECT * FROM settings WHERE id = ?", [result[0].id]);
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// بوت CRUD
// ==========================================
app.post("/api/bot-replies", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.trigger_keyword || !b.reply_text) {
      return res.status(400).json({ error: "الكلمة والرد مطلوبان" });
    }
    const result = await q(
      `INSERT INTO bot_replies (target_page, trigger_keyword, reply_text, is_active)
       VALUES (?, ?, ?, ?) RETURNING id`,
      [b.target_page || "general", b.trigger_keyword, b.reply_text, b.is_active === false ? 0 : 1]
    );
    const rows = await q("SELECT * FROM bot_replies WHERE id = ?", [result[0].id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/bot-replies/:id", async (req, res) => {
  try {
    const b = req.body || {};
    const fields = [];
    const params = [];
    ["target_page", "trigger_keyword", "reply_text"].forEach((k) => {
      if (b[k] !== undefined) {
        fields.push(`${k} = ?`);
        params.push(b[k]);
      }
    });
    if (b.is_active !== undefined) {
      fields.push("is_active = ?");
      params.push(b.is_active ? 1 : 0);
    }
    if (!fields.length) return res.status(400).json({ error: "لا حقول" });
    params.push(req.params.id);
    await q(`UPDATE bot_replies SET ${fields.join(", ")} WHERE id = ?`, params);
    const rows = await q("SELECT * FROM bot_replies WHERE id = ?", [req.params.id]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/bot-replies/:id", async (req, res) => {
  try {
    await q("DELETE FROM bot_replies WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// سؤال البوت: كلمة مفتاحية أو كود موديل GB-12
app.post("/api/bot/ask", async (req, res) => {
  try {
    const text = String((req.body && req.body.message) || "").trim();
    if (!text) return res.status(400).json({ error: "message فارغ" });

    const codeMatch = text.toUpperCase().match(/\b([A-Z]{1,3})-(\d+)\b/);
    if (codeMatch) {
      const code = codeMatch[1] + "-" + codeMatch[2];
      const rows = await q(
        "SELECT * FROM projects WHERE UPPER(model_code) = ? AND status = 'منشور' LIMIT 1",
        [code]
      );
      if (rows.length) {
        return res.json({ type: "project", data: rows[0] });
      }
      return res.json({
        type: "text",
        data: { reply: "ما لقيت موديل بالكود " + code }
      });
    }

    const replies = await q(
      "SELECT * FROM bot_replies WHERE is_active = 1 OR is_active IS NULL ORDER BY id DESC"
    );
    const lower = text.toLowerCase();
    const found = replies.find((r) =>
      lower.includes(String(r.trigger_keyword || "").toLowerCase())
    );

    if (found) {
      return res.json({ type: "text", data: { reply: found.reply_text } });
    }

    res.json({
      type: "text",
      data: {
        reply:
          "أهلاً بك في الشام الذهبي ✨ اكتب كود الموديل مثل GB-1 أو سؤالك وسنرد عليك."
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
app.listen(PORT, () => {
  console.log("=================================");
  console.log("  الشام الذهبي — السيرفر شغال");
  console.log("  المنفذ: " + PORT);
  console.log("  فحص: /api/health");
  console.log("=================================");
});
