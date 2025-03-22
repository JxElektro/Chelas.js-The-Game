
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import Avatar, { AvatarType } from '@/components/Avatar';
import UserList from '@/components/UserList';
import { UserCog, Users, Power, Wifi, WifiOff } from 'lucide-react';

// Mock user data - in a real app, this would come from Supabase
const mockUsers = [
  { id: '1', name: 'John', avatar: 'tech' as AvatarType, isAvailable: true },
  { id: '2', name: 'Sara', avatar: 'code' as AvatarType, isAvailable: true },
  { id: '3', name: 'Mike', avatar: 'coffee' as AvatarType, isAvailable: false },
  { id: '4', name: 'Emily', avatar: 'smile' as AvatarType, isAvailable: true },
  { id: '5', name: 'David', avatar: 'gaming' as AvatarType, isAvailable: true },
  { id: '6', name: 'Alex', avatar: 'music' as AvatarType, isAvailable: true },
];

const Lobby = () => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  const [users, setUsers] = useState(mockUsers);
  
  // In a real app, this would be the actual logged-in user's ID
  const currentUserId = '7';
  const currentUser = {
    id: currentUserId,
    name: 'You',
    avatar: 'user' as AvatarType,
    isAvailable: isAvailable
  };

  const handleStatusToggle = () => {
    setIsAvailable(!isAvailable);
  };

  const handleSelectUser = (userId: string) => {
    // In a real app, this would create a conversation in Supabase
    console.log('Starting conversation with user:', userId);
    navigate(`/conversation/${userId}`);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col min-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-chelas-yellow text-2xl">Welcome!</h1>
          <Button
            variant={isAvailable ? 'primary' : 'default'}
            onClick={handleStatusToggle}
            className="flex items-center"
          >
            {isAvailable ? (
              <>
                <Wifi size={16} className="mr-1" />
                Available
              </>
            ) : (
              <>
                <WifiOff size={16} className="mr-1" />
                Unavailable
              </>
            )}
          </Button>
        </div>

        <WindowFrame title="YOUR PROFILE" className="mb-6">
          <div className="flex items-center">
            <Avatar type={currentUser.avatar} size="lg" />
            <div className="ml-4">
              <h2 className="text-black text-lg font-bold">{currentUser.name}</h2>
              <p className="text-sm text-chelas-gray-dark">
                Status: {isAvailable ? 'Available to chat' : 'Not available'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate('/interests')}
            >
              <UserCog size={14} className="mr-1" />
              Preferences
            </Button>
          </div>
        </WindowFrame>

        <WindowFrame title="AVAILABLE PEOPLE" className="flex-grow mb-4">
          <p className="text-sm text-black mb-3">
            These people are available to chat right now:
          </p>
          
          <UserList 
            users={[...users, currentUser]} 
            onSelectUser={handleSelectUser}
            currentUserId={currentUserId}
          />
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Lobby;
