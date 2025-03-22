
import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-chelas-black noise-bg relative px-3 py-4 sm:px-4 sm:py-6 md:py-10 md:px-8 max-w-md mx-auto"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-chelas-yellow/5 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-chelas-yellow/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-20 flex flex-col items-center w-full">
        {children}
      </div>
    </motion.div>
  );
};

export default Layout;
