
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

/** Definición de pestañas y a qué categorías mapean */
const TABS = [
  { label: 'Entretenimiento', categories: ['movies', 'series_anime'] },
  { label: 'Música',          categories: ['music'] },
  { label: 'Libros',          categories: ['books'] },
  { label: 'Gastronomía',     categories: ['food'] },
  { label: 'Viajes',          categories: ['travel'] },
  { label: 'Deportes',        categories: ['sports'] },
  { label: 'Arte',            categories: ['art'] },
  { label: 'Tecnología',      categories: ['tech'] },
  { label: 'Hobbies',         categories: ['hobbies'] },
  { label: 'Actualidad',      categories: ['trends'] },
  { label: 'Humor',           categories: ['humor'] },
  { label: 'Otros',           categories: ['other'] },
  { label: 'Evitar',          categories: ['avoid'] },
  { label: 'Análisis IA',     categories: ['analysis'] },
  { label: 'Análisis Externo', categories: ['externalAnalysis'] },
];

const InterestsPage = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [allInterests, setAllInterests] = useState<InterestOption[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avoidInterests, setAvoidInterests] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState(''); 
  const [loading, setLoading] = useState(false);
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
    setUserAuthenticated(true);
    fetchUserProfile(sessionData.session.user.id);
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
        
        // Separar los intereses que son para evitar
        if (profile.temas_preferidos) {
          const allPreferredIds = profile.temas_preferidos;
          
          // Primero, identifiquemos qué IDs son de la categoría "avoid"
          const avoidInterestIds = allInterests
            .filter(interest => interest.category === 'avoid' && allPreferredIds.includes(interest.id))
            .map(interest => interest.id);
          
          // Luego, configuramos los intereses normales y los de "avoid" por separado
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
    // Determinar si estamos manejando un interés normal o uno a evitar
    if (isAvoidCategory) {
      setAvoidInterests(prev => {
        if (prev.includes(interestId)) {
          return prev.filter(id => id !== interestId);
        } else {
          return [...prev, interestId];
        }
      });
    } else {
      setSelectedInterests(prev => {
        if (prev.includes(interestId)) {
          return prev.filter(id => id !== interestId);
        } else {
          return [...prev, interestId];
        }
      });
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

      // Combinar los intereses normales y los de evitar
      const allInterestsToSave = [...selectedInterests, ...avoidInterests];

      console.log('Guardando preferencias para usuario:', user.id);
      console.log('Intereses seleccionados:', allInterestsToSave);
      console.log('Descripción personal:', personalNote);

      // Actualizar la tabla "profiles"
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

  /** Obtiene las categorías definidas en la pestaña actual y filtra */
  const currentTabData = TABS[currentTab];
  const isAnalysisTab = currentTabData.categories.includes('analysis');
  const isExternalAnalysisTab = currentTabData.categories.includes('externalAnalysis');
  
  // Filtrar intereses por categoría (excepto para las pestañas de análisis)
  const filteredInterests = !isAnalysisTab && !isExternalAnalysisTab 
    ? allInterests.filter(opt => currentTabData.categories.includes(opt.category as string))
    : [];
  
  // Determinar si estamos en la pestaña de "Evitar"
  const isAvoidTab = currentTabData.categories.includes('avoid');

  // Obtener los intereses seleccionados como objetos completos
  const selectedInterestsObjects = allInterests.filter(interest => 
    selectedInterests.includes(interest.id)
  );
  
  // Obtener los intereses a evitar como objetos completos
  const avoidInterestsObjects = allInterests.filter(interest => 
    avoidInterests.includes(interest.id)
  );

  if (!userAuthenticated) {
    return <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <p>Verificando sesión...</p>
      </div>
    </Layout>;
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4"
      >
        <h1 className="text-chelas-yellow text-2xl mb-6">
          Configura Tus Intereses
        </h1>

        <WindowFrame title="TUS PREFERENCIAS" className="w-full max-w-3xl p-4">
          {/* Tabs para cambiar de categoría */}
          <Tabs
            tabs={TABS.map(t => t.label)}
            activeTab={currentTab}
            onChange={setCurrentTab}
          />

          {loading ? (
            <p className="text-sm text-black mb-4">Cargando...</p>
          ) : (
            <div className="mt-4 flex flex-col space-y-4">
              {isAnalysisTab ? (
                // Mostrar el análisis de IA usando el componente unificado en modo "prompt"
                userProfile && (
                  <AiAnalysisUnified 
                    mode="prompt"
                    profile={userProfile} 
                    selectedInterests={selectedInterestsObjects}
                    avoidTopics={avoidInterestsObjects}
                  />
                )
              ) : isExternalAnalysisTab ? (
                // Mostrar el componente de análisis externo usando el componente unificado en modo "response"
                userProfile && (
                  <AiAnalysisUnified 
                    mode="response"
                    userId={userProfile.id}
                    onSaveResponse={async (text) => {
                      // Como ejemplo simple, simplemente actualiza el perfil local
                      setUserProfile({
                        ...userProfile,
                        analisis_externo: text
                      });
                    }}
                  />
                )
              ) : (
                // Mostrar la lista de intereses filtrada
                <div className="max-h-[250px] overflow-y-auto p-2 border border-chelas-gray-dark bg-white">
                  {filteredInterests.length === 0 ? (
                    <p className="text-sm text-black">
                      No hay temas para esta categoría.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredInterests.map(opt => {
                        // Determinar si este interés está seleccionado
                        const isSelected = isAvoidTab 
                          ? avoidInterests.includes(opt.id)
                          : selectedInterests.includes(opt.id);
                        
                        return (
                          <motion.div
                            key={opt.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`
                              p-2 cursor-pointer flex items-center gap-2
                              ${isSelected ? 'bg-chelas-yellow/20 text-black' : 'bg-chelas-button-face text-black'}
                              border border-chelas-gray-dark shadow-win95-button rounded-sm
                            `}
                            onClick={() => handleToggleInterest(opt.id, isAvoidTab)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleInterest(opt.id, isAvoidTab)}
                              className="mr-2"
                            />
                            <span className="text-sm text-black">{opt.label}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sección para descripción personal (no mostrar en pestaña de análisis) */}
              {!isAnalysisTab && !isExternalAnalysisTab && (
                <div>
                  <label className="block text-xs text-black mb-1">
                    Cuéntanos algo personal sobre ti (opcional)
                  </label>
                  <textarea
                    className="win95-inset w-full h-24 p-2 text-black"
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="Me encanta cocinar platos italianos y coleccionar cómics de superhéroes..."
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          )}
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default InterestsPage;
