
import React from 'react';
import WindowFrame from '@/components/WindowFrame';
import ConversationPrompt from '@/components/ConversationPrompt';
import ConversationTopicWithOptions from '@/components/ConversationTopicWithOptions';
import Button from '@/components/Button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TopicOption {
  emoji: string;
  text: string;
}

interface TopicWithOptions {
  question: string;
  options: TopicOption[];
}

interface ConversationTopicDisplayProps {
  useTopicsWithOptions: boolean;
  getCurrentTopic: () => TopicWithOptions | string | null;
  isLoading: boolean;
  handleSelectOption: (option: TopicOption) => void;
  showAllTopics: boolean;
  setShowAllTopics: (show: boolean) => void;
  topicsWithOptions: TopicWithOptions[];
  topics: string[];
  currentTopicIndex: number;
  setCurrentTopicIndex: (index: number) => void;
}

const ConversationTopicDisplay: React.FC<ConversationTopicDisplayProps> = ({
  useTopicsWithOptions,
  getCurrentTopic,
  isLoading,
  handleSelectOption,
  showAllTopics,
  setShowAllTopics,
  topicsWithOptions,
  topics,
  currentTopicIndex,
  setCurrentTopicIndex
}) => {
  return (
    <>
      <WindowFrame 
        title="TEMA DE CONVERSACIÓN" 
        className="mb-6"
        onClose={() => setShowAllTopics(!showAllTopics)}
      >
        {useTopicsWithOptions ? (
          <ConversationTopicWithOptions 
            topic={getCurrentTopic() as TopicWithOptions} 
            isLoading={isLoading}
            onSelectOption={handleSelectOption}
          />
        ) : (
          <ConversationPrompt 
            prompt={getCurrentTopic() as string} 
            isLoading={isLoading} 
          />
        )}
      </WindowFrame>
      
      {(useTopicsWithOptions ? topicsWithOptions.length > 1 : topics.length > 1) && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowAllTopics(!showAllTopics)}
            className="w-full text-sm"
          >
            {showAllTopics ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Ocultar más temas
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Ver todos los temas ({useTopicsWithOptions ? topicsWithOptions.length : topics.length})
              </>
            )}
          </Button>
          
          {showAllTopics && (
            <WindowFrame 
              title="TODOS LOS TEMAS" 
              className="mt-2"
              onClose={() => setShowAllTopics(false)}
            >
              <div className="space-y-2">
                {useTopicsWithOptions ? (
                  topicsWithOptions.map((topic, index) => (
                    <div 
                      key={index}
                      className={`p-2 cursor-pointer text-sm rounded-sm
                        ${index === currentTopicIndex ? 
                          'bg-chelas-yellow text-black' : 
                          'bg-chelas-button-face hover:bg-chelas-gray-light/30 text-black'}
                      `}
                      onClick={() => setCurrentTopicIndex(index)}
                    >
                      {topic.question}
                    </div>
                  ))
                ) : (
                  topics.map((topic, index) => (
                    <div 
                      key={index}
                      className={`p-2 cursor-pointer text-sm rounded-sm
                        ${index === currentTopicIndex ? 
                          'bg-chelas-yellow text-black' : 
                          'bg-chelas-button-face hover:bg-chelas-gray-light/30 text-black'}
                      `}
                      onClick={() => setCurrentTopicIndex(index)}
                    >
                      {topic}
                    </div>
                  ))
                )}
              </div>
            </WindowFrame>
          )}
        </div>
      )}
    </>
  );
};

export default ConversationTopicDisplay;
