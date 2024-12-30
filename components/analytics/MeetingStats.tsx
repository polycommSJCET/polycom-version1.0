"use client";

import React from 'react';
import styles from '../analytics/styles/meetingStats.module.css';

const MeetingStats = () => {
  const meetingData = [
    { label: "Meeting Duration", value: "2h 45m", icon: "⏱️" }, // Stopwatch
    { label: "Camera On Time", value: "1h 20m", icon: "📷" }, // Camera
    { label: "Microphone On Time", value: "1h 35m", icon: "🎤" }, // Microphone
    { label: "Drop Off Rate", value: "50%", icon: "📉" }, // Downward Trend Graph
    { label: "Screen Sharing Time", value: "50m", icon: "🖥️" }, // Computer Screen
    { label: "Join Or Leave Time", value: "50m", icon: "🔄" }, // Refresh/Loop Icon
  ];

  return (
    <div className={styles.container}>
      {/* Meeting Stats Section */}
      <div className={styles.card}>
        <h3 className={styles.title}>📊 Meeting Stats</h3>
        <div className={styles.statsContainer}>
          {meetingData.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <span className={styles.icon}>{stat.icon}</span>
              <div>
                <p className={styles.label}>{stat.label}</p>
                <p className={styles.value}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Chart Section */}
      <div className={styles.chartWrapper}>
        <div className={styles.chartContainer}>
        </div>
      </div>
    </div>
  );
};

export default MeetingStats;
