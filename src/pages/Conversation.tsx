import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import Avatar, { AvatarType } from '@/components/Avatar';
import Timer from '@/components/Timer';
import ConversationPrompt from '@/components/ConversationPrompt';
import MatchPercentage from '@/components/MatchPercentage';
import { generateConversationTopic, generateMockTopic } from '@/services/deepseekService';
import { ArrowLeft, RefreshCw, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Conversation as ConversationType, InterestOption } from '@/types/supabase';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const BOT_ID = '00000000-0000-0000-0000-000000000000';

const Conversation = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [allInterests, setAllInterests] = useState<InterestOption[]>([]);
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
        navigate('/lobby');
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
            descripcion_personal: 'Soy ChelasBot, un bot conversacional para ayudar a practicar tus habilidades sociales.'
          });
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
          navigate('/lobby');
          return;
        }
        
        setOtherUserProfile(data as Profile);
      } catch (error) {
        console.error('Error al procesar el perfil del usuario:', error);
        navigate('/lobby');
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
        
        const mockTopic = generateMockTopic();
        
        setTimeout(() => {
          setTopic(mockTopic);
          setIsLoading(false);
        }, 1500);

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
          
          if (conversation && matchPercentage > 0) {
            const { error: updateError } = await supabase
              .from('conversations')
              .update({ match_percentage: matchPercentage })
              .eq('id', conversation.id);
              
            if (updateError) {
              console.error('Error al actualizar match_percentage:', updateError);
            }
          }
          
          if (conversation) {
            await supabase
              .from('conversation_topics')
              .insert({
                conversation_id: conversation.id,
                topic: mockTopic
              });
          }
        }
      } catch (error) {
        console.error('Error al generar tema:', error);
        setTopic("¿Cuál es tu parte favorita del desarrollo JavaScript?");
        setIsLoading(false);
      }
    };

    generateTopic();
  }, [otherUserProfile, currentUserProfile, matchPercentage]);

  const handleNewTopic = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newTopic = generateMockTopic();
      setTopic(newTopic);
      setIsLoading(false);
    }, 1500);
  };

  const handleTimeUp = () => {
    console.log('¡Se acabó el tiempo!');
    toast.info('Se acabó el tiempo de esta conversación');
  };

  const handleEndConversation = () => {
    navigate('/lobby');
  };

  if (!otherUserProfile) return null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col min-h-[90vh] w-full"
      >
        <Button 
          variant="ghost" 
          className="self-start mb-4"
          onClick={handleEndConversation}
        >
          <ArrowLeft size={16} className="mr-1" />
          Volver al Lobby
        </Button>

        <WindowFrame title="COMPAÑERO DE CONVERSACIÓN" className="mb-6">
          <div className="flex items-center">
            <Avatar type={otherUserProfile.avatar as AvatarType} size="lg" />
            <div className="ml-4">
              <h2 className="text-black text-lg font-bold">{otherUserProfile.name}</h2>
              <p className="text-sm text-chelas-gray-dark">
                ¡Usa el tema de abajo para iniciar una conversación!
              </p>
            </div>
          </div>
        </WindowFrame>

        {matchPercentage > 0 && (
          <MatchPercentage 
            percentage={matchPercentage} 
            matchCount={matchCount} 
          />
        )}

        <Timer 
          initialMinutes={3} 
          onTimeUp={handleTimeUp}
          onExtend={() => console.log('Tiempo extendido')}
        />

        <ConversationPrompt prompt={topic} isLoading={isLoading} />

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-auto">
          <Button 
            variant="default"
            onClick={handleNewTopic}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw size={16} className="mr-1" />
            Nuevo Tema
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
