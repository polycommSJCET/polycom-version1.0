import React from 'react';

const events = [
  { id: 1, name: 'Event 1', description: 'This is a short description for Event 1.\nIt has multiple lines.' },
  { id: 2, name: 'Event 2', description: 'This is a short description for Event 2.\nIt has multiple lines.' },
  { id: 3, name: 'Event 3', description: 'This is a short description for Event 3.\nIt has multiple lines.' },
];

const HistoryPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event History</h1>
      <ul>
        {events.map(event => (
          <li key={event.id} className="mb-4 p-4 border rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold">{event.name}</span>
                <p className="text-sm text-gray-600 whitespace-pre-line">{event.description}</p>
              </div>
              <div className="space-x-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded">Button 1</button>
                <button className="px-4 py-2 bg-green-500 text-white rounded">Button 2</button>
                <button className="px-4 py-2 bg-red-500 text-white rounded">Button 3</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPage;
