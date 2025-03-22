
// src/pages/InterestsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import Tabs from '@/components/Tabs';
import { TopicCategory } from '@/types/supabase';
import { useNavigate } from 'react-router-dom';

/** Estructura interna para mostrar intereses en la UI */
interface InterestOption {
  id: string;       // uuid o identificador
  label: string;    // nombre del interés
  category: TopicCategory; // ej. 'movies', 'music', 'avoid', etc.
}

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
];

const InterestsPage = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [allInterests, setAllInterests] = useState<InterestOption[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState(''); // Texto personal
  const [loading, setLoading] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  
  useEffect(() => {
    checkAuthStatus();
    fetchInterests();
    fetchUserProfile();
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
  const fetchUserProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('temas_preferidos, descripcion_personal')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró un perfil, puede ser un usuario nuevo
          console.log('No se encontró perfil para el usuario, puede ser nuevo');
          return;
        }
        throw error;
      }

      if (data) {
        if (data.temas_preferidos) {
          setSelectedInterests(data.temas_preferidos);
        }
        if (data.descripcion_personal) {
          setPersonalNote(data.descripcion_personal);
        }
      }
    } catch (err) {
      console.error('Error al cargar perfil de usuario:', err);
      toast.error('Error al cargar tu perfil');
    }
  };

  /** Maneja el check/uncheck de cada interés */
  const handleToggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
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

      console.log('Guardando preferencias para usuario:', user.id);
      console.log('Intereses seleccionados:', selectedInterests);
      console.log('Descripción personal:', personalNote);

      // Actualizar la tabla "profiles"
      const { error } = await supabase
        .from('profiles')
        .update({
          temas_preferidos: selectedInterests,
          descripcion_personal: personalNote
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error al actualizar perfil:', error);
        
        // Si el error es porque el perfil no existe, lo creamos
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.email?.split('@')[0] || 'Usuario',
              avatar: 'user',
              temas_preferidos: selectedInterests,
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
      
      // Redirigir al Lobby después de guardar exitosamente
      navigate('/lobby');
      
    } catch (err) {
      console.error('Error al guardar datos:', err);
      toast.error('Error al guardar datos');
    } finally {
      setLoading(false);
    }
  };

  /** Obtiene las categorías definidas en la pestaña actual y filtra */
  const categories = TABS[currentTab].categories;
  const filteredInterests = allInterests.filter(opt =>
    categories.includes(opt.category as string)
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
              {/* Contenedor con scroll si la lista es grande */}
              <div className="max-h-[250px] overflow-y-auto p-2 border border-chelas-gray-dark bg-white">
                {filteredInterests.length === 0 ? (
                  <p className="text-sm text-black">
                    No hay intereses para esta categoría.
                  </p>
                ) : (
                  filteredInterests.map(opt => (
                    <label key={opt.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(opt.id)}
                        onChange={() => handleToggleInterest(opt.id)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black">{opt.label}</span>
                    </label>
                  ))
                )}
              </div>

              {/* Sección para descripción personal */}
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
