
import React from 'react';
import { X, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Combina las clases si deseas usar "className" extra
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface WindowFrameProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
}

const WindowFrame: React.FC<WindowFrameProps> = ({
  title,
  children,
  onClose,
  onMinimize,
  className = "",
}) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      // 1) Hacemos que sea flex y ocupe todo el espacio asignado
      // 2) min-h-0 permite que el contenido interno (children) pueda scrollear
      className={cn(
        "win95-window w-full flex flex-col h-full min-h-0",
        className
      )}
    >
      {/* Barra de título */}
      <div className="win95-window-title select-none flex items-center justify-between flex-shrink-0">
        <div className={cn("text-sm font-bold tracking-tight", isMobile ? "py-0.5 text-xs" : "")}>
          {title}
        </div>
        <div className="flex items-center">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className={cn(
                "win95-button h-5 w-5 flex items-center justify-center p-0 bg-chelas-button-face mr-1",
                isMobile ? "h-6 w-6" : ""
              )}
              aria-label="Minimize window"
            >
              <Minus size={isMobile ? 14 : 14} strokeWidth={2.5} className="text-black" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "win95-button h-5 w-5 flex items-center justify-center p-0 bg-chelas-button-face",
                isMobile ? "h-6 w-6" : ""
              )}
              aria-label="Close window"
            >
              <X size={isMobile ? 14 : 14} strokeWidth={2.5} className="text-black" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal - optimizado para móvil */}
      <div className={cn(
        "flex-grow min-h-0 overflow-hidden flex flex-col",
        isMobile ? "p-0 sm:p-1" : "p-2"
      )}>
        {children}
      </div>
    </motion.div>
  );
};

export default WindowFrame;
