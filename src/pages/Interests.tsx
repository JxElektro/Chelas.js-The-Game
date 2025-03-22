
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { useNavigate } from 'react-router-dom';
import Tabs from '@/components/Tabs';
import { 
  interestTabs, 
  Category, 
  SubInterest,
  seedInterests
} from '@/utils/interestUtils';
import AiAnalysisUnified from '@/components/AiAnalysisUnified';
import { 
  SuperProfile, 
  createEmptySuperProfile, 
  loadSuperProfile, 
  updateSuperProfileFromSelections 
} from '@/utils/superProfileUtils';

const InterestsPage = () => {
  const navigate = useNavigate();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  // Arrays para los IDs seleccionados
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avoidInterests, setAvoidInterests] = useState<string[]>([]);

  // Info adicional del usuario
  const [personalNote, setPersonalNote] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Para mostrar botón admin
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  // Nuevo state para manejar el SuperProfile
  const [superProfile, setSuperProfile] = useState<SuperProfile | null>(null);

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

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Cargar el SuperProfile
      const profile = await loadSuperProfile(userId);
      
      if (profile) {
        setSuperProfile(profile);
        
        // Si hay un análisis de IA, lo cargamos
        if (profile.cultura.tech.ia) {
          setAiAnalysis(profile.cultura.tech.ia);
        }
        
        // Convertimos el SuperProfile a arrays de IDs seleccionados
        const selected: string[] = [];
        const avoided: string[] = [];
        
        // Recorremos el SuperProfile para extraer los intereses seleccionados
        extractInterestsFromSuperProfile(profile, selected, avoided);
        
        setSelectedInterests(selected);
        setAvoidInterests(avoided);
      } else {
        // Si no hay perfil, creamos uno vacío
        setSuperProfile(createEmptySuperProfile());
      }
      
      // También cargamos el perfil básico para la descripción personal
      const { data, error } = await supabase
        .from('profiles')
        .select('descripcion_personal, analisis_externo')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al cargar perfil de usuario:', error);
        toast.error('Error al cargar tu perfil');
        return;
      }

      if (data) {
        if (data.descripcion_personal) setPersonalNote(data.descripcion_personal);
        if (data.analisis_externo && !aiAnalysis) setAiAnalysis(data.analisis_externo);
      }
      
    } catch (err) {
      console.error('Error al cargar perfil de usuario:', err);
      toast.error('Error al cargar tu perfil');
    } finally {
      setLoading(false);
    }
  };

  // Función para extraer los intereses seleccionados del SuperProfile
  const extractInterestsFromSuperProfile = (
    profile: SuperProfile,
    selectedArr: string[],
    avoidArr: string[]
  ) => {
    // Recorremos todo el perfil
    Object.keys(profile).forEach(tabKey => {
      const tab = profile[tabKey as keyof SuperProfile];
      
      Object.keys(tab).forEach(categoryKey => {
        const category = tab[categoryKey as string];
        
        Object.keys(category).forEach(interestKey => {
          // Saltamos el campo 'ia' que es string
          if (interestKey === 'ia') return;
          
          // @ts-ignore - Sabemos que es un objeto con propiedades booleanas
          if (category[interestKey] === true) {
            // Si es de la categoría "avoid", va al array de evitar
            if (categoryKey === 'avoid') {
              avoidArr.push(interestKey);
            } else {
              selectedArr.push(interestKey);
            }
          }
        });
      });
    });
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
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al generar intereses');
    } finally {
      setLoading(false);
    }
  };

  // Guardar en Supabase utilizando la nueva función de SuperProfile
  const handleSave = async () => {
    if (!profileId) return;
    try {
      setLoading(true);

      // Actualizamos el SuperProfile con las selecciones actuales
      const result = await updateSuperProfileFromSelections(
        profileId,
        selectedInterests,
        avoidInterests,
        aiAnalysis
      );

      if (!result.success) {
        throw result.error;
      }
      
      // También actualizamos la descripción personal en el perfil básico
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          descripcion_personal: personalNote,
          // También guardamos el análisis para compatibilidad
          analisis_externo: aiAnalysis
        })
        .eq('id', profileId);
      
      if (profileError) throw profileError;

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

  // Actualizar el análisis de ChatGPT
  const handleAiAnalysisChange = async (analysis: string) => {
    setAiAnalysis(analysis);
    
    // Si tenemos un SuperProfile, actualizamos el campo ia
    if (superProfile && profileId) {
      const updatedProfile = { ...superProfile };
      updatedProfile.cultura.tech.ia = analysis;
      setSuperProfile(updatedProfile);
    }
  };

  // Renderizado de la pestaña actual
  const renderCurrentTab = () => {
    const tabData = interestTabs[currentTabIndex];
    if (!tabData) return null;

    // Si es la pestaña "Opciones Avanzadas IA"
    const isAiTab = tabData.categories.some(
      (cat) => cat.categoryId === 'externalAnalysis'
    );

    if (isAiTab) {
      // Usando el componente AiAnalysisUnified en modo 'prompt'
      return (
        <div className="p-2">
          <AiAnalysisUnified
            mode="prompt"
            userId={profileId || undefined}
            personalNote={personalNote}
            onPersonalNoteChange={setPersonalNote}
            // Convertir IDs de intereses a objetos InterestOption para AiAnalysisUnified
            selectedInterests={selectedInterests.map(id => ({ id, label: id, category: 'other' }))}
            avoidTopics={avoidInterests.map(id => ({ id, label: id, category: 'avoid' }))}
            onSaveResponse={handleAiAnalysisChange}
          />
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
                  // Si es "avoid", lo buscamos en avoidInterests
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
            {/* Renderizado de pestañas con el componente Tabs */}
            <Tabs 
              tabs={interestTabs.map(tab => tab.label)} 
              activeTab={currentTabIndex} 
              onChange={setCurrentTabIndex}
            >
              {/* Contenido de la pestaña */}
              <div className="p-4 flex-1 overflow-auto">
                {loading ? (
                  <p className="text-sm text-black mb-4">Cargando...</p>
                ) : (
                  <>
                    {renderCurrentTab()}

                    {/* Campo de descripción personal solo se muestra cuando no estamos en la pestaña IA */}
                    {currentTabIndex !== interestTabs.length - 1 && (
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
                    )}

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
            </Tabs>
          </div>
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default InterestsPage;
