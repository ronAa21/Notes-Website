import express from "express";
import dotenv from "dotenv";
import notes from "./routes/notes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static("public"));

app.use("/api", notes);

app.use((req, res) => res.status(404).send("404 not found"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at ${PORT}\nOkairi ${process.env.USER}`);
})