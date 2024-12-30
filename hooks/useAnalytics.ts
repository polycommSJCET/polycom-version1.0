// src/hooks/useAnalytics.ts
'use client';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  joinedAt: Date;
  isActive: boolean;
}

export const useAnalytics = () => {
  const [meetingStartTime, setMeetingStartTime] = useState<Date | null>(null);
  const [meetingEndTime, setMeetingEndTime] = useState<Date | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Simulate meeting start
  const startMeeting = () => {
    setMeetingStartTime(new Date());
  };

  // Simulate meeting end
  const endMeeting = () => {
    setMeetingEndTime(new Date());
  };

  // Add user to meeting
  const addUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
  };

  // Remove user from meeting
  const removeUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  // Select user for analytics
  const selectUser = (userId: string) => {
    const user = users.find((u) => u.id === userId) || null;
    setSelectedUser(user);
  };

  return {
    meetingStartTime,
    meetingEndTime,
    users,
    selectedUser,
    startMeeting,
    endMeeting,
    addUser,
    removeUser,
    selectUser,
  };
};
