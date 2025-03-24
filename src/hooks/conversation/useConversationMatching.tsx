
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { MutableRefObject } from 'react';

export const useConversationMatching = (
  currentUserProfile: Profile | null,
  otherUserProfile: Profile | null,
  allInterests: any[],
  setMatchPercentage: (percentage: number) => void,
  setMatchCount: (count: number) => void,
  userId: string | undefined,
  conversationIdRef: MutableRefObject<string | null>,
  setIsFavorite: (isFavorite: boolean) => void,
  setIsFollowUp: (isFollowUp: boolean) => void
) => {
  // Calculate match percentage
  useEffect(() => {
    if (currentUserProfile && otherUserProfile && allInterests.length > 0) {
      calculateMatchPercentage();
    }
  }, [currentUserProfile, otherUserProfile, allInterests]);

  const calculateMatchPercentage = () => {
    if (!currentUserProfile?.temas_preferidos || !otherUserProfile?.temas_preferidos) {
      setMatchPercentage(0);
      setMatchCount(0);
      return;
    }
    
    const avoidIds = allInterests
      .filter(interest => interest.category === 'avoid')
      .map(interest => interest.id);
      
    const currentUserInterests = currentUserProfile.temas_preferidos.filter(
      id => !avoidIds.includes(id)
    );
    
    const otherUserInterests = otherUserProfile.temas_preferidos.filter(
      id => !avoidIds.includes(id)
    );
    
    const matches = currentUserInterests.filter(id => 
      otherUserInterests.includes(id)
    );
    
    const uniqueInterests = [...new Set([...currentUserInterests, ...otherUserInterests])];
    
    const percentage = uniqueInterests.length > 0
      ? Math.round((matches.length / uniqueInterests.length) * 100)
      : 0;
      
    setMatchPercentage(percentage);
    setMatchCount(matches.length);
    
    if (userId !== '00000000-0000-0000-0000-000000000000' && currentUserProfile.id) {
      updateConversationMatchPercentage(currentUserProfile.id, userId as string, percentage);
    }
  };

  const updateConversationMatchPercentage = async (userA: string, userB: string, percentage: number) => {
    try {
      const { data: existingConversation, error: findError } = await supabase
        .from('conversations')
        .select('id, is_favorite, follow_up')
        .or(`user_a.eq.${userA},user_b.eq.${userA}`)
        .or(`user_a.eq.${userB},user_b.eq.${userB}`)
        .order('started_at', { ascending: false })
        .limit(1);
        
      if (findError) {
        console.error('Error al buscar conversación:', findError);
        return;
      }
      
      if (existingConversation && existingConversation.length > 0) {
        conversationIdRef.current = existingConversation[0].id;
        setIsFavorite(existingConversation[0].is_favorite || false);
        setIsFollowUp(existingConversation[0].follow_up || false);
        
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ match_percentage: percentage })
          .eq('id', existingConversation[0].id);
          
        if (updateError) {
          console.error('Error al actualizar match_percentage:', updateError);
        }
      }
    } catch (error) {
      console.error('Error al actualizar coincidencia:', error);
    }
  };

  return { calculateMatchPercentage };
};
