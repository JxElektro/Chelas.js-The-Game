
import React, { useState, useEffect } from 'react';
import { Copy, Check, Send } from 'lucide-react';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Profile, InterestOption } from '@/types/supabase';
// Función que formatea el análisis usando IA (por ejemplo, DeepSeek)
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
  onSaveResponse?: (response: string) => Promise<void> | void;
  // userId, por ejemplo para guardar en la BD (modo "response")
  userId?: string;
  // Descripción personal
  personalNote?: string;
  // Callback para actualizar la descripción personal
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
  onPersonalNoteChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(true);

  // Cargar el análisis existente cuando se monta el componente
  useEffect(() => {
    if (mode === 'response' && userId) {
      fetchExistingAnalysis();
    }
  }, [mode, userId]);

  // Función para cargar el análisis existente
  const fetchExistingAnalysis = async () => {
    if (!userId) return;
    
    try {
      setIsFetchingExisting(true);
      // Intentamos primero cargar desde super_profile.cultura.tech.ia
      const { data: superProfileData, error: superProfileError } = await supabase
        .from('profiles')
        .select('super_profile')
        .eq('id', userId)
        .single();
      
      if (!superProfileError && superProfileData?.super_profile?.cultura?.tech?.ia) {
        setAnalysisText(superProfileData.super_profile.cultura.tech.ia);
        setChecked(true);
        setIsFetchingExisting(false);
        return;
      }
      
      // Si no existe en super_profile, lo buscamos en analisis_externo
      const { data, error } = await supabase
        .from('profiles')
        .select('analisis_externo')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // No encontrado
          console.error('Error al cargar análisis existente:', error);
        }
        return;
      }
      
      if (data && data.analisis_externo) {
        setAnalysisText(data.analisis_externo);
        // Si hay un análisis existente, podemos marcar la casilla de confirmación
        setChecked(true);
      }
    } catch (err) {
      console.error('Error al obtener análisis:', err);
    } finally {
      setIsFetchingExisting(false);
    }
  };

  // Prompt fijo para modo "response" (se indica que se trata de mi perfil)
  const fixedPrompt = `ChatGPT, necesito que generes un perfil completo y detallado **de mí** utilizando la siguiente información personal y profesional. Por favor, incluye las siguientes secciones:

1. **Datos Generales:**  
   - Nombre  
   - Edad o rango de edad  
   - Ubicación (ciudad o país)

2. **Formación Académica y Experiencia Laboral:**  
   - Estudios realizados y títulos obtenidos  
   - Puestos de trabajo y principales responsabilidades

3. **Habilidades y Competencias:**  
   - Habilidades técnicas  
   - Habilidades blandas

4. **Logros e Intereses:**  
   - Proyectos destacados o reconocimientos  
   - Intereses personales y profesionales

No incluyas información sensible (como contraseñas o datos privados).`;

  // Función para generar el prompt a partir de mi información (modo "prompt")
  const generatePromptFromProfile = (): string => {
    if (customPrompt) return customPrompt;
    const interestsText = selectedInterests.length > 0
      ? selectedInterests.map(i => i.label).join(', ')
      : 'Ninguno';
    const avoidText = avoidTopics.length > 0
      ? avoidTopics.map(i => i.label).join(', ')
      : 'Ninguno';
    const personalDescription = personalNote?.trim()
      ? personalNote
      : 'No he proporcionado una descripción personal.';
    return `
Genera un perfil completo y detallado **de mí** utilizando la siguiente información. Incluye las secciones de:
- Datos Generales  
- Formación Académica  
- Experiencia Laboral  
- Habilidades  
- Logros e Intereses  
- Resumen Personal

Mis datos disponibles:
- Nombre: ${profile?.name || 'No disponible'}
- Descripción personal: ${personalDescription}
- Temas de interés: ${interestsText}
- Temas que prefiero evitar: ${avoidText}

Utiliza esta información para generar un perfil que me represente de forma auténtica y facilite iniciar una conversación conmigo.
    `.trim();
  };

  // Seleccionamos el prompt según el modo
  const analysisPrompt = mode === 'prompt'
    ? generatePromptFromProfile()
    : fixedPrompt;

  // Función para copiar el prompt (común para ambos modos)
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(analysisPrompt);
    setCopied(true);
    toast.success('Texto copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  // Función para abrir ChatGPT en una nueva pestaña
  const openChatGPT = () => {
    window.open('https://chat.openai.com/', '_blank');
  };

  // Función para guardar la respuesta formateada con IA
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
      const formattedText = await formatProfileAnalysis(analysisText);
      
      // Actualizar el SuperProfile si existe
      const { data: superProfileData } = await supabase
        .from('profiles')
        .select('super_profile')
        .eq('id', userId)
        .single();
      
      if (superProfileData?.super_profile) {
        // Clonar el SuperProfile y actualizar el campo ia
        const updatedProfile = JSON.parse(JSON.stringify(superProfileData.super_profile));
        updatedProfile.cultura.tech.ia = formattedText;
        
        // Guardar el SuperProfile actualizado
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            super_profile: updatedProfile,
            // También actualizamos analisis_externo para compatibilidad
            analisis_externo: formattedText
          })
          .eq('id', userId);
          
        if (updateError) throw updateError;
      } else {
        // Si no hay SuperProfile, solo actualizamos analisis_externo
        const { error } = await supabase
          .from('profiles')
          .update({
            analisis_externo: formattedText
          })
          .eq('id', userId);
          
        if (error) throw error;
      }
      
      toast.success('Análisis guardado correctamente');
      if (onSaveResponse) {
        await onSaveResponse(formattedText);
      }
    } catch (err) {
      console.error('Error al guardar el análisis:', err);
      toast.error('Error al guardar el análisis');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cambio en la descripción personal
  const handlePersonalNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onPersonalNoteChange) {
      onPersonalNoteChange(e.target.value);
    }
  };

  return (
    <WindowFrame title={mode === 'prompt' ? "ANÁLISIS DE IA: MI PERFIL" : "ANÁLISIS IA"} className="mt-6">
      <div className="p-2">
        {/* Botones separados para Mostrar/Ocultar prompt y Copiar prompt */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setShowPrompt(!showPrompt)}
          >
            {showPrompt ? "Ocultar prompt" : "Mostrar prompt"}
          </Button>
          {showPrompt && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleCopyPrompt}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          )}
        </div>
        {showPrompt && (
          <div className="win95-inset bg-white p-2 mb-4">
            <pre className="text-black text-xs whitespace-pre-wrap">
              {analysisPrompt}
            </pre>
          </div>
        )}

        {mode === 'prompt' && (
          <div className="mt-4">
            <label className="text-sm text-black mb-2 block">
              <strong>Cuéntanos algo personal sobre ti (opcional):</strong>
            </label>
            <Textarea
              value={personalNote}
              onChange={handlePersonalNoteChange}
              placeholder="Descríbete brevemente. Esta información ayudará a generar un perfil más preciso."
              className="win95-inset w-full h-32 p-2 text-black"
            />
          </div>
        )}

        {mode === 'response' && (
          <>
            <div className="bg-chelas-yellow/20 p-2 border border-chelas-yellow text-sm mb-4">
              <p className="text-white">
                Usa el prompt copiado en ChatGPT para generar un perfil que me represente. Luego, pega la respuesta en el campo de abajo.
              </p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-black mb-2">
                <strong>Pega aquí la respuesta de ChatGPT:</strong>
              </p>
              {isFetchingExisting ? (
                <p className="text-sm text-gray-500 mb-2">Cargando análisis guardado...</p>
              ) : (
                <Textarea
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  placeholder="Pega aquí el perfil generado por ChatGPT..."
                  className="win95-inset w-full h-48 p-2 text-black"
                />
              )}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="sensitiveCheck"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="sensitiveCheck" className="text-sm text-black">
                Confirmo que este texto no contiene información sensible.
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
