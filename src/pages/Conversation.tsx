import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import Avatar, { AvatarType } from '@/components/Avatar';
import ConversationPrompt from '@/components/ConversationPrompt';
import ConversationTopicWithOptions from '@/components/ConversationTopicWithOptions';
import MatchPercentage from '@/components/MatchPercentage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  generateConversationTopic, 
  generateMockTopic, 
  generateTopicWithOptions,
  mockTopicsWithOptions
} from '@/services/deepseekService';
import { ArrowLeft, RefreshCw, X, ChevronDown, ChevronUp, Star, BookmarkPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ConversationType, InterestOption } from '@/types/supabase';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Json } from '@/integrations/supabase/types';
import { createInterestSummary } from '@/utils/interestSummaryUtils';

interface TopicOption {
  emoji: string;
  text: string;
}

interface TopicWithOptions {
  question: string;
  options: TopicOption[];
}

const BOT_ID = '00000000-0000-0000-0000-000000000000';

const Conversation = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
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
  const isMobile = useIsMobile();
  
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

  if (!otherUserProfile) return null;

  // Check if topics are loaded to control when the timer starts
  const topicsLoaded = useTopicsWithOptions 
    ? !isLoading && topicsWithOptions.length > 0 
    : !isLoading && topics.length > 0;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col min-h-[90vh] w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="self-start"
            onClick={handleEndConversation}
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-2 pb-4">
          <WindowFrame 
            title="COMPAÑERO DE CONVERSACIÓN" 
            className="mb-6"
            onClose={handleEndConversation}
          >
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
                >
                  <Star size={16} className={isFavorite ? "text-black fill-current" : ""} />
                </Button>
                
                <Button 
                  variant={isFollowUp ? "primary" : "default"}
                  className="flex items-center p-1 h-8 w-8" 
                  onClick={toggleFollowUp}
                >
                  <BookmarkPlus size={16} className={isFollowUp ? "text-black fill-current" : ""} />
                </Button>
              </div>
            </div>
          </WindowFrame>

          {matchPercentage > 0 && (
            <MatchPercentage 
              percentage={matchPercentage} 
              matchCount={matchCount} 
            />
          )}

          {useTopicsWithOptions ? (
            <WindowFrame 
              title="TEMA DE CONVERSACIÓN" 
              className="mb-6"
              onClose={() => setShowAllTopics(!showAllTopics)}
            >
              <ConversationTopicWithOptions 
                topic={getCurrentTopic() as TopicWithOptions} 
                isLoading={isLoading}
                onSelectOption={handleSelectOption}
              />
            </WindowFrame>
          ) : (
            <WindowFrame 
              title="TEMA DE CONVERSACIÓN" 
              className="mb-6"
              onClose={() => setShowAllTopics(!showAllTopics)}
            >
              <ConversationPrompt 
                prompt={getCurrentTopic() as string} 
                isLoading={isLoading} 
              />
            </WindowFrame>
          )}
          
          {(useTopicsWithOptions ? topicsWithOptions.length > 1 : topics.length > 1) && (
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="w-full text-sm"
              >
                {showAllTopics ? (
                  <>
                    <ChevronUp size={16} className="mr-1" />
                    Ocultar más temas
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="mr-1" />
                    Ver todos los temas ({useTopicsWithOptions ? topicsWithOptions.length : topics.length})
                  </>
                )}
              </Button>
              
              {showAllTopics && (
                <WindowFrame 
                  title="TODOS LOS TEMAS" 
                  className="mt-2"
                  onClose={() => setShowAllTopics(false)}
                >
                  <div className="space-y-2">
                    {useTopicsWithOptions ? (
                      topicsWithOptions.map((topic, index) => (
                        <div 
                          key={index}
                          className={`p-2 cursor-pointer text-sm rounded-sm
                            ${index === currentTopicIndex ? 
                              'bg-chelas-yellow text-black' : 
                              'bg-chelas-button-face hover:bg-chelas-gray-light/30 text-black'}
                          `}
                          onClick={() => setCurrentTopicIndex(index)}
                        >
                          {topic.question}
                        </div>
                      ))
                    ) : (
                      topics.map((topic, index) => (
                        <div 
                          key={index}
                          className={`p-2 cursor-pointer text-sm rounded-sm
                            ${index === currentTopicIndex ? 
                              'bg-chelas-yellow text-black' : 
                              'bg-chelas-button-face hover:bg-chelas-gray-light/30 text-black'}
                          `}
                          onClick={() => setCurrentTopicIndex(index)}
                        >
                          {topic}
                        </div>
                      ))
                    )}
                  </div>
                </WindowFrame>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
          {(useTopicsWithOptions ? topicsWithOptions.length > 1 : topics.length > 1) && (
            <Button 
              variant="default"
              onClick={handleNextTopic}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <ChevronDown size={16} className="mr-1" />
              Siguiente Tema
            </Button>
          )}
          
          <Button 
            variant="default"
            onClick={handleNewTopic}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw size={16} className="mr-1" />
            Nuevos Temas
          </Button>
          
          <Button 
            variant="primary"
            onClick={handleEndConversation}
            className="w-full sm:w-auto"
          >
            <X size={16} className="mr-1" />
            Terminar Chat
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Conversation;
