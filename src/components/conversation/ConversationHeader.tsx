
import React from 'react';
import Avatar, { AvatarType } from '@/components/Avatar';
import { Profile } from '@/types/supabase';
import { Star, BookmarkPlus } from 'lucide-react';
import Button from '@/components/Button';
import { createInterestSummary } from '@/utils/interestSummaryUtils';

interface ConversationHeaderProps {
  otherUserProfile: Profile;
  isFavorite: boolean;
  isFollowUp: boolean;
  toggleFavorite: () => void;
  toggleFollowUp: () => void;
  handleEndConversation: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  otherUserProfile,
  isFavorite,
  isFollowUp,
  toggleFavorite,
  toggleFollowUp,
  handleEndConversation
}) => {
  const BOT_ID = '00000000-0000-0000-0000-000000000000';

  const getUserSummary = () => {
    if (!otherUserProfile) return "Cargando usuario...";
    
    if (otherUserProfile.id === BOT_ID) {
      return "Un asistente de chat para practicar tus habilidades sociales.";
    }
    
    return createInterestSummary(otherUserProfile.super_profile);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar type={otherUserProfile.avatar as AvatarType} size="lg" />
          <div className="ml-4">
            <h2 className="text-black text-lg font-bold">{otherUserProfile.name}</h2>
            <p className="text-sm text-chelas-gray-dark">
              {getUserSummary()}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant={isFavorite ? "primary" : "default"}
            className="flex items-center p-1 h-8 w-8" 
            onClick={toggleFavorite}
            title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Star size={16} className={isFavorite ? "text-black fill-current" : ""} />
          </Button>
          
          <Button 
            variant={isFollowUp ? "primary" : "default"}
            className="flex items-center p-1 h-8 w-8" 
            onClick={toggleFollowUp}
            title={isFollowUp ? "Quitar seguimiento" : "Marcar para seguimiento"}
          >
            <BookmarkPlus size={16} className={isFollowUp ? "text-black fill-current" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
