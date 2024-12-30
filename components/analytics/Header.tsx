// src/components/Header.tsx
"use client"

import React from 'react';
import styles from '../../components/analytics/styles/header.module.css';

const Header = () => (
  <header className={styles.header}>
    <div className={styles.logo}>📊 My Campaign</div>
    <div className={styles.actions}>
      <button className='btn'> Dashboard</button>
    </div>
  </header>
);

export default Header;
