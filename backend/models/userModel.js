const db = require("../config/db");

const SELECT = `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.password_hash,
                       u.role, u.city_id, c.name AS city_name, u.created_at
                FROM users u LEFT JOIN cities c ON c.id = u.city_id`;

exports.findByEmail = async (email) => {
  const [rows] = await db.query(`${SELECT} WHERE u.email = ?`, [email]);
  return rows[0] || null;
};

exports.findByPhone = async (phone) => {
  const [rows] = await db.query(`${SELECT} WHERE u.phone = ?`, [phone]);
  return rows[0] || null;
};

exports.findByEmailOrPhone = async (email, phone) => {
  const [rows] = await db.query(`${SELECT} WHERE u.email = ? OR u.phone = ?`, [email, phone]);
  return rows[0] || null;
};

exports.findById = async (id) => {
  const [rows] = await db.query(`${SELECT} WHERE u.id = ?`, [id]);
  return rows[0] || null;
};

exports.createUser = async ({ firstName, lastName, email, phone, passwordHash, cityId }) => {
  const [r] = await db.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, city_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, phone, passwordHash, cityId]
  );
  return r.insertId;
};

exports.listAll = async () => {
  const [rows] = await db.query(`${SELECT} ORDER BY u.created_at DESC`);
  return rows.map(({ password_hash, ...safe }) => safe);
};