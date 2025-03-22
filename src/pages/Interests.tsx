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
  { label: 'Análisis IA',     categories: ['externalAnalysis'] },
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

  // Actualiza la descripción personal (si se usa en otro componente)
  const handlePersonalNoteUpdate = (newNote: string) => {
    setPersonalNote(newNote);
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
        <WindowFrame title="TUS PREFERENCIAS" className="w-full max-w-full sm:max-w-3xl p-4">
          {/* Contenedor de Tabs con scroll horizontal en mobile */}
          <div className="w-full overflow-x-auto mb-4">
            <Tabs
              tabs={TABS.map(t => t.label)}
              activeTab={currentTab}
              onChange={setCurrentTab}
            />
          </div>
          {loading ? (
            <p className="text-sm text-black mb-4">Cargando...</p>
          ) : (
            <div className="mt-4 flex flex-col space-y-4">
              {isAnalysisTab ? (
                // Mostrar el componente de análisis en modo "response"
                userProfile && (
                  <AiAnalysisUnified 
                    mode="response"
                    userId={userProfile.id}
                    profile={userProfile}
                    selectedInterests={selectedInterestsObjects}
                    avoidTopics={avoidInterestsObjects}
                    personalNote={personalNote}
                    onPersonalNoteChange={handlePersonalNoteUpdate}
                    onSaveResponse={async (text) => {
                      setUserProfile({ ...userProfile, analisis_externo: text });
                    }}
                  />
                )
              ) : (
                // Mostrar la lista de intereses filtrada
                <div className="max-h-[250px] overflow-y-auto p-2 border border-chelas-gray-dark bg-white">
                  {filteredInterests.length === 0 ? (
                    <p className="text-sm text-black">No hay temas para esta categoría.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredInterests.map(opt => {
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
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleSave} disabled={loading}>
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
