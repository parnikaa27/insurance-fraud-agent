import axios from "axios";
import { client } from "../utils/openai.js";


const MCP_URL = "http://localhost:4000/tool";
const safeResult = (res) => res?.data?.result ?? null;

export async function runAgent(input) {
  try {
    // Step 1: Extract claim_id
    const claimIdMatch = input.match(/\b\d{3,6}\b/);

    if (!claimIdMatch) {
      return { error: "No valid claim ID found in input" };
    }

    const claim_id = claimIdMatch[0];
    console.log("Extracted Claim ID:", claim_id);

    // Step 2: Get claim details
    const claimRes = await axios.post(`${MCP_URL}/get_claim_details`, {
      claim_id,
    });

    const claim = safeResult(claimRes);

    if (!claim || claim.error) {
      return {
        claim_id,
        error: "Claim not found or invalid response",
        risk_level: "UNKNOWN",
        summary: "Unable to fetch claim details",
        recommended_actions: ["Verify claim ID", "Check MCP service"],
      };
    }

    // Step 3: Get customer history
    const customerMap = {
      "123": "C1",
      "456": "C2",
      "789": "C3",
      "278": "C4",
      "873": "C5",
    };

    const historyRes = await axios.post(
      `${MCP_URL}/get_customer_history`,
      {
        customer_id: customerMap[claim.claim_id],
      }
    );

    const history = safeResult(historyRes);

    if (!history || typeof history.total_claims !== "number") {
      return {
        claim_id,
        error: "Customer history not available",
        risk_level: "UNKNOWN",
        summary: "Cannot evaluate due to missing history data",
        recommended_actions: ["Fix MCP history service", "Retry request"],
      };
    }

    // Step 4: Fraud signals
    const fraudRes = await axios.post(
      `${MCP_URL}/detect_fraud_signals`,
      {
        total_claims: history.total_claims,
        amount: claim.amount,
      }
    );

    const fraudSignals = safeResult(fraudRes) || [];

    if (!Array.isArray(fraudSignals)) {
      return {
        claim_id,
        error: "Fraud signal generation failed",
        risk_level: "UNKNOWN",
        summary: "Invalid fraud signal response",
        recommended_actions: ["Check fraud engine"],
      };
    }

    // Step 5: LLM Explanation
    const llmRes = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are an insurance fraud investigator.

Return STRICT JSON ONLY:
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
    } catch {
      parsedOutput = {
        risk_level: "UNKNOWN",
        reasoning: fraudSignals,
        summary: llmRes.choices[0].message.content,
        recommended_actions: ["Manual review required"],
      };
    }

    // FINAL RESPONSE
    return {
      claim_id: claim.claim_id,
      claim_details: claim,
      customer_history: history,
      fraud_signals: fraudSignals,

      risk_level: parsedOutput.risk_level,
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