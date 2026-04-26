export async function detectFraudSignals({ total_claims, amount }) {
  let signals = [];

  if (total_claims === 0) signals.push("New customer");
  if (total_claims > 3) signals.push("Repeat claimant");

  if (amount > 500000) signals.push("Very high amount");
  else if (amount > 100000) signals.push("Moderate amount");

  if (total_claims > 2 && amount > 200000) {
    signals.push("High risk combo");
  }

  return signals;
}