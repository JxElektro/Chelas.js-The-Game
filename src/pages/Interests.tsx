
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
import { useIsMobile } from '@/hooks/use-mobile';

const Interests = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [interests, setInterests] = useState<string[]>([]);
  const [avoidTopics, setAvoidTopics] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [avoidOptions, setAvoidOptions] = useState<InterestOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        
        // Obtenemos todos los intereses excepto los de categoría 'avoid'
        const { data: allInterests, error: interestsError } = await supabase
          .from('interests')
          .select('*')
          .not('category', 'eq', 'avoid');
          
        // Para la categoría avoid, usaremos los mismos intereses pero los marcaremos como "para evitar"
        // Ya que no tenemos una categoría 'avoid' real en la base de datos
        const { data: regularInterests, error: avoidError } = await supabase
          .from('interests')
          .select('*')
          .in('category', ['tech', 'movies', 'music', 'series_anime', 'books', 'travel', 'food', 'sports', 'art', 'hobbies', 'trends', 'humor', 'other']);
        
        if (interestsError) throw interestsError;
        if (avoidError) throw avoidError;
        
        // Formateamos los intereses para el componente InterestSelector
        setInterestOptions(
          (allInterests || []).map((interest: Interest) => ({
            id: interest.id,
            label: interest.name,
            category: interest.category
          }))
        );
        
        // Usamos los mismos intereses para "evitar" pero con una categoría simulada 'avoid'
        setAvoidOptions(
          (regularInterests || []).slice(0, 20).map((interest: Interest) => ({
            id: interest.id,
            label: interest.name,
            category: 'avoid'
          }))
        );
        
        // En una aplicación real, cargaríamos los intereses seleccionados del usuario desde Supabase
        
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
      // En una aplicación real, guardaríamos estas preferencias en Supabase
      console.log('Guardando preferencias:', { interests, avoidTopics });
      toast.success('Preferencias guardadas correctamente');
      
      // Navegamos al lobby
      navigate('/lobby');
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      toast.error('Error al guardar preferencias');
    }
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
