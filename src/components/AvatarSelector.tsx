
import React, { useState } from 'react';
import Avatar, { AvatarType } from './Avatar';
import { motion } from 'framer-motion';

interface AvatarSelectorProps {
  onSelect: (type: AvatarType) => void;
  selectedAvatar?: AvatarType;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  onSelect, 
  selectedAvatar = 'user'
}) => {
  const avatarTypes: AvatarType[] = [
    'user', 'tech', 'coffee', 'gaming', 'code',
    'smile', 'music', 'rocket', 'zap', 'heart'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-5 gap-4 p-4 win95-inset mx-auto max-w-xs"
    >
      {avatarTypes.map((type) => (
        <motion.div
          key={type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Avatar
            type={type}
            selected={type === selectedAvatar}
            onClick={() => onSelect(type)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AvatarSelector;
