import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Brain, 
  Target, 
  Clock, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Settings, 
  BarChart3, 
  Zap, 
  Star, 
  Users, 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Lightbulb, 
  MessageCircle, 
  Headphones, 
  Camera, 
  Monitor,
  Loader2,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  StopCircle,
  SkipForward,
  RefreshCw,
  BookOpen,
  Code,
  Database,
  Globe,
  Smartphone,
  Shield,
  GitBranch,
  Server,
  Cloud,
  Layers,
  Network,
  Package,
  Terminal,
  Home
} from 'lucide-react';

interface MockInterviewSimulatorProps {
  onBack: () => void;
}

interface Question {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  expectedKeywords: string[];
  timeLimit: number; // in seconds
  followUpQuestions?: string[];
}

interface InterviewSession {
  id: string;
  type: 'technical' | 'behavioral' | 'system-design' | 'coding';
  questions: Question[];
  currentQuestionIndex: number;
  startTime: Date;
  responses: InterviewResponse[];
  status: 'setup' | 'in-progress' | 'completed';
}

interface InterviewResponse {
  questionId: string;
  audioBlob?: Blob;
  transcription: string;
  duration: number;
  confidence: number;
  emotionAnalysis: {
    energy: number;
    clarity: number;
    pace: number;
    confidence: number;
  };
  keywordMatch: number;
  score: number;
  feedback: string[];
}

interface InterviewResults {
  overallScore: number;
  categoryScores: {
    technical: number;
    communication: number;
    confidence: number;
    clarity: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  detailedFeedback: InterviewResponse[];
}

const MockInterviewSimulator: React.FC<MockInterviewSimulatorProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'setup' | 'interview' | 'results'>('setup');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'system-design' | 'coding'>('technical');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [duration, setDuration] = useState<15 | 30 | 45>(30);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sample questions database
  const questionDatabase: Record<string, Question[]> = {
    technical: [
      {
        id: 'tech-1',
        category: 'Data Structures',
        difficulty: 'Medium',
        question: 'Explain the difference between an array and a linked list. When would you use each?',
        expectedKeywords: ['array', 'linked list', 'memory', 'access time', 'insertion', 'deletion'],
        timeLimit: 120,
        followUpQuestions: ['How would you implement a dynamic array?']
      },
      {
        id: 'tech-2',
        category: 'Algorithms',
        difficulty: 'Hard',
        question: 'Describe how you would implement a binary search algorithm and analyze its time complexity.',
        expectedKeywords: ['binary search', 'sorted array', 'divide and conquer', 'O(log n)', 'time complexity'],
        timeLimit: 180,
        followUpQuestions: ['What happens if the array is not sorted?']
      },
      {
        id: 'tech-3',
        category: 'System Design',
        difficulty: 'Hard',
        question: 'How would you design a URL shortener like bit.ly? Walk me through your architecture.',
        expectedKeywords: ['database', 'hashing', 'scalability', 'load balancer', 'caching', 'API'],
        timeLimit: 300,
        followUpQuestions: ['How would you handle 1 million requests per second?']
      },
      {
        id: 'tech-4',
        category: 'JavaScript',
        difficulty: 'Medium',
        question: 'Explain closures in JavaScript and provide a practical example.',
        expectedKeywords: ['closure', 'scope', 'lexical environment', 'function', 'variable'],
        timeLimit: 150,
        followUpQuestions: ['What are the memory implications of closures?']
      },
      {
        id: 'tech-5',
        category: 'Database',
        difficulty: 'Medium',
        question: 'What is the difference between SQL and NoSQL databases? When would you choose each?',
        expectedKeywords: ['SQL', 'NoSQL', 'ACID', 'scalability', 'consistency', 'schema'],
        timeLimit: 120,
        followUpQuestions: ['How do you handle transactions in NoSQL?']
      }
    ],
    behavioral: [
      {
        id: 'beh-1',
        category: 'Leadership',
        difficulty: 'Medium',
        question: 'Tell me about a time when you had to lead a team through a challenging project.',
        expectedKeywords: ['leadership', 'team', 'challenge', 'communication', 'result', 'collaboration'],
        timeLimit: 180,
        followUpQuestions: ['How did you handle team conflicts?']
      },
      {
        id: 'beh-2',
        category: 'Problem Solving',
        difficulty: 'Medium',
        question: 'Describe a situation where you had to solve a complex technical problem under pressure.',
        expectedKeywords: ['problem solving', 'pressure', 'analysis', 'solution', 'outcome', 'learning'],
        timeLimit: 150,
        followUpQuestions: ['What would you do differently next time?']
      },
      {
        id: 'beh-3',
        category: 'Communication',
        difficulty: 'Easy',
        question: 'How do you explain technical concepts to non-technical stakeholders?',
        expectedKeywords: ['communication', 'simplify', 'analogy', 'stakeholder', 'understanding', 'clarity'],
        timeLimit: 120,
        followUpQuestions: ['Can you give me a specific example?']
      }
    ],
    'system-design': [
      {
        id: 'sys-1',
        category: 'Scalability',
        difficulty: 'Hard',
        question: 'Design a chat application like WhatsApp that can handle millions of users.',
        expectedKeywords: ['websockets', 'database', 'message queue', 'load balancer', 'microservices', 'real-time'],
        timeLimit: 600,
        followUpQuestions: ['How would you handle message delivery guarantees?']
      },
      {
        id: 'sys-2',
        category: 'Architecture',
        difficulty: 'Hard',
        question: 'Design a distributed cache system like Redis. Explain your approach.',
        expectedKeywords: ['distributed', 'cache', 'consistency', 'partitioning', 'replication', 'performance'],
        timeLimit: 450,
        followUpQuestions: ['How do you handle cache invalidation?']
      }
    ],
    coding: [
      {
        id: 'code-1',
        category: 'Arrays',
        difficulty: 'Medium',
        question: 'Given an array of integers, find two numbers that add up to a target sum.',
        expectedKeywords: ['two sum', 'hash map', 'array', 'target', 'time complexity', 'space complexity'],
        timeLimit: 300,
        followUpQuestions: ['What if there are multiple solutions?']
      },
      {
        id: 'code-2',
        category: 'Strings',
        difficulty: 'Easy',
        question: 'Write a function to reverse a string without using built-in reverse methods.',
        expectedKeywords: ['reverse', 'string', 'two pointers', 'iteration', 'in-place'],
        timeLimit: 180,
        followUpQuestions: ['How would you handle Unicode characters?']
      }
    ]
  };

  const startInterview = () => {
    const questions = questionDatabase[interviewType] || [];
    const selectedQuestions = questions
      .filter(q => q.difficulty === difficulty)
      .slice(0, Math.floor(duration / 5)); // Roughly 5 minutes per question

    const newSession: InterviewSession = {
      id: Date.now().toString(),
      type: interviewType,
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      startTime: new Date(),
      responses: [],
      status: 'in-progress'
    };

    setSession(newSession);
    setCurrentView('interview');
    setTimeRemaining(selectedQuestions[0]?.timeLimit || 120);
    
    // Start the timer
    startTimer();
    
    // Speak the first question
    if (audioEnabled) {
      speakQuestion(selectedQuestions[0]?.question || '');
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const speakQuestion = (question: string) => {
    if ('speechSynthesis' in window && audioEnabled) {
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: videoEnabled 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudioResponse(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioResponse = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate audio processing and analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcription and analysis
      const mockTranscription = "This is a mock transcription of the user's response. In a real implementation, this would be the actual speech-to-text result.";
      const mockAnalysis = {
        energy: Math.random() * 0.8 + 0.2,
        clarity: Math.random() * 0.7 + 0.3,
        pace: Math.random() * 0.6 + 0.4,
        confidence: Math.random() * 0.8 + 0.2
      };

      const currentQuestion = session?.questions[session.currentQuestionIndex];
      const keywordMatch = calculateKeywordMatch(mockTranscription, currentQuestion?.expectedKeywords || []);
      const score = calculateResponseScore(mockAnalysis, keywordMatch);

      const response: InterviewResponse = {
        questionId: currentQuestion?.id || '',
        audioBlob,
        transcription: mockTranscription,
        duration: 60, // Mock duration
        confidence: mockAnalysis.confidence,
        emotionAnalysis: mockAnalysis,
        keywordMatch,
        score,
        feedback: generateFeedback(score, keywordMatch, mockAnalysis)
      };

      if (session) {
        const updatedSession = {
          ...session,
          responses: [...session.responses, response]
        };
        setSession(updatedSession);
      }

      setCurrentResponse(mockTranscription);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateKeywordMatch = (transcription: string, keywords: string[]): number => {
    const lowerTranscription = transcription.toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      lowerTranscription.includes(keyword.toLowerCase())
    );
    return keywords.length > 0 ? (matchedKeywords.length / keywords.length) * 100 : 0;
  };

  const calculateResponseScore = (analysis: any, keywordMatch: number): number => {
    const emotionScore = (analysis.energy + analysis.clarity + analysis.pace + analysis.confidence) / 4 * 100;
    return Math.round((emotionScore * 0.6 + keywordMatch * 0.4));
  };

  const generateFeedback = (score: number, keywordMatch: number, analysis: any): string[] => {
    const feedback: string[] = [];
    
    if (score >= 80) {
      feedback.push("Excellent response! You demonstrated strong knowledge and communication skills.");
    } else if (score >= 60) {
      feedback.push("Good response with room for improvement in technical depth.");
    } else {
      feedback.push("Consider providing more detailed explanations and examples.");
    }

    if (keywordMatch < 50) {
      feedback.push("Try to include more relevant technical keywords in your response.");
    }

    if (analysis.confidence < 0.5) {
      feedback.push("Speak with more confidence and conviction.");
    }

    if (analysis.pace < 0.4) {
      feedback.push("Consider speaking at a slightly faster pace for better engagement.");
    }

    return feedback;
  };

  const handleNextQuestion = () => {
    if (!session) return;

    if (session.currentQuestionIndex < session.questions.length - 1) {
      const nextIndex = session.currentQuestionIndex + 1;
      const nextQuestion = session.questions[nextIndex];
      
      setSession({
        ...session,
        currentQuestionIndex: nextIndex
      });
      
      setTimeRemaining(nextQuestion.timeLimit);
      setCurrentResponse('');
      
      if (audioEnabled) {
        speakQuestion(nextQuestion.question);
      }
    } else {
      completeInterview();
    }
  };

  const completeInterview = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (session) {
      const results = calculateFinalResults(session);
      setResults(results);
      setCurrentView('results');
    }
  };

  const calculateFinalResults = (session: InterviewSession): InterviewResults => {
    const responses = session.responses;
    const overallScore = responses.length > 0 
      ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length)
      : 0;

    const avgEmotionAnalysis = responses.reduce((acc, r) => ({
      technical: acc.technical + r.keywordMatch,
      communication: acc.communication + r.emotionAnalysis.clarity * 100,
      confidence: acc.confidence + r.emotionAnalysis.confidence * 100,
      clarity: acc.clarity + r.emotionAnalysis.energy * 100
    }), { technical: 0, communication: 0, confidence: 0, clarity: 0 });

    const categoryScores = {
      technical: Math.round(avgEmotionAnalysis.technical / responses.length) || 0,
      communication: Math.round(avgEmotionAnalysis.communication / responses.length) || 0,
      confidence: Math.round(avgEmotionAnalysis.confidence / responses.length) || 0,
      clarity: Math.round(avgEmotionAnalysis.clarity / responses.length) || 0
    };

    return {
      overallScore,
      categoryScores,
      strengths: generateStrengths(categoryScores),
      improvements: generateImprovements(categoryScores),
      recommendations: generateRecommendations(overallScore, categoryScores),
      detailedFeedback: responses
    };
  };

  const generateStrengths = (scores: any): string[] => {
    const strengths: string[] = [];
    if (scores.technical >= 70) strengths.push("Strong technical knowledge");
    if (scores.communication >= 70) strengths.push("Clear communication skills");
    if (scores.confidence >= 70) strengths.push("Confident delivery");
    if (scores.clarity >= 70) strengths.push("Well-structured responses");
    return strengths;
  };

  const generateImprovements = (scores: any): string[] => {
    const improvements: string[] = [];
    if (scores.technical < 60) improvements.push("Enhance technical depth in responses");
    if (scores.communication < 60) improvements.push("Improve communication clarity");
    if (scores.confidence < 60) improvements.push("Build confidence in delivery");
    if (scores.clarity < 60) improvements.push("Structure responses more clearly");
    return improvements;
  };

  const generateRecommendations = (overallScore: number, scores: any): string[] => {
    const recommendations: string[] = [];
    
    if (overallScore < 60) {
      recommendations.push("Practice more technical interviews to build confidence");
      recommendations.push("Review fundamental concepts in your field");
    }
    
    if (scores.technical < 70) {
      recommendations.push("Study system design patterns and best practices");
      recommendations.push("Practice explaining complex concepts simply");
    }
    
    if (scores.communication < 70) {
      recommendations.push("Practice the STAR method for behavioral questions");
      recommendations.push("Work on speaking pace and clarity");
    }

    return recommendations;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const renderSetup = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Configure Your Mock Interview</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Customize your interview experience with AI-powered questions and real-time feedback
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Interview Type Selection */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3 text-blue-400" />
            Interview Type
          </h3>
          
          <div className="space-y-4">
            {[
              { id: 'technical', label: 'Technical Interview', icon: Code, desc: 'Data structures, algorithms, and technical concepts' },
              { id: 'behavioral', label: 'Behavioral Interview', icon: Users, desc: 'Leadership, teamwork, and soft skills' },
              { id: 'system-design', label: 'System Design', icon: Network, desc: 'Architecture and scalability questions' },
              { id: 'coding', label: 'Coding Challenge', icon: Terminal, desc: 'Live coding and problem solving' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setInterviewType(type.id as any)}
                className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                  interviewType === type.id
                    ? 'border-blue-400 bg-blue-500/20'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <div className="flex items-center">
                  <type.icon className="w-6 h-6 mr-3 text-blue-400" />
                  <div>
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm text-gray-400">{type.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          {/* Difficulty */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold mb-4">Difficulty Level</h4>
            <div className="flex space-x-3">
              {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    difficulty === level
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold mb-4">Interview Duration</h4>
            <div className="flex space-x-3">
              {([15, 30, 45] as const).map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    duration === mins
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Audio/Video Settings */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold mb-4">Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Volume2 className="w-5 h-5 mr-3 text-blue-400" />
                  <span>Audio Questions</span>
                </div>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    audioEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    audioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 mr-3 text-purple-400" />
                  <span>Video Recording</span>
                </div>
                <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    videoEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    videoEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={startInterview}
          className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
        >
          <PlayCircle className="w-6 h-6 mr-3 inline group-hover:animate-pulse" />
          Start Mock Interview
        </button>
      </div>
    </div>
  );

  const renderInterview = () => {
    if (!session) return null;
    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

    return (
      <div className="space-y-8">
        {/* Progress Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </h3>
              <p className="text-gray-400">{currentQuestion?.category} • {currentQuestion?.difficulty}</p>
            </div>
            
            <div className="text-right">
              <div className={`text-3xl font-bold ${timeRemaining <= 30 ? 'text-red-400' : 'text-blue-400'}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-400">Time Remaining</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Display */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold mb-4">{currentQuestion?.question}</h4>
              {currentQuestion?.expectedKeywords && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Key topics to cover:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.expectedKeywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {audioEnabled && (
              <button
                onClick={() => speakQuestion(currentQuestion?.question || '')}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Recording Interface */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="text-center">
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500/20 border-4 border-red-500 animate-pulse' 
                  : 'bg-blue-500/20 border-4 border-blue-500'
              }`}>
                {isAnalyzing ? (
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-12 h-12 text-red-400" />
                ) : (
                  <Mic className="w-12 h-12 text-blue-400" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              {isAnalyzing ? (
                <div>
                  <h4 className="text-xl font-semibold mb-2">Analyzing Response...</h4>
                  <p className="text-gray-400">Processing your answer with AI</p>
                </div>
              ) : isRecording ? (
                <div>
                  <h4 className="text-xl font-semibold mb-2">Recording...</h4>
                  <p className="text-gray-400">Speak clearly and take your time</p>
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full font-semibold transition-colors duration-200"
                  >
                    <StopCircle className="w-5 h-5 mr-2 inline" />
                    Stop Recording
                  </button>
                </div>
              ) : (
                <div>
                  <h4 className="text-xl font-semibold mb-2">Ready to Record</h4>
                  <p className="text-gray-400 mb-6">Click the button below to start your response</p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={startRecording}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-full font-semibold transition-all duration-300"
                    >
                      <Mic className="w-5 h-5 mr-2 inline" />
                      Start Recording
                    </button>
                    
                    <button
                      onClick={handleNextQuestion}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-full font-semibold transition-colors duration-200"
                    >
                      <SkipForward className="w-5 h-5 mr-2 inline" />
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </div>

            {currentResponse && (
              <div className="mt-8 p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <h5 className="font-semibold mb-2 text-emerald-300">Your Response:</h5>
                <p className="text-gray-200 text-sm">{currentResponse}</p>
                <button
                  onClick={handleNextQuestion}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="space-y-8">
        {/* Overall Score */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-48 h-48 mx-auto mb-6 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${results.overallScore * 2.51} 251`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                    {results.overallScore}
                  </div>
                  <div className="text-gray-400 text-sm">out of 100</div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-gray-300">
              {results.overallScore >= 80 ? 'Outstanding performance! You\'re ready for interviews.' :
               results.overallScore >= 60 ? 'Good job! Some areas for improvement identified.' :
               'Keep practicing! Focus on the recommendations below.'}
            </p>
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(results.categoryScores).map(([category, score], index) => (
            <div key={category} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold capitalize">{category}</h3>
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getScoreGradient(score)} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${score}%`, animationDelay: `${index * 200}ms` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Sections */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Strengths */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
              Strengths
            </h3>
            <div className="space-y-3">
              {results.strengths.map((strength, index) => (
                <div key={index} className="flex items-start">
                  <Star className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
              Areas for Improvement
            </h3>
            <div className="space-y-3">
              {results.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">{improvement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-blue-400" />
            Personalized Recommendations
          </h3>
          <div className="space-y-4">
            {results.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-200">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={() => {
              setCurrentView('setup');
              setSession(null);
              setResults(null);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            <RefreshCw className="w-5 h-5 mr-2 inline" />
            Take Another Interview
          </button>
          
          <button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
            <Download className="w-5 h-5 mr-2 inline" />
            Download Report
          </button>
          
          <button className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
            <Share2 className="w-5 h-5 mr-2 inline" />
            Share Results
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x / 20,
            top: mousePosition.y / 20,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            right: mousePosition.x / 25,
            bottom: mousePosition.y / 25,
            transform: 'translate(50%, 50%)'
          }}
        />
      </div>

      <div className="relative z-10 p-6 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 mr-6"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mock Interview Simulator</h1>
                <p className="text-gray-400">AI-powered interview practice with real-time feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {currentView === 'setup' && renderSetup()}
          {currentView === 'interview' && renderInterview()}
          {currentView === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
};

export default MockInterviewSimulator;