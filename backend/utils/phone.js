exports.normalizePhone = (raw) => {
  const p = String(raw || "").replace(/[\s\-()]/g, "");
  if (/^03\d{9}$/.test(p)) return "+92" + p.slice(1);
  if (/^923\d{9}$/.test(p)) return "+" + p;
  if (/^\+923\d{9}$/.test(p)) return p;
  return null;
};