'use client';

import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PresenceTimelineProps {
  timelineData: any[];
  presenceData: any[];
}

export function PresenceTimeline({ timelineData, presenceData }: PresenceTimelineProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="transform transition-all duration-300 hover:shadow-xl overflow-hidden h-full">
          <div className="p-6 bg-gradient-to-br from-yellow-50/50 to-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              Presence Timeline
            </h2>
            <div className="h-[400px] rounded-xl bg-white p-4 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData}
                  layout="vertical"
                  barGap={0}
                  barCategoryGap={8}  // Changed from 20 to 8 to make bars wider
                  barSize={30}        // Added barSize property to explicitly set the bar width
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 'dataMax']}
                    tickFormatter={(value) => `${Math.floor(value / 60000)}m`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                  />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (payload && payload[0] && payload[0].payload) {
                        const interval = payload[0].payload;
                        const startMinutes = Math.floor(interval.start / 60000);
                        const endMinutes = Math.floor(interval.end / 60000);
                        const duration = endMinutes - startMinutes;

                        return (
                          <div className="bg-white p-2 shadow-lg rounded-lg border">
                            <p className="font-medium">{label}</p>
                            <p>Status: {interval.status}</p>
                            <p>Start: {startMinutes}m</p>
                            <p>End: {endMinutes}m</p>
                            <p>Duration: {duration}m</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {timelineData.map((user, userIndex) => (
                    user.intervals.map((interval: any, intervalIndex: number) => (
                      <Bar
                        key={`${userIndex}-${intervalIndex}`}
                        dataKey={(data) => {
                          if (data.name === user.name) {
                            return interval.end - interval.start;
                          }
                          return 0;
                        }}
                        stackId={user.name}
                        fill={interval.status === 'present' ? '#22c55e' : '#ef4444'}
                        radius={[4, 4, 4, 4]}
                      />
                    ))
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="transform transition-all duration-300 hover:shadow-xl h-full">
          <div className="p-6 bg-gradient-to-br from-yellow-50/50 to-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              Presence Time Details
            </h2>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {presenceData.map((participant, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className="text-sm font-semibold text-yellow-600">
                        {Math.floor(participant.presenceTime / 60)}m {participant.presenceTime % 60}s
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
  );
}