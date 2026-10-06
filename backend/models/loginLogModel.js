const db = require("../config/db");

exports.record = async ({ userId, identifier, success, ip, userAgent }) => {
  await db.query(
    `INSERT INTO login_logs (user_id, identifier, success, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [userId || null, String(identifier).slice(0, 150), success ? 1 : 0, ip || null, (userAgent || "").slice(0, 255)]
  );
};