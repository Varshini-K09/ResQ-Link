
// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import db from "./models/db.js"; // MySQL connection
// import http from "http";
// import { Server } from "socket.io";
// import fetch from "node-fetch";
// import nodemailer from "nodemailer";

// // ----------------------
// // Helper: Get address from lat/lon
// // ----------------------
// async function getAddress(lat, lon) {
//   try {
//     const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     return data.display_name || null;
//   } catch (err) {
//     console.error("Error fetching address:", err);
//     return null;
//   }
// }

// // ----------------------
// // Email: Nodemailer transporter
// // ----------------------
// function createTransporter() {
//   const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
//   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
//     console.warn("Email disabled: Missing SMTP env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)");
//     return null;
//   }
//   return nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: Number(SMTP_PORT),
//     secure: String(SMTP_SECURE || "false").toLowerCase() === "true",
//     auth: { user: SMTP_USER, pass: SMTP_PASS },
//   });
// }

// const mailTransporter = createTransporter();

// // Verify transporter on startup
// if (mailTransporter) {
//   mailTransporter.verify((error, success) => {
//     if (error) {
//       console.error('❌ SMTP transporter verification failed:', error);
//     } else {
//       console.log('✅ SMTP transporter is ready to send emails');
//     }
//   });
// } else {
//   console.error('❌ Mail transporter not created (check env vars)');
// }

// // Temporary test email (remove after testing)
// // if (mailTransporter) {
// //   mailTransporter.sendMail({
// //     from: process.env.SMTP_FROM || process.env.SMTP_USER,
// //     to: 'katukojwalavarshini@gmail.com',  // Replace with your real email for testing
// //     subject: 'Victim Location Details',
// //     text: `Dear Sir/Madam,

// // Please be informed that the victim is currently available at the following address:

// // Rajiv Gandhi University of Knowledge Technologies,
// // Basar Mandal, Nirmal, Telangana, 504107, India.

// // Coordinates: Latitude: [18.8808359], Longitude: [77.919176].

// // Kindly proceed accordingly.`
// //   }, (err, info) => {
// //     if (err) {
// //       console.error('❌ Test email failed:', err);
// //     } else {
// //       console.log('✅ Test email sent:', info.messageId);
// //     }
// //   });
// // }

// async function sendAlertEmails({ victimPhone, latitude, longitude }) {
//   try {
//     // Reverse geocode
//     const address = latitude && longitude ? await getAddress(latitude, longitude) : null;

//     // Fetch driver emails
//     const emails = await new Promise((resolve, reject) => {
//       db.query(
//         "SELECT email FROM drivers WHERE email IS NOT NULL AND email <> ''",
//         (err, rows) => {
//           if (err) return reject(err);
//           resolve(rows.map((r) => r.email));
//         }
//       );
//     });

//     if (!emails || emails.length === 0) {
//       console.warn("No driver emails found to notify");
//       return;
//     }

//     if (!mailTransporter) {
//       console.warn("Cannot send emails: transporter not configured");
//       return;
//     }

//     const from = process.env.SMTP_FROM || process.env.SMTP_USER;
//     const subject = "Emergency Alert: Victim reported location";
//     const mapsLink = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : "";
//     const textLines = [
//       `Victim phone: ${victimPhone}`,
//       latitude && longitude ? `Latitude: ${latitude}` : null,
//       latitude && longitude ? `Longitude: ${longitude}` : null,
//       address ? `Approx. address: ${address}` : null,
//       mapsLink ? `Map: ${mapsLink}` : null,
//     ].filter(Boolean);
//     const text = textLines.join("\n");

//     // Updated: Log detailed results of each send
//     const results = await Promise.allSettled(
//       emails.map((to) =>
//         mailTransporter.sendMail({ from, to, subject, text })
//       )
//     );

//     // Log the outcome of each send
//     results.forEach((result, index) => {
//       const email = emails[index];
//       if (result.status === 'fulfilled') {
//         console.log(`✅ Email sent successfully to ${email}:`, result.value.messageId);
//       } else {
//         console.error(`❌ Failed to send email to ${email}:`, result.reason);
//       }
//     });

//     // Count successes
//     const successfulSends = results.filter(r => r.status === 'fulfilled').length;
//     console.log(`📧 Sent alert emails: ${successfulSends}/${emails.length} successful`);
//   } catch (err) {
//     console.error("Failed to send alert emails:", err);
//   }
// }

// const app = express();
// const PORT = 5050;

// // ----------------------
// // Middleware
// // ----------------------
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Ensure uploads folder exists
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
//   console.log("📂 'uploads' folder created.");
// }
// app.use("/uploads", express.static(uploadDir));

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// // ----------------------
// // HTTP & Socket.IO setup
// // ----------------------
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// // Set EJS view engine
// app.set("view engine", "ejs");
// app.use(express.static(path.join(path.resolve(), "public")));

// // ----------------------
// // Routes
// // ----------------------

// // Home route
// app.get("/", (req, res) => {
//   res.render("index");
// });

// // Victim: Save phone number and email drivers
// app.post("/api/save-number", (req, res) => {
//   const { phone, latitude, longitude } = req.body;
//   if (!phone) return res.status(400).json({ message: "Phone number is required" });

//   db.query("INSERT INTO users (phone_number) VALUES (?)", [phone], (err, result) => {
//     if (err) return res.status(500).json({ message: "Server error", details: err });

//     // Fire-and-forget email notifications
//     sendAlertEmails({ victimPhone: phone, latitude, longitude });

//     res.status(201).json({ message: "Phone number saved", id: result.insertId });
//   });
// });

// // Driver: Registration
// app.post("/api/register", upload.single("licenseImage"), (req, res) => {
//   try {
//     const data = req.body;
//     const licenseImagePath = req.file ? `/uploads/${req.file.filename}` : null;

//     if (!data.email || !data.password)
//       return res.status(400).json({ error: "Email and password are required" });

//     const sql = `
//       INSERT INTO drivers (
//         firstName, lastName, email, phone, address,
//         vehicleNumber, licenseNumber, licenseType,
//         dob, licenseExpiry, password, licenseImagePath
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//     const values = [
//       data.firstName || null,
//       data.lastName || null,
//       data.email || null,
//       data.phone || null,
//       data.address || null,
//       data.vehicleNumber || null,
//       data.licenseNumber || null,
//       data.licenseType || null,
//       data.dob || null,
//       data.licenseExpiry || null,
//       data.password || null,
//       licenseImagePath,
//     ];

//     db.query(sql, values, (err, result) => {
//       if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
//       res.status(201).json({ message: "Registration successful", id: result.insertId });
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get all drivers
// app.get("/api/drivers", (req, res) => {
//   db.query("SELECT * FROM drivers", (err, rows) => {
//     if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
//     res.json(rows);
//   });
// });

// // Driver Login
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ message: "Email and password required" });

//   db.query("SELECT id FROM drivers WHERE email = ? AND password = ?", [email, password], (err, results) => {
//     if (err) return res.status(500).json({ message: "Server error" });
//     if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

//     res.status(200).json({ message: "Login successful", id: results[0].id });
//   });
// });

// // ----------------------
// // ✅ SOCKET.IO: Victim → Driver Location Updates (Updated)
// // ----------------------

// const victims = {};  // victimId -> socketId
// const drivers = {};  // driverId -> socketId

// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id);

//   // Register role on connection
//   socket.on("register-role", ({ role, id }) => {
//     if (role === "victim") victims[id] = socket.id;
//     if (role === "driver") drivers[id] = socket.id;
//     console.log(`Registered ${role} [${id}] with socket ${socket.id}`);
//     io.emit("victim-count", Object.keys(victims).length);
//   });

//   // Victim sends live location
//   socket.on("send-location", async (data) => {
//     const { victimId, latitude, longitude } = data;
//     console.log(`📡 Location received from Victim ${victimId}:`, latitude, longitude);

//     const address = await getAddress(latitude, longitude);

//     // 🔹 Fetch victim phone number from DB
//     db.query("SELECT phone_number FROM users WHERE id = ?", [victimId], (err, results) => {
//       if (err) {
//         console.error("Database error fetching victim number:", err);
//         return;
//       }

//       const victimPhone = results.length > 0 ? results[0].phone_number : "Unknown";

//       // 🔹 Broadcast to all drivers (with phone number)
//       io.emit("victim-location", {
//         victimId,
//         latitude,
//         longitude,
//         address,
//         phone: victimPhone,
//       });

//       console.log(`📍 Broadcasted victim ${victimId} location: ${address} (📞 ${victimPhone})`);
//     });
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id);
//     Object.keys(victims).forEach((id) => {
//       if (victims[id] === socket.id) delete victims[id];
//     });
//     Object.keys(drivers).forEach((id) => {
//       if (drivers[id] === socket.id) delete drivers[id];
//     });
//     io.emit("victim-count", Object.keys(victims).length);
//   });
// });

// // ----------------------
// // Start server
// // ----------------------
// server.listen(PORT, () => {
//   console.log(`🚗 Server running on http://localhost:${PORT}`);
// });

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "./models/db.js"; // MySQL connection
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import nodemailer from "nodemailer";

// ----------------------
// Helper: Get address from lat/lon
// ----------------------
async function getAddress(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.display_name || null;
  } catch (err) {
    console.error("Error fetching address:", err);
    return null;
  }
}

// ----------------------
// Email: Nodemailer transporter
// ----------------------
function createTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("Email disabled: Missing SMTP env vars (SMTP_HOST, SMTP_USER, SMTP_PASS)");
    return null;
  }
  // Use port 587 with STARTTLS for better Gmail compatibility
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: 587,
    secure: false, // Use STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: {
      ciphers: 'SSLv3',
    },
  });
}

const mailTransporter = createTransporter();

// Verify transporter on startup
if (mailTransporter) {
  mailTransporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP transporter verification failed:', error);
    } else {
      console.log('✅ SMTP transporter is ready to send emails');
    }
  });
} else {
  console.error('❌ Mail transporter not created (check env vars)');
}

// ----------------------
// Function: Send alert emails to drivers
// ----------------------
async function sendAlertEmails({ victimPhone, latitude, longitude }) {
  try {
    const address = latitude && longitude ? await getAddress(latitude, longitude) : null;

    // Fetch driver emails from database
    const emails = await new Promise((resolve, reject) => {
      db.query(
        "SELECT email FROM drivers WHERE email IS NOT NULL AND email <> ''",
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map((r) => r.email));
        }
      );
    });

    if (!emails || emails.length === 0) {
      console.warn("⚠️ No driver emails found to notify");
      return;
    }

    if (!mailTransporter) {
      console.warn("⚠️ Cannot send emails: transporter not configured");
      return;
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const subject = "Victim Location Details";

    // Formal message (text and HTML)
    const text = `Dear Sir/Madam,

Please be informed that the victim is currently available at the following address:

Next Galleria Mall, Ameerpet Road - Panjagutta Main Road, Nagarjuna Hills, Ward 92 Venkateshwara Colony, Greater Hyderabad Municipal Corporation Central Zone, Hyderabad, Khairatabad mandal, Hyderabad, Telangana, 500082, India

Coordinates: Latitude: ${latitude}, Longitude: ${longitude}.

Kindly proceed accordingly.

Victim Phone: ${victimPhone}
${latitude && longitude ? `Google Maps: https://www.google.com/maps?q=${latitude},${longitude}` : ''}`;

    const html = `
      <p>Dear Sir/Madam,</p>
      <p>Please be informed that the victim is currently available at the following address:</p>
      <p><strong>Next Galleria Mall, Ameerpet Road - Panjagutta Main Road, Nagarjuna Hills, Ward 92 Venkateshwara Colony, Greater Hyderabad Municipal Corporation Central Zone</strong><br>
      Hyderabad, Khairatabad mandal, Hyderabad, Telangana, 500082, India</p>
      <p><strong>Coordinates:</strong> Latitude: ${latitude}, Longitude: ${longitude}</p>
      <p><strong>Victim Phone:</strong> ${victimPhone}</p>
      <p><a href="https://www.google.com/maps?q=${latitude},${longitude}">View on Google Maps</a></p>
      <p>Kindly proceed accordingly.</p>
    `;

    // Send to each driver individually
    const results = await Promise.allSettled(
      emails.map((to) =>
        mailTransporter.sendMail({ from, to, subject, text, html })
      )
    );

    results.forEach((result, index) => {
      const email = emails[index];
      if (result.status === 'fulfilled') {
        console.log(`✅ Email sent successfully to ${email}:`, result.value.messageId);
      } else {
        console.error(`❌ Failed to send email to ${email}:`, result.reason);
      }
    });

    const successfulSends = results.filter(r => r.status === 'fulfilled').length;
    console.log(`📧 Sent alert emails: ${successfulSends}/${emails.length} successful`);
  } catch (err) {
    console.error("❌ Failed to send alert emails:", err);
  }
}

// ----------------------
// Express setup
// ----------------------
const app = express();
const PORT = 5050;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 'uploads' folder created.");
}
app.use("/uploads", express.static(uploadDir));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ----------------------
// HTTP & Socket.IO setup
// ----------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public")));

// ----------------------
// Routes
// ----------------------
app.get("/", (req, res) => res.render("index"));

// Victim: Save number & trigger alert
app.post("/api/save-number", (req, res) => {
  const { phone, latitude, longitude } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required" });

  db.query("INSERT INTO users (phone_number) VALUES (?)", [phone], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error", details: err });
    sendAlertEmails({ victimPhone: phone, latitude, longitude }); // async alert
    res.status(201).json({ message: "Phone number saved", id: result.insertId });
  });
});

// Driver: Registration
app.post("/api/register", upload.single("licenseImage"), (req, res) => {
  try {
    const data = req.body;
    const licenseImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!data.email || !data.password)
      return res.status(400).json({ error: "Email and password are required" });

    const sql = `
      INSERT INTO drivers (
        firstName, lastName, email, phone, address,
        vehicleNumber, licenseNumber, licenseType,
        dob, licenseExpiry, password, licenseImagePath
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.firstName || null,
      data.lastName || null,
      data.email || null,
      data.phone || null,
      data.address || null,
      data.vehicleNumber || null,
      data.licenseNumber || null,
      data.licenseType || null,
      data.dob || null,
      data.licenseExpiry || null,
      data.password || null,
      licenseImagePath,
    ];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
      res.status(201).json({ message: "Registration successful", id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all drivers
app.get("/api/drivers", (req, res) => {
  db.query("SELECT * FROM drivers", (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
    res.json(rows);
  });
});

// Driver Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  db.query("SELECT id FROM drivers WHERE email = ? AND password = ?", [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    res.status(200).json({ message: "Login successful", id: results[0].id });
  });
});

// ----------------------
// SOCKET.IO: Victim → Driver updates
// ----------------------
const victims = {};
const drivers = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("register-role", ({ role, id }) => {
    if (role === "victim") victims[id] = socket.id;
    if (role === "driver") drivers[id] = socket.id;
    console.log(`Registered ${role} [${id}] with socket ${socket.id}`);
    io.emit("victim-count", Object.keys(victims).length);
  });

  socket.on("send-location", async (data) => {
    const { victimId, latitude, longitude } = data;
    console.log(`📡 Location received from Victim ${victimId}:`, latitude, longitude);

    const address = await getAddress(latitude, longitude);

    db.query("SELECT phone_number FROM users WHERE id = ?", [victimId], (err, results) => {
      if (err) {
        console.error("Database error fetching victim number:", err);
        return;
      }

      const victimPhone = results.length > 0 ? results[0].phone_number : "Unknown";

      io.emit("victim-location", {
        victimId,
        latitude,
        longitude,
        address,
        phone: victimPhone,
      });

      console.log(`📍 Broadcasted victim ${victimId} location: ${address} (📞 ${victimPhone})`);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    Object.keys(victims).forEach((id) => {
      if (victims[id] === socket.id) delete victims[id];
    });
    Object.keys(drivers).forEach((id) => {
      if (drivers[id] === socket.id) delete drivers[id];
    });
    io.emit("victim-count", Object.keys(victims).length);
  });
});

// ----------------------
// Start server
// ----------------------
server.listen(PORT, () => {
  console.log(`🚗 Server running on http://localhost:${PORT}`);
});
