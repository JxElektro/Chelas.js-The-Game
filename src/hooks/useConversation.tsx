
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { InterestOption } from '@/types/supabase';
import { createInterestSummary } from '@/utils/interestSummaryUtils';
import { 
  generateConversationTopic, 
  generateMockTopic, 
  generateTopicWithOptions,
  mockTopicsWithOptions
} from '@/services/deepseekService';
import { Json } from '@/integrations/supabase/types';

interface TopicOption {
  emoji: string;
  text: string;
}

interface TopicWithOptions {
  question: string;
  options: TopicOption[];
}

const BOT_ID = '00000000-0000-0000-0000-000000000000';

export const useConversation = (userId: string | undefined) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicsWithOptions, setTopicsWithOptions] = useState<TopicWithOptions[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [allInterests, setAllInterests] = useState<any[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [useTopicsWithOptions, setUseTopicsWithOptions] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  
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
  }, [navigate]);
  
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
          toast.error('No se pudo cargar el perfil del usuario');
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
  }, [userId, navigate]);

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
    
    if (userId !== BOT_ID && currentUserProfile.id) {
      updateConversationMatchPercentage(currentUserProfile.id, userId as string, percentage);
    }
  };
  
  const updateConversationMatchPercentage = async (userA: string, userB: string, percentage: number) => {
    try {
      const { data: existingConversation, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user_a.eq.${userA},user_b.eq.${userA}`)
        .or(`user_a.eq.${userB},user_b.eq.${userB}`)
        .order('started_at', { ascending: false })
        .limit(1);
        
      if (findError) {
        console.error('Error al buscar conversación:', findError);
        return;
      }
      
      if (existingConversation && existingConversation.length > 0) {
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

  useEffect(() => {
    if (!otherUserProfile || !currentUserProfile) return;

    const generateTopic = async () => {
      setIsLoading(true);
      try {
        console.log('Iniciando conversación con el usuario:', otherUserProfile.id);
        
        if (useTopicsWithOptions) {
          // Generar temas con opciones usando los perfiles completos
          let topicsOptions;
          
          try {
            topicsOptions = await generateTopicWithOptions({
              userAProfile: currentUserProfile,
              userBProfile: otherUserProfile,
              matchPercentage
            });
            
            if (!topicsOptions || topicsOptions.length === 0) {
              throw new Error('No se pudieron generar temas con opciones');
            }
          } catch (error) {
            console.error('Error al generar temas con opciones:', error);
            topicsOptions = mockTopicsWithOptions();
          }
          
          setTimeout(() => {
            setTopicsWithOptions(topicsOptions);
            setCurrentTopicIndex(0);
            setIsLoading(false);
          }, 1500);
        } else {
          // Generate regular topics (fallback)
          const mockTopics = generateMockTopic();
          
          setTimeout(() => {
            setTopics(mockTopics);
            setCurrentTopicIndex(0);
            setIsLoading(false);
          }, 1500);
        }

        // Create the conversation record
        if (otherUserProfile && currentUserProfile) {
          const { data: conversation, error } = await supabase
            .from('conversations')
            .insert({
              user_a: currentUserProfile.id,
              user_b: otherUserProfile.id
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error al crear conversación:', error);
            return;
          }
          
          // Store the conversation ID for later use
          if (conversation) {
            conversationIdRef.current = conversation.id;
            
            // Update match percentage in a separate query
            if (matchPercentage > 0) {
              const { error: updateError } = await supabase
                .from('conversations')
                .update({ match_percentage: matchPercentage })
                .eq('id', conversation.id);
                
              if (updateError) {
                console.error('Error al actualizar match_percentage:', updateError);
              }
            }
            
            // Save topics in the database
            if (useTopicsWithOptions && topicsWithOptions.length > 0) {
              const topicPromises = topicsWithOptions.map(topic => {
                return supabase
                  .from('conversation_topics')
                  .insert({
                    conversation_id: conversation.id,
                    topic: topic.question
                  });
              });
              
              await Promise.all(topicPromises);
            } else if (topics.length > 0) {
              const topicPromises = topics.map(topic => {
                return supabase
                  .from('conversation_topics')
                  .insert({
                    conversation_id: conversation.id,
                    topic: topic
                  });
              });
              
              await Promise.all(topicPromises);
            }
          }
        }
      } catch (error) {
        console.error('Error al generar tema:', error);
        setTopicsWithOptions(mockTopicsWithOptions());
        setIsLoading(false);
      }
    };

    generateTopic();
  }, [otherUserProfile, currentUserProfile, matchPercentage]);

  const handleNewTopic = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (useTopicsWithOptions) {
        const newTopicsWithOptions = mockTopicsWithOptions();
        setTopicsWithOptions(newTopicsWithOptions);
        setCurrentTopicIndex(0);
      } else {
        const newTopics = generateMockTopic();
        setTopics(newTopics);
        setCurrentTopicIndex(0);
      }
      setIsLoading(false);
      
      // Save new topics to database if we have a conversation ID
      if (conversationIdRef.current) {
        if (useTopicsWithOptions) {
          topicsWithOptions.forEach(topic => {
            supabase
              .from('conversation_topics')
              .insert({
                conversation_id: conversationIdRef.current as string,
                topic: topic.question
              })
              .then(({ error }) => {
                if (error) console.error('Error al guardar nuevo tema:', error);
              });
          });
        } else {
          topics.forEach(topic => {
            supabase
              .from('conversation_topics')
              .insert({
                conversation_id: conversationIdRef.current as string,
                topic: topic
              })
              .then(({ error }) => {
                if (error) console.error('Error al guardar nuevo tema:', error);
              });
          });
        }
      }
    }, 1500);
  };
  
  const handleNextTopic = () => {
    const maxIndex = useTopicsWithOptions 
      ? topicsWithOptions.length - 1 
      : topics.length - 1;
      
    if (currentTopicIndex < maxIndex) {
      setCurrentTopicIndex(currentTopicIndex + 1);
    } else {
      // If we're at the end, cycle back to the first topic
      setCurrentTopicIndex(0);
    }
  };

  const handleEndConversation = () => {
    // When conversation ends, navigate to home
    if (conversationIdRef.current) {
      // We need to be careful with the database fields we're updating
      // Only update fields that exist in the database schema
      supabase
        .from('conversations')
        .update({ 
          ended_at: new Date().toISOString()
          // Note: is_favorite and follow_up are currently removed due to schema issues
        })
        .eq('id', conversationIdRef.current)
        .then(({ error }) => {
          if (error) console.error('Error al finalizar conversación:', error);
        });
    }
    
    navigate('/');
  };
  
  const handleSelectOption = (option: TopicOption) => {
    toast.success(`Seleccionaste: ${option.text}`);
    // Aquí podrías implementar lógica adicional para guardar la selección o pasar al siguiente tema
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos');
    
    // Note: This feature requires database schema update
    // Consider adding is_favorite column to conversations table
    console.log('Favorito toggle:', !isFavorite);
  };
  
  const toggleFollowUp = () => {
    setIsFollowUp(!isFollowUp);
    toast.success(isFollowUp ? 'Follow-up cancelado' : 'Follow-up marcado');
    
    // Note: This feature requires database schema update
    // Consider adding follow_up column to conversations table
    console.log('Follow-up toggle:', !isFollowUp);
  };

  const getCurrentTopic = () => {
    if (useTopicsWithOptions) {
      if (topicsWithOptions.length === 0) return null;
      return topicsWithOptions[currentTopicIndex];
    } else {
      if (topics.length === 0) return "";
      return topics[currentTopicIndex];
    }
  };

  const getUserSummary = () => {
    if (!otherUserProfile) return "Cargando usuario...";
    
    if (otherUserProfile.id === BOT_ID) {
      return "Un asistente de chat para practicar tus habilidades sociales.";
    }
    
    return createInterestSummary(otherUserProfile.super_profile);
  };

  return {
    isLoading,
    topics,
    topicsWithOptions,
    currentTopicIndex,
    setCurrentTopicIndex,
    otherUserProfile,
    currentUserProfile,
    matchPercentage,
    matchCount,
    showAllTopics,
    setShowAllTopics,
    useTopicsWithOptions,
    isFavorite,
    setIsFavorite,
    isFollowUp,
    setIsFollowUp,
    conversationIdRef,
    handleEndConversation,
    handleNewTopic,
    handleNextTopic,
    handleSelectOption,
    toggleFavorite,
    toggleFollowUp,
    getCurrentTopic,
    getUserSummary
  };
};
