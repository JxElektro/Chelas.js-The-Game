
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import WindowFrame from '@/components/WindowFrame';
import ConversationHeader from '@/components/conversation/ConversationHeader';
import ConversationMatch from '@/components/conversation/ConversationMatch';
import ConversationTopicDisplay from '@/components/conversation/ConversationTopicDisplay';
import { useConversation } from '@/hooks/useConversation';
import { useIsMobile } from '@/hooks/use-mobile';

const BOT_ID = '00000000-0000-0000-0000-000000000000';

const Conversation = () => {
  const { userId } = useParams<{ userId: string }>();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<string>('');

  // Extraemos variables y funciones del hook de conversación.
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
    handleSelectOption,
    getCurrentTopic,
  } = useConversation(userId);

  // Si aún no se cargó el perfil del otro usuario, no se renderiza.
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
      {/* Fondo decorativo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <h1 className="text-chelas-yellow text-9xl font-pixel tracking-tighter">JS</h1>
      </div>
      
      <div className="relative z-20 flex flex-col items-center w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col min-h-[85vh] w-full"
        >
          {/* Ventana principal de la conversación */}
          <WindowFrame
            title={`Chat con ${otherUserProfile.name || 'Usuario'}`}
            onClose={() => navigate('/')}
            className="w-full h-full mb-4"
          >
            <div className="flex flex-col h-full">
              {/* Área scrolleable para el contenido principal */}
              <ScrollArea 
                className="flex-1 overflow-auto" 
                style={{ maxHeight: 'calc(100vh - 150px)' }}
              >
                {/* Información del compañero de conversación */}
                <ConversationHeader
                  otherUserProfile={otherUserProfile}
                  isFavorite={isFavorite}
                  isFollowUp={isFollowUp}
                  toggleFavorite={toggleFavorite}
                  toggleFollowUp={toggleFollowUp}
                  handleEndConversation={handleEndConversation}
                />

                {matchPercentage > 0 && (
                  <div className="px-3 mb-4">
                    <ConversationMatch
                      percentage={matchPercentage}
                      matchCount={matchCount}
                      isFavorite={isFavorite}
                      isFollowUp={isFollowUp}
                    />
                  </div>
                )}

                {/* Tema de conversación */}
                <div className="px-3 mb-6">
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
                    handleNewTopic={handleNewTopic}
                  />
                </div>
                
                {/* Integración de las notas dentro de la misma ventana */}
                <div className="px-3 mt-6 mb-4">
                  <div className="mb-2 text-xs font-bold tracking-tight text-black">NOTAS DE LA CONVERSACIÓN</div>
                  <Textarea
                    placeholder="Escribe tus notas sobre esta conversación aquí..."
                    className="win95-inset bg-white w-full min-h-[100px] text-black text-sm"
                    value={notes}
                    onChange={handleNotesChange}
                  />
                </div>
              </ScrollArea>
            </div>
          </WindowFrame>
        </motion.div>
      </div>
    </div>
  );
};

export default Conversation;
