
import React, { useState } from 'react';
import { Copy, Check, ArrowDownToLine, Send } from 'lucide-react';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Profile, InterestOption } from '@/types/supabase';
// Importa la función para formatear el análisis usando IA
import { formatProfileAnalysis } from '@/services/deepseekService';
import { Textarea } from './ui/textarea';

interface AiAnalysisUnifiedProps {
  mode: 'prompt' | 'response';
  // Datos para modo "prompt"
  profile?: Profile;
  selectedInterests?: InterestOption[];
  avoidTopics?: InterestOption[];
  // Permite sobrescribir el prompt generado automáticamente
  customPrompt?: string;
  // Callback para guardar respuesta (modo "response")
  onSaveResponse?: (response: string) => Promise<void>;
  // userId, por ejemplo para guardar en la BD (modo "response")
  userId?: string;
  // Información personal del usuario
  personalNote?: string;
  // Callback para actualizar la nota personal
  onPersonalNoteChange?: (note: string) => void;
}

const AiAnalysisUnified: React.FC<AiAnalysisUnifiedProps> = ({
  mode,
  profile,
  selectedInterests = [],
  avoidTopics = [],
  customPrompt,
  onSaveResponse,
  userId,
  personalNote = '',
  onPersonalNoteChange
}) => {
  const [copied, setCopied] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [localPersonalNote, setLocalPersonalNote] = useState(personalNote);

  // Prompt fijo para el modo 'response'
  const fixedPrompt = `ChatGPT, necesito que generes un perfil completo y detallado de un usuario utilizando información pública y profesional. Por favor, incluye las siguientes secciones:

1. **Datos Generales:**  
   - Nombre (ficticio o genérico)  
   - Edad o rango de edad  
   - Ubicación aproximada (ciudad o país)

2. **Formación Académica y Experiencia Laboral:**  
   - Estudios realizados y títulos obtenidos  
   - Principales puestos de trabajo y responsabilidades

3. **Habilidades y Competencias:**  
   - Habilidades técnicas (ej. lenguajes de programación, herramientas, etc.)  
   - Habilidades blandas (comunicación, trabajo en equipo, liderazgo, etc.)

4. **Logros e Intereses:**  
   - Proyectos destacados o reconocimientos  
   - Intereses personales y profesionales

Asegúrate de utilizar datos genéricos o ficticios, y de no incluir ninguna información sensible como contraseñas, números de identificación o datos de contacto reales. La idea es tener un perfil completo y descriptivo que resalte los aspectos públicos y profesionales del usuario.`;

  // Función para generar el prompt basado en el perfil (modo "prompt")
  const generatePromptFromProfile = (): string => {
    if (customPrompt) return customPrompt;
    const interestsText = selectedInterests.length > 0 
      ? selectedInterests.map(i => i.label).join(', ')
      : 'Ninguno';
    
    const avoidText = avoidTopics.length > 0 
      ? avoidTopics.map(i => i.label).join(', ')
      : 'Ninguno';
    
    const personalDescription = localPersonalNote?.trim() 
      ? localPersonalNote 
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
- Nombre: ${profile?.name || 'Nombre no disponible'}
- Descripción personal: ${personalDescription}
- Temas de interés: ${interestsText}
- Temas que se prefieren evitar: ${avoidText}

Utiliza esta información para generar un perfil que permita a alguien que no conoce al usuario entablar una conversación y conocer más sobre él.
    `.trim();
  };

  // Seleccionamos el prompt a usar según el modo
  const analysisPrompt = mode === 'prompt'
    ? generatePromptFromProfile()
    : fixedPrompt;

  // Función para copiar el prompt (para ambos modos)
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(analysisPrompt);
    setCopied(true);
    toast.success('Texto copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  // Función para copiar el prompt fijo en modo response
  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(fixedPrompt);
    setPromptCopied(true);
    toast.success('Prompt copiado al portapapeles');
    setTimeout(() => setPromptCopied(false), 2000);
  };

  // Función para abrir ChatGPT en una nueva pestaña
  const openChatGPT = () => {
    window.open('https://chat.openai.com/', '_blank');
  };

  // Manejar cambios en la nota personal
  const handlePersonalNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalPersonalNote(newValue);
    if (onPersonalNoteChange) {
      onPersonalNoteChange(newValue);
    }
  };

  // Función para guardar la respuesta del análisis (modo "response")
  // Se utiliza la IA para formatear el texto antes de guardarlo en Supabase
  const handleSaveResponse = async () => {
    if (!checked) {
      toast.error('Debes confirmar que el texto no contiene información sensible');
      return;
    }
    if (!userId) {
      toast.error('No se encontró el ID de usuario');
      return;
    }
    setLoading(true);
    try {
      // Llamada a la IA para formatear el análisis recibido
      const formattedText = await formatProfileAnalysis(analysisText);
      
      // Actualizar la columna "analisis_externo" y la descripción personal en Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          analisis_externo: formattedText,
          descripcion_personal: localPersonalNote
        })
        .eq('id', userId);
        
      if (error) throw error;
      toast.success('Análisis y descripción personal guardados correctamente');
      if (onSaveResponse) await onSaveResponse(formattedText);
    } catch (err) {
      console.error('Error al guardar el análisis:', err);
      toast.error('Error al guardar el análisis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WindowFrame title={mode === 'prompt' ? "ANÁLISIS DE IA: TU PERFIL" : "ANÁLISIS IA"} className="mt-6">
      <div className="p-2">
        {/* Campo para la descripción personal */}
        <div className="mb-4">
          <label className="block text-xs text-black mb-1">
            Cuéntanos algo personal sobre ti (opcional)
          </label>
          <Textarea
            value={localPersonalNote}
            onChange={handlePersonalNoteChange}
            placeholder="Me encanta cocinar platos italianos y coleccionar cómics de superhéroes..."
            className="win95-inset w-full h-24 p-2 text-black"
          />
        </div>

        <p className="text-black text-sm mb-4">
          Este es el texto que la IA utiliza para entender tu perfil. Puedes copiarlo y pegarlo en ChatGPT u otra herramienta de IA para obtener más información o sugerencias personalizadas.
        </p>

        <div className="win95-inset bg-white p-3 mb-4 relative">
          <pre className="text-black text-xs whitespace-pre-wrap">
            {analysisPrompt}
          </pre>
          <Button
            variant="primary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={mode === 'prompt' ? handleCopyPrompt : copyPromptToClipboard}
          >
            {copied || promptCopied ? <Check size={14} /> : <Copy size={14} />}
            {copied || promptCopied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>

        {mode === 'response' && (
          <>
            <div className="bg-chelas-yellow/20 p-2 border border-chelas-yellow text-sm mb-4">
              <p className="text-white">
                <strong>Sugerencia:</strong> Usa este prompt en ChatGPT para obtener recomendaciones de temas de conversación o para entender mejor cómo te ve la IA.
                <br />
                Luego, pega la respuesta generada en el siguiente campo.
              </p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-black mb-2">
                <strong>Pega aquí la respuesta de ChatGPT:</strong>
              </p>
              <textarea
                className="win95-inset w-full h-48 p-2 text-black"
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                placeholder="Pega aquí el perfil generado por ChatGPT..."
              />
            </div>
            <div className="flex items-start space-x-2 mt-4">
              <input
                type="checkbox"
                id="sensitiveCheck"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="sensitiveCheck" className="text-sm text-black">
                Confirmo que este texto no contiene información sensible o privada.
              </label>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="primary" onClick={handleSaveResponse} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Análisis'}
              </Button>
            </div>
            <div className="flex justify-center mt-4">
              <Button variant="default" size="sm" onClick={openChatGPT} className="flex items-center">
                Ir a ChatGPT <Send size={14} className="ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </WindowFrame>
  );
};

export default AiAnalysisUnified;
