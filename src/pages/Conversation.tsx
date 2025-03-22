
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

// Mock user data for demo
const mockUsers = {
  '1': { id: '1', name: 'John', avatar: 'tech' as AvatarType, interests: ['javascript', 'react', 'node'] },
  '2': { id: '2', name: 'Sara', avatar: 'code' as AvatarType, interests: ['typescript', 'webdev', 'ai'] },
  '3': { id: '3', name: 'Mike', avatar: 'coffee' as AvatarType, interests: ['frontend', 'design', 'ux'] },
  '4': { id: '4', name: 'Emily', avatar: 'smile' as AvatarType, interests: ['data', 'ai', 'cloud'] },
  '5': { id: '5', name: 'David', avatar: 'gaming' as AvatarType, interests: ['games', 'backend', 'typescript'] },
  '6': { id: '6', name: 'Alex', avatar: 'music' as AvatarType, interests: ['mobile', 'design', 'frontend'] },
};

const Conversation = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState('');
  
  // In a real app, this would be the actual logged-in user's data from Supabase
  const currentUser = {
    id: '7',
    name: 'You',
    avatar: 'user' as AvatarType,
    interests: ['javascript', 'react', 'webdev'],
    avoidTopics: ['politics', 'religion']
  };
  
  const otherUser = userId ? mockUsers[userId as keyof typeof mockUsers] : null;

  useEffect(() => {
    if (!otherUser) {
      navigate('/lobby');
      return;
    }

    const generateTopic = async () => {
      setIsLoading(true);
      try {
        // In a real app we would use the DeepSeek API
        // const newTopic = await generateConversationTopic({
        //   userAInterests: currentUser.interests,
        //   userBInterests: otherUser.interests,
        //   avoidTopics: currentUser.avoidTopics
        // });
        
        // For demo purposes, use the mock function
        const newTopic = generateMockTopic();
        
        // Simulating API delay
        setTimeout(() => {
          setTopic(newTopic);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error generating topic:', error);
        setTopic("What's your favorite part of JavaScript development?");
        setIsLoading(false);
      }
    };

    generateTopic();
  }, [otherUser, userId, navigate]);

  const handleNewTopic = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTopic(generateMockTopic());
      setIsLoading(false);
    }, 1500);
  };

  const handleTimeUp = () => {
    // In a real app, we would update the conversation status in Supabase
    console.log('Time up!');
  };

  const handleEndConversation = () => {
    // In a real app, we would update the conversation status in Supabase
    navigate('/lobby');
  };

  if (!otherUser) return null;

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
          Back to Lobby
        </Button>

        <WindowFrame title="CONVERSATION PARTNER" className="mb-6">
          <div className="flex items-center">
            <Avatar type={otherUser.avatar} size="lg" />
            <div className="ml-4">
              <h2 className="text-black text-lg font-bold">{otherUser.name}</h2>
              <p className="text-sm text-chelas-gray-dark">
                Use the topic below to start a conversation!
              </p>
            </div>
          </div>
        </WindowFrame>

        <Timer 
          initialMinutes={3} 
          onTimeUp={handleTimeUp}
          onExtend={() => console.log('Extended time')}
        />

        <ConversationPrompt prompt={topic} isLoading={isLoading} />

        <div className="flex justify-center gap-3 mt-auto">
          <Button 
            variant="default"
            onClick={handleNewTopic}
            disabled={isLoading}
          >
            <RefreshCw size={16} className="mr-1" />
            New Topic
          </Button>
          
          <Button 
            variant="primary"
            onClick={handleEndConversation}
          >
            <X size={16} className="mr-1" />
            End Chat
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Conversation;
