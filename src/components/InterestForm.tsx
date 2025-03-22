
import React, { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import InterestSelector from '@/components/InterestSelector';
import InterestAiChat from '@/components/InterestAiChat';
import { InterestOption } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface InterestFormProps {
  interestOptions: InterestOption[];
  avoidOptions: InterestOption[];
  onCustomInterestAdd: (interest: string) => void;
}

const InterestForm: React.FC<InterestFormProps> = ({ 
  interestOptions, 
  avoidOptions,
  onCustomInterestAdd 
}) => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<string[]>([]);
  const [avoidTopics, setAvoidTopics] = useState<string[]>([]);
  const aiMessage = 'Hola, puedo ayudarte a descubrir más intereses que quizás no hayas considerado. Cuéntame un poco sobre tus pasatiempos favoritos o actividades que disfrutas.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Debes iniciar sesión para guardar tus preferencias');
        navigate('/login');
        return;
      }
      
      const userId = session.user.id;
      
      // Save selected interests
      const interestPromises = interests.map(interestId => {
        // Skip custom interests (they start with "custom-")
        if (interestId.startsWith('custom-')) {
          const option = interestOptions.find(opt => opt.id === interestId);
          if (option) {
            // First, create the interest in the database
            return supabase
              .from('interests')
              .insert({
                name: option.label,
                category: option.category
              })
              .select()
              .then(({ data, error }) => {
                if (error) throw error;
                if (data && data.length > 0) {
                  // Then link it to the user
                  return supabase
                    .from('user_interests')
                    .insert({
                      user_id: userId,
                      interest_id: data[0].id,
                      is_avoided: false
                    });
                }
              });
          }
        } else {
          // For existing interests, just create the user-interest relationship
          return supabase
            .from('user_interests')
            .insert({
              user_id: userId,
              interest_id: interestId,
              is_avoided: false
            });
        }
      });
      
      // Save avoided topics
      const avoidPromises = avoidTopics.map(topicId => {
        return supabase
          .from('user_interests')
          .insert({
            user_id: userId,
            interest_id: topicId,
            is_avoided: true
          });
      });
      
      // Wait for all promises to resolve
      await Promise.all([...interestPromises, ...avoidPromises]);
      
      console.log('Preferencias guardadas correctamente');
      toast.success('Preferencias guardadas correctamente');
      navigate('/lobby');
    } catch (error: any) {
      console.error('Error al guardar preferencias:', error);
      toast.error('Error al guardar preferencias');
    }
  };

  // Handle suggested interest from AI chat
  const handleSuggestedInterest = (interest: string) => {
    // First check if we already have this interest or a maximum number
    if (interests.length >= 5) {
      toast.error('Ya has seleccionado el máximo de intereses (5)');
      return;
    }
    
    // Create a new custom interest and add it
    onCustomInterestAdd(interest);
  };

  return (
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
          onCustomInterestSubmit={onCustomInterestAdd}
        />
        
        <InterestSelector
          title="Prefiero evitar:"
          options={avoidOptions}
          selectedOptions={avoidTopics}
          onChange={setAvoidTopics}
          maxSelections={3}
        />
      </div>
      
      <InterestAiChat 
        initialMessage={aiMessage} 
        onSuggestedInterestClick={handleSuggestedInterest}
      />
      
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
  );
};

export default InterestForm;
