"use client";

import React from 'react';
import styles from '../analytics/styles/sidebar.module.css';

interface User {
  id: number;
  name: string;
  status: string; // e.g., Active, Muted, Speaking, etc.
}

const users: User[] = [
  { id: 1, name: 'Alice', status: 'Active' },
  { id: 2, name: 'Bob', status: 'Muted' },
  { id: 3, name: 'Charlie', status: 'Speaking' },
  { id: 4, name: 'David', status: 'Active' },
  { id: 5, name: 'Eve', status: 'Muted' },
];

const Sidebar = ({ onUserClick }: { onUserClick: (userId: number) => void }) => {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>👥 Participants</h3>
      <ul className={styles.userList}>
        {users.map((user) => (
          <li
            key={user.id}
            className={styles.userItem}
            onClick={() => onUserClick(user.id)}
          >
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userStatus}>{user.status}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
