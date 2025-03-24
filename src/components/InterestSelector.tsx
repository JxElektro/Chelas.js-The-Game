
import React, { useState, useRef, useEffect } from 'react';
import { Check, Search, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { InterestOption, TopicCategory } from '@/types/supabase';

interface InterestSelectorProps {
  title: string;
  options: InterestOption[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  onCustomInterestSubmit?: (interest: string) => void;
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
  maxSelections = 5,
  onCustomInterestSubmit
}) => {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
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

  // Filtrar opciones por búsqueda
  const filteredOptions = searchQuery 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (activeCategory ? optionsByCategory[activeCategory] : options);

  const handleToggle = (id: string) => {
    if (selectedOptions.includes(id)) {
      onChange(selectedOptions.filter(option => option !== id));
    } else if (selectedOptions.length < maxSelections) {
      onChange([...selectedOptions, id]);
    }
  };

  const handleCustomInterestSubmit = () => {
    if (customInterest.trim() && onCustomInterestSubmit) {
      onCustomInterestSubmit(customInterest.trim());
      setCustomInterest('');
    }
  };

  // Calcular altura según el modo de visualización
  const getContentHeight = () => {
    if (isMobile) {
      return expandedView ? '300px' : '180px';
    }
    return expandedView ? '500px' : '240px';
  };

  return (
    <div className="mb-4 bg-chelas-gray-dark/20 p-2 rounded-md border border-chelas-gray-dark">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} text-white font-medium`}>{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-chelas-gray-light">
            {selectedOptions.length}/{maxSelections}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpandedView(!expandedView)}
            className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} p-0`}
          >
            {expandedView ? <ChevronUp size={isMobile ? 12 : 16} /> : <ChevronDown size={isMobile ? 12 : 16} />}
          </Button>
        </div>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="relative mb-2">
        <Search size={isMobile ? 12 : 16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-chelas-gray-light" />
        <input
          type="text"
          placeholder="Buscar intereses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full bg-chelas-button-face pl-7 pr-4 ${isMobile ? 'py-0.5 text-xs' : 'py-1 text-sm'} text-black border-2 border-chelas-gray-dark`}
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchQuery('')}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'} p-0`}
          >
            <X size={isMobile ? 10 : 14} />
          </Button>
        )}
      </div>
      
      {/* Selector de categorías */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto">
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className={`
                ${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'} rounded-sm flex items-center gap-1
                ${activeCategory === category ? 'bg-chelas-yellow text-black' : 'bg-chelas-button-face text-black'}
              `}
            >
              <Tag size={isMobile ? 8 : 12} />
              {categoryNames[category] || category}
            </button>
          ))}
        </div>
      )}
      
      {/* Lista de intereses */}
      <div 
        className="win95-inset bg-white p-2 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: getContentHeight() }}
      >
        <ScrollArea ref={scrollAreaRef} className="h-full pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              
              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    p-1.5 cursor-pointer flex items-center gap-2
                    ${isSelected ? 'bg-chelas-yellow/20 text-black' : 'bg-chelas-button-face text-black'}
                    border border-chelas-gray-dark shadow-win95-button rounded-sm
                  `}
                  onClick={() => handleToggle(option.id)}
                >
                  <Checkbox 
                    id={`interest-${option.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option.id)}
                    className="data-[state=checked]:bg-chelas-yellow data-[state=checked]:text-black border-chelas-gray-dark"
                  />
                  <Label 
                    htmlFor={`interest-${option.id}`} 
                    className={`${isMobile ? 'text-xs' : 'text-sm'} truncate cursor-pointer flex-1 text-black`}
                  >
                    {option.label}
                  </Label>
                </motion.div>
              );
            })}
          </div>
          
          {/* Sección para añadir interés personalizado */}
          {onCustomInterestSubmit && expandedView && (
            <div className="mt-4 border-t border-chelas-gray-light pt-4">
              <h4 className={`${isMobile ? 'text-xs' : 'text-sm'} text-black mb-2`}>¿No encuentras lo que buscas? Añade un interés personalizado:</h4>
              <div className="flex gap-2">
                <Textarea
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Escribe un interés personalizado..."
                  className={`${isMobile ? 'text-xs' : 'text-sm'} min-h-[60px] border-chelas-gray-dark`}
                />
                <Button 
                  onClick={handleCustomInterestSubmit}
                  disabled={!customInterest.trim() || selectedOptions.length >= maxSelections}
                  className="h-full"
                >
                  Añadir
                </Button>
              </div>
              {selectedOptions.length >= maxSelections && (
                <p className="text-xs text-red-500 mt-1">
                  Has alcanzado el máximo de selecciones permitidas.
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default InterestSelector;
