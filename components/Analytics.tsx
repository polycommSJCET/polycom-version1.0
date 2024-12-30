// src/components/Analytics.tsx
'use client';
import { useAnalytics } from '../hooks/useAnalytics';

const Analytics = () => {
  const { meetingStartTime, meetingEndTime, users, selectedUser, selectUser } = useAnalytics();

  const duration =
    meetingStartTime && meetingEndTime
      ? ((meetingEndTime.getTime() - meetingStartTime.getTime()) / 1000).toFixed(0)
      : 'In Progress';

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Meeting Analytics</h2>
      <p>Meeting Start: {meetingStartTime?.toLocaleTimeString() || 'Not Started'}</p>
      <p>Meeting End: {meetingEndTime?.toLocaleTimeString() || 'Ongoing'}</p>
      <p>Duration: {duration} seconds</p>

      <h3 className="text-xl mt-4">Active Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => selectUser(user.id)}>
            {user.name} ({user.isActive ? 'Active' : 'Inactive'})
          </li>
        ))}
      </ul>

      {selectedUser && (
        <div className="mt-4">
          <h4 className="text-lg">Selected User Details</h4>
          <p>Name: {selectedUser.name}</p>
          <p>Joined At: {selectedUser.joinedAt.toLocaleTimeString()}</p>
          <p>Status: {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
