const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

const WHATSAPP_NUMBER = "918147434571";

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("leads.db");

db.run(`
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  project_type TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

app.post("/api/leads", (req, res) => {
  const {
    name,
    phone,
    location,
    project_type,
    budget,
    message
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      error: "Name and phone are required"
    });
  }

  const sql = `
    INSERT INTO leads
    (name, phone, location, project_type, budget, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [name, phone, location, project_type, budget, message],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: "Could not save enquiry"
        });
      }

      const whatsappMessage = `
PN BUILDSCAPE - NEW ENQUIRY

Name: ${name}
Phone: ${phone}
Location: ${location}
Project Type: ${project_type}
Budget: ${budget}

Requirements:
${message}
`;

      const whatsapp =
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(whatsappMessage);

      res.json({
        success: true,
        leadId: this.lastID,
        whatsapp
      });
    }
  );
});

app.get("/api/leads", (req, res) => {
  db.all(
    "SELECT * FROM leads ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: "Could not load leads"
        });
      }

      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`PN BUILDSCAPE running at http://localhost:${PORT}`);
});