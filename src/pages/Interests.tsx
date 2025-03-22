import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import InterestSelector from '@/components/InterestSelector';
import { Tag, AlertTriangle, ChevronRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Interest, InterestOption, TopicCategory, ChatMessage } from '@/types/supabase';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Textarea } from '@/components/ui/textarea';

const PREDEFINED_INTERESTS: Record<string, string[]> = {
  entretenimiento: [
    'Películas', 'Series de TV', 'Anime', 'Documentales', 'Comedia', 
    'Dramáticos', 'Ciencia ficción', 'Fantasía'
  ],
  musica: [
    'Rock', 'Pop', 'Hip Hop / Rap', 'Electrónica', 'Jazz', 
    'Clásica', 'Reggaetón', 'Indie'
  ],
  libros: [
    'Novelas', 'Cuentos', 'Poesía', 'Ensayos', 'Ciencia ficción literaria',
    'Biografías', 'Autoconocimiento'
  ],
  gastronomia: [
    'Cocina internacional', 'Cocina local', 'Repostería', 
    'Comida saludable', 'Comida exótica', 'Restaurantes y food trucks'
  ],
  viajes: [
    'Destinos de playa', 'Destinos de montaña', 'Ciudades históricas',
    'Ecoturismo', 'Viajes de aventura', 'Turismo cultural'
  ],
  deportes: [
    'Fútbol', 'Baloncesto', 'Tenis', 'Correr', 'Gimnasio',
    'Deportes extremos', 'Yoga / Pilates'
  ],
  arte: [
    'Pintura', 'Escultura', 'Fotografía', 'Exposiciones y museos',
    'Teatro', 'Danza', 'Literatura y poesía'
  ],
  tecnologia: [
    'Innovación', 'Programación', 'Videojuegos', 'Gadgets',
    'Inteligencia Artificial', 'Robótica', 'Astronomía'
  ],
  hobbies: [
    'Moda', 'Fotografía', 'Jardinería', 'DIY (Hazlo tú mismo)',
    'Gaming', 'Meditación', 'Voluntariado'
  ],
  actualidad: [
    'Noticias internacionales', 'Redes sociales', 'Tendencias en marketing digital',
    'Emprendimiento', 'Startups', 'Economía'
  ],
  humor: [
    'Chistes', 'Datos curiosos', 'Memes', 'Curiosidades históricas', 'Anécdotas personales'
  ],
  otros: [
    'Filosofía', 'Psicología', 'Política', 'Medio ambiente', 'Desarrollo personal',
    'Relaciones y vida social'
  ]
};

const Interests = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [interests, setInterests] = useState<string[]>([]);
  const [avoidTopics, setAvoidTopics] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [avoidOptions, setAvoidOptions] = useState<InterestOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('Hola, puedo ayudarte a descubrir más intereses que quizás no hayas considerado. Cuéntame un poco sobre tus pasatiempos favoritos o actividades que disfrutas.');
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  const transformPredefinedInterests = () => {
    const result: InterestOption[] = [];
    let id = 1;
    
    Object.entries(PREDEFINED_INTERESTS).forEach(([category, interests]) => {
      interests.forEach(interest => {
        result.push({
          id: `custom-${id++}`,
          label: interest,
          category: mapCategoryToDbCategory(category)
        });
      });
    });
    
    return result;
  };
  
  const mapCategoryToDbCategory = (category: string): TopicCategory => {
    const categoryMap: Record<string, TopicCategory> = {
      entretenimiento: 'movies',
      musica: 'music',
      libros: 'books',
      gastronomia: 'food',
      viajes: 'travel',
      deportes: 'sports',
      arte: 'art',
      tecnologia: 'tech',
      hobbies: 'hobbies',
      actualidad: 'trends',
      humor: 'humor',
      otros: 'other'
    };
    
    return categoryMap[category] || 'other';
  };

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        
        const { data: allInterests, error: interestsError } = await supabase
          .from('interests')
          .select('*')
          .not('category', 'eq', 'avoid');
          
        const { data: regularInterests, error: avoidError } = await supabase
          .from('interests')
          .select('*')
          .in('category', ['tech', 'movies', 'music', 'series_anime', 'books', 'travel', 'food', 'sports', 'art', 'hobbies', 'trends', 'humor', 'other']);
        
        if (interestsError) throw interestsError;
        if (avoidError) throw avoidError;
        
        const predefinedOptions = transformPredefinedInterests();
        
        const dbInterestOptions = (allInterests || []).map((interest: Interest) => ({
          id: interest.id,
          label: interest.name,
          category: interest.category
        }));
        
        const combinedOptions = [...dbInterestOptions];
        predefinedOptions.forEach(option => {
          if (!combinedOptions.some(dbOption => dbOption.label.toLowerCase() === option.label.toLowerCase())) {
            combinedOptions.push(option);
          }
        });
        
        setInterestOptions(combinedOptions);
        
        setAvoidOptions(
          (regularInterests || []).slice(0, 20).map((interest: Interest) => ({
            id: interest.id,
            label: interest.name,
            category: 'avoid' as TopicCategory
          }))
        );
        
      } catch (error) {
        console.error('Error al cargar intereses:', error);
        toast.error('Error al cargar intereses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Guardando preferencias:', { interests, avoidTopics });
      toast.success('Preferencias guardadas correctamente');
      navigate('/lobby');
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      toast.error('Error al guardar preferencias');
    }
  };

  const handleCustomInterestAdd = (interest: string) => {
    const newInterest: InterestOption = {
      id: `custom-${Date.now()}`,
      label: interest,
      category: 'other'
    };
    
    setInterestOptions(prev => [...prev, newInterest]);
    
    if (interests.length < 5) {
      setInterests(prev => [...prev, newInterest.id]);
    }
    
    toast.success(`Se ha añadido "${interest}" a tus intereses`);
  };

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
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[80vh] w-full"
      >
        <Button 
          variant="ghost" 
          className="self-start mb-4"
          onClick={() => navigate('/register')}
        >
          <ArrowLeft size={16} className="mr-1" />
          Atrás
        </Button>

        <h1 className="text-chelas-yellow text-2xl mb-6">Tus Intereses</h1>

        <WindowFrame title="PREFERENCIAS DE CONVERSACIÓN" className="w-full">
          {loading ? (
            <p className="text-sm text-black mb-4">Cargando opciones...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-black mb-4">
                Selecciona temas sobre los que te interesa hablar y aquellos que prefieres evitar.
              </p>
              
              <div className="mb-6">
                <InterestSelector
                  title="Me interesa hablar sobre:"
                  options={interestOptions}
                  selectedOptions={interests}
                  onChange={setInterests}
                  maxSelections={5}
                  onCustomInterestSubmit={handleCustomInterestAdd}
                />
                
                <InterestSelector
                  title="Prefiero evitar:"
                  options={avoidOptions}
                  selectedOptions={avoidTopics}
                  onChange={setAvoidTopics}
                  maxSelections={3}
                />
              </div>
              
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
                        <p className="text-sm">{aiMessage}</p>
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
              
              <div className="mb-4 p-2 bg-chelas-yellow/20 border-2 border-chelas-yellow flex items-start">
                <AlertTriangle size={16} className="text-chelas-yellow mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-white">
                  Estas preferencias se utilizarán para generar temas de conversación relevantes cuando te conectes con otros asistentes.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Guardar y Continuar <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </form>
          )}
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Interests;
