
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/types/supabase';

interface InterestAiChatProps {
  initialMessage: string;
}

const InterestAiChat: React.FC<InterestAiChatProps> = ({ initialMessage }) => {
  const [showAIChat, setShowAIChat] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    const newConversation: ChatMessage[] = [
      ...conversation,
      { role: 'user', content: userMessage }
    ];
    setConversation(newConversation);
    setUserMessage('');
    
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'ai',
        content: `Basándome en lo que me cuentas, te sugiero explorar intereses como: "Fotografía de paisajes", "Ciencia de datos" o "Cocina asiática". ¿Alguno de estos te interesa?`
      };
      setConversation([...newConversation, aiResponse]);
    }, 1000);
  };

  return (
    <>
      <Button 
        type="button"
        variant="outline"
        onClick={() => setShowAIChat(!showAIChat)}
        className="mb-4 w-full"
      >
        <MessageSquare size={16} className="mr-2" />
        {showAIChat ? 'Ocultar asistente de IA' : 'Explorar más intereses con ayuda de IA'}
      </Button>
      
      {showAIChat && (
        <WindowFrame title="ASISTENTE DE INTERESES" className="mb-4 p-2">
          <div className="bg-chelas-gray-dark/20 p-2 rounded-sm mb-2 h-60 overflow-y-auto">
            {conversation.length === 0 ? (
              <div className="p-2 rounded bg-chelas-yellow/20 mb-2">
                <p className="text-sm">{initialMessage}</p>
              </div>
            ) : (
              conversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded mb-2 ${
                    msg.role === 'ai' 
                      ? 'bg-chelas-yellow/20 text-black' 
                      : 'bg-chelas-button-face text-black ml-auto max-w-[80%]'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Escribe sobre tus intereses..."
              className="text-sm min-h-[60px] border-chelas-gray-dark"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!userMessage.trim()}
              className="h-full"
            >
              Enviar
            </Button>
          </div>
        </WindowFrame>
      )}
    </>
  );
};

export default InterestAiChat;
