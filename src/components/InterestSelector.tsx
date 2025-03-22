
import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';

interface InterestOption {
  id: string;
  label: string;
}

interface InterestSelectorProps {
  title: string;
  options: InterestOption[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
  title,
  options,
  selectedOptions,
  onChange,
  maxSelections = 5
}) => {
  const handleToggle = (id: string) => {
    if (selectedOptions.includes(id)) {
      onChange(selectedOptions.filter(option => option !== id));
    } else if (selectedOptions.length < maxSelections) {
      onChange([...selectedOptions, id]);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-white">{title}</h3>
        <span className="text-xs text-chelas-gray-light">
          {selectedOptions.length}/{maxSelections}
        </span>
      </div>
      
      <div className="win95-inset p-2 h-40 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  p-2 cursor-pointer flex items-center 
                  ${isSelected ? 'bg-chelas-yellow text-black' : 'bg-chelas-button-face text-black'}
                  border-2 shadow-win95-button
                `}
                onClick={() => handleToggle(option.id)}
              >
                <div className="w-5 h-5 mr-2 flex-shrink-0 bg-white border-2 border-chelas-gray-dark flex items-center justify-center">
                  {isSelected && <Check size={14} />}
                </div>
                <span className="text-sm truncate">{option.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterestSelector;
