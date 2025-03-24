
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useConversationPreferences = (
  isFavorite: boolean,
  setIsFavorite: (isFavorite: boolean) => void,
  isFollowUp: boolean,
  setIsFollowUp: (isFollowUp: boolean) => void,
  conversationIdRef: React.MutableRefObject<string | null>
) => {
  const toggleFavorite = async () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    toast.success(newFavoriteState ? 'Añadido a favoritos' : 'Eliminado de favoritos');
    
    // Update the favorite status in the database
    if (conversationIdRef.current) {
      const { error } = await supabase
        .from('conversations')
        .update({ is_favorite: newFavoriteState })
        .eq('id', conversationIdRef.current);
        
      if (error) {
        console.error('Error al actualizar estado de favorito:', error);
        // Revert the UI state if the update failed
        setIsFavorite(!newFavoriteState);
        toast.error('Error al guardar favorito');
      }
    }
  };
  
  const toggleFollowUp = async () => {
    const newFollowUpState = !isFollowUp;
    setIsFollowUp(newFollowUpState);
    toast.success(newFollowUpState ? 'Follow-up marcado' : 'Follow-up cancelado');
    
    // Update the follow-up status in the database
    if (conversationIdRef.current) {
      const { error } = await supabase
        .from('conversations')
        .update({ follow_up: newFollowUpState })
        .eq('id', conversationIdRef.current);
        
      if (error) {
        console.error('Error al actualizar estado de follow-up:', error);
        // Revert the UI state if the update failed
        setIsFollowUp(!newFollowUpState);
        toast.error('Error al guardar follow-up');
      }
    }
  };

  return {
    toggleFavorite,
    toggleFollowUp
  };
};
