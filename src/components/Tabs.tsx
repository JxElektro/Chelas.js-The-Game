
import React from 'react';
import { motion } from 'framer-motion';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
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
                px-4 py-2
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
      <div className="bg-chelas-button-face border-x border-b border-chelas-gray-dark p-4">
        {/* El contenido de la pestaña se mostrará aquí */}
      </div>
    </div>
  );
};

export default Tabs;
