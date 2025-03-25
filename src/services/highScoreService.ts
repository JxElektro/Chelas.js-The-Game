
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HighScore {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  created_at: string;
}

export interface UserInfo {
  userId: string | null;
  userName: string | null;
}

// Generic service for handling high scores across different games
export class HighScoreService {
  private gameType: 'dino' | 'snake' | string;
  
  constructor(gameType: 'dino' | 'snake' | string) {
    this.gameType = gameType;
  }
  
  // Get high scores for this game
  async getHighScores(): Promise<HighScore[]> {
    try {
      const { data, error } = await supabase.rpc(`get_${this.gameType}_high_scores`);
      if (error) throw error;
      return data as HighScore[];
    } catch (error) {
      console.error(`Error fetching ${this.gameType} high scores:`, error);
      toast.error('Error loading scores');
      return [];
    }
  }
  
  // Save high score for a user
  async saveHighScore(userInfo: UserInfo, newScore: number): Promise<boolean> {
    const { userId, userName } = userInfo;
    
    if (!userId || !userName) return false;
    
    try {
      const { error } = await supabase.rpc(`add_${this.gameType}_high_score`, {
        user_id_param: userId,
        user_name_param: userName,
        score_param: newScore,
      });
      
      if (error) throw error;
      
      toast.success('Score saved!');
      return true;
    } catch (error) {
      console.error(`Error saving ${this.gameType} high score:`, error);
      toast.error('Error saving score');
      return false;
    }
  }
  
  // Get user info from Supabase
  static async getUserInfo(): Promise<UserInfo> {
    const { data } = await supabase.auth.getSession();
    
    if (!data?.session) {
      return { userId: null, userName: null };
    }
    
    const userId = data.session.user.id;
    
    // Get profile name
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
      
    const userName = profileData?.name || null;
    
    return { userId, userName };
  }
}

// Export convenient factory functions for specific games
export const createDinoHighScoreService = () => new HighScoreService('dino');
export const createSnakeHighScoreService = () => new HighScoreService('snake');
