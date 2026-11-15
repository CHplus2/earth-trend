import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Point, TrendResult } from '../lib/stats';
import { decimalYear } from '../lib/stats';

interface Props {
  points: Point[];
  trend: TrendResult;
  unit: string;
  anomalies: boolean;
}

export default function TrendChart({ points, trend, unit, anomalies }: Props) {
  const data = points.map((p) => {
    const t = decimalYear(p.date);
    return {
      t,
      value: p.value,
      fit: trend.intercept + trend.sensSlopePerYear * (t - trend.t0),
    };
  });
  return (
    <>
    <p className="chart-caption">
      {anomalies ? 'Monthly anomaly (difference from the usual value for that month)' : 'Monthly values'}, {unit}
    </p>
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" />
        <XAxis
          dataKey="t"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v: number) => String(Math.floor(v))}
          stroke="#9fb3d1"
        />
        <YAxis
          stroke="#9fb3d1"
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip
          contentStyle={{ background: '#0b1626', border: '1px solid #2a3a55' }}
          formatter={(v: number) => v.toFixed(3)}
          labelFormatter={(v: number) => v.toFixed(2)}
        />
        <Line dataKey="value" name="Monthly" stroke="#4fc3f7" dot={false} strokeWidth={1.5} />
        <Line dataKey="fit" name="Sen trend" stroke="#ffd23f" dot={false} strokeWidth={2.5} />
      </ComposedChart>
    </ResponsiveContainer>
    </>
  );
}
