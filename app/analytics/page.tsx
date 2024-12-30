'use client';

import React, { useState } from 'react';
import Sidebar from '../../components/analytics/Sidebar';
import MeetingStats from '../../components/analytics/MeetingStats';
import AnalyticsChart from '../../components/analytics/AnalyticsChart';
import styles from '../../components/analytics/styles/analyticsChart.module.css';
import Sidebar1 from '../../components/Sidebar'
import Header from '@/components/analytics/Header';


const AnalyticsPage = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
    console.log(`User with ID ${userId} clicked`);
  };

  return (
        <div className={styles.container}>
          <div className={styles.sidebar}>
        <Sidebar1  />
      </div>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <Sidebar onUserClick={handleUserClick} />
      </div>
      <div className={styles.mainContent}>
        <Header  />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <MeetingStats />
        <AnalyticsChart />
      </div>
    </div>
    </div>
    
  );
};

export default AnalyticsPage;
