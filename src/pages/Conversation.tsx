import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/hooks/useConversation';
import ConversationHeader from '@/components/conversation/ConversationHeader';
import ConversationTopicDisplay from '@/components/conversation/ConversationTopicDisplay';
import ConversationActions from '@/components/conversation/ConversationActions';
import ConversationNotes from '@/components/ConversationNotes';
import { useIsMobile } from '@/hooks/use-mobile';

const Conversation: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Hook personalizado para manejar la conversación
  const conversation = useConversation(userId);

  // Si no se tiene el perfil del otro usuario, se muestra un mensaje o se puede redireccionar
  if (!conversation.otherUserProfile) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p>No se encontró el perfil del otro usuario.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Cabecera de la conversación */}
      <ConversationHeader 
        otherUserProfile={conversation.otherUserProfile} 
        isFavorite={conversation.isFavorite}
        isFollowUp={conversation.isFollowUp}
        toggleFavorite={conversation.toggleFavorite}
        toggleFollowUp={conversation.toggleFollowUp}
        handleEndConversation={conversation.handleEndConversation}
      />

      {/* Contenedor principal de la conversación */}
      <div className="flex-grow overflow-auto p-4 win95-window">
        <ConversationTopicDisplay
          useTopicsWithOptions={conversation.useTopicsWithOptions}
          getCurrentTopic={conversation.getCurrentTopic}
          isLoading={conversation.isLoading}
          handleSelectOption={conversation.handleSelectOption}
          showAllTopics={conversation.showAllTopics}
          setShowAllTopics={conversation.setShowAllTopics}
          topicsWithOptions={conversation.topicsWithOptions}
          topics={conversation.topics}
          currentTopicIndex={conversation.currentTopicIndex}
          setCurrentTopicIndex={conversation.setCurrentTopicIndex}
          handleNewTopic={conversation.handleNewTopic}
        />

        {/* Mostrar las notas de la conversación si el ID está disponible */}
        {conversation.conversationIdRef.current && (
          <ConversationNotes conversationId={conversation.conversationIdRef.current} />
        )}
      </div>

      {/* Área de acciones de la conversación */}
      <div className="flex-shrink-0 mt-auto p-4 bg-chelas-button-face border-t-2 border-chelas-button-highlight">
        <ConversationActions
          isLoading={conversation.isLoading}
          useTopicsWithOptions={conversation.useTopicsWithOptions}
          topicsWithOptions={conversation.topicsWithOptions}
          topics={conversation.topics}
          handleNewTopic={conversation.handleNewTopic}
          handleEndConversation={conversation.handleEndConversation}
        />
      </div>
    </div>
  );
};

export default Conversation;
