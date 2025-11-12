import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartDatum = {
  label: string;
  analyses: number;
  findings: number;
};

type PatientChartProps = {
  data: ChartDatum[];
  isDark?: boolean;
};

export function PatientChart({ data, isDark = false }: PatientChartProps) {
  const axisColor = isDark ? "#e2e8f0" : "#475569";
  const gridColor = isDark ? "#1f2937" : "#e2e8f0";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke={gridColor} />
        <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
        <YAxis stroke={axisColor} fontSize={12} />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: `1px solid ${gridColor}`,
            background: isDark ? "#0f172a" : "#ffffff",
          }}
        />
        <Area
          type="monotone"
          dataKey="analyses"
          stroke="#6366f1"
          fill="url(#colorAnalyses)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="findings"
          stroke="#22c55e"
          fill="url(#colorFindings)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
