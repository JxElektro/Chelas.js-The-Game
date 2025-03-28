
import React, { useState, useEffect } from 'react';
import { Copy, Check, ArrowDownToLine, Send } from 'lucide-react';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';
import ImageUploader from './ImageUploader';

/**
 * Props:
 * - userId: ID del usuario actual (UUID de Supabase).
 * - currentAnalysis: Texto actual guardado en analisis_externo (opcional, para precargar).
 */
interface AiAnalysisPersonalProps {
  userId: string;
  currentAnalysis?: string;
}

const AiAnalysisPersonal: React.FC<AiAnalysisPersonalProps> = ({ userId, currentAnalysis }) => {
  const [analysisText, setAnalysisText] = useState(currentAnalysis || '');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Cargar análisis existente al iniciar
  useEffect(() => {
    if (!currentAnalysis) {
      fetchExistingAnalysis();
    } else {
      setIsFetchingExisting(false);
      if (currentAnalysis) {
        setChecked(true);
      }
    }
  }, [currentAnalysis, userId]);

  // Función para cargar el análisis existente de Supabase
  const fetchExistingAnalysis = async () => {
    try {
      setIsFetchingExisting(true);
      
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
        setChecked(true);
      }
    } catch (err) {
      console.error('Error al obtener análisis:', err);
    } finally {
      setIsFetchingExisting(false);
    }
  };

  // Texto de prompt para ChatGPT
  const chatGptPrompt = `ChatGPT, necesito que generes un perfil completo y detallado de un usuario utilizando información pública y profesional. Por favor, incluye las siguientes secciones:

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

  const handleSave = async () => {
    // Verificar que el usuario haya marcado el checkbox
    if (!checked) {
      toast.error('Debes confirmar que no contiene información sensible');
      return;
    }

    setLoading(true);
    try {
      // Guardar en la columna analisis_externo
      const { error } = await supabase
        .from('profiles')
        .update({ 
          analisis_externo: analysisText,
          // Si hay una imagen subida, guardar la URL
          ...(uploadedImageUrl ? { screenshot: uploadedImageUrl } : {})
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Análisis guardado correctamente');
    } catch (err) {
      console.error('Error al guardar el análisis:', err);
      toast.error('Error al guardar el análisis');
    } finally {
      setLoading(false);
    }
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(chatGptPrompt);
    setPromptCopied(true);
    toast.success('Prompt copiado al portapapeles');
    
    setTimeout(() => {
      setPromptCopied(false);
    }, 2000);
  };

  const openChatGPT = () => {
    window.open('https://chat.openai.com/', '_blank');
  };

  const handleImageUploaded = (url: string) => {
    setUploadedImageUrl(url);
  };

  return (
    <WindowFrame title="OPCIONES AVANZADAS IA" className="mt-4">
      <div className="flex flex-col space-y-4 p-4">
        <div className="bg-chelas-black/20 p-3 border border-chelas-yellow rounded">
          <p className="text-sm text-white mb-2">
            <strong>¿Cómo funciona?</strong> Utiliza este prompt para pedirle a ChatGPT que genere un perfil 
            profesional completo. Luego, pega la respuesta abajo para guardarla en tu perfil.
          </p>
          
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowPrompt(!showPrompt)}
              className="flex items-center"
            >
              {showPrompt ? 'Ocultar Prompt' : 'Ver Prompt'} <ArrowDownToLine size={14} className="ml-1" />
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={openChatGPT}
              className="flex items-center"
            >
              Ir a ChatGPT <Send size={14} className="ml-1" />
            </Button>
          </div>
        </div>
        
        {showPrompt && (
          <div className="win95-inset bg-chelas-button-face p-3 relative">
            <pre className="text-black text-xs whitespace-pre-wrap overflow-auto max-h-60">
              {chatGptPrompt}
            </pre>
            
            <Button
              variant="primary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={copyPromptToClipboard}
            >
              {promptCopied ? <Check size={14} /> : <Copy size={14} />}
              {promptCopied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm text-black mb-2">
            <strong>Pega aquí la respuesta de ChatGPT:</strong>
          </p>
          {isFetchingExisting ? (
            <p className="text-sm text-gray-500 mb-2">Cargando análisis guardado...</p>
          ) : (
            <Textarea
              className="win95-inset w-full h-48 p-2 text-black"
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              placeholder="Pega aquí el perfil generado por ChatGPT..."
            />
          )}
        </div>

        {/* Componente de subida de imágenes */}
        <div className="mt-4">
          <p className="text-sm text-black mb-2">
            <strong>Subir imagen de perfil o avatar:</strong>
          </p>
          <ImageUploader 
            onImageUploaded={handleImageUploaded}
            bucketName="screenshots"
          />
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="sensitiveCheck"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="sensitiveCheck" className="text-sm text-black">
            Confirmo que este texto no contiene información sensible o privada que no desee compartir.
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Análisis'}
          </Button>
        </div>
      </div>
    </WindowFrame>
  );
};

export default AiAnalysisPersonal;
