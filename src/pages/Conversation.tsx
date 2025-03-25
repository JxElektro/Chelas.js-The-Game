
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversationState } from '@/hooks/conversation/useConversationState';
import { useConversationTopics } from '@/hooks/conversation/useConversationTopics';
import { useConversationProfiles } from '@/hooks/conversation/useConversationProfiles';
import { useConversationPreferences } from '@/hooks/conversation/useConversationPreferences';
import ConversationHeader from '@/components/conversation/ConversationHeader';
import ConversationTopicDisplay from '@/components/conversation/ConversationTopicDisplay';
import ConversationActions from '@/components/conversation/ConversationActions';
import ConversationMatch from '@/components/conversation/ConversationMatch';
import ConversationPrompt from '@/components/ConversationPrompt';
import ConversationTopicWithOptions from '@/components/ConversationTopicWithOptions';
import ConversationNotes from '@/components/ConversationNotes';
import { useIsMobile } from '@/hooks/use-mobile';

const Conversation = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const conversationState = useConversationState();
  const { 
    isLoading, topics, topicsWithOptions, currentTopicIndex, 
    otherUserProfile, matchPercentage, showAllTopics, useTopicsWithOptions,
    isFavorite, isFollowUp, conversationIdRef
  } = conversationState;
  
  const topicsHook = useConversationTopics(conversationState);
  const profilesHook = useConversationProfiles(conversationState);
  const { toggleFavorite, toggleFollowUp } = useConversationPreferences(
    isFavorite,
    conversationState.setIsFavorite,
    isFollowUp,
    conversationState.setIsFollowUp,
    conversationIdRef
  );
  
  useEffect(() => {
    if (userId) {
      // Only fetch profiles if not already loading
      if (!isLoading) {
        conversationState.setIsLoading(true);
        profilesHook.fetchProfiles(userId);
      }
    } else {
      navigate('/');
    }
  }, [userId]);
  
  useEffect(() => {
    if (otherUserProfile && !isLoading) {
      topicsHook.fetchConversationTopics();
    }
  }, [otherUserProfile, isLoading]);
  
  if (isLoading || !otherUserProfile) {
    return <div className="p-4">Cargando conversación...</div>;
  }
  
  return (
    <div className="h-full flex flex-col min-h-0">
      <ConversationHeader 
        otherUserProfile={otherUserProfile} 
        isFavorite={isFavorite}
        isFollowUp={isFollowUp}
        toggleFavorite={toggleFavorite}
        toggleFollowUp={toggleFollowUp}
      />
      
      <div className="flex-grow overflow-auto p-4 win95-window">
        <div className="mb-4">
          <ConversationMatch 
            matchPercentage={matchPercentage} 
            name={otherUserProfile.name}
          />
        </div>
        
        {useTopicsWithOptions ? (
          <ConversationTopicWithOptions 
            topic={topicsWithOptions[currentTopicIndex]}
            onNext={() => conversationState.setCurrentTopicIndex(currentTopicIndex + 1)}
            showAllTopics={showAllTopics}
            toggleShowAll={() => conversationState.setShowAllTopics(!showAllTopics)}
            allTopics={topicsWithOptions}
          />
        ) : (
          <ConversationTopicDisplay 
            topic={topics[currentTopicIndex]}
            onNext={() => conversationState.setCurrentTopicIndex(currentTopicIndex + 1)}
            showAllTopics={showAllTopics}
            toggleShowAll={() => conversationState.setShowAllTopics(!showAllTopics)}
            allTopics={topics}
          />
        )}
        
        {conversationIdRef.current && (
          <ConversationNotes conversationId={conversationIdRef.current} />
        )}
      </div>
      
      <div className="flex-shrink-0 mt-auto p-4 bg-chelas-button-face border-t-2 border-chelas-button-highlight">
        <ConversationActions
          useTopicsWithOptions={useTopicsWithOptions}
          toggleTopicsFormat={() => conversationState.setUseTopicsWithOptions(!useTopicsWithOptions)}
        />
        
        <div className="mt-3">
          <ConversationPrompt
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default Conversation;
