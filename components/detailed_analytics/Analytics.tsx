'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Users, Mic, Video, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { fetchMeetingData } from './Analytics_Data';

interface MeetingData {
  duration: { hours: number; minutes: number; seconds: number };
  ended_at: string;
  ended_by_name: string;
  ended_by_role: string;
  ended_by_user_id: string;
  id: string;
  meeting_id: string;
  started_at: string;
  user_metadata: any;
}

interface ActivityData {
  username: string;
  cameraStartTime: string;
  cameraEndTime: string;
  micStartTime: string;
  micEndTime: string;
}

const Analytics = ({ meetingId }: { meetingId: string }) => {
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [speakingTimeData, setSpeakingTimeData] = useState<any[]>([]);
  const [participationStats, setParticipationStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMeetingData = async () => {
      setIsLoading(true);
      try {
        const { meetingData, processedData } = await fetchMeetingData(meetingId);
        console.log('meeting data', meetingData);
        console.log('processed data', processedData);
        setMeetingData(meetingData);
        setSpeakingTimeData(processedData.speakingTimeData);
        setParticipationStats(processedData.participationStats);
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

  const activityChartData = participationStats.map(stat => ({
    name: stat.name,
    duration: stat.value
  }));

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

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-6 bg-gradient-to-br from-blue-50 via-blue-100/20 to-transparent rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500 bg-opacity-10 rounded-full">
                    <Clock className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Duration</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {meetingData ? formatDuration(meetingData.duration) : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-6 bg-gradient-to-br from-green-50 via-green-100/20 to-transparent rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500 bg-opacity-10 rounded-full">
                    <Users className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Host</p>
                    <p className="text-2xl font-bold text-green-600">
                      {meetingData?.ended_by_name || '--'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-6 bg-gradient-to-br from-purple-50 via-purple-100/20 to-transparent rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500 bg-opacity-10 rounded-full">
                    <Calendar className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Started At</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {meetingData ? format(new Date(meetingData.started_at), 'hh:mm a') : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-6 bg-gradient-to-br from-red-50 via-red-100/20 to-transparent rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-500 bg-opacity-10 rounded-full">
                    <Calendar className="h-7 w-7 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ended At</p>
                    <p className="text-2xl font-bold text-red-600">
                      {meetingData ? format(new Date(meetingData.ended_at), 'hh:mm a') : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Overview Chart */}
            <Card className="transform transition-all duration-300 hover:shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  Speaking Time Overview
                </h2>
                <div className="h-[350px] p-4 bg-white rounded-xl shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={speakingTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="speakingTime" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Participant Activity */}
            <Card className="transform transition-all duration-300 hover:shadow-xl">
              <div className="p-6 bg-gradient-to-br from-green-50/50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  Speaking Time Details
                </h2>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {speakingTimeData.map((participant, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                          <p className="text-sm font-semibold text-blue-600">
                            {participant.speakingTime}s
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;