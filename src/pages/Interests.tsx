
import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import { useNavigate } from 'react-router-dom';
import Tabs from '@/components/Tabs';
import { interestTabs } from '@/utils/interestUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInterestsState } from '@/hooks/interests/useInterestsState';
import { useInterestsSave } from '@/hooks/interests/useInterestsSave';
import InterestActions from '@/components/interests/InterestActions';
import InterestTabContent from '@/components/interests/InterestTabContent';

const InterestsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Use our custom hooks
  const {
    currentTabIndex,
    setCurrentTabIndex,
    selectedInterests,
    setSelectedInterests,
    avoidInterests, 
    setAvoidInterests,
    personalNote,
    setPersonalNote,
    aiAnalysis,
    setAiAnalysis,
    loading,
    setLoading,
    isAdmin,
    userAuthenticated,
    profileId,
    superProfile,
    setSuperProfile,
    profileData,
    setProfileData
  } = useInterestsState();
  
  const { handleSave } = useInterestsSave();

  // Alternar selección al hacer clic
  const handleToggleInterest = (interestId: string, isAvoid: boolean) => {
    if (isAvoid) {
      setAvoidInterests((prev) =>
        prev.includes(interestId)
          ? prev.filter((id) => id !== interestId)
          : [...prev, interestId]
      );
    } else {
      setSelectedInterests((prev) =>
        prev.includes(interestId)
          ? prev.filter((id) => id !== interestId)
          : [...prev, interestId]
      );
    }
  };

  // Actualizar el análisis de ChatGPT
  const handleAiAnalysisChange = async (analysis: string) => {
    setAiAnalysis(analysis);
    
    // Si tenemos un SuperProfile, actualizamos el campo ia
    if (superProfile && profileId) {
      const updatedProfile = { ...superProfile };
      updatedProfile.cultura.tech.ia = analysis;
      setSuperProfile(updatedProfile);
    }
  };

  // Handle save function
  const onSave = async () => {
    await handleSave(
      profileId,
      selectedInterests,
      avoidInterests,
      aiAnalysis,
      personalNote,
      profileData,
      setLoading
    );
  };

  // Renderizado de la pestaña actual
  const renderCurrentTab = () => {
    // Ahora el índice corresponde directamente al array de interestTabs 
    const tabData = interestTabs[currentTabIndex];
    
    return (
      <InterestTabContent
        currentTabIndex={currentTabIndex}
        aiAnalysis={aiAnalysis}
        onAiAnalysisChange={handleAiAnalysisChange}
        tabData={tabData}
        selectedInterests={selectedInterests}
        avoidInterests={avoidInterests}
        onToggleInterest={handleToggleInterest}
        userId={profileId}
      />
    );
  };

  if (!userAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <p>Verificando sesión...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col w-full px-2 sm:px-6 md:px-8"
      >
        <div className="mx-auto w-full max-w-5xl mt-8 mb-12">
          {isAdmin && (
            <InterestActions 
              isAdmin={true}
              loading={loading}
              setLoading={setLoading}
              onSave={onSave}
              showSaveButtons={false}
            />
          )}

          <WindowFrame 
            title="PROPIEDADES DE INTERESES" 
            className="w-full mt-4 h-[80vh]" 
            onClose={() => navigate('/')}
            onMinimize={() => navigate('/')}
          >
            <div className="flex flex-col h-full">
              {/* Filtramos las pestañas para mostrar solo las categorías de interés */}
              <Tabs 
                tabs={interestTabs
                  .filter(tab => !tab.categories.some(cat => cat.categoryId === 'externalAnalysis'))
                  .map(tab => tab.label)} 
                activeTab={currentTabIndex} 
                onChange={setCurrentTabIndex}
              >
                {/* Contenido de la pestaña */}
                <div className={`${isMobile ? 'p-1' : 'p-2 sm:p-4'} flex-1 overflow-auto`}>
                  {loading ? (
                    <p className="text-sm text-black mb-4">Cargando...</p>
                  ) : (
                    <div className="win95-inset bg-white p-2 overflow-auto max-h-[60vh]">
                      {renderCurrentTab()}
                    </div>
                  )}
                </div>
              </Tabs>
              
              {/* Botones de guardar en la parte inferior */}
              <InterestActions 
                isAdmin={false}
                loading={loading}
                setLoading={setLoading}
                onSave={onSave}
                showSaveButtons={true}
              />
            </div>
          </WindowFrame>
        </div>
      </motion.div>
    </Layout>
  );
};

export default InterestsPage;

