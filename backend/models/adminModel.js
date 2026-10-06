const db = require("../config/db");

const count = async (sql) => Number((await db.query(sql))[0][0].n);

exports.stats = async () => {
  const [users, newToday, loginsToday, failedToday, messages, [days]] = await Promise.all([
    count("SELECT COUNT(*) n FROM users"),
    count("SELECT COUNT(*) n FROM users WHERE DATE(created_at) = CURDATE()"),
    count("SELECT COUNT(*) n FROM login_logs WHERE success = 1 AND DATE(created_at) = CURDATE()"),
    count("SELECT COUNT(*) n FROM login_logs WHERE success = 0 AND DATE(created_at) = CURDATE()"),
    count("SELECT COUNT(*) n FROM contact_messages"),
    db.query(`SELECT DATE_FORMAT(created_at,'%Y-%m-%d') d,
                     SUM(success = 1) ok, SUM(success = 0) fail
              FROM login_logs WHERE created_at >= CURDATE() - INTERVAL 6 DAY
              GROUP BY d ORDER BY d`),
  ]);
  return {
    users, newToday, loginsToday, failedToday, messages,
    days: days.map((r) => ({ d: r.d, ok: Number(r.ok), fail: Number(r.fail) })),
  };
};

exports.logins = async () => {
  const [rows] = await db.query(
    `SELECT l.id, l.identifier, l.success, l.ip_address, l.user_agent, l.created_at,
            u.first_name, u.last_name
     FROM login_logs l LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.id DESC LIMIT 300`);
  return rows;
};

exports.messages = async () => {
  const [rows] = await db.query("SELECT * FROM contact_messages ORDER BY id DESC LIMIT 300");
  return rows;
};
exports.findMessage = async (id) => {
  const [rows] = await db.query("SELECT * FROM contact_messages WHERE id = ?", [id]);
  return rows[0] || null;
};

exports.saveReply = async (id, reply) => {
  await db.query("UPDATE contact_messages SET reply = ?, replied_at = NOW() WHERE id = ?", [reply, id]);
};