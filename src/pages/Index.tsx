
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Desktop from '@/components/Desktop';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos si hay una sesión activa
    const checkAuth = async () => {
      const { data } = await fetch('/auth/session').then(res => res.json());
      if (!data.session) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return <Desktop />;
};

export default Index;
