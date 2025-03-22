
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import WindowFrame from '@/components/WindowFrame';
import { Terminal, LogIn } from 'lucide-react';
import { AuthContext } from '@/App';
import LogoutButton from '@/components/LogoutButton';

const Landing = () => {
  const { user } = useContext(AuthContext);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[80vh]"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2
          }}
        >
          <h1 className="text-chelas-yellow text-4xl md:text-5xl mb-2 animate-windows-startup">
            CHELAS.JS
          </h1>
          {/* Texto "The Game" en rojo */}
          <p className="text-red-500 text-lg md:text-xl">The Game</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-center"
        >
          <p className="text-chelas-gray-light mb-2">
            Conecta con otros entusiastas de JavaScript
          </p>
          <p className="text-sm text-chelas-gray-medium">
            Inicios de conversación impulsados por IA para eventos de tecnología
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 gap-4 w-full max-w-xs"
        >
          {user ? (
            <div className="grid grid-cols-2 gap-4">
              <Link to="/lobby" className="w-full">
                <Button variant="primary" className="w-full">
                  <Terminal size={16} className="mr-2" />
                  Ir al Lobby
                </Button>
              </Link>
              <LogoutButton className="w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Link to="/register" className="w-full">
                <Button variant="primary" className="w-full">
                  <Terminal size={16} className="mr-2" />
                  Registrarse
                </Button>
              </Link>
              <Link to="/login" className="w-full">
                <Button variant="default" className="w-full">
                  <LogIn size={16} className="mr-2" />
                  Entrar
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 w-full max-w-xs"
        >
          <WindowFrame title="CÓMO FUNCIONA">
            <ol className="text-sm text-black space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">1</span>
                <p>Crea tu perfil y selecciona tus intereses</p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">2</span>
                <p>Encuentra personas disponibles en el evento</p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">3</span>
                <p>Obtén temas de conversación generados por IA basados en intereses comunes</p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">4</span>
                <p>Conecta, conversa y haz nuevos amigos</p>
              </li>
            </ol>
          </WindowFrame>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Landing;
