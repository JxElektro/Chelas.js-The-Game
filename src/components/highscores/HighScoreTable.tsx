
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export interface HighScore {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  created_at: string;
}

interface HighScoreTableProps {
  scores: HighScore[];
  loading: boolean;
  title?: string;
}

export default function HighScoreTable({ scores, loading, title = "High Scores" }: HighScoreTableProps) {
  return (
    <div className="border-2 border-chelas-gray-dark flex-grow overflow-auto p-2">
      <h3 className="font-bold text-sm mb-2">{title}</h3>
      {loading ? (
        <p className="text-center text-sm">Loading...</p>
      ) : scores.length > 0 ? (
        <div className="win95-inset p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-chelas-gray-dark">
                <TableHead className="text-left p-1">Player</TableHead>
                <TableHead className="text-right p-1">Score</TableHead>
                <TableHead className="text-right p-1">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map(score => (
                <TableRow key={score.id} className="border-b border-gray-200">
                  <TableCell className="p-1">{score.user_name}</TableCell>
                  <TableCell className="text-right p-1">{score.score}</TableCell>
                  <TableCell className="text-right p-1 text-xs">
                    {new Date(score.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-sm">
          No high scores yet. Be the first!
        </p>
      )}
    </div>
  );
}
