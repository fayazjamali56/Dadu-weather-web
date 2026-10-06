require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");


const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: (process.env.CORS_ORIGIN || "").split(",") }));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api", notFound);

// Also serves the website, so you can open http://localhost:5000
const fs = require("fs");
const frontendDir = path.join(__dirname, "../frontend");
console.log("Frontend folder:", frontendDir, "exists:", fs.existsSync(frontendDir));
app.use(express.static(frontendDir));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
db.query("SELECT 1")
  .then(() => {
    console.log("MySQL connected");
    app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Cannot connect to MySQL. Is WampServer green? Check .env.\n", err.message);
    process.exit(1);
  });