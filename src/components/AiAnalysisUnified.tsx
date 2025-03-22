import React, { useState, useEffect } from 'react';
import { Copy, Check, Send } from 'lucide-react';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Profile, InterestOption } from '@/types/supabase';
import { formatProfileAnalysis } from '@/services/deepseekService';
import { Textarea } from './ui/textarea';
import { SuperProfile } from '@/utils/superProfileUtils';
import { Json } from '@/integrations/supabase/types';

interface AiAnalysisUnifiedProps {
  mode: 'prompt' | 'response';
  profile?: Profile;
  selectedInterests?: InterestOption[];
  avoidTopics?: InterestOption[];
  customPrompt?: string;
  onSaveResponse?: (response: string) => Promise<void> | void;
  userId?: string;
  personalNote?: string;
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

  useEffect(() => {
    if (mode === 'response' && userId) {
      fetchExistingAnalysis();
    }
  }, [mode, userId]);

  const fetchExistingAnalysis = async () => {
    if (!userId) return;
    
    try {
      setIsFetchingExisting(true);
      const { data: superProfileData, error: superProfileError } = await supabase
        .from('profiles')
        .select('super_profile')
        .eq('id', userId)
        .single();
      
      if (!superProfileError && superProfileData?.super_profile) {
        const typedSuperProfile = superProfileData.super_profile as unknown as SuperProfile;
        if (typedSuperProfile.cultura?.tech?.ia) {
          setAnalysisText(typedSuperProfile.cultura.tech.ia);
          setChecked(true);
          setIsFetchingExisting(false);
          return;
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('analisis_externo')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error al cargar análisis existente:', error);
        }
        return;
      }
      
      if (data && data.analisis_externo) {
        setAnalysisText(data.analisis_externo);
        setChecked(true);
      }
    } catch (err) {
      console.error('Error al obtener análisis:', err);
    } finally {
      setIsFetchingExisting(false);
    }
  };

  const fixedPrompt = `Genera un perfil completo, auténtico y amigable sobre mí con el objetivo de facilitar conversaciones interesantes y significativas. Evita cualquier tipo de información sensible, como contraseñas, direcciones específicas, números de teléfono o documentos personales.

Organiza el perfil en las siguientes secciones:

- **Datos Generales:** (Nombre, Edad, Lugar donde vivo actualmente, y algo relevante de mi origen cultural o familiar)

- **Formación Académica:** (Cursos realizados, bootcamps, talleres, tecnologías o herramientas aprendidas de forma autodidacta)

- **Experiencia Laboral:** (Puestos que he desempeñado, proyectos interesantes en los que he trabajado, tecnologías que domino y cómo las he aplicado en mis trabajos)

- **Habilidades Técnicas y Blandas:** (Lenguajes de programación, frameworks, herramientas, y habilidades blandas como comunicación, trabajo en equipo, liderazgo)

- **Logros e Intereses Personales:** (Proyectos personales, hobbies, voluntariados, comunidades tecnológicas en las que participo, interés en innovación tecnológica)

- **Resumen Personal:** (Breve descripción sobre cómo me percibo personalmente, cómo me gustaría que me perciban los demás, mis aspiraciones personales y profesionales)`;

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
Genera un perfil completo, auténtico y amigable sobre mí con el objetivo de facilitar conversaciones interesantes y significativas. Evita cualquier tipo de información sensible, como contraseñas, direcciones específicas, números de teléfono o documentos personales.

Organiza el perfil en las siguientes secciones:

- **Datos Generales:** (Nombre, Edad, Lugar donde vivo actualmente, y algo relevante de mi origen cultural o familiar)

- **Formación Académica:** (Cursos realizados, bootcamps, talleres, tecnologías o herramientas aprendidas de forma autodidacta)

- **Experiencia Laboral:** (Puestos que he desempeñado, proyectos interesantes en los que he trabajado, tecnologías que domino y cómo las he aplicado en mis trabajos)

- **Habilidades Técnicas y Blandas:** (Lenguajes de programación, frameworks, herramientas, y habilidades blandas como comunicación, trabajo en equipo, liderazgo)

- **Logros e Intereses Personales:** (Proyectos personales, hobbies, voluntariados, comunidades tecnológicas en las que participo, interés en innovación tecnológica)

- **Resumen Personal:** (Breve descripción sobre cómo me percibo personalmente, cómo me gustaría que me perciban los demás, mis aspiraciones personales y profesionales)

Datos disponibles:
- Nombre: ${profile?.name || 'No disponible'}
- Descripción personal: ${personalDescription}
- Temas de interés: ${interestsText}
- Temas que prefiero evitar: ${avoidText}

Utiliza esta estructura para generar un perfil amigable que facilite conectar con personas con intereses similares, creando un ambiente propicio para iniciar conversaciones enriquecedoras.
    `.trim();
  };

  const analysisPrompt = mode === 'prompt'
    ? generatePromptFromProfile()
    : fixedPrompt;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(analysisPrompt);
    setCopied(true);
    toast.success('Texto copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const openChatGPT = () => {
    window.open('https://chat.openai.com/', '_blank');
  };

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
      
      const { data: superProfileData } = await supabase
        .from('profiles')
        .select('super_profile')
        .eq('id', userId)
        .single();
      
      if (superProfileData?.super_profile) {
        const updatedProfile = JSON.parse(JSON.stringify(superProfileData.super_profile)) as unknown as SuperProfile;
        
        if (!updatedProfile.cultura) updatedProfile.cultura = {} as SuperProfile['cultura'];
        if (!updatedProfile.cultura.tech) updatedProfile.cultura.tech = {} as SuperProfile['cultura']['tech'];
        
        updatedProfile.cultura.tech.ia = formattedText;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            super_profile: updatedProfile as unknown as Json,
            analisis_externo: formattedText
          })
          .eq('id', userId);
          
        if (updateError) throw updateError;
      } else {
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

  const handlePersonalNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onPersonalNoteChange) {
      onPersonalNoteChange(e.target.value);
    }
  };

  return (
    <WindowFrame title={mode === 'prompt' ? "ANÁLISIS DE IA: MI PERFIL" : "ANÁLISIS IA"} className="mt-6">
      <div className="p-2">
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
