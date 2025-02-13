'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { KeyMetrics } from './KeyMetrics';
import { PresenceTimeline } from './PresenceTimeline';
import { ParticipantMetrics } from './ParticipantMetrics';
import { MeetingData } from '../../types/analytics';
import { fetchMeetingData, fetchPresenceAnalytics } from './Analytics_Data';

export default function Analytics({ meetingId }: { meetingId: string }) {
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [speakingTimeData, setSpeakingTimeData] = useState<any[]>([]);
  const [cameraTimeData, setCameraTimeData] = useState<any[]>([]);
  const [presenceData, setPresenceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMeetingData = async () => {
      setIsLoading(true);
      try {
        const [meetingResponse, presenceResponse] = await Promise.all([
          fetchMeetingData(meetingId),
          fetchPresenceAnalytics(meetingId)
        ]);

        const { meetingData, processedData } = meetingResponse;
        setMeetingData(meetingData);
        setSpeakingTimeData(processedData.speakingTimeData);
        setCameraTimeData(processedData.cameraTimeData);
        setPresenceData(presenceResponse);
      } catch (error) {
        console.error('Error loading meeting data:', error);
      }
      setIsLoading(false);
    };

    loadMeetingData();
  }, [meetingId]);

  const formatDuration = (duration: { hours: number; minutes: number; seconds: number }) => {
    const hours = Math.floor(duration.hours);
    const minutes = Math.floor(duration.minutes);
    const seconds = Math.floor(duration.seconds);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
  };

  const formatTimelineData = () => {
    if (!meetingData) return [];
    
    const startTime = new Date(meetingData.started_at).getTime();
    const endTime = new Date(meetingData.ended_at).getTime();
    
    return presenceData.map((user) => {
      const sortedEvents = [...user.events].sort((a, b) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );

      const intervals = [];
      let currentTime = startTime;

      sortedEvents.forEach((event, index) => {
        const eventTime = new Date(event.time).getTime();

        if (currentTime < eventTime) {
          intervals.push({
            start: currentTime - startTime,
            end: eventTime - startTime,
            status: 'absent'
          });
        }

        if (event.type === 'joined' && index < sortedEvents.length - 1) {
          const nextEvent = sortedEvents[index + 1];
          const nextTime = new Date(nextEvent.time).getTime();
          
          intervals.push({
            start: eventTime - startTime,
            end: nextTime - startTime,
            status: 'present'
          });
          
          currentTime = nextTime;
        }
      });

      if (currentTime < endTime) {
        intervals.push({
          start: currentTime - startTime,
          end: endTime - startTime,
          status: 'absent'
        });
      }

      return {
        name: user.name,
        intervals
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse text-lg text-gray-600">Loading analytics data...</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Meeting Analytics
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Meeting ID: {meetingId}</p>
              </div>
              <div className="bg-blue-50 px-6 py-3 rounded-xl shadow-inner">
                <p className="text-sm font-semibold text-blue-700">
                  {meetingData ? format(new Date(meetingData.started_at), 'PPP') : '--'}
                </p>
              </div>
            </div>
          </div>

          <KeyMetrics meetingData={meetingData} formatDuration={formatDuration} />
          
          <PresenceTimeline 
            timelineData={formatTimelineData()} 
            presenceData={presenceData} 
          />
          
          <ParticipantMetrics
            title="Speaking Time"
            data={speakingTimeData}
            color="indigo-600"
            dataKey="speakingTime"
            gradientFrom="indigo-50"
          />
          
          <ParticipantMetrics
            title="Camera Time"
            data={cameraTimeData}
            color="green-600"
            dataKey="cameraTime"
            gradientFrom="green-50"
          />
        </div>
      )}
    </div>
  );
}