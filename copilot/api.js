import express from "express";
import cors from "cors";
import { runAgent } from "../agent/agent.js";

const app = express();   // ✅ MUST COME FIRST

app.use(cors());         // ✅ AFTER app is defined
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await runAgent(message);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error running agent" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Copilot API running on ${PORT}`);
});