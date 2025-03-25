
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
  
  const { fetchConversationTopics } = useConversationTopics(conversationState);
  const { fetchProfiles } = useConversationProfiles(conversationState);
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
        fetchProfiles(userId);
      }
    } else {
      navigate('/');
    }
  }, [userId]);
  
  useEffect(() => {
    if (otherUserProfile && !isLoading) {
      fetchConversationTopics();
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
        onToggleFavorite={toggleFavorite}
        onToggleFollowUp={toggleFollowUp}
      />
      
      <div className="flex-grow overflow-auto p-4 win95-window">
        <div className="mb-4">
          <ConversationMatch 
            percentage={matchPercentage} 
            otherUserName={otherUserProfile.name} 
          />
        </div>
        
        {useTopicsWithOptions ? (
          <ConversationTopicWithOptions 
            topics={topicsWithOptions} 
            currentIndex={currentTopicIndex}
            onNextTopic={() => conversationState.setCurrentTopicIndex(currentTopicIndex + 1)}
            showAllTopics={showAllTopics}
            onToggleShowAll={() => conversationState.setShowAllTopics(!showAllTopics)}
          />
        ) : (
          <ConversationTopicDisplay 
            topics={topics} 
            currentIndex={currentTopicIndex}
            onNextTopic={() => conversationState.setCurrentTopicIndex(currentTopicIndex + 1)}
            showAllTopics={showAllTopics}
            onToggleShowAll={() => conversationState.setShowAllTopics(!showAllTopics)}
          />
        )}
        
        {conversationIdRef.current && (
          <ConversationNotes conversationId={conversationIdRef.current} />
        )}
      </div>
      
      <div className="flex-shrink-0 mt-auto p-4 bg-chelas-button-face border-t-2 border-chelas-button-highlight">
        <ConversationActions
          useTopicsWithOptions={useTopicsWithOptions}
          onToggleTopicsFormat={() => conversationState.setUseTopicsWithOptions(!useTopicsWithOptions)}
        />
        
        <div className="mt-3">
          <ConversationPrompt
            otherUserName={otherUserProfile.name}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default Conversation;
