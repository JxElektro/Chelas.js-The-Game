import React from 'react';

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
  isLoading: boolean;
  onSelectOption: (option: TopicOption) => void;
}

const ConversationTopicWithOptions: React.FC<ConversationTopicWithOptionsProps> = ({
  topic,
  isLoading,
  onSelectOption
}) => {
  if (isLoading) {
    return (
      <div className="win95-window max-w-md mx-auto mb-4">
        <div className="win95-window-title">
          <span className="text-sm">Tema de conversación</span>
        </div>
        <div className="p-3">
          <div className="win95-inset p-3 text-center">
            <p className="text-sm italic">Cargando tema...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="win95-window max-w-md mx-auto mb-4">
        <div className="win95-window-title">
          <span className="text-sm">Tema de conversación</span>
        </div>
        <div className="p-3">
          <div className="win95-inset p-3 text-center">
            <p className="text-sm">No hay temas disponibles.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="win95-window max-w-md mx-auto mb-4">
      <div className="win95-window-title">
        <span className="text-sm">Tema de conversación</span>
      </div>
      <div className="p-3">
        <div className="win95-inset p-3">
          <p className="text-sm font-bold mb-2 text-black">{topic.question}</p>
          <ul>
            {topic.options.map((option, index) => (
              <li key={index} className="flex items-center mb-1">
                <span className="mr-2">{option.emoji}</span>
                <span className="text-sm text-black">{option.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConversationTopicWithOptions;
