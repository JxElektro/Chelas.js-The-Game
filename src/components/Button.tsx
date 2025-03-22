
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'win95-button select-none focus:outline-none inline-flex items-center justify-center font-ms-sans transition-shadow';
  
  const variantClasses = {
    default: 'bg-chelas-button-face text-chelas-button-text',
    primary: 'bg-chelas-yellow text-chelas-black border-chelas-button-shadow',
    ghost: 'bg-transparent border-0 shadow-none hover:bg-chelas-button-face/50',
    outline: 'bg-transparent text-chelas-button-face border-chelas-button-face',
    link: 'bg-transparent border-0 shadow-none underline text-chelas-yellow hover:text-chelas-yellow/80',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-4 py-1',
    lg: 'text-base px-6 py-2',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
