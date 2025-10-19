export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_lat?: number;
  location_lng?: number;
  room?: string;
  capacity: number;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  cover_image_url?: string;
  club_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
