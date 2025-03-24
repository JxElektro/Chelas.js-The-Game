
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
  const navigate = useNavigate();
  const [notes, setNotes] = useState<string>('');

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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  return (
    <div 
      className="min-h-screen w-full bg-chelas-black noise-bg relative p-4 md:p-6 lg:p-8"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <h1 className="text-chelas-yellow text-9xl font-pixel tracking-tighter">JS</h1>
      </div>
      
      <div className="relative z-20 flex flex-col items-center w-full max-w-5xl mx-auto">
        {/* Contenedor principal con estilo similar al Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col min-h-[85vh] w-full`}
        >
          {/* Ventana principal de la conversación */}
          <WindowFrame
            title={`Chat con ${otherUserProfile.name || 'Usuario'}`}
            onClose={() => navigate('/')}
            className="w-full h-full mb-4"
          >
            <div className="flex flex-col h-full">
              {/* Área scrolleable para el contenido principal */}
              <ScrollArea className="flex-1 pr-2 pb-2 overflow-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
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
                    isFavorite={isFavorite}
                    isFollowUp={isFollowUp}
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
          
          {/* Ventana para las notas */}
          <WindowFrame
            title="NOTAS DE LA CONVERSACIÓN"
            className="w-full"
          >
            <div className="p-2">
              <Textarea
                placeholder="Escribe tus notas sobre esta conversación aquí..."
                className="win95-inset bg-white w-full min-h-[100px] text-black text-sm"
                value={notes}
                onChange={handleNotesChange}
              />
            </div>
          </WindowFrame>
        </motion.div>
      </div>
    </div>
  );
};

export default Conversation;
