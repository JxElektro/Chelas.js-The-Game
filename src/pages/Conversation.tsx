
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/hooks/useConversation';
import ConversationHeader from '@/components/conversation/ConversationHeader';
import ConversationTopicDisplay from '@/components/conversation/ConversationTopicDisplay';
import ConversationActions from '@/components/conversation/ConversationActions';
import ConversationTopicWithOptions from '@/components/ConversationTopicWithOptions';
import ConversationNotes from '@/components/ConversationNotes';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopicWithOptions } from '@/types/conversation';

const Conversation = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Use the combined hook instead of separate hooks
  const conversation = useConversation(userId);
  
  if (conversation.isLoading || !conversation.otherUserProfile) {
    return <div className="p-4">Cargando conversación...</div>;
  }
  
  return (
    <div className="h-full flex flex-col min-h-0">
      <ConversationHeader 
        otherUserProfile={conversation.otherUserProfile} 
        isFavorite={conversation.isFavorite}
        isFollowUp={conversation.isFollowUp}
        toggleFavorite={conversation.toggleFavorite}
        toggleFollowUp={conversation.toggleFollowUp}
        handleEndConversation={conversation.handleEndConversation}
      />
      
      <div className="flex-grow overflow-auto p-4 win95-window">
        <ConversationTopicDisplay
          useTopicsWithOptions={conversation.useTopicsWithOptions}
          getCurrentTopic={conversation.getCurrentTopic}
          isLoading={conversation.isLoading}
          handleSelectOption={conversation.handleSelectOption}
          showAllTopics={conversation.showAllTopics}
          setShowAllTopics={conversation.setShowAllTopics}
          topicsWithOptions={conversation.topicsWithOptions}
          topics={conversation.topics}
          currentTopicIndex={conversation.currentTopicIndex}
          setCurrentTopicIndex={conversation.setCurrentTopicIndex}
          handleNewTopic={conversation.handleNewTopic}
        />
        
        {conversation.conversationIdRef.current && (
          <ConversationNotes conversationId={conversation.conversationIdRef.current} />
        )}
      </div>
      
      <div className="flex-shrink-0 mt-auto p-4 bg-chelas-button-face border-t-2 border-chelas-button-highlight">
        <ConversationActions
          isLoading={conversation.isLoading}
          useTopicsWithOptions={conversation.useTopicsWithOptions}
          topicsWithOptions={conversation.topicsWithOptions}
          topics={conversation.topics}
          handleNewTopic={conversation.handleNewTopic}
          handleEndConversation={conversation.handleEndConversation}
        />
      </div>
    </div>
  );
};

export default Conversation;
