
import { createInterestSummary } from '@/utils/interestSummaryUtils';
import { Profile } from '@/types/supabase';
import { TopicWithOptions } from '@/types/conversation';
import { BOT_ID } from './useConversationProfiles';

export const useConversationUtils = (
  useTopicsWithOptions: boolean,
  topicsWithOptions: TopicWithOptions[],
  topics: string[],
  currentTopicIndex: number,
  otherUserProfile: Profile | null
) => {
  /**
   * Returns the current conversation topic based on the current index
   * This function returns either a TopicWithOptions object or a string
   */
  const getCurrentTopic = () => {
    if (useTopicsWithOptions) {
      if (topicsWithOptions.length === 0) return null;
      return topicsWithOptions[currentTopicIndex];
    } else {
      if (topics.length === 0) return "";
      return topics[currentTopicIndex];
    }
  };

  const getUserSummary = () => {
    if (!otherUserProfile) return "Cargando usuario...";
    
    if (otherUserProfile.id === BOT_ID) {
      return "Un asistente de chat para practicar tus habilidades sociales.";
    }
    
    return createInterestSummary(otherUserProfile.super_profile);
  };

  return {
    getCurrentTopic,
    getUserSummary
  };
};
