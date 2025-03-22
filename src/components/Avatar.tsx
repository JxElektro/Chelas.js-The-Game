
import React from 'react';
import { User, Monitor, Coffee, Gamepad2, Code, Smile, Music, Rocket, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export type AvatarType = 'user' | 'tech' | 'coffee' | 'gaming' | 'code' | 'smile' | 'music' | 'rocket' | 'zap' | 'heart';

interface AvatarProps {
  type: AvatarType;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
}

const avatarIcons: Record<AvatarType, React.ReactElement> = {
  user: <User />,
  tech: <Monitor />,
  coffee: <Coffee />,
  gaming: <Gamepad2 />,
  code: <Code />,
  smile: <Smile />,
  music: <Music />,
  rocket: <Rocket />,
  zap: <Zap />,
  heart: <Heart />
};

const Avatar: React.FC<AvatarProps> = ({ 
  type, 
  size = 'md',
  selected = false,
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };
  
  const iconSizes = {
    sm: { size: 16 },
    md: { size: 24 },
    lg: { size: 32 }
  };

  // Get the icon for the given type, or default to User if not found
  const icon = avatarIcons[type] || avatarIcons.user;
  
  // Clone the icon with appropriate size
  const sizedIcon = React.cloneElement(
    icon,
    iconSizes[size]
  );

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClasses[size]} 
        ${selected ? 'bg-chelas-yellow text-black' : 'bg-chelas-gray-medium text-black'} 
        ${onClick ? 'cursor-pointer' : ''}
        flex items-center justify-center rounded-none overflow-hidden
        border-2 border-chelas-gray-dark shadow-win95
      `}
      onClick={onClick}
    >
      {sizedIcon}
    </motion.div>
  );
};

export default Avatar;
