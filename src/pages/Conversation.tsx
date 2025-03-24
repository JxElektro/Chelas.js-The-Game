import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import WindowFrame from '@/components/WindowFrame';
import ConversationHeader from '@/components/conversation/ConversationHeader';
import ConversationMatch from '@/components/conversation/ConversationMatch';
import ConversationTopicDisplay from '@/components/conversation/ConversationTopicDisplay';
import ConversationActions from '@/components/conversation/ConversationActions';
import { useConversation } from '@/hooks/useConversation';
import { useIsMobile } from '@/hooks/use-mobile';

const BOT_ID = '00000000-0000-0000-0000-000000000000';

const Conversation = () => {
  const { userId } = useParams<{ userId: string }>();
  const isMobile = useIsMobile();

  // Extraemos las variables y funciones del hook useConversation
  const {
    isLoading,
    topics,
    topicsWithOptions,
    currentTopicIndex,
    setCurrentTopicIndex,
    otherUserProfile,
    matchPercentage,
    matchCount,
    showAllTopics,
    setShowAllTopics,
    useTopicsWithOptions,
    isFavorite,
    toggleFavorite,
    isFollowUp,
    toggleFollowUp,
    handleEndConversation,
    handleNewTopic,
    handleNextTopic,
    handleSelectOption,
    getCurrentTopic,
  } = useConversation(userId);

  // Si no se cargó el perfil del otro usuario, no renderizamos nada
  if (!otherUserProfile) return null;

  return (
    <Layout>
      {/* Contenedor principal: se ajusta el padding según si es móvil o desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col min-h-[90vh] w-full ${isMobile ? 'px-2' : 'px-6'}`}
      >
        {/* Ventana con el título del chat */}
        <WindowFrame
          title={`Chat con ${otherUserProfile.name || 'Usuario'}`}
          onClose={handleEndConversation}
          className="w-full h-full"
        >
          <div className="flex flex-col h-full">
            {/* Área scrolleable para el contenido principal */}
            <ScrollArea className="flex-1 pr-2 pb-2">
              {/* Cabecera con datos del otro usuario y acciones (favorito, follow-up, etc.) */}
              <ConversationHeader
                otherUserProfile={otherUserProfile}
                isFavorite={isFavorite}
                isFollowUp={isFollowUp}
                toggleFavorite={toggleFavorite}
                toggleFollowUp={toggleFollowUp}
                handleEndConversation={handleEndConversation}
              />

              {/* Muestra el match si existe */}
              {matchPercentage > 0 && (
                <ConversationMatch
                  percentage={matchPercentage}
                  matchCount={matchCount}
                />
              )}

              {/* Sección de tema de conversación */}
              <div className="mt-4">
                <ConversationTopicDisplay
                  useTopicsWithOptions={useTopicsWithOptions}
                  getCurrentTopic={getCurrentTopic}
                  isLoading={isLoading}
                  handleSelectOption={handleSelectOption}
                  showAllTopics={showAllTopics}
                  setShowAllTopics={setShowAllTopics}
                  topicsWithOptions={topicsWithOptions}
                  topics={topics}
                  currentTopicIndex={currentTopicIndex}
                  setCurrentTopicIndex={setCurrentTopicIndex}
                />
              </div>
            </ScrollArea>

            {/* Acciones para avanzar en la conversación */}
            <div className="mt-4">
              <ConversationActions
                isLoading={isLoading}
                useTopicsWithOptions={useTopicsWithOptions}
                topicsWithOptions={topicsWithOptions}
                topics={topics}
                handleNextTopic={handleNextTopic}
                handleNewTopic={handleNewTopic}
                handleEndConversation={handleEndConversation}
              />
            </div>
          </div>
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Conversation;
