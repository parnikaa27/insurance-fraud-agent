export async function detectFraudSignals({ total_claims, amount }) {
  let signals = [];
  if (total_claims > 2) signals.push("Frequent claims");
  if (amount > 100000) signals.push("High claim amount");
  return signals;
}