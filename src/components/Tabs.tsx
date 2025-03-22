import React from 'react';
import { motion } from 'framer-motion';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex overflow-x-auto border-b border-chelas-gray-dark">
      {tabs.map((label, i) => {
        const isActive = i === activeTab;
        return (
          <motion.button
            key={label}
            onClick={() => onChange(i)}
            className={`
              px-4 py-2 
              whitespace-nowrap
              text-black
              ${isActive ? 'bg-chelas-gray-light font-bold' : 'bg-chelas-gray-medium'}
              border-r border-chelas-gray-dark
              shadow-win95-button 
              hover:bg-chelas-button-face
              transition-colors
            `}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default Tabs;
