
// Custom types for Supabase that don't require modifying the auto-generated types
import type { Database } from '@/integrations/supabase/types';

// Profile type derived from Database type
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  temas_preferidos?: string[];
  descripcion_personal?: string;
  analisis_externo?: string; // Make analisis_externo optional with ?
};

// Interest type derived from Database type
export type Interest = Database['public']['Tables']['interests']['Row'];

// UserInterest type derived from Database type
export type UserInterest = Database['public']['Tables']['user_interests']['Row'];

// Conversation type derived from Database type
export type ConversationType = Database['public']['Tables']['conversations']['Row'] & {
  match_percentage?: number;
  is_favorite: boolean;
  follow_up: boolean;
};

// ConversationTopic type derived from Database type
export type ConversationTopic = Database['public']['Tables']['conversation_topics']['Row'];

// Helper type for interest selection
export type InterestOption = {
  id: string;
  label: string;
  category: TopicCategory;
};

// Category enum for topics
export type TopicCategory = 
  | 'tech'
  | 'movies'
  | 'music'
  | 'series_anime'
  | 'books'
  | 'travel'
  | 'food'
  | 'sports'
  | 'art'
  | 'hobbies'
  | 'trends'
  | 'humor'
  | 'other'
  | 'avoid';

// Type for AI chat conversations
export type ChatMessage = {
  role: 'ai' | 'user';
  content: string;
  suggestions?: string[]; // Optional suggested interests that can be clicked
};

// Export the updated conversation interface
export type Conversation = {
  id: string;
  user_a: string;
  user_b: string;
  started_at: string;
  ended_at: string | null;
  match_percentage: number | null;
  is_favorite: boolean;
  follow_up: boolean;
};
