
import React from 'react';
import { Percent } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatchPercentageProps {
  percentage: number;
  matchCount: number;
}

const MatchPercentage: React.FC<MatchPercentageProps> = ({ percentage, matchCount }) => {
  // Determinar color basado en el porcentaje
  const getColor = () => {
    if (percentage >= 70) return 'bg-green-600';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-blue-600';
  };

  return (
    <div className="mb-4 p-3 bg-chelas-window-bg border-2 shadow-win95">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-black font-bold text-sm">Coincidencia</h3>
        <div className="flex items-center bg-chelas-button-face px-2 py-1 rounded-sm shadow-win95-button">
          <Percent size={14} className="text-black mr-1" />
          <span className="text-black font-bold">{percentage}%</span>
        </div>
      </div>
      
      <div className="win95-inset bg-white p-1">
        <div className="relative h-5 w-full bg-chelas-gray-light">
          <motion.div 
            className={`h-full ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <p className="text-black text-xs mt-2">
        Tienen <strong>{matchCount} {matchCount === 1 ? 'tema' : 'temas'}</strong> en común
      </p>
    </div>
  );
};

export default MatchPercentage;
