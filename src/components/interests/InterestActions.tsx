
import React from 'react';
import Button from '@/components/Button';
import { seedInterests } from '@/utils/interestUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface InterestActionsProps {
  isAdmin: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSave: () => Promise<void>;
  showSaveButtons?: boolean;
}

const InterestActions: React.FC<InterestActionsProps> = ({ 
  isAdmin, 
  loading, 
  setLoading,
  onSave,
  showSaveButtons = true
}) => {
  const navigate = useNavigate();
  
  const handleSeedInterests = async () => {
    try {
      setLoading(true);
      const { success, error } = await seedInterests();
      
      if (error) {
        console.error('Error al insertar intereses:', error);
        toast.error('Error al generar intereses predefinidos');
      } else {
        toast.success('Intereses predefinidos generados correctamente');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al generar intereses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isAdmin && (
        <Button 
          variant="primary" 
          onClick={handleSeedInterests} 
          className="mb-4"
          disabled={loading}
        >
          {loading ? 'Generando...' : 'Regenerar intereses predefinidos'}
        </Button>
      )}
      
      {showSaveButtons && (
        <div className="flex justify-end mt-4">
          <Button variant="default" onClick={() => navigate('/')} className="mr-2">
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Aceptar'}
          </Button>
        </div>
      )}
    </>
  );
};

export default InterestActions;
