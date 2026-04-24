import axios from "axios";
import { client } from "../utils/openai.js";

const MCP_URL = "http://localhost:4000/tool";

export async function runAgent(input) {
  try {
    // Step 1: Extract claim_id
    const claimIdMatch = input.match(/\d+/);
    if (!claimIdMatch) {
      return {
        error: "No claim ID found in input",
      };
    }

    const claim_id = claimIdMatch[0];
    console.log("Extracted Claim ID:", claim_id);

    // Step 2: Get claim details
    const claimRes = await axios.post(`${MCP_URL}/get_claim_details`, {
      claim_id,
    });

    const claim = claimRes.data.result;

    // Step 3: Get customer history
    const historyRes = await axios.post(
      `${MCP_URL}/get_customer_history`,
      {
        customer_id: claim.claim_id,
      }
    );

    const history = historyRes.data.result;

    // Step 4: Fraud signals
    const fraudRes = await axios.post(
      `${MCP_URL}/detect_fraud_signals`,
      {
        total_claims: history.total_claims,
        amount: claim.amount,
      }
    );

    const fraudSignals = fraudRes.data.result;

    // Step 5: LLM Explanation (clean + structured)
    const llmRes = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // or your working Groq model
      messages: [
        {
          role: "system",
          content: `
You are an insurance fraud investigator.

Return STRICT JSON ONLY in this format:
{
  "risk_level": "LOW | MEDIUM | HIGH",
  "reasoning": ["point1", "point2"],
  "summary": "short explanation",
  "recommended_actions": ["action1", "action2"]
}
          `,
        },
        {
          role: "user",
          content: `
Claim Data: ${JSON.stringify(claim)}
Customer History: ${JSON.stringify(history)}
Fraud Signals: ${JSON.stringify(fraudSignals)}
          `,
        },
      ],
    });

    let parsedOutput;

    try {
      parsedOutput = JSON.parse(llmRes.choices[0].message.content);
    } catch (e) {
      // fallback if LLM messes up JSON
      parsedOutput = {
        risk_level: "UNKNOWN",
        reasoning: fraudSignals,
        summary: llmRes.choices[0].message.content,
        recommended_actions: ["Manual review required"],
      };
    }

    // ✅ FINAL RESPONSE (UI READY)
    return {
      claim_id,
      risk_level: parsedOutput.risk_level,
      fraud_signals: fraudSignals,
      claim_details: claim,
      customer_history: history,
      reasoning: parsedOutput.reasoning,
      summary: parsedOutput.summary,
      recommended_actions: parsedOutput.recommended_actions,
      timestamp: new Date().toISOString(),
    };

  } catch (err) {
    console.error("Agent Error:", err.message);

    return {
      error: "Error running fraud analysis",
      details: err.message,
    };
  }
}