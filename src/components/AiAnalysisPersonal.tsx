
import React, { useState } from 'react';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        .update({ analisis_externo: analysisText })
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

  return (
    <WindowFrame title="ANÁLISIS EXTERNO (IA)" className="mt-4">
      <div className="flex flex-col space-y-4">
        <p className="text-sm text-black">
          Pega aquí el texto de análisis que obtuviste de ChatGPT (u otra IA).
        </p>

        <textarea
          className="win95-inset w-full h-48 p-2 text-black"
          value={analysisText}
          onChange={(e) => setAnalysisText(e.target.value)}
          placeholder="Pega tu análisis aquí..."
        />

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
