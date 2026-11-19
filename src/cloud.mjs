/**
 * Find the lowest-cost multiset of whole cloud-playtime packs covering the
 * requested hours, allowing unused hours. A bounded unbounded-knapsack DP
 * makes the result exact rather than a greedy approximation.
 *
 * Tie break: lower price, fewer unused hours, fewer packs. Complexity
 * O((hours + maxPackHours) * packTypes), bounded by caller validation.
 */
export function cheapestCloudPacks(hours, packs) {
  if (!Number.isSafeInteger(hours) || hours < 1 || hours > 10000)
    throw new RangeError('Cloud hours must be an integer between 1 and 10,000');
  if (!Array.isArray(packs) || packs.length === 0 || packs.length > 20 ||
      packs.some(p => !Number.isSafeInteger(p.hours) || p.hours < 1 || p.hours > 10000 ||
        !Number.isSafeInteger(p.cents) || p.cents < 0 || p.cents > 999999999))
    throw new RangeError('Invalid cloud-playtime price catalog');
  const limit = hours + Math.max(...packs.map(p => p.hours)) - 1;
  const dp = Array(limit + 1).fill(null);
  dp[0] = { cents: 0, count: 0, quantities: Array(packs.length).fill(0) };
  for (let used = 0; used <= limit; used++) {
    const base = dp[used];
    if (!base) continue;
    for (let i = 0; i < packs.length; i++) {
      const next = used + packs[i].hours;
      if (next > limit) continue;
      const cents = base.cents + packs[i].cents;
      const count = base.count + 1;
      const previous = dp[next];
      if (!previous || cents < previous.cents ||
          (cents === previous.cents && count < previous.count)) {
        const quantities = base.quantities.slice();
        quantities[i] += 1;
        dp[next] = { cents, count, quantities };
      }
    }
  }
  let best = null;
  for (let covered = hours; covered <= limit; covered++) {
    const candidate = dp[covered];
    if (!candidate) continue;
    if (!best || candidate.cents < best.cents ||
        (candidate.cents === best.cents && covered < best.coveredHours) ||
        (candidate.cents === best.cents && covered === best.coveredHours && candidate.count < best.count)) {
      best = { ...candidate, coveredHours: covered };
    }
  }
  if (!best) throw new RangeError('No purchasable cloud-playtime packs');
  const selection = packs.map((pack, i) => ({ ...pack, quantity: best.quantities[i] }))
    .filter(pack => pack.quantity > 0).sort((a,b) => b.hours - a.hours);
  return { totalCents: best.cents, coveredHours: best.coveredHours, unusedHours: best.coveredHours - hours, selection };
}
