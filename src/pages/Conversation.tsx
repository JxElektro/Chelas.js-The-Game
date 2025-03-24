
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import { Profile, ConversationType } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Json } from '@/integrations/supabase/types';
import ConversationHeader from '@/components/conversation/ConversationHeader';
import ConversationMatch from '@/components/conversation/ConversationMatch';
import ConversationTopicDisplay from '@/components/conversation/ConversationTopicDisplay';
import ConversationActions from '@/components/conversation/ConversationActions';
import { useConversation } from '@/hooks/useConversation';
import WindowFrame from '@/components/WindowFrame';

const BOT_ID = '00000000-0000-0000-0000-000000000000';

const Conversation = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isMobile = useIsMobile();
  
  const {
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
  } = useConversation(userId);

  if (!otherUserProfile) return null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col min-h-[90vh] w-full ${isMobile ? 'px-1' : 'px-4'}`}
      >
        <WindowFrame 
          title={`Chat con ${otherUserProfile.name || 'Usuario'}`}
          onClose={handleEndConversation}
          className="w-full h-full"
        >
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 pr-2 pb-4">
              <ConversationHeader 
                otherUserProfile={otherUserProfile}
                isFavorite={isFavorite}
                isFollowUp={isFollowUp}
                toggleFavorite={toggleFavorite}
                toggleFollowUp={toggleFollowUp}
                handleEndConversation={handleEndConversation}
              />

              {matchPercentage > 0 && (
                <ConversationMatch 
                  percentage={matchPercentage} 
                  matchCount={matchCount} 
                />
              )}

              <ConversationTopicDisplay
                useTopicsWithOptions={useTopicsWithOptions}
                getCurrentTopic={getCurrentTopic}
                isLoading={isLoading}
                handleSelectOption={handleSelectOption}
                showAllTopics={showAllTopics}
                setShowAllTopics={setShowAllTopics}
                topicsWithOptions={topicsWithOptions}
                topics={topics}
                currentTopicIndex={currentTopicIndex}
                setCurrentTopicIndex={setCurrentTopicIndex}
              />
            </ScrollArea>

            <ConversationActions
              isLoading={isLoading}
              useTopicsWithOptions={useTopicsWithOptions}
              topicsWithOptions={topicsWithOptions}
              topics={topics}
              handleNextTopic={handleNextTopic}
              handleNewTopic={handleNewTopic}
              handleEndConversation={handleEndConversation}
            />
          </div>
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Conversation;
