import mysql from "mysql2";

// Read DB configuration from environment variables with safe fallbacks
const common = {
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "resqlink",
};

// Prefer Unix socket if provided (common on Linux when root uses auth_socket)
const dbConfig = process.env.DB_SOCKET
  ? { socketPath: process.env.DB_SOCKET, ...common }
  : {
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      ...common,
    };

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error(
      `❌ MySQL connection failed: ${err.message}\n` +
        (dbConfig.socketPath
          ? `Tried socketPath=${dbConfig.socketPath} user=${dbConfig.user} db=${dbConfig.database}`
          : `Tried connecting with host=${dbConfig.host} port=${dbConfig.port} user=${dbConfig.user} db=${dbConfig.database}`)
    );
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

export default db;
