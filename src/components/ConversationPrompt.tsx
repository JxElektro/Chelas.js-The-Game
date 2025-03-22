
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationPromptProps {
  prompt: string;
  isLoading?: boolean;
}

const ConversationPrompt: React.FC<ConversationPromptProps> = ({ 
  prompt, 
  isLoading = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bg-chelas-yellow border-2 border-chelas-gray-dark shadow-win95 text-black p-4 mb-6 max-w-xs mx-auto"
    >
      <div className="flex items-center mb-2">
        <Sparkles size={16} className="mr-1" />
        <h3 className="text-xs font-bold">AI CONVERSATION STARTER</h3>
      </div>
      
      {isLoading ? (
        <div className="win95-inset flex items-center justify-center h-16 p-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-sm text-chelas-gray-dark"
          >
            Generating topic...
          </motion.div>
        </div>
      ) : (
        <div className="win95-inset p-2">
          <p className="text-sm">{prompt}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ConversationPrompt;
