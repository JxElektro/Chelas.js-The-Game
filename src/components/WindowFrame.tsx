
import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

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
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`win95-window w-full ${className}`}
    >
      <div className="win95-window-title select-none">
        <div className="text-sm font-bold tracking-tight">{title}</div>
        {onClose && (
          <button 
            onClick={onClose}
            className="win95-button h-5 w-5 flex items-center justify-center p-0 text-black"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
};

export default WindowFrame;
