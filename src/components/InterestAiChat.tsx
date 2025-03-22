
import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/types/supabase';
import { toast } from 'sonner';

interface InterestAiChatProps {
  initialMessage: string;
  onSuggestedInterestClick?: (interest: string) => void;
}

const InterestAiChat: React.FC<InterestAiChatProps> = ({ 
  initialMessage,
  onSuggestedInterestClick 
}) => {
  const [showAIChat, setShowAIChat] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [conversation]);

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    const newConversation: ChatMessage[] = [
      ...conversation,
      { role: 'user', content: userMessage }
    ];
    setConversation(newConversation);
    setUserMessage('');
    setIsTyping(true);
    
    // Simulate AI response with a delay
    setTimeout(() => {
      generateAiResponse(userMessage, newConversation);
    }, 1500);
  };

  const generateAiResponse = (message: string, currentConversation: ChatMessage[]) => {
    let suggestedInterests: string[] = [];
    
    // Based on user message keywords, suggest related interests
    const keywords = {
      'deporte': ['Fútbol', 'Running', 'Natación', 'Ciclismo', 'Yoga'],
      'música': ['Rock', 'Jazz', 'Pop', 'Música clásica', 'Hip hop'],
      'películas': ['Ciencia ficción', 'Drama', 'Comedia', 'Cine independiente', 'Documentales'],
      'comida': ['Gastronomía italiana', 'Repostería', 'Cocina asiática', 'Comida vegetariana', 'Parrilladas'],
      'viajes': ['Ecoturismo', 'Mochilero', 'Turismo cultural', 'Playas', 'Montañas'],
      'tecnología': ['Inteligencia artificial', 'Desarrollo web', 'Programación', 'Videojuegos', 'Gadgets'],
      'arte': ['Pintura', 'Fotografía', 'Museos', 'Escultura', 'Arte digital'],
      'lectura': ['Novelas', 'Ciencia ficción', 'Biografías', 'Poesía', 'Historia']
    };
    
    const lowercaseMessage = message.toLowerCase();
    
    // Check for keywords in the message
    for (const [keyword, related] of Object.entries(keywords)) {
      if (lowercaseMessage.includes(keyword)) {
        suggestedInterests = [...suggestedInterests, ...related];
      }
    }
    
    // If no specific interests found, suggest some general ones
    if (suggestedInterests.length === 0) {
      suggestedInterests = [
        'Viajes por Europa', 
        'Fotografía', 
        'Series de Netflix', 
        'Desarrollo personal',
        'Podcasts',
        'Juegos de mesa'
      ];
    }
    
    // Limit to 5 random suggestions
    suggestedInterests = suggestedInterests
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    // Format response with clickable interest suggestions
    const responseContent = `
      Basándome en lo que me cuentas, te sugiero explorar estos intereses:
      
      ${suggestedInterests.map(interest => `• ${interest}`).join('\n')}
      
      ¿Alguno de estos te interesa? Puedes hacer clic en cualquiera para añadirlo a tus intereses.
    `;
    
    const aiResponse: ChatMessage = {
      role: 'ai',
      content: responseContent,
      suggestions: suggestedInterests
    };
    
    setConversation([...currentConversation, aiResponse]);
    setIsTyping(false);
  };

  const handleInterestClick = (interest: string) => {
    if (onSuggestedInterestClick) {
      onSuggestedInterestClick(interest);
      toast.success(`¡"${interest}" añadido a tus intereses!`);
    }
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
          <div 
            id="chat-container"
            className="bg-chelas-gray-dark/20 p-2 rounded-sm mb-2 h-60 overflow-y-auto"
          >
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
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  
                  {/* Render clickable suggestions if available */}
                  {msg.role === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleInterestClick(suggestion)}
                          className="text-xs bg-chelas-button-face hover:bg-chelas-yellow hover:text-black px-2 py-1 rounded-sm transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="p-2 rounded bg-chelas-yellow/20 mb-2">
                <p className="text-sm">Escribiendo...</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Escribe sobre tus intereses..."
              className="text-sm min-h-[60px] border-chelas-gray-dark"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || isTyping}
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
