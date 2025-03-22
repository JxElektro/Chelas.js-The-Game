// FILE: src/pages/Interests.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { useNavigate } from 'react-router-dom';
import Tabs from '@/components/Tabs';
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

  const fetchUserProfile = async (userId: string) => {
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
        // Separa intereses de "Evitar" del resto
        if (Array.isArray(temas_preferidos)) {
          // Ej: "avoid" agrupa los ID que son de "Evitar"
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

                    {/* Campo de descripción personal */}
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
                      <Button variant="primary" onClick={handleSave} disabled={loading || currentTabIndex === interestTabs.length - 1}>
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
