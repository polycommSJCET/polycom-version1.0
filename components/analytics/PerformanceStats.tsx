"use client";

import React, { useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement,  // ✅ Register PointElement
  LineElement,   // ✅ Register LineElement
  BarElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from '../../components/analytics/styles/performenceStats.module.css';

// ✅ Register necessary components and elements
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const PerformanceStats = () => {
  const chartRef = useRef(null);

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Performance',
        data: [85, 90, 78, 92, 88, 95],
        fill: false,
        borderColor: '#4caf50',
        pointBackgroundColor: '#f9a825', // Points on the graph
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Monthly Performance Stats</h3>
      <div className={styles.chartContainer}>
        <Line data={lineData} options={options} ref={chartRef} />
      </div>
    </div>
  );
};

export default PerformanceStats;
