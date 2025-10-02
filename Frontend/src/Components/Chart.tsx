import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimpleLineChartProps {
  numbers: number[];
}

function SimpleLineChart({ numbers }: SimpleLineChartProps) {
  const data = numbers.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" tick={false} axisLine={false} />
          <YAxis tick={true} axisLine={true} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" dot={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export default SimpleLineChart;
