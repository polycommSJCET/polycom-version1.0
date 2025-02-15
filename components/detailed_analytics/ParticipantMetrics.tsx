'use client';

import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ParticipantMetricsProps {
  title: string;
  data: any[];
  color: string;
  dataKey: string;
  gradientFrom: string;
}

export function ParticipantMetrics({ 
  title, 
  data, 
  color, 
  dataKey, 
  gradientFrom 
}: ParticipantMetricsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="transform transition-all duration-300 hover:shadow-xl overflow-hidden h-full">
          <div className={`p-6 bg-gradient-to-br from-${gradientFrom}/50 to-white`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className={`p-2 bg-${gradientFrom} rounded-lg mr-3`}>
                <Users className={`h-5 w-5 text-${color}`} />
              </div>
              {title} Overview
            </h2>
            <div className="h-[350px] p-4 bg-white rounded-xl shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{fontSize: 12}}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey={dataKey} fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="transform transition-all duration-300 hover:shadow-xl h-full">
          <div className={`p-6 bg-gradient-to-br from-${gradientFrom}/50 to-white`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className={`p-2 bg-${gradientFrom} rounded-lg mr-3`}>
                <Users className={`h-5 w-5 text-${color}`} />
              </div>
              {title} Details
            </h2>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {data.map((participant, index) => (
                <div 
                  key={index} 
                  className={`p-4 bg-white rounded-xl border border-${gradientFrom} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 bg-${gradientFrom} rounded-lg`}>
                        <Users className={`h-5 w-5 text-${color}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className={`text-sm font-semibold text-${color}`}>
                        {participant[dataKey]}s
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