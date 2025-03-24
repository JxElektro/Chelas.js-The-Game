
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X } from 'lucide-react';
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
  
  return (
    <div className="flex justify-between items-center mt-4 px-2">
      <Button 
        variant="outline"
        onClick={handleNewTopic}
        disabled={isLoading}
        className="w-auto"
        title="Generar Nuevos Temas"
      >
        <Bot size={24} />
      </Button>
      
      <Button 
        variant="destructive"
        onClick={handleEndConversation}
        className="w-auto"
      >
        <X size={18} className="mr-2" />
        Terminar Chat
      </Button>
    </div>
  );
};

export default ConversationActions;
