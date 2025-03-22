
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import { Mail, Lock, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      toast.success('Sesión iniciada correctamente');
      navigate('/lobby');
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      
      toast.success('Se ha enviado un enlace para restablecer tu contraseña');
      setForgotPassword(false);
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      toast.error(error.message || 'Error al enviar correo de restablecimiento');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[80vh]"
      >
        <Button 
          variant="ghost" 
          className="self-start mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} className="mr-1" />
          Atrás
        </Button>

        <h1 className="text-chelas-yellow text-2xl mb-6">
          {forgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
        </h1>

        {!forgotPassword ? (
          <WindowFrame title="INICIAR SESIÓN" className="max-w-xs w-full">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm text-black mb-1">
                  Correo
                </label>
                <div className="flex">
                  <div className="bg-chelas-button-face p-2 border-2 border-r-0 shadow-win95-button">
                    <Mail size={16} className="text-black" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="win95-inset flex-1 px-2 py-1 text-black focus:outline-none"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm text-black mb-1">
                  Contraseña
                </label>
                <div className="flex">
                  <div className="bg-chelas-button-face p-2 border-2 border-r-0 shadow-win95-button">
                    <Lock size={16} className="text-black" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="win95-inset flex-1 px-2 py-1 text-black focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button type="submit" variant="primary" disabled={loading} className="w-full">
                  {loading ? (
                    'Cargando...'
                  ) : (
                    <>
                      Iniciar Sesión <ChevronRight size={16} className="ml-1" />
                    </>
                  )}
                </Button>
                
                <div className="text-center text-sm text-black mt-2">
                  <p>¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-blue-900 hover:underline">
                      Regístrate
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-blue-900 hover:underline mt-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </form>
          </WindowFrame>
        ) : (
          <WindowFrame title="RECUPERAR CONTRASEÑA" className="max-w-xs w-full">
            <form onSubmit={handleResetPassword}>
              <div className="mb-6">
                <p className="text-sm text-black mb-4">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <label htmlFor="resetEmail" className="block text-sm text-black mb-1">
                  Correo Electrónico
                </label>
                <div className="flex">
                  <div className="bg-chelas-button-face p-2 border-2 border-r-0 shadow-win95-button">
                    <Mail size={16} className="text-black" />
                  </div>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="win95-inset flex-1 px-2 py-1 text-black focus:outline-none"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button type="submit" variant="primary" disabled={resetLoading} className="w-full">
                  {resetLoading ? (
                    'Enviando...'
                  ) : (
                    <>
                      Enviar Enlace <RefreshCw size={16} className="ml-1" />
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setForgotPassword(false)} 
                  className="w-full"
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </form>
          </WindowFrame>
        )}
      </motion.div>
    </Layout>
  );
};

export default Login;
