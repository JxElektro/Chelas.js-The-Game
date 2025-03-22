
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

  // Generar el prompt de análisis basado en los intereses y la descripción personal
  const generateAnalysisPrompt = () => {
    const interestsText = selectedInterests.length > 0 
      ? `Temas que me interesan: ${selectedInterests.map(i => i.label).join(', ')}.` 
      : 'No he seleccionado temas de interés específicos.';
    
    const avoidText = avoidTopics.length > 0 
      ? `Temas que prefiero evitar: ${avoidTopics.map(i => i.label).join(', ')}.` 
      : 'No he especificado temas que prefiera evitar.';
    
    const personalDescription = profile.descripcion_personal && profile.descripcion_personal.trim()
      ? `Sobre mí: ${profile.descripcion_personal}`
      : 'No he proporcionado una descripción personal.';

    return `
## Mi Perfil para Conversaciones

Hola, soy ${profile.name}. Este es un resumen de mis intereses para ayudar a generar conversaciones:

${interestsText}

${avoidText}

${personalDescription}

Basado en esta información, ¿podrías ayudarme a:
1. Entender qué tipo de conversaciones podrían ser más interesantes para mí?
2. Sugerir algunos temas específicos o preguntas que podría plantear en una conversación con otra persona?
3. Identificar qué temas podrían conectar bien con personas con intereses similares?
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
