
import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface WindowFrameProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ 
  title, 
  children, 
  onClose,
  className = ""
}) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`win95-window w-full ${className}`}
    >
      <div className="win95-window-title select-none flex items-center justify-between">
        <div className={`text-sm font-bold tracking-tight ${isMobile ? 'py-1' : ''}`}>{title}</div>
        {onClose && (
          <button 
            onClick={onClose}
            className={`win95-button h-5 w-5 flex items-center justify-center p-0 text-black ${isMobile ? 'h-6 w-6' : ''}`}
            aria-label="Close window"
          >
            <X size={isMobile ? 16 : 14} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className={`p-2 ${isMobile ? 'sm:p-4' : 'p-4'}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default WindowFrame;
