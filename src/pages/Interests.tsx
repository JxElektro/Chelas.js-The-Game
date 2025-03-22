
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import InterestSelector from '@/components/InterestSelector';
import { Tag, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Interest, InterestOption } from '@/types/supabase';
import { toast } from 'sonner';

const Interests = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<string[]>([]);
  const [avoidTopics, setAvoidTopics] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [avoidOptions, setAvoidOptions] = useState<InterestOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        
        // Obtenemos los intereses de la base de datos
        const { data: techInterests, error: techError } = await supabase
          .from('interests')
          .select('*')
          .eq('category', 'tech');
          
        const { data: avoidInterests, error: avoidError } = await supabase
          .from('interests')
          .select('*')
          .eq('category', 'avoid');
        
        if (techError) throw techError;
        if (avoidError) throw avoidError;
        
        // Formateamos los intereses para el componente InterestSelector
        setInterestOptions(
          (techInterests || []).map((interest: Interest) => ({
            id: interest.id,
            label: interest.name,
            category: interest.category
          }))
        );
        
        setAvoidOptions(
          (avoidInterests || []).map((interest: Interest) => ({
            id: interest.id,
            label: interest.name,
            category: interest.category
          }))
        );
        
        // En una aplicación real, cargaríamos los intereses seleccionados del usuario desde Supabase
        
      } catch (error) {
        console.error('Error fetching interests:', error);
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
      // En una aplicación real, guardaríamos estas preferencias en Supabase
      console.log('Guardando preferencias:', { interests, avoidTopics });
      toast.success('Preferencias guardadas correctamente');
      
      // Navegamos al lobby
      navigate('/lobby');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar preferencias');
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[80vh]"
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

        <WindowFrame title="PREFERENCIAS DE CONVERSACIÓN" className="w-full max-w-md">
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
                />
                
                <InterestSelector
                  title="Prefiero evitar:"
                  options={avoidOptions}
                  selectedOptions={avoidTopics}
                  onChange={setAvoidTopics}
                  maxSelections={3}
                />
              </div>
              
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
