import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import Tabs from '@/components/Tabs';
import AiAnalysisUnified from '@/components/AiAnalysisUnified';
import { TopicCategory, Profile, InterestOption } from '@/types/supabase';
import { useNavigate } from 'react-router-dom';
import { seedInterests } from '@/utils/interestUtils';

/** Definición de pestañas y a qué categorías mapean */
const TABS = [
  { label: 'General', categories: ['movies', 'series_anime', 'music', 'books'] },
  { label: 'Ocio', categories: ['food', 'travel', 'sports', 'hobbies'] },
  { label: 'Cultura', categories: ['art', 'tech', 'trends', 'humor'] },
  { label: 'Otros', categories: ['other'] },
  { label: 'Evitar', categories: ['avoid'] },
  { label: 'Opciones Avanzadas IA', categories: ['externalAnalysis'] },
];

const InterestsPage = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [allInterests, setAllInterests] = useState<InterestOption[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avoidInterests, setAvoidInterests] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Para mostrar botón admin
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  
  useEffect(() => {
    checkAuthStatus();
    fetchInterests();
  }, []);

  /** Verifica si el usuario está autenticado */
  const checkAuthStatus = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error('Debes iniciar sesión para acceder a esta página');
      navigate('/login');
      return;
    }
    
    // Verificar si es admin (para propósitos de desarrollo)
    const email = sessionData.session.user.email;
    setIsAdmin(email === 'admin@example.com' || email === 'test@example.com');
    
    setUserAuthenticated(true);
    fetchUserProfile(sessionData.session.user.id);
  };

  /** Función para generar intereses predefinidos en la base de datos */
  const handleSeedInterests = async () => {
    try {
      setLoading(true);
      const { success, error } = await seedInterests();
      
      if (error) {
        console.error('Error al insertar intereses:', error);
        toast.error('Error al generar intereses predefinidos');
      } else {
        toast.success('Intereses predefinidos generados correctamente');
        // Recargar intereses
        fetchInterests();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al generar intereses');
    } finally {
      setLoading(false);
    }
  };

  /** Carga todos los intereses desde la tabla "interests" en Supabase */
  const fetchInterests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interests')
        .select('*');
      if (error) throw error;
      // Convertir data en el formato InterestOption
      const mapped = (data || []).map((i: any) => ({
        id: i.id,
        label: i.name,
        category: i.category
      })) as InterestOption[];
      setAllInterests(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar intereses');
    } finally {
      setLoading(false);
    }
  };

  /** Carga el perfil del usuario para mostrar sus intereses y su nota personal */
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')  
        .eq('id', userId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No se encontró perfil para el usuario, puede ser nuevo');
          return;
        }
        throw error;
      }
      if (data) {
        const profile = data as Profile;
        setUserProfile(profile);
        if (profile.temas_preferidos) {
          setSelectedInterests(profile.temas_preferidos);
        }
        // Separar los intereses de evitar
        if (profile.temas_preferidos) {
          const allPreferredIds = profile.temas_preferidos;
          const avoidInterestIds = allInterests
            .filter(interest => interest.category === 'avoid' && allPreferredIds.includes(interest.id))
            .map(interest => interest.id);
          const normalInterestIds = allPreferredIds.filter(id => !avoidInterestIds.includes(id));
          setSelectedInterests(normalInterestIds);
          setAvoidInterests(avoidInterestIds);
        }
        if (profile.descripcion_personal) {
          setPersonalNote(profile.descripcion_personal);
        }
      }
    } catch (err) {
      console.error('Error al cargar perfil de usuario:', err);
      toast.error('Error al cargar tu perfil');
    }
  };

  /** Maneja el check/uncheck de cada interés */
  const handleToggleInterest = (interestId: string, isAvoidCategory: boolean) => {
    if (isAvoidCategory) {
      setAvoidInterests(prev =>
        prev.includes(interestId) ? prev.filter(id => id !== interestId) : [...prev, interestId]
      );
    } else {
      setSelectedInterests(prev =>
        prev.includes(interestId) ? prev.filter(id => id !== interestId) : [...prev, interestId]
      );
    }
  };

  /** Guarda los cambios en Supabase */
  const handleSave = async () => {
    try {
      if (!userAuthenticated) {
        toast.error('Debes iniciar sesión para guardar tus preferencias');
        navigate('/login');
        return;
      }
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        toast.error('No estás autenticado');
        navigate('/login');
        return;
      }
      // Combinar los intereses normales y de evitar
      const allInterestsToSave = [...selectedInterests, ...avoidInterests];
      const { error } = await supabase
        .from('profiles')
        .update({
          temas_preferidos: allInterestsToSave,
          descripcion_personal: personalNote
        })
        .eq('id', user.id);
      if (error) {
        console.error('Error al actualizar perfil:', error);
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.email?.split('@')[0] || 'Usuario',
              avatar: 'user',
              temas_preferidos: allInterestsToSave,
              descripcion_personal: personalNote
            });
          if (insertError) throw insertError;
          toast.success('Perfil creado y preferencias guardadas');
        } else {
          throw error;
        }
      } else {
        toast.success('Intereses y nota personal guardados');
      }
      navigate('/lobby');
    } catch (err) {
      console.error('Error al guardar datos:', err);
      toast.error('Error al guardar datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado según la pestaña actual
  const currentTabData = TABS[currentTab];
  const isAnalysisTab = currentTabData.categories.includes('externalAnalysis');
  const filteredInterests = !isAnalysisTab
    ? allInterests.filter(opt => currentTabData.categories.includes(opt.category as string))
    : [];
  const isAvoidTab = currentTabData.categories.includes('avoid');
  const selectedInterestsObjects = allInterests.filter(interest =>
    selectedInterests.includes(interest.id)
  );
  const avoidInterestsObjects = allInterests.filter(interest =>
    avoidInterests.includes(interest.id)
  );

  // Agrupamos intereses por subcategoría para mejor visualización
  const groupInterestsByType = (interests: InterestOption[]) => {
    return interests.reduce<Record<string, InterestOption[]>>((acc, interest) => {
      const category = interest.category as string;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(interest);
      return acc;
    }, {});
  };

  // Ordenamos los intereses por categoría para presentar subcategorías
  const groupedInterests = groupInterestsByType(filteredInterests);

  // Mapeo de categorías a nombres en español
  const categoryNames: Record<string, string> = {
    movies: 'Películas y Series',
    series_anime: 'Anime y TV',
    music: 'Música',
    books: 'Libros y Lectura',
    food: 'Gastronomía',
    travel: 'Viajes',
    sports: 'Deportes',
    hobbies: 'Pasatiempos',
    art: 'Arte y Cultura',
    tech: 'Tecnología',
    trends: 'Tendencias',
    humor: 'Humor',
    other: 'Misceláneos',
    avoid: 'Temas a Evitar'
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
        className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4"
      >
        <h1 className="text-chelas-yellow text-2xl mb-6">Configura Tus Intereses</h1>
        {isAdmin && (
          <Button 
            variant="primary" 
            onClick={handleSeedInterests} 
            className="mb-4"
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Regenerar intereses predefinidos'}
          </Button>
        )}
        
        <WindowFrame title="PROPIEDADES DE INTERESES" className="w-full max-w-full sm:max-w-3xl">
          <div className="flex flex-col h-full">
            {/* Componente de pestañas horizontales estilo Windows */}
            <Tabs
              tabs={TABS.map(t => t.label)}
              activeTab={currentTab}
              onChange={setCurrentTab}
            >
              {/* Contenido de la pestaña activa */}
              <div className="p-4 flex-1 overflow-auto bg-chelas-button-face">
                {loading ? (
                  <p className="text-sm text-black mb-4">Cargando...</p>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {isAnalysisTab ? (
                      // Mostrar el componente de análisis en modo "response"
                      userProfile && (
                        <AiAnalysisUnified 
                          mode="response"
                          userId={userProfile.id}
                          profile={userProfile}
                          selectedInterests={selectedInterestsObjects}
                          avoidTopics={avoidInterestsObjects}
                          onSaveResponse={async (text) => {
                            setUserProfile({ ...userProfile, analisis_externo: text });
                          }}
                        />
                      )
                    ) : (
                      <>
                        {/* Descripción de la pestaña */}
                        <p className="text-sm text-black mb-4">
                          {isAvoidTab 
                            ? 'Selecciona los temas que prefieres evitar en tus conversaciones:' 
                            : 'Selecciona temas que te interesan para conversar:'}
                        </p>
                        
                        {/* Mostrar la lista de intereses filtrada y agrupada */}
                        <div className="max-h-[350px] overflow-y-auto p-2 border border-chelas-gray-dark bg-white">
                          {Object.keys(groupedInterests).length === 0 ? (
                            <p className="text-sm text-black">No hay temas para esta categoría.</p>
                          ) : (
                            <div className="space-y-4">
                              {Object.entries(groupedInterests).map(([category, interests]) => (
                                <div key={category} className="mb-4">
                                  <h3 className="text-sm font-bold text-black mb-2 border-b border-chelas-gray-dark pb-1">
                                    {categoryNames[category] || category}
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {interests.map(opt => {
                                      const isSelected = isAvoidTab
                                        ? avoidInterests.includes(opt.id)
                                        : selectedInterests.includes(opt.id);
                                      return (
                                        <motion.div
                                          key={opt.id}
                                          whileHover={{ scale: 1.01 }}
                                          whileTap={{ scale: 0.99 }}
                                          className="p-2 cursor-pointer flex items-center gap-2 border border-chelas-gray-dark shadow-win95-button rounded-sm bg-chelas-button-face text-black"
                                          onClick={() => handleToggleInterest(opt.id, isAvoidTab)}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleInterest(opt.id, isAvoidTab)}
                                            className="mr-2"
                                          />
                                          <span className="text-sm text-black break-words">{opt.label}</span>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <Button variant="default" onClick={() => navigate('/lobby')}>
                        Cancelar
                      </Button>
                      <Button variant="primary" onClick={handleSave} disabled={loading || isAnalysisTab}>
                        {loading ? 'Guardando...' : 'Aceptar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default InterestsPage;
