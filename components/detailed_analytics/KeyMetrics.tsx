'use client';

import { Card } from '@/components/ui/card';
import { Clock, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MeetingData } from '../../types/analytics';

interface KeyMetricsProps {
  meetingData: MeetingData | null;
  formatDuration: (duration: { hours: number; minutes: number; seconds: number }) => string;
}

export function KeyMetrics({ meetingData, formatDuration }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all duration-300 hover:scale-105 hover:shadow-xl">
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
  );
}