import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const poolConfig = process.env.DATABASE_URL 
  ? {
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Aiven cloud connections
      connectionLimit: 5
    }
  : {
      host: "localhost",
      user: "root",
      port: 3307,
      password: "Aaronpagente212005",
      database: "test_db",
      connectionLimit: 5
    };

export const pool = mysql.createPool(poolConfig);