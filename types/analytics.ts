export interface MeetingData {
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