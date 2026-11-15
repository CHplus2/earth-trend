import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Point } from '../lib/stats';
import { decimalYear } from '../lib/stats';

interface Props {
  a: Point[];
  b: Point[];
  nameA: string;
  nameB: string;
  unitA: string;
  unitB: string;
}

export default function CompareChart({ a, b, nameA, nameB, unitA, unitB }: Props) {
  const mapB = new Map(b.map((p) => [p.date, p.value]));
  const data = a.map((p) => ({ t: decimalYear(p.date), a: p.value, b: mapB.get(p.date) ?? null }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" />
        <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(v: number) => String(Math.floor(v))} stroke="#9fb3d1" />
        <YAxis yAxisId="a" stroke="#4fc3f7" domain={['auto', 'auto']} tickFormatter={(v: number) => v.toFixed(1)} />
        <YAxis yAxisId="b" orientation="right" stroke="#ff8a65" domain={['auto', 'auto']} tickFormatter={(v: number) => v.toFixed(1)} />
        <Tooltip contentStyle={{ background: '#0b1626', border: '1px solid #2a3a55' }} formatter={(v: number) => v.toFixed(3)} labelFormatter={(v: number) => v.toFixed(2)} />
        <Legend />
        <Line yAxisId="a" dataKey="a" name={`${nameA} (${unitA})`} stroke="#4fc3f7" dot={false} strokeWidth={1.5} />
        <Line yAxisId="b" dataKey="b" name={`${nameB} (${unitB})`} stroke="#ff8a65" dot={false} strokeWidth={1.5} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
