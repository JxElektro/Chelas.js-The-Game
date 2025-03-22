
import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, Plus, Minus } from 'lucide-react';
import Button from './Button';
import { motion } from 'framer-motion';

interface TimerProps {
  initialMinutes?: number;
  onTimeUp?: () => void;
  onExtend?: () => void;
}

const Timer: React.FC<TimerProps> = ({
  initialMinutes = 3,
  onTimeUp,
  onExtend
}) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    
    if (seconds <= 0) {
      onTimeUp?.();
      setIsRunning(false);
      return;
    }
    
    // Start blinking when less than 30 seconds remaining
    if (seconds <= 30 && !isBlinking) {
      setIsBlinking(true);
    }

    const timer = setTimeout(() => {
      setSeconds(s => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, isRunning, onTimeUp, isBlinking]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const extendTime = () => {
    setSeconds(s => s + 60);
    setIsBlinking(false);
    onExtend?.();
  };

  const percentage = Math.max(0, (seconds / (initialMinutes * 60)) * 100);

  return (
    <div className="win95-window max-w-xs mx-auto mb-4">
      <div className="win95-window-title">
        <div className="flex items-center">
          <TimerIcon size={14} className="mr-1" />
          <span className="text-sm">Time Remaining</span>
        </div>
      </div>
      <div className="p-3">
        <motion.div 
          animate={isBlinking ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={isBlinking ? { repeat: Infinity, duration: 1 } : {}}
          className="win95-inset flex items-center justify-center py-2 mb-2"
        >
          <span className={`font-pixel text-lg ${seconds <= 30 ? 'text-red-500' : 'text-black'}`}>
            {formatTime()}
          </span>
        </motion.div>
        
        <div className="bg-chelas-gray-dark border-2 border-inset h-4 mb-3">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'tween' }}
            className="h-full bg-chelas-yellow"
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="primary" 
            className="text-xs"
            onClick={extendTime}
            disabled={!isRunning}
          >
            <Plus size={14} className="mr-1" />
            Add 1 Min
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Timer;
