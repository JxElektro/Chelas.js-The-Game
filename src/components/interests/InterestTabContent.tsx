
import React from 'react';
import { SubInterest, Category } from '@/utils/interestUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import AiAnalysisUnified from '@/components/AiAnalysisUnified';
import ProfileInfoTab from '@/components/ProfileInfoTab';

interface InterestTabContentProps {
  currentTabIndex: number;
  personalNote: string;
  onPersonalNoteChange: (note: string) => void;
  aiAnalysis: string | undefined;
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
  tabData: any;
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
  const isMobile = useIsMobile();

  // Si es la primera pestaña (info de perfil)
  if (currentTabIndex === 0) {
    return (
      <ProfileInfoTab 
        profileData={profileData} 
        onProfileDataChange={onProfileDataChange}
        personalNote={personalNote}
        onPersonalNoteChange={onPersonalNoteChange}
      />
    );
  }

  if (!tabData) return null;

  // Si es la pestaña "Sobre Mí", mostraremos la info del prompt para ChatGPT
  const isAboutMeTab = tabData.categories.some(
    (cat: Category) => cat.categoryId === 'personalInfo'
  );

  // Ya no mostramos la tab de opciones avanzadas IA, la omitimos completamente
  const isAiTab = tabData.categories.some(
    (cat: Category) => cat.categoryId === 'externalAnalysis'
  );

  if (isAiTab) {
    // Esta pestaña ya no es necesaria
    return null;
  }

  if (isAboutMeTab) {
    // Mostramos la sección "Sobre Mí" con el botón para copiar el prompt
    return (
      <div className="p-2">
        <div className="space-y-4">
          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-black mb-2`}>
            Descripción personal
          </h3>
          <textarea
            value={personalNote}
            onChange={(e) => onPersonalNoteChange(e.target.value)}
            className="win95-inset w-full min-h-[120px] p-2 bg-white text-black text-sm"
            placeholder="Cuéntanos un poco sobre ti..."
          />
          
          {aiAnalysis && (
            <div className="mt-4">
              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-black mb-2`}>
                Prompt para ChatGPT
              </h3>
              <div className="relative">
                <div className="win95-inset p-2 bg-white text-black text-xs overflow-auto max-h-[150px]">
                  {aiAnalysis}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiAnalysis);
                    toast.success('Prompt copiado al portapapeles');
                  }}
                  className="win95-button absolute top-2 right-2 py-0.5 px-2 text-xs"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-black mt-1">
                Pega este texto en ChatGPT para obtener sugerencias personalizadas.
              </p>
            </div>
          )}

          <div className="mt-4">
            <AiAnalysisUnified
              mode="prompt"
              userId={userId || undefined}
              personalNote={personalNote}
              onPersonalNoteChange={onPersonalNoteChange}
              selectedInterests={selectedInterests.map(id => ({ id, label: id, category: 'other' }))}
              avoidTopics={avoidInterests.map(id => ({ id, label: id, category: 'avoid' }))}
              onSaveResponse={onAiAnalysisChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // De lo contrario, desplegamos las categorías y subInterests
  return (
    <div className="space-y-4">
      {tabData.categories.map((cat: Category) => {
        // Revisamos si es la categoría "avoid"
        const isAvoidCategory = cat.categoryId === 'avoid';

        return (
          <div key={cat.categoryId} className="bg-white border border-gray-300 p-2">
            <h3 className="text-sm font-bold text-black mb-2">{cat.label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cat.subInterests?.map((sub: SubInterest) => {
                // Si es "avoid", lo buscamos en avoidInterests
                const isSelected = isAvoidCategory
                  ? avoidInterests.includes(sub.id)
                  : selectedInterests.includes(sub.id);

                return (
                  <div
                    key={sub.id}
                    onClick={() => onToggleInterest(sub.id, isAvoidCategory)}
                    className={`cursor-pointer flex items-center gap-2 border border-chelas-gray-dark p-2 ${
                      isSelected ? 'bg-chelas-yellow/20' : 'bg-chelas-button-face'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleInterest(sub.id, isAvoidCategory)}
                      className="text-black"
                    />
                    <span className="text-sm text-black">{sub.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InterestTabContent;
