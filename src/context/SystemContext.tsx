import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for our system context
interface DrinkExpense {
  id: string;
  description: string;
  price: number;
  created_at: string;
}

interface GameScore {
  gameType: 'dino' | 'snake';
  score: number;
  highScore: number;
}

interface ConversationNote {
  conversationId: string;
  notes: string;
}

interface ConversationPreference {
  conversationId: string;
  isFavorite: boolean;
  followUp: boolean;
}

interface UserInfo {
  userId: string | null;
  userName: string | null;
  isAuthenticated: boolean;
}

interface SystemContextType {
  // User information
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  
  // Drink expenses
  expenses: DrinkExpense[];
  addExpense: (description: string, price: number) => Promise<boolean>;
  removeExpense: (id: string) => Promise<boolean>;
  fetchExpenses: () => Promise<void>;
  totalExpenses: number;
  
  // Game scores
  gameScores: Record<string, GameScore>;
  updateGameScore: (gameType: 'dino' | 'snake', score: number) => void;
  
  // Conversation preferences
  conversationPreferences: ConversationPreference[];
  toggleFavorite: (conversationId: string) => Promise<boolean>;
  toggleFollowUp: (conversationId: string) => Promise<boolean>;
  
  // Conversation notes
  conversationNotes: ConversationNote[];
  saveNote: (conversationId: string, note: string) => Promise<boolean>;
  getNote: (conversationId: string) => string;
  
  // System settings
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Create the context with a default undefined value
const SystemContext = createContext<SystemContextType | undefined>(undefined);

// Provider component
export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User information state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userId: null,
    userName: null,
    isAuthenticated: false
  });
  
  // Expenses state
  const [expenses, setExpenses] = useState<DrinkExpense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  
  // Game scores state
  const [gameScores, setGameScores] = useState<Record<string, GameScore>>({
    dino: { gameType: 'dino', score: 0, highScore: 0 },
    snake: { gameType: 'snake', score: 0, highScore: 0 }
  });
  
  // Conversation preferences state
  const [conversationPreferences, setConversationPreferences] = useState<ConversationPreference[]>([]);
  
  // Conversation notes state
  const [conversationNotes, setConversationNotes] = useState<ConversationNote[]>([]);
  
  // System settings state
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Check user authentication on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.session.user.id)
          .single();
          
        setUserInfo({
          userId: data.session.user.id,
          userName: profileData?.name || 'Usuario',
          isAuthenticated: true
        });
        
        // Load user data
        fetchExpenses();
        fetchConversationPreferences();
        fetchConversationNotes();
      }
    };
    
    checkUser();
    
    // Load system settings from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .single();
            
          setUserInfo({
            userId: session.user.id,
            userName: profileData?.name || 'Usuario',
            isAuthenticated: true
          });
          
          // Load user data
          fetchExpenses();
          fetchConversationPreferences();
          fetchConversationNotes();
        } else if (event === 'SIGNED_OUT') {
          setUserInfo({
            userId: null,
            userName: null,
            isAuthenticated: false
          });
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Update total expenses when expenses change
  useEffect(() => {
    const sum = expenses.reduce((acc, expense) => acc + Number(expense.price), 0);
    setTotalExpenses(sum);
  }, [expenses]);
  
  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  
  // Fetch expenses from the database
  const fetchExpenses = async () => {
    if (!userInfo.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('drink_expenses')
        .select('*')
        .eq('user_id', userInfo.userId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      if (data) {
        setExpenses(data as DrinkExpense[]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };
  
  // Add a new expense
  const addExpense = async (description: string, price: number): Promise<boolean> => {
    if (!userInfo.userId) return false;
    
    try {
      const { error } = await supabase
        .from('drink_expenses')
        .insert([{
          user_id: userInfo.userId,
          description,
          price
        }]);
        
      if (error) throw error;
      
      await fetchExpenses();
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      return false;
    }
  };
  
  // Remove an expense
  const removeExpense = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('drink_expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      await fetchExpenses();
      return true;
    } catch (error) {
      console.error('Error removing expense:', error);
      return false;
    }
  };
  
  // Update game score
  const updateGameScore = (gameType: 'dino' | 'snake', score: number) => {
    setGameScores(prev => {
      const currentGame = prev[gameType] || { gameType, score: 0, highScore: 0 };
      const highScore = score > currentGame.highScore ? score : currentGame.highScore;
      
      return {
        ...prev,
        [gameType]: {
          gameType,
          score,
          highScore
        }
      };
    });
  };
  
  // Fetch conversation preferences
  const fetchConversationPreferences = async () => {
    if (!userInfo.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, is_favorite, follow_up')
        .eq('user_a', userInfo.userId);
        
      if (error) throw error;
      if (data) {
        const preferences = data.map(item => ({
          conversationId: item.id,
          isFavorite: item.is_favorite,
          followUp: item.follow_up
        }));
        
        setConversationPreferences(preferences);
      }
    } catch (error) {
      console.error('Error fetching conversation preferences:', error);
    }
  };
  
  // Toggle favorite status for a conversation
  const toggleFavorite = async (conversationId: string): Promise<boolean> => {
    try {
      // Find current preference
      const currentPref = conversationPreferences.find(p => p.conversationId === conversationId);
      const newValue = currentPref ? !currentPref.isFavorite : true;
      
      // Update in database
      const { error } = await supabase
        .from('conversations')
        .update({ is_favorite: newValue })
        .eq('id', conversationId);
        
      if (error) throw error;
      
      // Update local state
      setConversationPreferences(prev => {
        const index = prev.findIndex(p => p.conversationId === conversationId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], isFavorite: newValue };
          return updated;
        } else {
          return [
            ...prev,
            { conversationId, isFavorite: newValue, followUp: false }
          ];
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };
  
  // Toggle follow-up status for a conversation
  const toggleFollowUp = async (conversationId: string): Promise<boolean> => {
    try {
      // Find current preference
      const currentPref = conversationPreferences.find(p => p.conversationId === conversationId);
      const newValue = currentPref ? !currentPref.followUp : true;
      
      // Update in database
      const { error } = await supabase
        .from('conversations')
        .update({ follow_up: newValue })
        .eq('id', conversationId);
        
      if (error) throw error;
      
      // Update local state
      setConversationPreferences(prev => {
        const index = prev.findIndex(p => p.conversationId === conversationId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], followUp: newValue };
          return updated;
        } else {
          return [
            ...prev,
            { conversationId, isFavorite: false, followUp: newValue }
          ];
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling follow-up:', error);
      return false;
    }
  };
  
  // Fetch conversation notes
  const fetchConversationNotes = async () => {
    if (!userInfo.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('conversation_notes')
        .select('conversation_id, notes')
        .eq('user_id', userInfo.userId);
        
      if (error) throw error;
      if (data) {
        const notes = data.map(item => ({
          conversationId: item.conversation_id,
          notes: item.notes || ''
        }));
        
        setConversationNotes(notes);
      }
    } catch (error) {
      console.error('Error fetching conversation notes:', error);
    }
  };
  
  // Save a note for a conversation
  const saveNote = async (conversationId: string, note: string): Promise<boolean> => {
    if (!userInfo.userId) return false;
    
    try {
      // Check if note already exists
      const { data, error: fetchError } = await supabase
        .from('conversation_notes')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userInfo.userId)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      let saveError;
      
      if (data) {
        // Update existing note
        const { error } = await supabase
          .from('conversation_notes')
          .update({ notes: note })
          .eq('id', data.id);
          
        saveError = error;
      } else {
        // Insert new note
        const { error } = await supabase
          .from('conversation_notes')
          .insert({
            user_id: userInfo.userId,
            conversation_id: conversationId,
            notes: note
          });
          
        saveError = error;
      }
      
      if (saveError) throw saveError;
      
      // Update local state
      setConversationNotes(prev => {
        const index = prev.findIndex(n => n.conversationId === conversationId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { conversationId, notes: note };
          return updated;
        } else {
          return [...prev, { conversationId, notes: note }];
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      return false;
    }
  };
  
  // Get a note for a conversation
  const getNote = (conversationId: string): string => {
    const note = conversationNotes.find(n => n.conversationId === conversationId);
    return note ? note.notes : '';
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  // Context value
  const value: SystemContextType = {
    userInfo,
    setUserInfo,
    expenses,
    addExpense,
    removeExpense,
    fetchExpenses,
    totalExpenses,
    gameScores,
    updateGameScore,
    conversationPreferences,
    toggleFavorite,
    toggleFollowUp,
    conversationNotes,
    saveNote,
    getNote,
    darkMode,
    toggleDarkMode
  };
  
  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};

// Custom hook to use the system context
export const useSystem = (): SystemContextType => {
  const context = useContext(SystemContext);
  
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  
  return context;
};