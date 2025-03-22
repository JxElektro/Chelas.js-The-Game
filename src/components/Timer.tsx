
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
  // Duración de la cuenta regresiva en modo conversación (en segundos)
  const conversationDuration = initialMinutes * 60;
  // Duración del modo loading: 16 segundos
  const loadingDuration = 16;

  // Definimos el modo actual: "conversation" o "loading"
  const [mode, setMode] = useState<"conversation" | "loading">(isLoading ? "loading" : "conversation");

  // Tiempo restante en modo conversación
  const [conversationTimeLeft, setConversationTimeLeft] = useState(conversationDuration);
  // Tiempo transcurrido en modo loading (para calcular el progreso)
  const [loadingElapsed, setLoadingElapsed] = useState(0);

  // Bandera para controlar si el temporizador de conversación está activo
  const [isRunning, setIsRunning] = useState(autoStart);
  // Estado para controlar el parpadeo cuando quedan pocos segundos
  const [isBlinking, setIsBlinking] = useState(false);

  // Al detectar cambios en la prop isLoading, cambiamos el modo
  useEffect(() => {
    if (isLoading) {
      // Si se activa el loading, cambiamos al modo loading y reiniciamos el contador de carga
      setMode("loading");
      setLoadingElapsed(0);
    } else {
      // Al finalizar el loading, volvemos al modo conversación sin modificar el tiempo restante
      setMode("conversation");
    }
  }, [isLoading]);

  // Efecto para actualizar el temporizador según el modo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (mode === "conversation" && isRunning) {
      // Modo conversación: actualizamos cada 1 segundo
      interval = setInterval(() => {
        setConversationTimeLeft(prev => {
          if (prev <= 1) {
            onTimeUp?.();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (mode === "loading") {
      // Modo loading: actualizamos cada 100ms para una animación más suave
      interval = setInterval(() => {
        setLoadingElapsed(prev => {
          if (prev >= loadingDuration) {
            // Cuando se completa el loading, se detiene en 16 segundos
            return loadingDuration;
          }
          // Se incrementa en 0.1 segundos (con precisión de un decimal)
          return +(prev + 0.1).toFixed(1);
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, isRunning, loadingDuration, onTimeUp]);

  // Activa el parpadeo en modo conversación cuando quedan 30 segundos o menos
  useEffect(() => {
    if (mode === "conversation" && conversationTimeLeft <= 30 && !isBlinking) {
      setIsBlinking(true);
    }
  }, [conversationTimeLeft, mode, isBlinking]);

  // Función para formatear el tiempo en mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para extender el tiempo en modo conversación
  const extendTime = () => {
    if (mode === "conversation") {
      setConversationTimeLeft(prev => prev + 60);
      setIsBlinking(false);
      onExtend?.();
    }
  };

  // Calculamos el porcentaje de progreso:
  // En modo conversación: cuanto queda de tiempo
  // En modo loading: cuánto se ha completado de 16 segundos
  const percentage = mode === "conversation"
    ? Math.max(0, (conversationTimeLeft / conversationDuration) * 100)
    : Math.min(100, (loadingElapsed / loadingDuration) * 100);

  // Generamos los segmentos de carga para el estilo Windows
  const renderWindowsLoadingSegments = () => {
    const totalSegments = 20;
    const filledSegments = Math.floor((percentage / 100) * totalSegments);
    
    return (
      <div className="flex w-full h-4 bg-white border border-gray-400">
        {Array.from({ length: totalSegments }).map((_, index) => (
          <div 
            key={index}
            className={`h-full w-[5%] ${index < filledSegments ? 'bg-blue-800' : 'bg-transparent'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="win95-window max-w-xs mx-auto mb-4">
      <div className="win95-window-title">
        <div className="flex items-center">
          <TimerIcon size={14} className="mr-1" />
          <span className="text-sm">
            {mode === "conversation" ? "Time Remaining" : "Loading..."}
          </span>
        </div>
      </div>
      <div className="p-3">
        {mode === "loading" ? (
          // Windows-style progress bar with blue segments
          <div className="mb-3">
            <div className="win95-inset p-2 mb-2">
              {renderWindowsLoadingSegments()}
            </div>
          </div>
        ) : (
          // Conversation mode showing time and yellow progress bar
          <>
            <div className="win95-inset flex items-center justify-center py-2 mb-2">
              <motion.div
                animate={isBlinking ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                transition={isBlinking ? { repeat: Infinity, duration: 1 } : {}}
              >
                <span className={`font-pixel text-lg ${conversationTimeLeft <= 30 ? 'text-red-500' : 'text-black'}`}>
                  {formatTime(conversationTimeLeft)}
                </span>
              </motion.div>
            </div>

            <div className="bg-chelas-gray-dark border-2 border-inset h-4 mb-3">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: 'tween' }}
                className="h-full bg-chelas-yellow"
              />
            </div>
          </>
        )}

        {mode === "conversation" && (
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
        )}
      </div>
    </div>
  );
};

export default Timer;
