'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/utils/supabase';
import type { Meeting } from '@/types/meeting';
import { format, parseISO } from 'date-fns';
import { downloadMeetingDocument } from '@/components/minutes/download-doc';


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
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});
  const [availableDownloads, setAvailableDownloads] = useState<Record<string, {pdf: boolean, doc: boolean}>>({});
  const { user } = useUser();
  
  // Add state to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const checkAvailableDownloads = async (meetingId: string) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('Polycomm')
        .list(`meetings/${meetingId}/documents`);
      
      if (error) {
        console.error('Error checking available downloads:', error);
        return;
      }
      
      const hasPdf = data.some(file => file.name === `${meetingId}_minutes.pdf`);
      const hasDoc = data.some(file => file.name === `${meetingId}_minutes.docx`);
      
      setAvailableDownloads(prev => ({
        ...prev,
        [meetingId]: { pdf: hasPdf, doc: hasDoc }
      }));
      
    } catch (error) {
      console.error('Error checking files:', error);
    }
  };

  // Call this when toggling the dropdown
  const handleToggleDropdown = (id: string, meetingId: string) => {
    if (openDropdownId !== id) {
      checkAvailableDownloads(meetingId);
    }
    toggleDropdown(id);
  };
  // Function to toggle dropdown visibility
  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };
  
  // Function to handle document download
  const handleDownload = async (meetingId: string, format: 'pdf' | 'doc') => {
    console.log("downloading")
    // Close the dropdown
    setOpenDropdownId(null);
    
    try {
      // Show loading state for this specific download
      setDownloadingFiles(prev => ({ ...prev, [`${meetingId}-${format}`]: true }));
      console.log(`Initiating download for ${format.toUpperCase()} document...`);
      
      // Get the download URL
      const downloadUrl = await downloadMeetingDocument(meetingId, format);
      
      // Open the download in a new window
      window.open(downloadUrl, '_blank');
      
    } catch (error) {
      console.error(`Error downloading ${format} document:`, error);
      // Show error to user
      alert(`Failed to download ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clear loading state
      setDownloadingFiles(prev => ({ ...prev, [`${meetingId}-${format}`]: false }));
    }
  };

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
                    {/* <p className="mt-2 text-gray-700">
                      {metadata.description || 'No description provided'}
                    </p> */}
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
                    <div className="relative">
                      <button 
                        onClick={() => handleToggleDropdown(meeting.id.toString(), meeting.meeting_id)}
                        className="rounded bg-purple-500 px-4 py-2 text-white transition hover:bg-purple-600"
                      >
                        Download
                      </button>
                      {openDropdownId === meeting.id.toString() && (
                        <div className="absolute right-0 z-10 mt-2 w-36 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                          {/* Show loading message if we're still checking */}
                          {!availableDownloads[meeting.meeting_id] && (
                            <div className="px-4 py-2 text-sm text-gray-500">Checking files...</div>
                          )}
                          
                          {/* Show message if no downloads available */}
                          {availableDownloads[meeting.meeting_id] && 
                          !availableDownloads[meeting.meeting_id].doc && 
                          !availableDownloads[meeting.meeting_id].pdf && (
                            <div className="px-4 py-2 text-sm text-gray-500">No files available</div>
                          )}
                          
                          {/* Doc download button */}
                          {availableDownloads[meeting.meeting_id]?.doc && (
                            <button
                              onClick={() => handleDownload(meeting.meeting_id, 'doc')}
                              disabled={downloadingFiles[`${meeting.meeting_id}-doc`]}
                              className={`block w-full px-4 py-2 text-left text-sm ${
                                downloadingFiles[`${meeting.meeting_id}-doc`] 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              } disabled:opacity-70 transition-colors`}
                            >
                              {downloadingFiles[`${meeting.meeting_id}-doc`] ? 'Preparing...' : 'Download DOC'}
                            </button>
                          )}
                          
                          {/* PDF download button */}
                          {availableDownloads[meeting.meeting_id]?.pdf && (
                            <button
                              onClick={() => handleDownload(meeting.meeting_id, 'pdf')}
                              disabled={downloadingFiles[`${meeting.meeting_id}-pdf`]}
                              className={`block w-full px-4 py-2 text-left text-sm ${
                                downloadingFiles[`${meeting.meeting_id}-pdf`] 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              } disabled:opacity-70 transition-colors`}
                            >
                              {downloadingFiles[`${meeting.meeting_id}-pdf`] ? 'Preparing...' : 'Download PDF'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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
