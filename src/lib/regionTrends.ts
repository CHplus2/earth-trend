import { REGIONS } from './catalog';
import type { Variable } from './catalog';
import { loadVariableSeries } from './data';
import { analyzeTrend, deseasonalize } from './stats';

export interface RegionTrend {
  /** Signed Mann-Kendall Z: positive = rising, negative = falling */
  z: number;
  perDecade: number;
  p: number;
  sig: boolean;
}

/** Trend (seasonal cycle removed) of one variable in every region that has data for it. */
export async function computeRegionTrends(v: Variable): Promise<Record<string, RegionTrend>> {
  const regions = REGIONS.filter((r) => v.regionTypes.includes(r.type));
  const results = await Promise.allSettled(regions.map((r) => loadVariableSeries(v, r.id)));
  const out: Record<string, RegionTrend> = {};
  results.forEach((res, i) => {
    if (res.status !== 'fulfilled' || res.value.length < 24) return;
    const t = analyzeTrend(deseasonalize(res.value));
    out[regions[i].id] = { z: t.mkZ, perDecade: t.sensSlopePerDecade, p: t.mkPValue, sig: t.significant };
  });
  return out;
}
