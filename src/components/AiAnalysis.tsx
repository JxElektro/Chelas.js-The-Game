import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Profile, InterestOption } from '@/types/supabase';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { toast } from 'sonner';

interface AiAnalysisProps {
  profile: Profile;
  selectedInterests: InterestOption[];
  avoidTopics: InterestOption[];
}

const AiAnalysis: React.FC<AiAnalysisProps> = ({ 
  profile, 
  selectedInterests, 
  avoidTopics 
}) => {
  const [copied, setCopied] = useState(false);

  // Generar el prompt de análisis para crear un perfil completo sin datos sensibles
  const generateAnalysisPrompt = () => {
    const interestsText = selectedInterests.length > 0 
      ? selectedInterests.map(i => i.label).join(', ')
      : 'Ninguno';
    
    const avoidText = avoidTopics.length > 0 
      ? avoidTopics.map(i => i.label).join(', ')
      : 'Ninguno';
    
    const personalDescription = profile.descripcion_personal && profile.descripcion_personal.trim()
      ? profile.descripcion_personal
      : 'No se ha proporcionado descripción personal.';

    return `
Genera un perfil completo y detallado de un usuario utilizando la siguiente información. Incluye las secciones de:
- Datos Generales  
- Formación Académica  
- Experiencia Laboral  
- Habilidades  
- Logros e Intereses  
- Resumen Personal

No incluyas información sensible como contraseñas, números de teléfono u otros datos privados.

Datos disponibles:
- Nombre: ${profile.name}
- Descripción personal: ${personalDescription}
- Temas de interés: ${interestsText}
- Temas que se prefieren evitar: ${avoidText}

Utiliza esta información para generar un perfil que permita a alguien que no conoce al usuario entablar una conversación y conocer más sobre él.
    `.trim();
  };

  const analysisPrompt = generateAnalysisPrompt();

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisPrompt);
    setCopied(true);
    toast.success('Texto copiado al portapapeles');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <WindowFrame title="ANÁLISIS DE IA: TU PERFIL" className="mt-6">
      <div className="p-2">
        <p className="text-black text-sm mb-4">
          Este es el texto que la IA utiliza para entender tu perfil. Puedes copiarlo y pegarlo en ChatGPT 
          u otra herramienta de IA para obtener más información o sugerencias personalizadas.
        </p>
        
        <div className="win95-inset bg-white p-3 mb-4 relative">
          <pre className="text-black text-xs whitespace-pre-wrap">
            {analysisPrompt}
          </pre>
          
          <Button
            variant="primary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
        
        <div className="bg-chelas-yellow/20 p-2 border border-chelas-yellow text-sm">
          <p className="text-white">
            <strong>Sugerencia:</strong> Usa este texto en ChatGPT para obtener recomendaciones 
            de temas de conversación o para entender mejor cómo te ve la IA.
          </p>
        </div>
      </div>
    </WindowFrame>
  );
};

export default AiAnalysis;
