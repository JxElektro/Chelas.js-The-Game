
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useIsMobile } from '@/hooks/use-mobile';

interface InterestOption {
  id: string;
  label: string;
  category?: string;
}

interface InterestSelectorProps {
  title: string;
  options: InterestOption[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}

// Mapeo de categorías a nombres en español
const categoryNames: Record<string, string> = {
  tech: 'Tecnología',
  movies: 'Películas',
  music: 'Música',
  series_anime: 'Series y Anime',
  books: 'Libros',
  travel: 'Viajes',
  food: 'Gastronomía',
  sports: 'Deportes',
  art: 'Arte y Cultura',
  hobbies: 'Hobbies',
  trends: 'Actualidad',
  humor: 'Humor',
  other: 'Otros',
  avoid: 'Evitar'
};

const InterestSelector: React.FC<InterestSelectorProps> = ({
  title,
  options,
  selectedOptions,
  onChange,
  maxSelections = 5
}) => {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Agrupar opciones por categoría
  const optionsByCategory: Record<string, InterestOption[]> = {};
  options.forEach(option => {
    const category = option.category || 'other';
    if (!optionsByCategory[category]) {
      optionsByCategory[category] = [];
    }
    optionsByCategory[category].push(option);
  });

  // Obtener categorías disponibles
  const availableCategories = Object.keys(optionsByCategory).sort();

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
      
      {/* Selector de categorías */}
      <div className="flex flex-wrap gap-1 mb-2">
        {availableCategories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(activeCategory === category ? null : category)}
            className={`
              text-xs px-2 py-1 rounded
              ${activeCategory === category ? 'bg-chelas-yellow text-black' : 'bg-chelas-button-face text-black'}
            `}
          >
            {categoryNames[category] || category}
          </button>
        ))}
      </div>
      
      <div className="win95-inset p-2 h-40 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(activeCategory ? optionsByCategory[activeCategory] : options).map((option) => {
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
