import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  Clock, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Award, 
  Users, 
  BarChart3, 
  Zap, 
  Brain, 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Shield, 
  GitBranch,
  FileText,
  ChevronRight,
  Search,
  Filter,
  Bookmark,
  Eye,
  Download,
  ExternalLink,
  Lightbulb,
  MessageCircle,
  HelpCircle,
  Layers,
  Settings,
  Monitor,
  Server,
  Cloud,
  Lock,
  Cpu,
  Network,
  Package,
  Terminal,
  Workflow,
  Home
} from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  keyPoints: string[];
  commonQuestions: string[];
  resources: Resource[];
  estimatedReadTime: string;
  importance: 'High' | 'Medium' | 'Low';
  trending: boolean;
}

interface Resource {
  title: string;
  type: 'article' | 'video' | 'documentation' | 'practice';
  url: string;
  description: string;
}

interface InterviewPrepGuideProps {
  onBack: () => void;
}

const InterviewPrepGuide: React.FC<InterviewPrepGuideProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'topics' | 'questions' | 'tips' | 'roadmap'>('topics');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const topics: Topic[] = [
    {
      id: '1',
      title: 'Data Structures & Algorithms',
      category: 'Computer Science',
      difficulty: 'Advanced',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      description: 'Fundamental data structures and algorithmic concepts essential for technical interviews',
      keyPoints: [
        'Arrays, Linked Lists, Stacks, Queues',
        'Trees (Binary, BST, AVL, Red-Black)',
        'Graphs (BFS, DFS, Dijkstra, A*)',
        'Hash Tables and Hash Functions',
        'Sorting Algorithms (Quick, Merge, Heap)',
        'Dynamic Programming',
        'Time & Space Complexity (Big O)',
        'Recursion and Backtracking'
      ],
      commonQuestions: [
        'Implement a binary search algorithm',
        'Find the longest palindromic substring',
        'Reverse a linked list',
        'Implement a LRU cache',
        'Find the shortest path in a graph',
        'Solve the knapsack problem',
        'Implement merge sort',
        'Check if a binary tree is balanced'
      ],
      resources: [
        {
          title: 'LeetCode Practice Problems',
          type: 'practice',
          url: 'https://leetcode.com',
          description: 'Extensive collection of coding problems'
        },
        {
          title: 'Algorithms Visualization',
          type: 'article',
          url: 'https://visualgo.net',
          description: 'Interactive algorithm visualizations'
        }
      ],
      estimatedReadTime: '45 min',
      importance: 'High',
      trending: true
    },
    {
      id: '2',
      title: 'System Design',
      category: 'Architecture',
      difficulty: 'Advanced',
      icon: Network,
      color: 'from-purple-500 to-pink-500',
      description: 'Large-scale system architecture and design principles for senior-level interviews',
      keyPoints: [
        'Scalability and Load Balancing',
        'Database Design (SQL vs NoSQL)',
        'Caching Strategies (Redis, Memcached)',
        'Microservices Architecture',
        'API Design (REST, GraphQL)',
        'Message Queues (Kafka, RabbitMQ)',
        'CDN and Content Delivery',
        'Monitoring and Logging',
        'Security and Authentication',
        'Distributed Systems Concepts'
      ],
      commonQuestions: [
        'Design a URL shortener like bit.ly',
        'Design a chat application like WhatsApp',
        'Design a social media feed',
        'Design a video streaming service',
        'Design a ride-sharing service',
        'Design a search engine',
        'Design a notification system',
        'Design a distributed cache'
      ],
      resources: [
        {
          title: 'System Design Primer',
          type: 'article',
          url: 'https://github.com/donnemartin/system-design-primer',
          description: 'Comprehensive system design guide'
        },
        {
          title: 'High Scalability',
          type: 'article',
          url: 'http://highscalability.com',
          description: 'Real-world system architecture examples'
        }
      ],
      estimatedReadTime: '60 min',
      importance: 'High',
      trending: true
    },
    {
      id: '3',
      title: 'JavaScript & Frontend',
      category: 'Frontend',
      difficulty: 'Intermediate',
      icon: Code,
      color: 'from-yellow-500 to-orange-500',
      description: 'Modern JavaScript concepts and frontend development practices',
      keyPoints: [
        'ES6+ Features (Arrow functions, Destructuring)',
        'Promises, Async/Await, Event Loop',
        'Closures and Scope',
        'Prototypes and Inheritance',
        'DOM Manipulation',
        'React/Vue/Angular Concepts',
        'State Management (Redux, Vuex)',
        'Webpack and Build Tools',
        'Testing (Jest, Cypress)',
        'Performance Optimization'
      ],
      commonQuestions: [
        'Explain event delegation in JavaScript',
        'What is the difference between let, const, and var?',
        'How does the event loop work?',
        'Implement a debounce function',
        'Explain React lifecycle methods',
        'What are React hooks?',
        'How would you optimize a React application?',
        'Explain the virtual DOM'
      ],
      resources: [
        {
          title: 'MDN Web Docs',
          type: 'documentation',
          url: 'https://developer.mozilla.org',
          description: 'Comprehensive JavaScript documentation'
        },
        {
          title: 'JavaScript30',
          type: 'practice',
          url: 'https://javascript30.com',
          description: '30 day vanilla JS coding challenge'
        }
      ],
      estimatedReadTime: '35 min',
      importance: 'High',
      trending: true
    },
    {
      id: '4',
      title: 'Backend Development',
      category: 'Backend',
      difficulty: 'Intermediate',
      icon: Server,
      color: 'from-green-500 to-emerald-500',
      description: 'Server-side development concepts and best practices',
      keyPoints: [
        'RESTful API Design',
        'Database Design and Optimization',
        'Authentication & Authorization',
        'Caching Strategies',
        'Error Handling and Logging',
        'Testing (Unit, Integration)',
        'Security Best Practices',
        'Performance Optimization',
        'Deployment and DevOps',
        'Monitoring and Alerting'
      ],
      commonQuestions: [
        'Design a RESTful API for a blog',
        'How do you handle authentication?',
        'Explain database indexing',
        'How do you prevent SQL injection?',
        'What is the difference between SQL and NoSQL?',
        'How do you handle rate limiting?',
        'Explain microservices architecture',
        'How do you ensure data consistency?'
      ],
      resources: [
        {
          title: 'REST API Tutorial',
          type: 'article',
          url: 'https://restfulapi.net',
          description: 'Complete guide to REST API design'
        },
        {
          title: 'Database Design Course',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
          description: 'Database design fundamentals'
        }
      ],
      estimatedReadTime: '40 min',
      importance: 'High',
      trending: false
    },
    {
      id: '5',
      title: 'Cloud Computing',
      category: 'DevOps',
      difficulty: 'Intermediate',
      icon: Cloud,
      color: 'from-teal-500 to-blue-500',
      description: 'Cloud platforms, services, and deployment strategies',
      keyPoints: [
        'AWS/Azure/GCP Services',
        'Containerization (Docker)',
        'Orchestration (Kubernetes)',
        'CI/CD Pipelines',
        'Infrastructure as Code',
        'Serverless Computing',
        'Cloud Security',
        'Cost Optimization',
        'Monitoring and Logging',
        'Disaster Recovery'
      ],
      commonQuestions: [
        'Explain the difference between IaaS, PaaS, and SaaS',
        'How do you deploy a web application to AWS?',
        'What is Docker and why use it?',
        'Explain Kubernetes architecture',
        'How do you implement CI/CD?',
        'What is serverless computing?',
        'How do you secure cloud applications?',
        'Explain auto-scaling strategies'
      ],
      resources: [
        {
          title: 'AWS Documentation',
          type: 'documentation',
          url: 'https://docs.aws.amazon.com',
          description: 'Official AWS documentation'
        },
        {
          title: 'Docker Tutorial',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
          description: 'Complete Docker tutorial'
        }
      ],
      estimatedReadTime: '50 min',
      importance: 'Medium',
      trending: true
    },
    {
      id: '6',
      title: 'Security Fundamentals',
      category: 'Security',
      difficulty: 'Intermediate',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      description: 'Cybersecurity concepts and secure coding practices',
      keyPoints: [
        'OWASP Top 10 Vulnerabilities',
        'Authentication vs Authorization',
        'Encryption and Hashing',
        'SQL Injection Prevention',
        'XSS and CSRF Protection',
        'Secure API Design',
        'Network Security',
        'Security Testing',
        'Compliance (GDPR, HIPAA)',
        'Incident Response'
      ],
      commonQuestions: [
        'How do you prevent SQL injection?',
        'Explain the difference between authentication and authorization',
        'What is XSS and how do you prevent it?',
        'How do you secure an API?',
        'Explain HTTPS and SSL/TLS',
        'What is CSRF and how do you prevent it?',
        'How do you handle sensitive data?',
        'Explain password security best practices'
      ],
      resources: [
        {
          title: 'OWASP Top 10',
          type: 'article',
          url: 'https://owasp.org/www-project-top-ten',
          description: 'Top 10 web application security risks'
        },
        {
          title: 'Security Headers',
          type: 'practice',
          url: 'https://securityheaders.com',
          description: 'Analyze HTTP security headers'
        }
      ],
      estimatedReadTime: '30 min',
      importance: 'Medium',
      trending: false
    }
  ];

  const interviewTips = [
    {
      category: 'Technical Preparation',
      tips: [
        'Practice coding problems daily on platforms like LeetCode, HackerRank',
        'Understand time and space complexity for all solutions',
        'Practice explaining your thought process out loud',
        'Review fundamental computer science concepts',
        'Build projects that demonstrate your skills',
        'Prepare for system design questions if applying for senior roles'
      ]
    },
    {
      category: 'Communication',
      tips: [
        'Ask clarifying questions before starting to code',
        'Think out loud and explain your approach',
        'Discuss trade-offs and alternative solutions',
        'Be honest about what you don\'t know',
        'Practice the STAR method for behavioral questions',
        'Prepare questions to ask the interviewer'
      ]
    },
    {
      category: 'Day of Interview',
      tips: [
        'Test your setup (camera, microphone, internet) beforehand',
        'Have a backup plan for technical difficulties',
        'Keep water and snacks nearby',
        'Dress professionally even for remote interviews',
        'Arrive 5-10 minutes early',
        'Have your resume and notes easily accessible'
      ]
    },
    {
      category: 'Problem Solving',
      tips: [
        'Start with a brute force solution, then optimize',
        'Use examples to understand the problem better',
        'Consider edge cases and handle them',
        'Write clean, readable code with good variable names',
        'Test your solution with different inputs',
        'Don\'t panic if you get stuck - ask for hints'
      ]
    }
  ];

  const roadmap = [
    {
      phase: 'Foundation (Weeks 1-2)',
      topics: ['Data Structures Basics', 'Algorithm Fundamentals', 'Time Complexity'],
      description: 'Build strong fundamentals in core computer science concepts'
    },
    {
      phase: 'Core Skills (Weeks 3-6)',
      topics: ['Advanced Algorithms', 'System Design Basics', 'Language-Specific Concepts'],
      description: 'Develop intermediate to advanced technical skills'
    },
    {
      phase: 'Specialization (Weeks 7-10)',
      topics: ['Domain-Specific Knowledge', 'Advanced System Design', 'Security & Best Practices'],
      description: 'Focus on your target role and company requirements'
    },
    {
      phase: 'Practice & Polish (Weeks 11-12)',
      topics: ['Mock Interviews', 'Behavioral Questions', 'Company Research'],
      description: 'Refine your skills and prepare for the actual interview'
    }
  ];

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.keyPoints.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || topic.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesDifficulty = filterDifficulty === 'all' || topic.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', ...Array.from(new Set(topics.map(topic => topic.category)))];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const renderTopics = () => (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics, concepts, or questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-400 transition-colors duration-200"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors duration-200"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-slate-800">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors duration-200"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty} className="bg-slate-800">
                  {difficulty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredTopics.map((topic, index) => (
          <div 
            key={topic.id}
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            onClick={() => setSelectedTopic(topic)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${topic.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${topic.color} rounded-xl flex items-center justify-center`}>
                  <topic.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  {topic.trending && (
                    <div className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    topic.importance === 'High' ? 'bg-red-500/20 text-red-300' :
                    topic.importance === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {topic.importance}
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{topic.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Category: {topic.category}</span>
                  <span className="text-gray-400">Difficulty: {topic.difficulty}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {topic.estimatedReadTime}
                  </span>
                  <span className="text-gray-400 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    {topic.commonQuestions.length} Questions
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-gray-400 mb-2">Key Topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {topic.keyPoints.slice(0, 3).map((point, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                        {point.split(',')[0]}
                      </span>
                    ))}
                    {topic.keyPoints.length > 3 && (
                      <span className="text-xs text-gray-400">+{topic.keyPoints.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Common Interview Questions</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Practice these frequently asked questions to build confidence and improve your interview performance
        </p>
      </div>

      <div className="space-y-6">
        {topics.map((topic, index) => (
          <div 
            key={topic.id}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${topic.color} rounded-lg flex items-center justify-center mr-4`}>
                <topic.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">{topic.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.commonQuestions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs font-bold">{qIndex + 1}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{question}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTips = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Interview Success Tips</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Expert advice and proven strategies to help you excel in technical interviews
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {interviewTips.map((section, index) => (
          <div 
            key={index}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-bold">{section.category}</h3>
            </div>
            
            <div className="space-y-3">
              {section.tips.map((tip, tipIndex) => (
                <div key={tipIndex} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRoadmap = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">12-Week Interview Prep Roadmap</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          A structured approach to prepare for technical interviews systematically
        </p>
      </div>

      <div className="space-y-6">
        {roadmap.map((phase, index) => (
          <div 
            key={index}
            className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                <span className="text-white font-bold">{index + 1}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">{phase.phase}</h3>
                <p className="text-gray-300 mb-4">{phase.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {phase.topics.map((topic, topicIndex) => (
                    <span key={topicIndex} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {index < roadmap.length - 1 && (
              <div className="absolute left-6 top-20 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Topic Detail Modal
  const TopicDetailModal = ({ topic, onClose }: { topic: Topic; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 bg-gradient-to-r ${topic.color} rounded-xl flex items-center justify-center mr-4`}>
              <topic.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{topic.title}</h2>
              <p className="text-gray-400">{topic.category} • {topic.difficulty}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Concepts</h3>
              <div className="space-y-2">
                {topic.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start bg-white/5 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Common Interview Questions</h3>
              <div className="space-y-3">
                {topic.commonQuestions.map((question, index) => (
                  <div key={index} className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-200">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Learning Resources</h3>
              <div className="space-y-3">
                {topic.resources.map((resource, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ExternalLink className="w-5 h-5 text-blue-400 mr-3" />
                        <div>
                          <h4 className="font-semibold">{resource.title}</h4>
                          <p className="text-sm text-gray-400">{resource.description}</p>
                        </div>
                      </div>
                      <a 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                      >
                        Visit
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 sticky top-0">
              <h3 className="text-lg font-semibold mb-4">Topic Overview</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Difficulty</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    topic.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-300' :
                    topic.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {topic.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Importance</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    topic.importance === 'High' ? 'bg-red-500/20 text-red-300' :
                    topic.importance === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {topic.importance}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Read Time</span>
                  <span>{topic.estimatedReadTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Questions</span>
                  <span>{topic.commonQuestions.length}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 mr-2" />
                  Bookmark Topic
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Interview Preparation Guide</h1>
                <p className="text-gray-400">Essential topics and concepts for technical interviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mb-12 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 w-fit">
          {[
            { id: 'topics', label: 'Topics & Concepts', icon: BookOpen },
            { id: 'questions', label: 'Interview Questions', icon: MessageCircle },
            { id: 'tips', label: 'Success Tips', icon: Lightbulb },
            { id: 'roadmap', label: 'Study Roadmap', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'topics' && renderTopics()}
          {activeTab === 'questions' && renderQuestions()}
          {activeTab === 'tips' && renderTips()}
          {activeTab === 'roadmap' && renderRoadmap()}
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <TopicDetailModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
      )}
    </div>
  );
};

export default InterviewPrepGuide;