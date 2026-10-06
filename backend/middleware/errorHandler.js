exports.notFound = (req, res) => res.status(404).json({ message: "Not found." });

exports.errorHandler = (err, req, res, next) => {
  if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "This email or phone is already registered." });
  console.error(err);
  res.status(500).json({ message: "Server error: " + err.message });
};