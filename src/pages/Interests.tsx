
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import InterestSelector from '@/components/InterestSelector';
import { Tag, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react';

const interestOptions = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'react', label: 'React' },
  { id: 'node', label: 'Node.js' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'webdev', label: 'Web Development' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'devops', label: 'DevOps' },
  { id: 'ai', label: 'AI' },
  { id: 'games', label: 'Games' },
  { id: 'mobile', label: 'Mobile Dev' },
  { id: 'design', label: 'Design' },
  { id: 'ux', label: 'UX/UI' },
  { id: 'data', label: 'Data Science' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'security', label: 'Security' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'agile', label: 'Agile' },
  { id: 'testing', label: 'Testing' },
  { id: 'iot', label: 'IoT' },
];

const avoidOptions = [
  { id: 'politics', label: 'Politics' },
  { id: 'religion', label: 'Religion' },
  { id: 'personal', label: 'Personal Finance' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'health', label: 'Health Issues' },
  { id: 'controversial', label: 'Controversial Topics' },
  { id: 'salary', label: 'Salary/Compensation' },
  { id: 'gossip', label: 'Industry Gossip' },
  { id: 'crypto', label: 'Cryptocurrency' },
  { id: 'company', label: 'Company Drama' },
];

const Interests = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<string[]>([]);
  const [avoidTopics, setAvoidTopics] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would save these preferences to Supabase
    console.log('Saving preferences:', { interests, avoidTopics });
    
    // Navigate to the lobby
    navigate('/lobby');
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
          onClick={() => navigate('/register')}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>

        <h1 className="text-chelas-yellow text-2xl mb-6">Your Interests</h1>

        <WindowFrame title="CONVERSATION PREFERENCES" className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-black mb-4">
              Select topics you're interested in talking about and those you'd prefer to avoid.
            </p>
            
            <div className="mb-6">
              <InterestSelector
                title="I'm interested in discussing:"
                options={interestOptions}
                selectedOptions={interests}
                onChange={setInterests}
                maxSelections={5}
              />
              
              <InterestSelector
                title="I'd prefer to avoid:"
                options={avoidOptions}
                selectedOptions={avoidTopics}
                onChange={setAvoidTopics}
                maxSelections={3}
              />
            </div>
            
            <div className="mb-4 p-2 bg-chelas-yellow/20 border-2 border-chelas-yellow flex items-start">
              <AlertTriangle size={16} className="text-chelas-yellow mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white">
                These preferences will be used to generate relevant conversation topics when you connect with other attendees.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                Save & Continue <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </form>
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Interests;
