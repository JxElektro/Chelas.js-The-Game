
import React from 'react';
import MatchPercentage from '@/components/MatchPercentage';

interface ConversationMatchProps {
  percentage: number;
  matchCount: number;
}

const ConversationMatch: React.FC<ConversationMatchProps> = ({
  percentage,
  matchCount
}) => {
  return (
    <MatchPercentage 
      percentage={percentage} 
      matchCount={matchCount} 
    />
  );
};

export default ConversationMatch;
