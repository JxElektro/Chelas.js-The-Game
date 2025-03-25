
import { useState, useEffect } from 'react';
import { HighScoreService, HighScore, UserInfo } from '@/services/highScoreService';

interface UseHighScoresReturn {
  highScores: HighScore[];
  userHighScore: number;
  loading: boolean;
  saveScore: (score: number) => Promise<boolean>;
  refreshScores: () => Promise<void>;
  userInfo: UserInfo;
}

export function useHighScores(gameType: 'dino' | 'snake' | string): UseHighScoresReturn {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [userHighScore, setUserHighScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({ userId: null, userName: null });
  
  // Create service for the specified game
  const highScoreService = new HighScoreService(gameType);
  
  // Fetch user info and scores on mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchUserInfo();
      await fetchHighScores();
    };
    
    initializeData();
  }, [gameType]);
  
  // Fetch user information
  const fetchUserInfo = async () => {
    const info = await HighScoreService.getUserInfo();
    setUserInfo(info);
    return info;
  };
  
  // Fetch high scores
  const fetchHighScores = async () => {
    setLoading(true);
    try {
      const scores = await highScoreService.getHighScores();
      setHighScores(scores);
      
      // Find user's high score
      if (userInfo.userId) {
        const userScore = scores.find(s => s.user_id === userInfo.userId);
        if (userScore) {
          setUserHighScore(userScore.score);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Save a new score
  const saveScore = async (newScore: number): Promise<boolean> => {
    if (newScore <= userHighScore) return false;
    
    const success = await highScoreService.saveHighScore(userInfo, newScore);
    if (success) {
      setUserHighScore(newScore);
      await fetchHighScores();
    }
    return success;
  };
  
  return {
    highScores,
    userHighScore,
    loading,
    saveScore,
    refreshScores: fetchHighScores,
    userInfo
  };
}
