
import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Button from './Button';

interface LogoutButtonProps {
  variant?: 'primary' | 'default' | 'ghost';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handleLogout}
    >
      <LogOut size={16} className="mr-2" />
      Cerrar Sesión
    </Button>
  );
};

export default LogoutButton;
