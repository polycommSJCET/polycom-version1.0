'use client';

import Analytics from '@/components/detailed_analytics/Analytics';

export default function AnalyticsPage({ params }: { params: { meetingId: string } }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Analytics meetingId={params.meetingId} />
        </div>
    );
}
