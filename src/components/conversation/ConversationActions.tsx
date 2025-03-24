
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronDown, X } from 'lucide-react';
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
  handleNextTopic: () => void;
  handleNewTopic: () => void;
  handleEndConversation: () => void;
}

const ConversationActions: React.FC<ConversationActionsProps> = ({
  isLoading,
  useTopicsWithOptions,
  topicsWithOptions,
  topics,
  handleNextTopic,
  handleNewTopic,
  handleEndConversation
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
      {(useTopicsWithOptions ? topicsWithOptions.length > 1 : topics.length > 1) && (
        <Button 
          variant="default"
          onClick={handleNextTopic}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <ChevronDown size={16} className="mr-1" />
          Siguiente Tema
        </Button>
      )}
      
      <Button 
        variant="default"
        onClick={handleNewTopic}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        <RefreshCw size={16} className="mr-1" />
        Nuevos Temas
      </Button>
      
      <Button 
        variant="destructive"
        onClick={handleEndConversation}
        className="w-full sm:w-auto"
      >
        <X size={16} className="mr-1" />
        Terminar Chat
      </Button>
    </div>
  );
};

export default ConversationActions;
