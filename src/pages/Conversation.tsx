
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import Avatar, { AvatarType } from '@/components/Avatar';
import Timer from '@/components/Timer';
import ConversationPrompt from '@/components/ConversationPrompt';
import { generateConversationTopic, generateMockTopic } from '@/services/deepseekService';
import { ArrowLeft, RefreshCw, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Conversation as ConversationType } from '@/types/supabase';
import { toast } from 'sonner';

// ID del bot predefinido
const BOT_ID = '00000000-0000-0000-0000-000000000000';

// Mock user data for demo
const mockUsers = {
  '1': { id: '1', name: 'John', avatar: 'tech' as AvatarType, interests: ['javascript', 'react', 'node'] },
  '2': { id: '2', name: 'Sara', avatar: 'code' as AvatarType, interests: ['typescript', 'webdev', 'ai'] },
  '3': { id: '3', name: 'Mike', avatar: 'coffee' as AvatarType, interests: ['frontend', 'design', 'ux'] },
  '4': { id: '4', name: 'Emily', avatar: 'smile' as AvatarType, interests: ['data', 'ai', 'cloud'] },
  '5': { id: '5', name: 'David', avatar: 'gaming' as AvatarType, interests: ['games', 'backend', 'typescript'] },
  '6': { id: '6', name: 'Alex', avatar: 'music' as AvatarType, interests: ['mobile', 'design', 'frontend'] },
  [BOT_ID]: { id: BOT_ID, name: 'ChelasBot', avatar: 'bot' as AvatarType, interests: ['javascript', 'react', 'typescript'] },
};

const Conversation = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  
  // En una aplicación real, esto sería el usuario actual con sesión iniciada en Supabase
  const currentUser = {
    id: '7',
    name: 'Tú',
    avatar: 'user' as AvatarType,
    interests: ['javascript', 'react', 'webdev'],
    avoidTopics: ['política', 'religión']
  };
  
  // Obtener el perfil del otro usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        navigate('/lobby');
        return;
      }

      try {
        // Para el bot, usamos datos predefinidos
        if (userId === BOT_ID) {
          setOtherUserProfile({
            id: BOT_ID,
            name: 'ChelasBot',
            avatar: 'bot',
            is_available: true,
            created_at: new Date().toISOString()
          });
          return;
        }

        // Para otros usuarios, consultamos la base de datos
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error || !data) {
          console.error('Error fetching user profile:', error);
          toast.error('No se pudo cargar el perfil del usuario');
          navigate('/lobby');
          return;
        }
        
        setOtherUserProfile(data);
      } catch (error) {
        console.error('Error processing user profile:', error);
        navigate('/lobby');
      }
    };

    fetchUserProfile();
  }, [userId, navigate]);

  useEffect(() => {
    if (!otherUserProfile) return;

    const generateTopic = async () => {
      setIsLoading(true);
      try {
        // En una aplicación real, usaríamos la API DeepSeek
        // const newTopic = await generateConversationTopic({
        //   userAInterests: currentUser.interests,
        //   userBInterests: otherUser.interests,
        //   avoidTopics: currentUser.avoidTopics
        // });
        
        // Para fines de demostración, usamos la función simulada
        const mockTopic = generateMockTopic();
        
        // Simulamos el retraso de la API
        setTimeout(() => {
          setTopic(mockTopic);
          setIsLoading(false);
        }, 1500);

        // En una aplicación real, guardaríamos la conversación en Supabase
        if (otherUserProfile) {
          // Crear una nueva conversación
          const { data: conversation, error } = await supabase
            .from('conversations')
            .insert({
              user_a: currentUser.id,
              user_b: otherUserProfile.id
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error creating conversation:', error);
            return;
          }
          
          // Guardar el tema de la conversación
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
        console.error('Error generating topic:', error);
        setTopic("¿Cuál es tu parte favorita del desarrollo JavaScript?");
        setIsLoading(false);
      }
    };

    generateTopic();
  }, [otherUserProfile]);

  const handleNewTopic = () => {
    setIsLoading(true);
    // Simulamos la llamada a la API
    setTimeout(() => {
      const newTopic = generateMockTopic();
      setTopic(newTopic);
      setIsLoading(false);
      
      // En una aplicación real, guardaríamos el nuevo tema en Supabase
    }, 1500);
  };

  const handleTimeUp = () => {
    // En una aplicación real, actualizaríamos el estado de la conversación en Supabase
    console.log('¡Se acabó el tiempo!');
  };

  const handleEndConversation = () => {
    // En una aplicación real, actualizaríamos el estado de la conversación en Supabase
    navigate('/lobby');
  };

  if (!otherUserProfile) return null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col min-h-[90vh]"
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

        <Timer 
          initialMinutes={3} 
          onTimeUp={handleTimeUp}
          onExtend={() => console.log('Tiempo extendido')}
        />

        <ConversationPrompt prompt={topic} isLoading={isLoading} />

        <div className="flex justify-center gap-3 mt-auto">
          <Button 
            variant="default"
            onClick={handleNewTopic}
            disabled={isLoading}
          >
            <RefreshCw size={16} className="mr-1" />
            Nuevo Tema
          </Button>
          
          <Button 
            variant="primary"
            onClick={handleEndConversation}
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
