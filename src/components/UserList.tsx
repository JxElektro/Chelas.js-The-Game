
import React, { useState, useEffect } from 'react';
import Avatar, { AvatarType } from './Avatar';
import Button from './Button';
import { User, UserCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  id: string;
  name: string;
  avatar: AvatarType;
  isAvailable: boolean;
  isFavorite?: boolean;
}

interface UserListProps {
  users: UserData[];
  onSelectUser: (userId: string) => void;
  currentUserId?: string;
  showFavoritesOnly?: boolean;
  onToggleFavorite?: (userId: string, isFavorite: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  onSelectUser, 
  currentUserId,
  showFavoritesOnly = false,
  onToggleFavorite
}) => {
  const isMobile = useIsMobile();
  const [userFavorites, setUserFavorites] = useState<Record<string, boolean>>({});
  
  // Filter users based on availability and possibly favorites
  const filteredUsers = users.filter(user => {
    const isAvailable = user.isAvailable && user.id !== currentUserId;
    if (showFavoritesOnly) {
      return isAvailable && (userFavorites[user.id] || user.isFavorite);
    }
    return isAvailable;
  });

  // Fetch user favorites on component mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user?.id) return;
        
        const { data: favorites, error } = await supabase
          .from('conversations')
          .select('user_b, is_favorite')
          .eq('user_a', session.session.user.id)
          .eq('is_favorite', true);
        
        if (error) {
          console.error('Error fetching favorites:', error);
          return;
        }
        
        if (favorites && favorites.length > 0) {
          const favMap: Record<string, boolean> = {};
          favorites.forEach(fav => {
            favMap[fav.user_b] = true;
          });
          setUserFavorites(favMap);
        }
      } catch (error) {
        console.error('Error in favorites fetch:', error);
      }
    };
    
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (userId: string) => {
    if (!currentUserId) return;
    
    try {
      const newFavoriteState = !userFavorites[userId];
      
      // Optimistic UI update
      setUserFavorites(prev => ({
        ...prev,
        [userId]: newFavoriteState
      }));
      
      // Check if a conversation exists
      const { data: existingConversation, error: queryError } = await supabase
        .from('conversations')
        .select('id, is_favorite')
        .eq('user_a', currentUserId)
        .eq('user_b', userId)
        .maybeSingle();
      
      if (queryError) {
        console.error('Error checking existing conversation:', queryError);
        toast.error('Error al actualizar favorito');
        return;
      }
      
      if (existingConversation) {
        // Update existing conversation
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ is_favorite: newFavoriteState })
          .eq('id', existingConversation.id);
          
        if (updateError) {
          console.error('Error updating favorite status:', updateError);
          toast.error('Error al actualizar favorito');
          // Revert UI state
          setUserFavorites(prev => ({
            ...prev,
            [userId]: !newFavoriteState
          }));
          return;
        }
      } else {
        // Create new conversation with favorite status
        const { error: insertError } = await supabase
          .from('conversations')
          .insert({
            user_a: currentUserId,
            user_b: userId,
            is_favorite: newFavoriteState
          });
          
        if (insertError) {
          console.error('Error creating favorite conversation:', insertError);
          toast.error('Error al crear favorito');
          // Revert UI state
          setUserFavorites(prev => ({
            ...prev,
            [userId]: !newFavoriteState
          }));
          return;
        }
      }
      
      toast.success(newFavoriteState ? 'Usuario añadido a favoritos' : 'Usuario eliminado de favoritos');
      
      // Call the parent component's toggle function if provided
      if (onToggleFavorite) {
        onToggleFavorite(userId, newFavoriteState);
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favorito');
    }
  };

  return (
    <div className="win95-inset py-2 px-1 overflow-y-auto flex-grow min-h-0">
      <AnimatePresence>
        {filteredUsers.length > 0 ? (
          <motion.div className="space-y-1 sm:space-y-2">
            {filteredUsers.map((user) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center px-1 sm:px-2 py-1 hover:bg-chelas-gray-medium"
              >
                <Avatar type={user.avatar} size={isMobile ? "sm" : "sm"} />
                <span className="text-black text-xs sm:text-sm ml-1 sm:ml-2 flex-grow truncate">{user.name}</span>
                
                {/* Star button for favorites */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(user.id);
                  }}
                  className={`ml-1 mr-1 p-0 h-6 w-6 ${(userFavorites[user.id] || user.isFavorite) ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  <Star size={isMobile ? 12 : 14} className="p-0" />
                </Button>
                
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onSelectUser(user.id)}
                  className="ml-1 sm:ml-1"
                >
                  <UserCheck size={isMobile ? 10 : 12} className={isMobile ? "mr-0.5" : "mr-1"} />
                  <span className={`${isMobile ? "text-[10px]" : "text-xs"}`}>Chat</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-2 sm:p-4 text-chelas-gray-dark"
          >
            <User size={isMobile ? 16 : 24} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs sm:text-sm">
              {showFavoritesOnly ? 'No hay usuarios favoritos' : 'No hay usuarios disponibles'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserList;
