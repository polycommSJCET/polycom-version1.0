"use client";

import React from 'react';
import MeetingStats from './MeetingStats';
import styles from '../../components/analytics/styles/dashboard.module.css';

const DashboardContent = () => {
  return (
    <div className={styles.content}>
      <h2>🏠 Dashboard</h2>
      <MeetingStats />
    </div>
  );
};

export default DashboardContent;
