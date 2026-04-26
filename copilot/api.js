import express from "express";
import cors from "cors";
import { runAgent } from "../agent/agent.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const reply = await runAgent(req.body.message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "Error running agent" });
  }
});

app.listen(5001, () => {
  console.log("Copilot API running on 5001");
});