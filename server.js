import express from "express";
import dotenv from "dotenv";
import notes from "./routes/notes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/api", notes);

app.use((req, res) => res.status(404).send("404 not found"));

app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.PORT}\nOkairi ${process.env.USER}`);
})