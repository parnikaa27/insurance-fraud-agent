export async function getCustomerHistory({ customer_id }) {
  const history = {
    C1: { total_claims: 1 },
    C2: { total_claims: 5 },
    C3: { total_claims: 2 },
    C4: { total_claims: 0 },
    C5: { total_claims: 3 },
  };

  return history[customer_id] || { total_claims: 0 };
}