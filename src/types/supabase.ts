
// Custom types for Supabase that don't require modifying the auto-generated types
import type { Database } from '@/integrations/supabase/types';

// Profile type derived from Database type
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Interest type derived from Database type
export type Interest = Database['public']['Tables']['interests']['Row'];

// UserInterest type derived from Database type
export type UserInterest = Database['public']['Tables']['user_interests']['Row'];

// Conversation type derived from Database type
export type Conversation = Database['public']['Tables']['conversations']['Row'];

// ConversationTopic type derived from Database type
export type ConversationTopic = Database['public']['Tables']['conversation_topics']['Row'];

// Helper type for interest selection
export type InterestOption = {
  id: string;
  label: string;
  category?: string;
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
