export async function getClaimDetails({ claim_id }) {
  const claims = {
    "123": { claim_id, amount: 120000, accident: "collision" },
    "456": { claim_id, amount: 20000, accident: "minor" },
  };

  return claims[claim_id] || claims["123"];
}