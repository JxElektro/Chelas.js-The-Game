
// Types related to conversation functionality
export interface TopicOption {
  emoji: string;
  text: string;
}

export interface TopicWithOptions {
  question: string;
  options: TopicOption[];
}
