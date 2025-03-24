
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { TopicWithOptions } from '@/types/conversation';
import { generateConversationTopic, generateMockTopic, generateTopicWithOptions, mockTopicsWithOptions } from '@/services/deepseekService';
import { MutableRefObject } from 'react';
import { BOT_ID } from './useConversationProfiles';

export const useConversationTopics = (
  otherUserProfile: Profile | null,
  currentUserProfile: Profile | null,
  matchPercentage: number,
  setIsLoading: (isLoading: boolean) => void,
  useTopicsWithOptions: boolean,
  setTopicsWithOptions: (topics: TopicWithOptions[]) => void,
  setTopics: (topics: string[]) => void,
  setCurrentTopicIndex: (index: number) => void,
  conversationIdRef: MutableRefObject<string | null>
) => {
  // Define local state variables to store topics
  const [localTopicsWithOptions, setLocalTopicsWithOptions] = useState<TopicWithOptions[]>([]);
  const [localTopics, setLocalTopics] = useState<string[]>([]);

  // Generate conversation topics
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
            setLocalTopicsWithOptions(topicsOptions);
            setCurrentTopicIndex(0);
            setIsLoading(false);
          }, 1500);
        } else {
          // Generate regular topics (fallback)
          const mockTopics = generateMockTopic();
          
          setTimeout(() => {
            setTopics(mockTopics);
            setLocalTopics(mockTopics);
            setCurrentTopicIndex(0);
            setIsLoading(false);
          }, 1500);
        }

        // Create the conversation record if it doesn't exist yet
        if (otherUserProfile && currentUserProfile && !conversationIdRef.current) {
          const { data: conversation, error } = await supabase
            .from('conversations')
            .insert({
              user_a: currentUserProfile.id,
              user_b: otherUserProfile.id,
              is_favorite: false,
              follow_up: false
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
            
            // We'll save the topics in a separate function
            saveTopicsToDatabase(conversation.id);
          }
        }
      } catch (error) {
        console.error('Error al generar tema:', error);
        const fallbackTopics = mockTopicsWithOptions();
        setTopicsWithOptions(fallbackTopics);
        setLocalTopicsWithOptions(fallbackTopics);
        setIsLoading(false);
      }
    };

    generateTopic();
  }, [otherUserProfile, currentUserProfile, matchPercentage]);

  // Helper to save topics to the database
  const saveTopicsToDatabase = (conversationId: string) => {
    if (useTopicsWithOptions && localTopicsWithOptions.length > 0) {
      const topicPromises = localTopicsWithOptions.map(topic => {
        return supabase
          .from('conversation_topics')
          .insert({
            conversation_id: conversationId,
            topic: topic.question
          });
      });
      
      Promise.all(topicPromises).catch(error => 
        console.error('Error al guardar temas:', error)
      );
    } else if (localTopics.length > 0) {
      const topicPromises = localTopics.map(topic => {
        return supabase
          .from('conversation_topics')
          .insert({
            conversation_id: conversationId,
            topic: topic
          });
      });
      
      Promise.all(topicPromises).catch(error => 
        console.error('Error al guardar temas:', error)
      );
    }
  };

  return { saveTopicsToDatabase };
};
