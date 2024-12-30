// src/components/AnalyticsChart.tsx
"use client"
import React from 'react';
import { Line } from 'react-chartjs-2';
import styles from '../../components/analytics/styles/analyticsChart.module.css';

const AnalyticsChart = () => {
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [120, 150, 300, 500, 800, 1000, 1200],
        fill: false,
        borderColor: '#42a5f5',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className={styles.chartCard}>
      <h3>Weekly Active Users</h3>
      <Line data={lineData} />
    </div>
  );
};

export default AnalyticsChart;
