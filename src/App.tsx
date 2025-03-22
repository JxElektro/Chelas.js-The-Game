
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect, createContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

// Pages
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Interests from "./pages/Interests";
import Lobby from "./pages/Lobby";
import Conversation from "./pages/Conversation";
import NotFound from "./pages/NotFound";

// Create context for authentication
export const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
}>({
  user: null,
  session: null,
});

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, session }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-pulse">Cargando...</div>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/interests" 
                    element={user ? <Interests /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/lobby" 
                    element={user ? <Lobby /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/conversation/:userId" 
                    element={user ? <Conversation /> : <Navigate to="/login" />} 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
