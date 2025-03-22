
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import WindowFrame from '@/components/WindowFrame';
import { Terminal, Users, MessageSquare, Sparkles } from 'lucide-react';

const Landing = () => {
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
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-center"
        >
          <p className="text-chelas-gray-light mb-2">
            Connect with fellow JavaScript enthusiasts
          </p>
          <p className="text-sm text-chelas-gray-medium">
            AI-powered conversation starters for tech events
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 gap-4 w-full max-w-xs"
        >
          <Link to="/register" className="w-full">
            <Button variant="primary" className="w-full">
              <Terminal size={16} className="mr-2" />
              Get Started
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 w-full max-w-xs"
        >
          <WindowFrame title="HOW IT WORKS">
            <ol className="text-sm text-black space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">1</span>
                <p>Create your profile and select your interests</p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">2</span>
                <p>Find available people in the event</p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">3</span>
                <p>Get AI-powered conversation starters based on your shared interests</p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-chelas-yellow flex items-center justify-center mr-2 border border-chelas-gray-dark">4</span>
                <p>Connect, chat, and make new friends!</p>
              </li>
            </ol>
          </WindowFrame>
        </motion.div>
      </Layout>
    </Layout>
  );
};

export default Landing;
