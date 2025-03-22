
import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, Plus } from 'lucide-react';
import Button from './Button';
import { motion } from 'framer-motion';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';

interface TimerProps {
  initialMinutes?: number;
  onTimeUp?: () => void;
  onExtend?: () => void;
  autoStart?: boolean;
  isLoading?: boolean;
}

const Timer: React.FC<TimerProps> = ({
  initialMinutes = 3,
  onTimeUp,
  onExtend,
  autoStart = false,
  isLoading = false
}) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isBlinking, setIsBlinking] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Reset timer when autoStart changes
  useEffect(() => {
    if (autoStart && !isRunning) {
      setIsRunning(true);
      setSeconds(initialMinutes * 60);
    }
  }, [autoStart, initialMinutes]);

  // Loading animation effect
  useEffect(() => {
    if (isLoading) {
      const duration = 8000; // 8 seconds
      const increment = 100 / (duration / 100); // Calculate increment per 100ms
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const newValue = prev + increment;
          return newValue >= 100 ? 100 : newValue;
        });
      }, 100);

      return () => {
        clearInterval(interval);
        setLoadingProgress(0);
      };
    }
  }, [isLoading]);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      if (seconds <= 0 && isRunning) {
        onTimeUp?.();
      }
      
      if (seconds <= 0) {
        setIsRunning(false);
      }
      
      return;
    }

    if (seconds <= 30 && !isBlinking) {
      setIsBlinking(true);
    }

    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);

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
        <div className="win95-inset flex items-center justify-center py-2 mb-2">
          {isLoading ? (
            <div className="w-full px-2">
              <Progress 
                value={loadingProgress} 
                className="h-4 bg-chelas-gray-light" 
              >
                <div className="h-full bg-[#33C3F0]" />
              </Progress>
            </div>
          ) : (
            <motion.div
              animate={isBlinking ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
              transition={isBlinking ? { repeat: Infinity, duration: 1 } : {}}
            >
              <span className={`font-pixel text-lg ${seconds <= 30 ? 'text-red-500' : 'text-black'}`}>
                {formatTime()}
              </span>
            </motion.div>
          )}
        </div>

        <div className="bg-chelas-gray-dark border-2 border-inset h-4 mb-3">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'tween' }}
            className="h-full bg-chelas-yellow"
          />
        </div>

        <div className="flex justify-between">
          {!isRunning && !autoStart && !isLoading && (
            <Button
              variant="primary"
              className="text-xs"
              onClick={() => setIsRunning(true)}
            >
              Iniciar
            </Button>
          )}
          <Button
            variant="primary"
            className="text-xs ml-auto"
            onClick={extendTime}
            disabled={!isRunning || isLoading}
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
