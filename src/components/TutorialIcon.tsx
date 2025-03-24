
import React from 'react';
import { BookOpen } from 'lucide-react';

const TutorialIcon = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer p-2 hover:bg-chelas-button-face/30 active:bg-chelas-button-face/50 rounded-md transition-colors"
      onClick={onClick}
    >
      <div className="text-3xl md:text-4xl mb-1">📚</div>
      <span className="text-xs md:text-sm text-center font-ms-sans text-white">Tutorial</span>
    </div>
  );
};

export default TutorialIcon;
