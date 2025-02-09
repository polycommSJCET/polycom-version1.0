export interface Meeting {
  id: string;
  meeting_id: string;
  ended_by_user_id: string | null;
  ended_by_name: string | null;
  ended_by_role: string | null;
  ended_at: string | null;
  started_at?: string;
  duration: { seconds: number; hours: number; minutes: number };
  user_metadata: {
    title?: string;
    description?: string;
    starts_at?: string;
    start_time?: string;
    participants_count?: number;
    duration?: string;
    custom?: {
      description?: string;
    };
  };
}
