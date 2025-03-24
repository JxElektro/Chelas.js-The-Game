
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { InterestOption } from '@/types/supabase';
import { Json } from '@/integrations/supabase/types';

export const BOT_ID = '00000000-0000-0000-0000-000000000000';

export const useConversationProfiles = (
  userId: string | undefined,
  setCurrentUserProfile: (profile: Profile) => void,
  setOtherUserProfile: (profile: Profile) => void,
  setAllInterests: (interests: any[]) => void
) => {
  const navigate = useNavigate();

  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          setCurrentUserProfile(data as Profile);
        } catch (error) {
          console.error('Error al cargar tu perfil:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };
    
    fetchCurrentUser();
    fetchAllInterests();
  }, [navigate, setCurrentUserProfile]);
  
  // Fetch all interests
  const fetchAllInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*');
        
      if (error) throw error;
      
      const mapped = (data || []).map((i: any) => ({
        id: i.id,
        label: i.name,
        category: i.category
      })) as InterestOption[];
      
      setAllInterests(mapped);
    } catch (error) {
      console.error('Error al cargar intereses:', error);
    }
  };

  // Fetch other user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        if (userId === BOT_ID) {
          setOtherUserProfile({
            id: BOT_ID,
            name: 'ChelasBot',
            avatar: 'bot',
            is_available: true,
            created_at: new Date().toISOString(),
            temas_preferidos: [],
            descripcion_personal: 'Soy ChelasBot, un bot conversacional para ayudar a practicar tus habilidades sociales.',
            analisis_externo: null,
            super_profile: {} as Json,
          } as Profile);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error || !data) {
          console.error('Error al cargar el perfil del usuario:', error);
          navigate('/');
          return;
        }
        
        setOtherUserProfile(data as Profile);
      } catch (error) {
        console.error('Error al procesar el perfil del usuario:', error);
        navigate('/');
      }
    };

    fetchUserProfile();
  }, [userId, navigate, setOtherUserProfile]);

  return { BOT_ID };
};
