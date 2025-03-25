
import React, { useState, useEffect } from 'react';
import { Save, FileText, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { saveConversationNotes } from '@/services/dailyReportService';
import { supabase } from '@/integrations/supabase/client';

interface ConversationNotesProps {
  conversationId: string;
}

const ConversationNotes: React.FC<ConversationNotesProps> = ({ conversationId }) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
        fetchExistingNotes(data.session.user.id);
      }
    };
    
    checkAuth();
  }, [conversationId]);

  const fetchExistingNotes = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_notes')
        .select('notes')
        .eq('conversation_id', conversationId)
        .eq('user_id', uid)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }
      
      if (data) {
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error in fetchExistingNotes:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!userId) {
      toast.error('Debes iniciar sesión para guardar notas');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const success = await saveConversationNotes(userId, conversationId, notes);
      
      if (success) {
        setShowSuccess(true);
        toast.success('Notas guardadas correctamente');
        
        // Hide success indicator after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        toast.error('Error al guardar las notas');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Error al guardar las notas');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 p-3 bg-chelas-window border border-chelas-gray-dark">
      <div className="flex items-center mb-2">
        <FileText size={16} className="mr-2 text-chelas-gray-dark" />
        <h3 className="text-sm font-bold text-black">Notas de la conversación</h3>
      </div>
      
      <Textarea
        placeholder="Añade notas sobre esta conversación para el informe diario..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full win95-inset border-chelas-gray-dark min-h-[100px] text-sm text-black"
      />
      
      <div className="flex justify-end mt-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleSaveNotes}
          disabled={isSaving}
          className="win95-button flex items-center"
        >
          {showSuccess ? (
            <CheckCircle size={14} className="mr-1 text-green-600" />
          ) : (
            <Save size={14} className="mr-1 text-black" />
          )}
          <span className="text-black">{isSaving ? 'Guardando...' : 'Guardar notas'}</span>
        </Button>
      </div>
      
      <p className="text-xs text-chelas-gray-dark mt-2">
        Estas notas se incluirán en tu informe diario generado por Virus.exe
      </p>
    </div>
  );
};

export default ConversationNotes;
