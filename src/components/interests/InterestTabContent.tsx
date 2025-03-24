
import React from 'react';
import { toast } from 'sonner';
import AiAnalysisPersonal from '@/components/AiAnalysisPersonal';
import ProfileInfoTab from '@/components/ProfileInfoTab';
import { InterestTab } from '@/utils/interestUtils';

// Define TabData type directly since it's not exported from interestUtils
type TabData = InterestTab;

interface InterestTabContentProps {
  currentTabIndex: number;
  personalNote: string;
  onPersonalNoteChange: (note: string) => void;
  aiAnalysis?: string;
  onAiAnalysisChange: (analysis: string) => void;
  profileData: {
    name: string;
    email: string;
    instagram: string;
    twitter: string;
    facebook: string;
  };
  onProfileDataChange: (data: {
    name?: string;
    email?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  }) => void;
  tabData: TabData | null;
  selectedInterests: string[];
  avoidInterests: string[];
  onToggleInterest: (interestId: string, isAvoid: boolean) => void;
  userId: string | null;
}

const InterestTabContent: React.FC<InterestTabContentProps> = ({
  currentTabIndex,
  personalNote,
  onPersonalNoteChange,
  aiAnalysis,
  onAiAnalysisChange,
  profileData,
  onProfileDataChange,
  tabData,
  selectedInterests,
  avoidInterests,
  onToggleInterest,
  userId
}) => {
  // Pestaña de Perfil personal
  if (currentTabIndex === 0) {
    return (
      <div className="p-2">
        <ProfileInfoTab
          personalNote={personalNote}
          onPersonalNoteChange={onPersonalNoteChange}
          profileData={profileData}
          onProfileDataChange={onProfileDataChange}
        />
      </div>
    );
  }

  // Pestaña de análisis de IA
  if (tabData && tabData.categories.some(cat => cat.categoryId === 'externalAnalysis')) {
    return (
      <div className="p-2">
        {userId && (
          <AiAnalysisPersonal
            userId={userId}
            currentAnalysis={aiAnalysis || ''}
          />
        )}
      </div>
    );
  }

  // Procesamos la pestaña de intereses normal
  if (!tabData) {
    return <p>Selecciona una pestaña para ver su contenido</p>;
  }

  const getInterestsByCategory = (categoryId: string) => {
    // Solo devuelve los intereses para la categoría actual
    const currentCategory = tabData.categories.find(cat => cat.categoryId === categoryId);
    if (!currentCategory) return [];

    return currentCategory.interests.map(interest => ({
      id: interest.id,
      isSelected: categoryId === 'avoid'
        ? avoidInterests.includes(interest.id)
        : selectedInterests.includes(interest.id),
      label: interest.label
    }));
  };

  const handleInterestClick = (interestId: string, categoryId: string) => {
    const isAvoid = categoryId === 'avoid';
    onToggleInterest(interestId, isAvoid);
    
    // Como feedback visual
    if (isAvoid) {
      toast.info(`${avoidInterests.includes(interestId) ? 'Dejando de evitar' : 'Evitando'} "${getInterestLabel(interestId)}"`);
    } else {
      toast.info(`${selectedInterests.includes(interestId) ? 'Quitando' : 'Añadiendo'} "${getInterestLabel(interestId)}"`);
    }
  };
  
  const getInterestLabel = (interestId: string): string => {
    // Buscar en todas las categorías
    for (const category of tabData.categories) {
      const interest = category.interests.find(int => int.id === interestId);
      if (interest) return interest.label;
    }
    return 'Interés';
  };

  return (
    <div className="p-2 space-y-4">
      <h2 className="text-2xl font-semibold mb-4">{tabData.label}</h2>
      
      {tabData.categories.map((category) => (
        <div key={category.categoryId} className="mb-6">
          <h3 className="text-xl font-medium mb-2">{category.label}</h3>
          
          <div className="flex flex-wrap gap-2">
            {getInterestsByCategory(category.categoryId).map((interest) => (
              <button
                key={interest.id}
                onClick={() => handleInterestClick(interest.id, category.categoryId)}
                className={`px-3 py-1.5 border rounded-md cursor-pointer transition-colors
                  ${interest.isSelected
                    ? 'bg-chelas-yellow text-black'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
              >
                {interest.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InterestTabContent;
