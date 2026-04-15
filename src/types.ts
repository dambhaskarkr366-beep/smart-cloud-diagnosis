export type AppScreen = 
  | 'dashboard' 
  | 'new-ticket' 
  | 'queue' 
  | 'session' 
  | 'feedback' 
  | 'dispute'
  | 'knowledge'
  | 'risk'
  | 'settings'
  | 'manual'
  | 'spare-parts'
  | 'voice-schedule';

export interface Technician {
  name: string;
  title: string;
  id: string;
  experience: string;
  specialty: string;
  avatar: string;
}

export interface LogEntry {
  time: string;
  title: string;
  description: string;
  status?: 'pending' | 'completed' | 'active';
}
