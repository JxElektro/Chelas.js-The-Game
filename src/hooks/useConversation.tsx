
import { useConversationState } from './conversation/useConversationState';
import { useConversationProfiles } from './conversation/useConversationProfiles';
import { useConversationMatching } from './conversation/useConversationMatching';
import { useConversationTopics } from './conversation/useConversationTopics';
import { useConversationActions } from './conversation/useConversationActions';
import { useConversationPreferences } from './conversation/useConversationPreferences';
import { useConversationUtils } from './conversation/useConversationUtils';

export const useConversation = (userId: string | undefined) => {
  // Get all the state variables from the state hook
  const {
    isLoading,
    setIsLoading,
    topics,
    setTopics,
    topicsWithOptions,
    setTopicsWithOptions,
    currentTopicIndex,
    setCurrentTopicIndex,
    otherUserProfile,
    setOtherUserProfile,
    currentUserProfile,
    setCurrentUserProfile,
    matchPercentage,
    setMatchPercentage,
    matchCount,
    setMatchCount,
    allInterests,
    setAllInterests,
    showAllTopics,
    setShowAllTopics,
    useTopicsWithOptions,
    isFavorite,
    setIsFavorite,
    isFollowUp,
    setIsFollowUp,
    conversationIdRef
  } = useConversationState();

  // Use the profiles hook to handle user profiles
  const { BOT_ID } = useConversationProfiles(
    userId, 
    setCurrentUserProfile, 
    setOtherUserProfile, 
    setAllInterests
  );

  // Use the matching hook to calculate match percentage
  useConversationMatching(
    currentUserProfile,
    otherUserProfile,
    allInterests,
    setMatchPercentage,
    setMatchCount,
    userId,
    conversationIdRef,
    setIsFavorite,
    setIsFollowUp
  );

  // Use the topics hook to generate conversation topics
  useConversationTopics(
    otherUserProfile,
    currentUserProfile,
    matchPercentage,
    setIsLoading,
    useTopicsWithOptions,
    setTopicsWithOptions,
    setTopics,
    setCurrentTopicIndex,
    conversationIdRef
  );

  // Use the actions hook to handle user actions
  const {
    handleNewTopic,
    handleNextTopic,
    handleEndConversation,
    handleSelectOption
  } = useConversationActions(
    useTopicsWithOptions,
    topicsWithOptions,
    topics,
    setTopicsWithOptions,
    setTopics,
    currentTopicIndex,
    setCurrentTopicIndex,
    setIsLoading,
    conversationIdRef,
    isFavorite,
    isFollowUp
  );

  // Use the preferences hook to handle favorites and follow-ups
  const {
    toggleFavorite,
    toggleFollowUp
  } = useConversationPreferences(
    isFavorite,
    setIsFavorite,
    isFollowUp,
    setIsFollowUp,
    conversationIdRef
  );

  // Use the utils hook for helper functions
  const {
    getCurrentTopic,
    getUserSummary
  } = useConversationUtils(
    useTopicsWithOptions,
    topicsWithOptions,
    topics,
    currentTopicIndex,
    otherUserProfile
  );

  // Return everything the original hook provided
  return {
    isLoading,
    topics,
    topicsWithOptions,
    currentTopicIndex,
    setCurrentTopicIndex,
    otherUserProfile,
    currentUserProfile,
    matchPercentage,
    matchCount,
    showAllTopics,
    setShowAllTopics,
    useTopicsWithOptions,
    isFavorite,
    setIsFavorite,
    isFollowUp,
    setIsFollowUp,
    conversationIdRef,
    handleEndConversation,
    handleNewTopic,
    handleNextTopic,
    handleSelectOption,
    toggleFavorite,
    toggleFollowUp,
    getCurrentTopic,
    getUserSummary
  };
};
