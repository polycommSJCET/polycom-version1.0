import React from 'react';
import Link from 'next/link';

const meetings = [
  { 
    id: 1, 
    title: 'Weekly Team Sync',
    date: '2024-01-15',
    time: '10:00 AM',
    participants: 8,
    duration: '45 mins',
    description: 'Weekly team sync meeting discussing project progress and blockers.' 
  },
  { 
    id: 2, 
    title: 'Product Review',
    date: '2024-01-14',
    time: '2:00 PM',
    participants: 12,
    duration: '60 mins',
    description: 'Monthly product review meeting with stakeholders.' 
  },
  // ...existing code...
];

const HistoryPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Meeting History</h1>
      <div className="space-y-4">
        {meetings.map(meeting => (
          <div key={meeting.id} className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{meeting.title}</h2>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>{meeting.date} at {meeting.time}</p>
                    <p>{meeting.participants} participants • {meeting.duration}</p>
                  </div>
                  <p className="mt-2 text-gray-700">{meeting.description}</p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/analytics/${meeting.id}`}>
                    <button className="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
                      View Analytics
                    </button>
                  </Link>
                  <Link href={`/minutes-templates/${meeting.id}`}>
                    <button className="rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600">
                      Generate Minutes
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
