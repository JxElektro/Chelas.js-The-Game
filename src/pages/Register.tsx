
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import AvatarSelector from '@/components/AvatarSelector';
import { AvatarType } from '@/components/Avatar';
import { User, Mail, Lock, ChevronRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: 'user' as AvatarType
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleAvatarSelect = (type: AvatarType) => {
    setFormData(prev => ({ ...prev, avatar: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate email and password
      if (formData.email.trim() === '' || formData.password.trim().length < 6) {
        setError('Por favor completa todos los campos. La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      setStep(2);
    } else {
      setLoading(true);
      setError(null);
      
      try {
        // Register the user with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              avatar: formData.avatar
            }
          }
        });

        if (signUpError) throw signUpError;
        
        // Create profile after successful registration
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: formData.name,
              avatar: formData.avatar,
              is_available: true
            });
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
            toast.error('Error al crear el perfil');
          }
        }
        
        toast.success('Cuenta creada correctamente');
        // Navigate to the interests page
        navigate('/interests');
      } catch (error: any) {
        console.error('Error registering user:', error);
        setError(error.message || 'Error al crear la cuenta');
        toast.error('Error al crear la cuenta');
      } finally {
        setLoading(false);
      }
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
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
          onClick={goBack}
        >
          <ArrowLeft size={16} className="mr-1" />
          Atrás
        </Button>

        <h1 className="text-chelas-yellow text-2xl mb-6">
          {step === 1 ? 'Crear Cuenta' : 'Elige tu Avatar'}
        </h1>

        <WindowFrame title={step === 1 ? "REGISTRO" : "SELECCIÓN DE AVATAR"} className="max-w-xs w-full">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded flex items-start">
                <AlertTriangle size={16} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-white">{error}</p>
              </div>
            )}
            
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm text-black mb-1">
                    Nombre Visible
                  </label>
                  <div className="flex">
                    <div className="bg-chelas-button-face p-2 border-2 border-r-0 shadow-win95-button">
                      <User size={16} className="text-black" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="win95-inset flex-1 px-2 py-1 text-black focus:outline-none"
                      placeholder="Cómo te verán los demás"
                    />
                  </div>
                </div>
                
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
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-sm text-black mb-4">
                  Elige un avatar que te represente:
                </p>
                
                <AvatarSelector 
                  selectedAvatar={formData.avatar}
                  onSelect={handleAvatarSelect}
                />
              </motion.div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  'Procesando...'
                ) : step === 1 ? (
                  <>
                    Siguiente <ChevronRight size={16} className="ml-1" />
                  </>
                ) : (
                  <>
                    Continuar <ChevronRight size={16} className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Register;
