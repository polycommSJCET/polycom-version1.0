'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/utils/supabase';
import type { Meeting } from '@/types/meeting';
import { format, parseISO } from 'date-fns';

const formatMeetingDate = (timestamp: string | undefined): string => {
  if (!timestamp) return 'Date not available';
  try {
    // Handle both ISO and Unix timestamp formats
    const date = timestamp.includes('T') 
      ? parseISO(timestamp)
      : new Date(parseInt(timestamp));
    
    return format(date, 'PPpp'); // Format: Apr 29, 2023, 9:30 PM EST
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const calculateDuration = (duration: { seconds: number; hours: number; minutes: number }): string => {
  if (!duration) return 'In progress';
  
  const { hours, minutes, seconds } = duration;
  return `${hours}h ${minutes}m ${seconds.toFixed(2)}s`;
};

const HistoryPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('ended_by_user_id', user.id)
          .order('ended_at', { ascending: false });

        if (error) {
          console.error('Error fetching meetings:', error);
          return;
        }

        setMeetings(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [user]);

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!meetings.length) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Meeting History</h1>
        <p className="text-gray-600">No meetings found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Meeting History</h1>
      <div className="space-y-4">
        {meetings.map(meeting => {
          // Parse metadata and handle potential string format
          const metadata = typeof meeting.user_metadata === 'string' 
            ? JSON.parse(meeting.user_metadata) 
            : meeting.user_metadata || {};

          // Extract starts_at from metadata
          const startTime = meeting.started_at;
            
          return (
            <div key={meeting.id} className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {metadata.title || metadata.description || 'Meeting'}
                    </h2>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>
                        Started: {formatMeetingDate(startTime)}
                      </p>
                      {meeting.ended_at && (
                        <p>
                          Ended: {formatMeetingDate(meeting.ended_at)}
                        </p>
                      )}
                      <p>
                        Duration: {calculateDuration(meeting.duration)}
                      </p>
                      <p>
                        Status: {meeting.ended_at ? 'Completed' : 'In Progress'}
                      </p>
                      <p>
                        Ended by: {meeting.ended_at ? meeting.ended_by_name : 'Not ended yet'}
                      </p>
                    </div>
                    <p className="mt-2 text-gray-700">
                      {metadata.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/analytics/${meeting.meeting_id}`}>
                      <button className="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
                        View Analytics
                      </button>
                    </Link>
                    <Link href={`/minutes-templates/${meeting.meeting_id}`}>
                      <button className="rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600">
                        Generate Minutes
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPage;
