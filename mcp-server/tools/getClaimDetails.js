export async function getClaimDetails({ claim_id }) {
  const claims = {
    "123": { claim_id: "123", amount: 120000, accident: "collision" },
    "456": { claim_id: "456", amount: 20000, accident: "minor" },
    "789": { claim_id: "789", amount: 750000, accident: "rear end collision" },
    "873": { claim_id: "873", amount: 5000, accident: "minor" },
    "278": { claim_id: "278", amount: 1500000, accident: "theft reported" },
  };

  return claims[claim_id] || { error: "Claim not found" };
}