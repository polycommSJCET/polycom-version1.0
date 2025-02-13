import { supabase } from '@/utils/supabase';
import Papa from 'papaparse';

interface ParsedAnalyticsRow {
    username: string;
    'mic start time': string;
    'mic end time': string;
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
        const meetingFilePath = `meetings/${meetingId}/camera_analytics_data.csv`;
        const analyticsFilePath = `meetings/${meetingId}/analytics_data.csv`;

        const { error: meetingFileError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .download(meetingFilePath);

        if (meetingFileError) {
            console.error('Error fetching meeting data file:', meetingFileError);
            // If file doesn't exist, return meeting data only
            return {
                meetingData,
                processedData: {
                    speakingTimeData: [],
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

        // Process participation stats with aggregated data
        const participationStats = [
            { 
                name: 'Speaking Time', 
                value: aggregatedData.reduce((acc, curr) => acc + curr.speakingTime, 0) 
            },
            { 
                name: 'Participation Score', 
                value: aggregatedData.reduce((acc, curr) => acc + curr.participationScore, 0) 
            },
        ];

        return {
            meetingData,
            processedData: {
                speakingTimeData: aggregatedData,
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
                participationStats: []
            }
        };
    }
}
