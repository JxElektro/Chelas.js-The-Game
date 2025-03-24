
import React from 'react';
import MatchPercentage from '@/components/MatchPercentage';
import { Badge } from '@/components/ui/badge';
import { Star, BookmarkPlus } from 'lucide-react';

interface ConversationMatchProps {
  percentage: number;
  matchCount: number;
  isFavorite?: boolean;
  isFollowUp?: boolean;
}

const ConversationMatch: React.FC<ConversationMatchProps> = ({
  percentage,
  matchCount,
  isFavorite,
  isFollowUp
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <MatchPercentage 
        percentage={percentage} 
        matchCount={matchCount} 
      />
      
      {isFavorite && (
        <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 border-yellow-200">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          Favorito
        </Badge>
      )}
      
      {isFollowUp && (
        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 border-blue-200">
          <BookmarkPlus size={12} className="text-blue-500" />
          Follow-up
        </Badge>
      )}
    </div>
  );
};

export default ConversationMatch;
