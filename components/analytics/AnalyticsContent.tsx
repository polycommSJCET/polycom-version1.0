interface ChartProps {
  data: { time: string; activeUsers: number }[];
}

const AnalyticsChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div>
      <h4>Active Users Over Time</h4>
      <ul>
        {data.map((point, index) => (
          <li key={index}>
            {point.time}: {point.activeUsers} Active Users
          </li>
        ))}
      </ul>
    </div>
  );
};
