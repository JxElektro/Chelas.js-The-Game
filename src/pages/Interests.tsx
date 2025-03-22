// FILE: src/pages/Interests.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { useNavigate } from 'react-router-dom';
import { seedInterests } from '@/utils/interestUtils';

// Importamos las tabs y la data fija
import { interestTabs, InterestTab, Category, SubInterest } from '@/utils/interestUtils';
const InterestsPage = () => {
  const navigate = useNavigate();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  // Arrays para los IDs seleccionados
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avoidInterests, setAvoidInterests] = useState<string[]>([]);

  // Info adicional del usuario
  const [personalNote, setPersonalNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Para mostrar botón admin
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  // Para cargar tu perfil y ver qué intereses ya tenía:
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
    setProfileId(sessionData.session.user.id);
    // Cargar los intereses del usuario, si ya existen
    fetchUserProfile(sessionData.session.user.id);
  };

<<<<<<< HEAD
  const fetchUserProfile = async (userId: string) => {
=======
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
>>>>>>> 827b06bac661a9c37899aac91b4b46d520f18be7
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al cargar perfil de usuario:', error);
        toast.error('Error al cargar tu perfil');
        return;
      }

      if (data) {
        const { temas_preferidos, descripcion_personal } = data;
        // Separa intereses de “Evitar” del resto
        if (Array.isArray(temas_preferidos)) {
          // Ej: "avoid" agrupa los ID que son de “Evitar”
          const avoided = temas_preferidos.filter((id: string) =>
            // Tu lógica: si es algo que corresponde a la categoría "avoid"
            // O si tu app los marcó así. Ej:
            id.includes('avoid-') // o la condición que uses
          );

          setAvoidInterests(avoided);

          // El resto:
          const normal = temas_preferidos.filter((id: string) => !avoided.includes(id));
          setSelectedInterests(normal);
        }
        if (descripcion_personal) setPersonalNote(descripcion_personal);
      }
    } catch (err) {
      console.error('Error al cargar perfil de usuario:', err);
      toast.error('Error al cargar tu perfil');
    } finally {
      setLoading(false);
    }
  };

  // Guardar en Supabase la unión de todos los intereses marcados
  const handleSave = async () => {
    if (!profileId) return;
    try {
      setLoading(true);

      // Todos los intereses en un solo array
      const allInterests = [...selectedInterests, ...avoidInterests];

      const { error } = await supabase
        .from('profiles')
        .update({
          temas_preferidos: allInterests,
          descripcion_personal: personalNote,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast.success('Preferencias guardadas correctamente');
      navigate('/lobby');
    } catch (err) {
      console.error('Error al guardar intereses:', err);
      toast.error('No se pudieron guardar los intereses');
    } finally {
      setLoading(false);
    }
  };

  // Alternar selección al hacer clic
  const handleToggleInterest = (interestId: string, isAvoid: boolean) => {
    if (isAvoid) {
      setAvoidInterests((prev) =>
        prev.includes(interestId)
          ? prev.filter((id) => id !== interestId)
          : [...prev, interestId]
      );
    } else {
      setSelectedInterests((prev) =>
        prev.includes(interestId)
          ? prev.filter((id) => id !== interestId)
          : [...prev, interestId]
      );
    }
  };

  // Renderizado de la pestaña actual
  const renderCurrentTab = () => {
    const tabData = interestTabs[currentTabIndex];
    if (!tabData) return null;

    // Si es la pestaña "Opciones Avanzadas IA" -> tu lógica
    const isAiTab = tabData.categories.some(
      (cat) => cat.categoryId === 'externalAnalysis'
    );

    if (isAiTab) {
      return (
        <div className="p-2">
          <p className="text-sm text-black mb-4">
            Aquí colocarías tu componente de análisis de IA, por ejemplo <strong>AiAnalysisUnified</strong> o el que uses.
          </p>
          {/* Lógica para tu componente IA */}
        </div>
      );
    }

    // De lo contrario, desplegamos las categorías y subInterests
    return (
      <div className="space-y-6">
        {tabData.categories.map((cat: Category) => {
          // Revisamos si es la categoría "avoid"
          const isAvoidCategory = cat.categoryId === 'avoid';

          return (
            <div key={cat.categoryId} className="bg-white border border-gray-300 p-2">
              <h3 className="text-sm font-bold text-black mb-2">{cat.label}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.subInterests?.map((sub: SubInterest) => {
                  // Si es “avoid”, lo buscamos en avoidInterests
                  const isSelected = isAvoidCategory
                    ? avoidInterests.includes(sub.id)
                    : selectedInterests.includes(sub.id);

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleInterest(sub.id, isAvoidCategory)}
                      className={`cursor-pointer flex items-center gap-2 border border-chelas-gray-dark p-2 ${
                        isSelected ? 'bg-chelas-yellow/20' : 'bg-chelas-button-face'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleInterest(sub.id, isAvoidCategory)}
                      />
                      <span className="text-sm text-black">{sub.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
<<<<<<< HEAD

        <WindowFrame title="PROPIEDADES DE INTERESES" className="w-full max-w-full sm:max-w-3xl">
          <div className="flex flex-col h-full">
            {/* Render de las pestañas */}
            <div className="flex border-b border-chelas-gray-dark bg-chelas-gray-light">
              {interestTabs.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setCurrentTabIndex(i)}
                  className={`px-4 py-2 text-sm font-bold ${
                    i === currentTabIndex ? 'bg-chelas-button-face' : ''
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Contenido de la pestaña */}
            <div className="p-4 flex-1 overflow-auto bg-chelas-button-face">
              {loading ? (
                <p className="text-sm text-black mb-4">Cargando...</p>
              ) : (
                <>
                  {renderCurrentTab()}

                  {/* Si quieres campo de descripción personal */}
                  <div className="mt-6">
                    <label className="block text-sm text-black font-medium mb-2">
                      Descripción Personal
                    </label>
                    <textarea
                      value={personalNote}
                      onChange={(e) => setPersonalNote(e.target.value)}
                      className="w-full h-24 win95-inset p-2 text-sm text-black"
                      placeholder="Ej: Soy fan de la programación y me gusta el senderismo..."
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="default" onClick={() => navigate('/lobby')} className="mr-2">
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                      {loading ? 'Guardando...' : 'Aceptar'}
                    </Button>
                  </div>
                </>
              )}
            </div>
=======
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
>>>>>>> 827b06bac661a9c37899aac91b4b46d520f18be7
          </div>
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default InterestsPage;
