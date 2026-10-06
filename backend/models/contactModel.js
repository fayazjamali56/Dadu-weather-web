const db = require("../config/db");

exports.create = async ({ name, email, phone, subject, message }) => {
  const [r] = await db.query(
    "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone || null, subject, message]
  );
  return r.insertId;
};