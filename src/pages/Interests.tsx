
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Interest, InterestOption, TopicCategory } from '@/types/supabase';
import { toast } from 'sonner';
import { transformPredefinedInterests } from '@/utils/interestUtils';
import InterestForm from '@/components/InterestForm';

const Interests = () => {
  const navigate = useNavigate();
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [avoidOptions, setAvoidOptions] = useState<InterestOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('Debes iniciar sesión para acceder a esta página');
        navigate('/login');
      }
    };

    checkAuth();
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        category: interest.category as TopicCategory
      }));
      
      const combinedOptions = [...dbInterestOptions];
      predefinedOptions.forEach(option => {
        if (!combinedOptions.some(dbOption => dbOption.label.toLowerCase() === option.label.toLowerCase())) {
          combinedOptions.push(option);
        }
      });
      
      setInterestOptions(combinedOptions);
      
      // Explicitly set the category as 'avoid'
      setAvoidOptions(
        (regularInterests || []).slice(0, 20).map((interest: Interest) => ({
          id: interest.id,
          label: interest.name,
          category: 'avoid' as TopicCategory
        }))
      );
      
    } catch (error: any) {
      console.error('Error al cargar intereses:', error);
      setError('Error al cargar intereses. Por favor, intenta nuevamente.');
      toast.error('Error al cargar intereses');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomInterestAdd = (interest: string) => {
    const newInterest: InterestOption = {
      id: `custom-${Date.now()}`,
      label: interest,
      category: 'other'
    };
    
    setInterestOptions(prev => [...prev, newInterest]);
    toast.success(`Se ha añadido "${interest}" a tus intereses`);
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
          ) : error ? (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded flex items-start">
              <AlertTriangle size={16} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white">{error}</p>
            </div>
          ) : (
            <InterestForm 
              interestOptions={interestOptions}
              avoidOptions={avoidOptions}
              onCustomInterestAdd={handleCustomInterestAdd}
            />
          )}
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Interests;
