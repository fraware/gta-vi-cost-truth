/**
 * Exact minimum-cost whole-pack cover for a user's requested cloud playtime.
 * The cost objective is primary; unused hours, then pack count break ties.
 * Packs must be nonnegative, bounded integer values.
 */
export function cheapestCloudPacks(hours, packs) {
  if (!Number.isSafeInteger(hours) || hours < 1 || hours > 10000)
    throw new RangeError('Planned hours must be an integer from 1 to 10,000');
  if (!Array.isArray(packs) || packs.length < 1 || packs.length > 20 ||
      packs.some(p => !Number.isSafeInteger(p.hours) || p.hours < 1 || p.hours > 10000 ||
                      !Number.isSafeInteger(p.amount) || p.amount < 0 || p.amount > 999999999))
    throw new RangeError('Invalid cloud playtime catalog');
  const maxHours = Math.max(...packs.map(p=>p.hours));
  const limit = hours + maxHours - 1;
  const dp = Array(limit + 1).fill(null);
  dp[0] = { amount:0, count:0, quantities:Array(packs.length).fill(0) };
  for (let h=0; h<=limit; h++) {
    const current = dp[h];
    if (!current) continue;
    for (let i=0;i<packs.length;i++) {
      const next = h+packs[i].hours;
      if (next>limit) continue;
      const amount = current.amount+packs[i].amount;
      const count=current.count+1;
      const previous=dp[next];
      if (!previous || amount < previous.amount || (amount === previous.amount && count < previous.count)) {
        const quantities = current.quantities.slice(); quantities[i]++;
        dp[next]={ amount,count,quantities };
      }
    }
  }
  let result=null;
  for (let h=hours;h<=limit;h++) {
    const p=dp[h];if(!p)continue;
    if(!result || p.amount<result.amount || (p.amount===result.amount && h<result.coveredHours) ||
       (p.amount===result.amount && h===result.coveredHours && p.count<result.count))
      result={...p,coveredHours:h};
  }
  if(!result)throw new RangeError('No cloud pack combination found');
  return {
    totalAmount:result.amount, coveredHours:result.coveredHours, unusedHours:result.coveredHours-hours,
    selection:packs.map((pack,i)=>({...pack,quantity:result.quantities[i]})).filter(p=>p.quantity),
  };
}
