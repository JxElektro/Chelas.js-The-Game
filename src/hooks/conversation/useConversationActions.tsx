
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TopicWithOptions } from '@/types/conversation';
import { toast } from 'sonner';
import { generateMockTopic, mockTopicsWithOptions } from '@/services/deepseekService';

export const useConversationActions = (
  useTopicsWithOptions: boolean,
  topicsWithOptions: TopicWithOptions[],
  topics: string[],
  setTopicsWithOptions: (topics: TopicWithOptions[]) => void,
  setTopics: (topics: string[]) => void,
  currentTopicIndex: number,
  setCurrentTopicIndex: (index: number) => void,
  setIsLoading: (isLoading: boolean) => void,
  conversationIdRef: React.MutableRefObject<string | null>,
  isFavorite: boolean,
  isFollowUp: boolean
) => {
  const navigate = useNavigate();

  const handleNewTopic = () => {
    setIsLoading(true);
    toast.info("Generando nuevos temas...");
    
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
      toast.success("Nuevos temas generados");
      
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
    } else if (maxIndex >= 0) {
      // If we're at the end, show a toast notification
      toast.info("Has visto todos los temas disponibles. Genera nuevos temas con el botón de la IA.");
    }
  };

  const handleEndConversation = () => {
    // When conversation ends, navigate to home
    if (conversationIdRef.current) {
      // Update the database with the current state
      supabase
        .from('conversations')
        .update({ 
          ended_at: new Date().toISOString(),
          is_favorite: isFavorite,
          follow_up: isFollowUp
        })
        .eq('id', conversationIdRef.current)
        .then(({ error }) => {
          if (error) console.error('Error al finalizar conversación:', error);
          else {
            toast.success("Conversación finalizada");
            navigate('/');
          }
        });
    } else {
      navigate('/');
    }
  };
  
  const handleSelectOption = (option: {emoji: string, text: string}) => {
    toast.success(`Seleccionaste: ${option.text}`);
    // Here you could implement additional logic to save the selection or move to the next topic
    handleNextTopic();
  };

  return {
    handleNewTopic,
    handleNextTopic,
    handleEndConversation,
    handleSelectOption
  };
};
