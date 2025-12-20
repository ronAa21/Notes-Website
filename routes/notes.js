import { pool } from "../db.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const route = express.Router();
dotenv.config();

function check(req, res, next) {
  const headers = req.headers.authorization

  if(!headers) {
    return res.status(401).send("No token");
  }

  const token = headers.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = user;
    console.log(user);
    next();
  } catch (error) {
    res.status(401).send("Invalid request");
  }
};

// for registration
route.post("/notes", async (req, res) => {
  try {
    const { fullName, email, password, country } = req.body

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'insert into user_notes (full_name, email, password, country) values (?, ?, ?, ?)', [fullName, email, hashed, country]
    );

    res.json({
      messsage: "signed up",
      user: fullName
    })
  } catch (error) {
    console.error("Insert error", error);
    res.status(500).json({ error: "failed" });
  }
})

// for login
route.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    "select id, password from user_notes where email = ?", [email]
  );

  if(rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);

  console.log(match)

  if(!match) {
    return res.status(401).json({ message: "Invalid credentials" });    
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_TOKEN,
    { expiresIn: "1h" }
  )

  res.json({token});
});
 
route.get("/notes", check,  async (req, res) => {
  const userId = req.user.userId;

  const [notes] = await pool.query(
    'select * from notes where user_id = ?', [userId]
  )

  res.json(notes);
});

// retrieve one particular user
route.get("/users", check, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [results] = await pool.query(
      'SELECT id, full_name, email FROM user_notes WHERE id = ?', [userId],
    )

    console.log(results);

    if(results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ exist: false });
    }

  } catch (error) {
    console.error("Retrieve error", error);
    res.status(500).json({ error: "failed" });
  }
})

// retrieving user specific notes
route.get("/mynotes", check, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [results] = await pool.query(
      'select * from notes where user_id = ? ORDER BY id DESC', [userId]
    )

    res.json(results);

  } catch (error) {
    console.error("Retrieve error", error);
      res.status(500).json({ error: "failed" });
  }
})

// add notes
route.post("/mynotes", check, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;

    await pool.query(
      'insert into notes (user_id, title, description) values (?, ?, ?)', [userId, title, description]
    );

    res.json({ message: "Added" });
    
  } catch (error) {
     console.error("Insert error", error);
    res.status(500).json({ error: "failed" });
  }
});

// edit notes
route.put("/updates/:id", check, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;
    const { uptitle, updesc } = req.body;

    const [result] = await pool.query(
      'update notes set title = ?, description = ? where id = ? and user_id = ?', [uptitle, updesc, noteId, userId]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ messages: 'updated' });
  } catch (error) {
    console.error("update error", error);
    res.status(500).json({ error: "failed" });
  }
});

route.delete("/delete/:id", check, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    const [result] = await pool.query(
      'delete from notes where id = ? and user_id = ?', [noteId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ messages: 'deleted' });
  } catch (error) {
      console.error("update error", error);
      res.status(500).json({ error: "failed" }); 
  }
})

export default route;