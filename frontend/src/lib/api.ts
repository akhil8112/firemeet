import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

export interface Participant {
  id: number;
  name: string;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker: string;
  timestamp: number;
  text: string;
}

export interface Topic {
  id: number;
  name: string;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview: string;
  topics: Topic[];
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  description: string;
  assigned_to: string;
  is_completed: boolean;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  duration: number;
  participants: Participant[];
}

export interface MeetingDetail extends Meeting {
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
  action_items: ActionItem[];
}

export const getMeetings = async (): Promise<Meeting[]> => {
  const response = await api.get('/meetings');
  return response.data;
};

export const getMeeting = async (id: number): Promise<MeetingDetail> => {
  const response = await api.get(`/meetings/${id}`);
  return response.data;
};

export const createMeeting = async (data: { title: string, date: string, duration: number, participant_names: string[] }): Promise<Meeting> => {
  const response = await api.post('/meetings', data);
  return response.data;
};

export const updateMeeting = async (id: number, data: { title?: string, date?: string, duration?: number }): Promise<Meeting> => {
  const response = await api.put(`/meetings/${id}`, data);
  return response.data;
};

export const deleteMeeting = async (id: number): Promise<void> => {
  await api.delete(`/meetings/${id}`);
};

export const updateActionItem = async (id: number, data: { is_completed: boolean }): Promise<ActionItem> => {
  const response = await api.put(`/actions/${id}`, data);
  return response.data;
};

export const uploadTranscript = async (meetingId: number, rawText: string) => {
  const response = await api.post(`/meetings/${meetingId}/transcript/raw`, { raw_text: rawText });
  return response.data;
};

export default api;
