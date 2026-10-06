const db = require("../config/db");

exports.findBySlug = async (slug) => {
  const [rows] = await db.query("SELECT id, slug, name FROM cities WHERE slug = ?", [slug]);
  return rows[0] || null;
};