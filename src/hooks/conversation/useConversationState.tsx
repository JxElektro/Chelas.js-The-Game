
import { useState, useRef } from 'react';
import { Profile } from '@/types/supabase';
import { TopicWithOptions } from '@/types/conversation';

export const useConversationState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicsWithOptions, setTopicsWithOptions] = useState<TopicWithOptions[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [allInterests, setAllInterests] = useState<any[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [useTopicsWithOptions, setUseTopicsWithOptions] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  
  return {
    // State
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
    setUseTopicsWithOptions,
    isFavorite,
    setIsFavorite,
    isFollowUp,
    setIsFollowUp,
    conversationIdRef
  };
};
