
import React from 'react';
import WindowFrame from '@/components/WindowFrame';
import ConversationPrompt from '@/components/ConversationPrompt';
import ConversationTopicWithOptions from '@/components/ConversationTopicWithOptions';
import Button from '@/components/Button';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

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
  handleNewTopic: () => void;
}

const ConversationTopicDisplay: React.FC<ConversationTopicDisplayProps> = ({
  useTopicsWithOptions,
  getCurrentTopic,
  isLoading,
  handleSelectOption,
  topicsWithOptions,
  topics,
  currentTopicIndex,
  setCurrentTopicIndex,
  handleNewTopic
}) => {
  const totalTopics = useTopicsWithOptions ? topicsWithOptions.length : topics.length;
  const showGenerateButton = currentTopicIndex === totalTopics - 1 && totalTopics > 0;
  
  const handlePrevTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1);
    }
  };
  
  const handleNextTopic = () => {
    if (currentTopicIndex < totalTopics - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1);
    }
  };
  
  return (
    <div className="relative w-full">
      <WindowFrame 
        title="TEMA DE CONVERSACIÓN" 
        className="w-full mb-4"
      >
        <div className="relative p-2">
          <div className="mb-4">
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
          </div>
          
          {/* Navegación entre temas y botón de generar nuevos temas */}
          {totalTopics > 1 && (
            <div className="flex justify-between items-center mt-2">
              <Button
                onClick={handlePrevTopic}
                disabled={currentTopicIndex === 0}
                className="px-2 flex items-center"
                variant={currentTopicIndex === 0 ? "ghost" : "default"}
              >
                <ChevronLeft size={18} className="mr-1" />
                Anterior
              </Button>
              
              <div className="text-xs text-center">
                {!isLoading && totalTopics > 0 && (
                  <span className="bg-chelas-gray-light px-2 py-0.5 rounded-sm">
                    {currentTopicIndex + 1} de {totalTopics}
                  </span>
                )}
              </div>
              
              {/* Mostrar el botón de Siguiente o el botón de generar nuevos temas */}
              {showGenerateButton ? (
                <Button
                  onClick={handleNewTopic}
                  disabled={isLoading}
                  className="px-2 flex items-center bg-chelas-button-face hover:bg-chelas-gray-light"
                  title="Generar Nuevos Temas"
                >
                  <Zap size={18} className="mr-1" />
                  Nuevos Temas
                </Button>
              ) : (
                <Button
                  onClick={handleNextTopic}
                  disabled={currentTopicIndex === totalTopics - 1}
                  className="px-2 flex items-center"
                  variant={currentTopicIndex === totalTopics - 1 ? "ghost" : "default"}
                >
                  Siguiente
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>
      </WindowFrame>
    </div>
  );
};

export default ConversationTopicDisplay;
