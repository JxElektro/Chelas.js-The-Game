
import React from 'react';
import Avatar, { AvatarType } from './Avatar';
import Button from './Button';
import { User, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
  id: string;
  name: string;
  avatar: AvatarType;
  isAvailable: boolean;
}

interface UserListProps {
  users: UserData[];
  onSelectUser: (userId: string) => void;
  currentUserId?: string;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  onSelectUser, 
  currentUserId 
}) => {
  const availableUsers = users.filter(user => 
    user.isAvailable && user.id !== currentUserId
  );

  return (
    <div className="win95-inset py-2 px-1 max-h-64 overflow-y-auto">
      <AnimatePresence>
        {availableUsers.length > 0 ? (
          <motion.div className="space-y-2">
            {availableUsers.map((user) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center px-2 py-1 hover:bg-chelas-gray-medium"
              >
                <Avatar type={user.avatar} size="sm" />
                <span className="text-black ml-2 flex-grow">{user.name}</span>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onSelectUser(user.id)}
                  className="ml-2"
                >
                  <UserCheck size={12} className="mr-1" />
                  <span className="text-xs">Chat</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-4 text-chelas-gray-dark"
          >
            <User size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users available right now</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserList;
