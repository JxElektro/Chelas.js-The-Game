
import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (index: number) => void;
  children?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col w-full">
      {/* Panel de pestañas horizontal al estilo Windows */}
      <div className="flex border-b border-chelas-gray-dark overflow-x-auto no-scrollbar">
        {tabs.map((label, i) => {
          const isActive = i === activeTab;
          return (
            <motion.button
              key={label}
              onClick={() => onChange(i)}
              className={`
                ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}
                text-center
                text-black
                border-l border-r border-t border-chelas-gray-dark
                ${isActive ? 
                  'bg-chelas-button-face font-bold -mb-[1px] border-b border-b-chelas-button-face' : 
                  'bg-chelas-gray-light'
                }
                ${i > 0 ? '-ml-[1px]' : ''}
                rounded-t-sm
                transition-colors
                whitespace-nowrap
              `}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </motion.button>
          );
        })}
      </div>
      
      {/* Contenedor para el contenido de la pestaña activa */}
      <div className="bg-chelas-button-face border-x border-b border-chelas-gray-dark p-2 sm:p-4">
        {children}
      </div>
    </div>
  );
};

export default Tabs;
