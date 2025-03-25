
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopicWithOptions {
  question: string;
  options: {
    emoji: string;
    text: string;
  }[];
}

interface ConversationActionsProps {
  isLoading: boolean;
  useTopicsWithOptions: boolean;
  topicsWithOptions: TopicWithOptions[];
  topics: string[];
  handleNewTopic: () => void;
  handleEndConversation: () => void;
}

const ConversationActions: React.FC<ConversationActionsProps> = ({
  isLoading,
  handleNewTopic,
  handleEndConversation
}) => {
  const isMobile = useIsMobile();
  
  // Empty component - functionality is moved to the topic display
  return null;
};

export default ConversationActions;
