
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopicOption {
  emoji: string;
  text: string;
}

interface TopicWithOptions {
  question: string;
  options: TopicOption[];
}

interface ConversationTopicWithOptionsProps {
  topic: TopicWithOptions | null;
  isLoading?: boolean;
  onSelectOption?: (option: TopicOption) => void;
}

const ConversationTopicWithOptions: React.FC<ConversationTopicWithOptionsProps> = ({ 
  topic, 
  isLoading = false,
  onSelectOption
}) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bg-chelas-yellow border-2 border-chelas-gray-dark shadow-win95 text-black p-4 mb-6 w-full mx-auto"
    >
      <div className="flex items-center mb-2">
        <Sparkles size={16} className="mr-1" />
        <h3 className="text-xs font-bold">TEMA DE CONVERSACIÓN</h3>
      </div>
      
      {isLoading ? (
        <div className="win95-inset flex items-center justify-center h-16 p-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-sm text-chelas-gray-dark"
          >
            Generando tema personalizado...
          </motion.div>
        </div>
      ) : topic ? (
        <div className="win95-inset p-3">
          <p className="text-sm font-medium mb-3">{topic.question}</p>
          
          <div className="space-y-2 mt-3">
            {topic.options.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-chelas-button-face border border-chelas-gray-dark p-2 cursor-pointer hover:bg-chelas-gray-light/30"
                onClick={() => onSelectOption && onSelectOption(option)}
              >
                <div className="flex items-start">
                  <span className="text-lg mr-2">{option.emoji}</span>
                  <p className="text-sm">{option.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="win95-inset p-2">
          <p className="text-sm text-chelas-gray-dark">No hay tema disponible</p>
        </div>
      )}
    </motion.div>
  );
};

export default ConversationTopicWithOptions;
