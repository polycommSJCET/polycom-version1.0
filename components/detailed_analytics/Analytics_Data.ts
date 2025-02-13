import { supabase } from '@/utils/supabase';
import Papa from 'papaparse';

const PYTHON_SERVER_URL = 'https://127.0.0.1:443';

interface ParsedAnalyticsRow {
    username: string;
    'mic start time': string;
    'mic end time': string;
}

interface ParsedCameraRow {
    username: string;
    'camera start time': string;
    'camera end time': string;
}

interface ParsedPresenceRow {
    'event time': string;
    'event type': 'joined' | 'left';
    'user name': string;
}

const BUCKET_NAME = 'Polycomm';  // Updated bucket name to lowercase

export async function fetchMeetingData(meetingId: string) {
    try {
        // Fetch meeting data from database
        const { data: meetingData, error: meetingError } = await supabase
            .from('meetings')
            .select('*')
            .eq('meeting_id', meetingId)
            .single();

        if (meetingError) {
            throw new Error(`Error fetching meeting data: ${meetingError.message}`);
        }

        console.log('Meeting Database Data:', meetingData);

        // Check if files exist first
        const { data: files, error: listError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .list(`meetings/${meetingId}`);

        if (listError) {
            console.error('Error listing files:', listError);
            throw new Error(`Error listing files: ${listError.message}`);
        }

        console.log('Available files:', files);

        // Fetch files using Supabase storage
        const cameraAnalyticsFilePath = `meetings/${meetingId}/camera_analytics_data.csv`;
        const analyticsFilePath = `meetings/${meetingId}/analytics_data.csv`;

        const { data: cameraDataCsv, error: cameraFileError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .download(cameraAnalyticsFilePath);

        if (cameraFileError) {
            console.error('Error fetching camera analytics data file:', cameraFileError);
            // If file doesn't exist, return meeting data only
            return {
                meetingData,
                processedData: {
                    speakingTimeData: [],
                    cameraTimeData: [],
                    participationStats: []
                }
            };
        }

        const { data: analyticsDataCsv, error: analyticsFileError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .download(analyticsFilePath);

        if (analyticsFileError) {
            console.error('Error fetching analytics file:', analyticsFileError);
            // If analytics file doesn't exist, return meeting data only
            return {
                meetingData,
                processedData: {
                    speakingTimeData: [],
                    cameraTimeData: [],
                    participationStats: []
                }
            };
        }

        // Convert Blob to text
        const analyticsDataText = await analyticsDataCsv.text();

        // Parse CSV data with strict configuration

        const parsedAnalyticsData = Papa.parse(analyticsDataText, { 
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase(),
        }).data as ParsedAnalyticsRow[];

        console.log('Raw parsed analytics data:', parsedAnalyticsData);

        // Process speaking time data with validation
        const speakingTimeData = parsedAnalyticsData
            .filter(row => row !== null && typeof row === 'object')
            .map((row: ParsedAnalyticsRow) => {
                const name = row.username;
                const startTime = new Date(row['mic start time']).getTime();
                const endTime = new Date(row['mic end time']).getTime();
                const speakingTime = isNaN(startTime) || isNaN(endTime) ? 0 : 
                    Math.floor((endTime - startTime) / 1000); // Convert to seconds

                console.log('Processing row:', {
                    rawRow: row,
                    processedName: name,
                    processedTime: speakingTime,
                    startTime: row['mic start time'],
                    endTime: row['mic end time']
                });

                return {
                    name: name || 'Unknown',
                    speakingTime,
                    participationScore: speakingTime > 0 ? 1 : 0 // Simple scoring based on speaking time
                };
            })
            .filter(data => data.name !== 'Unknown' || data.speakingTime !== 0);

        // Group by user and sum up their speaking times
        const aggregatedData = speakingTimeData.reduce((acc, curr) => {
            const existing = acc.find(item => item.name === curr.name);
            if (existing) {
                existing.speakingTime += curr.speakingTime;
                existing.participationScore += curr.participationScore;
            } else {
                acc.push({ ...curr });
            }
            return acc;
        }, [] as typeof speakingTimeData);

        // Convert Blob to text and parse camera data
        const cameraDataText = await cameraDataCsv.text();
        const parsedCameraData = Papa.parse(cameraDataText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase(),
        }).data as ParsedCameraRow[];

        console.log('Raw parsed camera data:', parsedCameraData);

        // Process camera time data
        const cameraTimeData = parsedCameraData
            .filter(row => row !== null && typeof row === 'object')
            .map((row: ParsedCameraRow) => {
                const name = row.username;
                const startTime = new Date(row['camera start time']).getTime();
                const endTime = new Date(row['camera end time']).getTime();
                const cameraTime = isNaN(startTime) || isNaN(endTime) ? 0 : 
                    Math.floor((endTime - startTime) / 1000); // Convert to seconds

                console.log('Processing camera row:', {
                    rawRow: row,
                    processedName: name,
                    processedTime: cameraTime,
                    startTime: row['camera start time'],
                    endTime: row['camera end time']
                });

                return {
                    name: name || 'Unknown',
                    cameraTime,
                    participationScore: cameraTime > 0 ? 1 : 0
                };
            })
            .filter(data => data.name !== 'Unknown' || data.cameraTime !== 0);

        // Aggregate camera data
        const aggregatedCameraData = cameraTimeData.reduce((acc, curr) => {
            const existing = acc.find(item => item.name === curr.name);
            if (existing) {
                existing.cameraTime += curr.cameraTime;
                existing.participationScore += curr.participationScore;
            } else {
                acc.push({ ...curr });
            }
            return acc;
        }, [] as typeof cameraTimeData);

        // Process participation stats with aggregated data
        const participationStats = [
            { 
                name: 'Speaking Time', 
                value: aggregatedData.reduce((acc, curr) => acc + curr.speakingTime, 0) 
            },
            {
                name: 'Camera Time',
                value: aggregatedCameraData.reduce((acc, curr) => acc + curr.cameraTime, 0)
            },
            { 
                name: 'Total Participation Score', 
                value: aggregatedData.reduce((acc, curr) => acc + curr.participationScore, 0) +
                       aggregatedCameraData.reduce((acc, curr) => acc + curr.participationScore, 0)
            },
        ];

        return {
            meetingData,
            processedData: {
                speakingTimeData: aggregatedData,
                cameraTimeData: aggregatedCameraData,
                participationStats
            }
        };
    } catch (error) {
        console.error('Error in fetchMeetingData:', error);
        // Return empty data structure instead of throwing
        return {
            meetingData: null,
            processedData: {
                speakingTimeData: [],
                cameraTimeData: [],
                participationStats: []
            }
        };
    }
}

export async function fetchPresenceAnalytics(meetingId: string) {
    try {
        const presenceAnalyticsFilePath = `meetings/${meetingId}/presence_analytics_data.csv`;

        // Fetch presence analytics file from Supabase storage
        const { data: presenceDataCsv, error: presenceFileError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .download(presenceAnalyticsFilePath);

        if (presenceFileError) {
            console.error('Error fetching presence analytics file:', presenceFileError);
            return [];
        }

        // Convert Blob to text
        const presenceDataText = await presenceDataCsv.text();

        // Parse CSV data
        const parsedPresenceData = Papa.parse(presenceDataText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase(),
        }).data as ParsedPresenceRow[];

        console.log('Raw parsed presence data:', parsedPresenceData);

        // Group events by user
        const userEvents = parsedPresenceData.reduce((acc, row) => {
            const userName = row['user name'];
            if (!acc[userName]) {
                acc[userName] = [];
            }
            acc[userName].push({
                time: new Date(row['event time']).getTime(),
                type: row['event type']
            });
            return acc;
        }, {} as { [key: string]: { time: number, type: string }[] });

        // Process events for each user
        const presenceTimeData = Object.entries(userEvents).map(([userName, events]) => {
            // Sort events by time
            events.sort((a, b) => a.time - b.time);
            
            let totalPresenceTime = 0;
            let lastJoinTime: number | null = null;

            events.forEach((event, index) => {
                if (event.type === 'joined') {
                    lastJoinTime = event.time;
                } else if (event.type === 'left' && lastJoinTime !== null) {
                    totalPresenceTime += Math.floor((event.time - lastJoinTime) / 1000);
                    lastJoinTime = null;
                }
            });

            return {
                name: userName,
                presenceTime: totalPresenceTime,
                events: events.map(e => ({
                    time: new Date(e.time).toISOString(),
                    type: e.type
                }))
            };
        });

        return presenceTimeData;

    } catch (error) {
        console.error('Error in fetchPresenceAnalytics:', error);
        return [];
    }
}

interface PresenceData {
  userName: string;
  callId: string;
  eventType: 'joined' | 'left';
  eventTime: string;
}

export const logPresenceToServer = async (data: PresenceData) => {
  try {
    const response = await fetch(`${PYTHON_SERVER_URL}/log-presence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to log presence data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging presence data:', error);
  }
};