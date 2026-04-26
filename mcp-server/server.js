import express from "express";
import { getClaimDetails } from "./tools/getClaimDetails.js";
import { getCustomerHistory } from "./tools/getCustomerHistory.js";
import { detectFraudSignals } from "./tools/fraudSignals.js";

const app = express();
app.use(express.json());

const tools = {
  get_claim_details: getClaimDetails,
  get_customer_history: getCustomerHistory,
  detect_fraud_signals: detectFraudSignals,
};

app.post("/tool/:toolName", async (req, res) => {
  const tool = tools[req.params.toolName];
  if (!tool) return res.status(404).send("Tool not found");

  const result = await tool(req.body);
  res.json({ result });
});

app.listen(4000, () => console.log("Tool server running on 4000"));