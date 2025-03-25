
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Lobby from '@/pages/Lobby';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserList from './UserList';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Avatar, { AvatarType } from '@/components/Avatar';

interface FavoriteUser {
  id: string;
  name: string;
  avatar: AvatarType;
  isAvailable: boolean;
  isFavorite: boolean;
}

const MessengerWithFavorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteUser[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session?.user?.id) {
          setCurrentUserId(session.session.user.id);
          
          // Fetch favorite conversations
          const { data: favConversations, error: favError } = await supabase
            .from('conversations')
            .select('user_b')
            .eq('user_a', session.session.user.id)
            .eq('is_favorite', true);
          
          if (favError) {
            console.error('Error fetching favorite conversations:', favError);
            setLoading(false);
            return;
          }
          
          if (favConversations && favConversations.length > 0) {
            // Extract user IDs
            const favoriteUserIds = favConversations.map(conv => conv.user_b);
            
            // Fetch profiles for these users
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', favoriteUserIds);
            
            if (profilesError) {
              console.error('Error fetching profiles:', profilesError);
              setLoading(false);
              return;
            }
            
            if (profiles) {
              setFavorites(profiles.map(profile => ({
                id: profile.id,
                name: profile.name,
                avatar: profile.avatar as AvatarType,
                isAvailable: profile.is_available || false,
                isFavorite: true
              })));
            }
          } else {
            setFavorites([]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setLoading(false);
      }
    };
    
    fetchFavorites();
    
    // Set up a subscription for real-time updates to favorites
    const favoritesChannel = supabase
      .channel('favorites-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: 'is_favorite=eq.true'
        }, 
        () => {
          fetchFavorites();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(favoritesChannel);
    };
  }, []);
  
  const handleSelectUser = (userId: string) => {
    navigate(`/conversation/${userId}`);
  };
  
  const handleToggleFavorite = (userId: string, isFavorite: boolean) => {
    if (isFavorite) {
      // If adding to favorites, and not already in the list, add to favorites
      if (!favorites.some(fav => fav.id === userId)) {
        // We'll need to fetch the user profile
        // In real implementation, the component would re-render from the DB update
      }
    } else {
      // If removing from favorites, update list
      setFavorites(favorites.filter(fav => fav.id !== userId));
    }
  };
  
  return (
    <div className="flex flex-col h-full w-full">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border-b border-chelas-gray-dark flex-shrink-0"
      >
        <div className="flex items-center justify-between p-2 bg-chelas-button-face">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            <span className="text-sm font-bold text-black">Favoritos</span>
          </div>
          <CollapsibleTrigger className="win95-button p-0.5 h-5 w-5 flex items-center justify-center">
            {isOpen ? (
              <ChevronUp className="h-3 w-3 text-black" />
            ) : (
              <ChevronDown className="h-3 w-3 text-black" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <ScrollArea className="max-h-20 w-full">
            {loading ? (
              <div className="p-2 text-center text-xs text-black bg-white">
                Cargando favoritos...
              </div>
            ) : favorites.length > 0 ? (
              <UserList 
                users={favorites}
                onSelectUser={handleSelectUser}
                currentUserId={currentUserId || undefined}
                showFavoritesOnly={true}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (
              <div className="p-2 text-center text-xs text-black bg-white">
                No tienes contactos favoritos
              </div>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Contenedor para el Lobby con altura flexible que toma el espacio restante */}
      <div className="flex-grow min-h-0 overflow-hidden">
        <Lobby />
      </div>
    </div>
  );
};

export default MessengerWithFavorites;
