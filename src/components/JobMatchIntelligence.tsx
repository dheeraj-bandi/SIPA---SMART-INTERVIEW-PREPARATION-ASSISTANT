import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  FileText, 
  Zap, 
  BarChart3, 
  Users, 
  Clock, 
  Star, 
  Award, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Building, 
  Calendar, 
  Eye, 
  Heart, 
  Share2, 
  Download, 
  RefreshCw, 
  Loader2,
  ChevronRight,
  ChevronDown,
  Plus,
  Bookmark,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code,
  Database,
  Globe,
  Smartphone,
  Shield,
  GitBranch,
  Settings,
  Bell,
  Mail,
  Phone,
  Linkedin,
  Github,
  FileCheck,
  X,
  Sparkles,
  PieChart,
  Activity,
  Lightbulb,
  Home
} from 'lucide-react';

interface JobMatchIntelligenceProps {
  onBack: () => void;
}

interface MatchAnalysis {
  overall_score: number;
  skills_match: number;
  experience_match: number;
  semantic_match: number;
  keyword_match: number;
  matching_skills: string[];
  missing_skills: string[];
  missing_keywords: string[];
  recommendations: string[];
  job_requirements: {
    skills: any;
    experience_level: string;
    education: string[];
    certifications: string[];
    job_titles: string[];
    total_skills: number;
  };
  resume_profile: {
    skills: any;
    experience_level: string;
    education: string[];
    certifications: string[];
    job_titles: string[];
    total_skills: number;
  };
}

interface AnalysisHistory {
  id: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  date: string;
  resumeFile: string;
  jobDescFile: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

const JobMatchIntelligence: React.FC<JobMatchIntelligenceProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analyzer' | 'history' | 'insights'>('analyzer');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [jobDescText, setJobDescText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MatchAnalysis | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<'resume' | 'job' | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jobInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDrag = (e: React.DragEvent, type: 'resume' | 'job') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(type);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'job') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        if (type === 'resume') {
          setResumeFile(file);
        } else {
          setJobDescFile(file);
          setJobDescText(''); // Clear text input when file is uploaded
        }
      }
    }
  };

  const analyzeJobMatch = async () => {
    if (!resumeFile || (!jobDescFile && !jobDescText.trim())) {
      setError('Please upload both resume and job description');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      if (jobDescFile) {
        formData.append('job_description', jobDescFile);
      } else {
        formData.append('job_description_text', jobDescText);
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const response = await fetch(`${API_BASE_URL}/job-match/analyze-files`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result.data);
        
        // Add to history
        const newHistoryItem: AnalysisHistory = {
          id: Date.now().toString(),
          jobTitle: extractJobTitle(jobDescText) || 'Job Analysis',
          company: extractCompany(jobDescText) || 'Unknown Company',
          matchScore: result.data.overall_score,
          date: new Date().toISOString(),
          resumeFile: resumeFile.name,
          jobDescFile: jobDescFile?.name || 'Text Input'
        };
        
        setAnalysisHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10
      } else {
        throw new Error(result.message || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractJobTitle = (text: string): string | null => {
    const titlePatterns = [
      /job title[:\s]+([^\n\r]+)/i,
      /position[:\s]+([^\n\r]+)/i,
      /role[:\s]+([^\n\r]+)/i,
      /^([^\n\r]+(?:developer|engineer|manager|analyst|designer|specialist))/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractCompany = (text: string): string | null => {
    const companyPatterns = [
      /company[:\s]+([^\n\r]+)/i,
      /organization[:\s]+([^\n\r]+)/i,
      /employer[:\s]+([^\n\r]+)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
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

  const renderAnalyzer = () => (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
          <p className="text-red-300">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Resume Upload */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            Upload Resume
          </h3>
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
              dragActive === 'resume'
                ? 'border-blue-400 bg-blue-500/10' 
                : resumeFile
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-white/5'
            }`}
            onDragEnter={(e) => handleDrag(e, 'resume')}
            onDragLeave={(e) => handleDrag(e, 'resume')}
            onDragOver={(e) => handleDrag(e, 'resume')}
            onDrop={(e) => handleDrop(e, 'resume')}
          >
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => e.target.files?.[0] && setResumeFile(e.target.files[0])}
              className="hidden"
            />
            
            {resumeFile ? (
              <div className="flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-emerald-400 mr-3" />
                <div>
                  <p className="text-emerald-400 font-semibold">{resumeFile.name}</p>
                  <p className="text-gray-400 text-sm">Ready for analysis</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="font-medium mb-2">Drop resume here</p>
                <p className="text-gray-400 text-sm mb-3">or click to browse</p>
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                >
                  Choose File
                </button>
                <p className="text-xs text-gray-500 mt-2">PDF or DOCX</p>
              </>
            )}
          </div>
        </div>

        {/* Job Description Upload */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
            Job Description
          </h3>
          
          {/* File Upload */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 mb-4 ${
              dragActive === 'job'
                ? 'border-purple-400 bg-purple-500/10' 
                : jobDescFile
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-white/5'
            }`}
            onDragEnter={(e) => handleDrag(e, 'job')}
            onDragLeave={(e) => handleDrag(e, 'job')}
            onDragOver={(e) => handleDrag(e, 'job')}
            onDrop={(e) => handleDrop(e, 'job')}
          >
            <input
              ref={jobInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setJobDescFile(e.target.files[0]);
                  setJobDescText('');
                }
              }}
              className="hidden"
            />
            
            {jobDescFile ? (
              <div className="flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-emerald-400 mr-2" />
                <div>
                  <p className="text-emerald-400 font-medium text-sm">{jobDescFile.name}</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <button
                  onClick={() => jobInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  Upload File
                </button>
              </>
            )}
          </div>

          {/* Text Input */}
          <div className="text-center text-gray-400 text-sm mb-3">or paste job description</div>
          <textarea
            value={jobDescText}
            onChange={(e) => {
              setJobDescText(e.target.value);
              if (e.target.value.trim()) setJobDescFile(null);
            }}
            placeholder="Paste the job description here..."
            className="w-full h-32 bg-white/10 border border-white/20 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-purple-400 transition-colors duration-200"
            disabled={!!jobDescFile}
          />
        </div>
      </div>

      {/* Analysis Button */}
      <div className="text-center">
        <button
          onClick={analyzeJobMatch}
          disabled={!resumeFile || (!jobDescFile && !jobDescText.trim()) || isAnalyzing}
          className={`group relative px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
            resumeFile && (jobDescFile || jobDescText.trim()) && !isAnalyzing
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/25' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
              Analyzing Match...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2 inline group-hover:animate-pulse" />
              Analyze Job Match
            </>
          )}
        </button>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold mb-2">Analyzing Job Match</h4>
            <p className="text-gray-400">Processing documents with AI...</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-400">{Math.round(analysisProgress)}% Complete</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-40 h-40 mx-auto mb-4 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="url(#matchGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${analysisResult.overall_score * 2.2} 220`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(analysisResult.overall_score)}`}>
                      {analysisResult.overall_score}%
                    </div>
                    <div className="text-gray-400 text-xs">Match</div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Job Match Score</h3>
              <p className="text-gray-300">
                {analysisResult.overall_score >= 80 ? 'Excellent match! You\'re a strong candidate.' :
                 analysisResult.overall_score >= 60 ? 'Good match with some areas to improve.' :
                 'Consider developing missing skills for better alignment.'}
              </p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Skills Match', value: analysisResult.skills_match, icon: Code },
              { label: 'Experience Match', value: analysisResult.experience_match, icon: GraduationCap },
              { label: 'Semantic Match', value: analysisResult.semantic_match, icon: Brain },
              { label: 'Keyword Match', value: analysisResult.keyword_match, icon: Search }
            ].map((metric, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <metric.icon className="w-6 h-6 text-blue-400" />
                  <span className={`text-xl font-bold ${getScoreColor(metric.value)}`}>
                    {Math.round(metric.value)}%
                  </span>
                </div>
                <h4 className="font-medium text-sm mb-2">{metric.label}</h4>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`bg-gradient-to-r ${getScoreGradient(metric.value)} h-1.5 rounded-full transition-all duration-1000`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skills Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                Matching Skills ({analysisResult.matching_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matching_skills.map((skill, index) => (
                  <span key={index} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                Skills to Develop ({analysisResult.missing_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missing_skills.map((skill, index) => (
                  <span key={index} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm border border-yellow-500/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h4 className="text-xl font-bold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              AI Recommendations
            </h4>
            <div className="space-y-3">
              {analysisResult.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-200 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => {
                setAnalysisResult(null);
                setResumeFile(null);
                setJobDescFile(null);
                setJobDescText('');
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              New Analysis
            </button>
            
            <button className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
              <Download className="w-4 h-4 mr-2 inline" />
              Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Analysis History</h2>
        <p className="text-gray-400">Track your job match analyses over time</p>
      </div>

      {analysisHistory.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Analysis History</h3>
          <p className="text-gray-400 mb-6">Start analyzing job matches to see your history here</p>
          <button 
            onClick={() => setActiveTab('analyzer')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
          >
            Start Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {analysisHistory.map((item, index) => (
            <div key={item.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.jobTitle}</h3>
                    <p className="text-gray-400 text-sm">{item.company}</p>
                    <p className="text-gray-500 text-xs">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(item.matchScore)}`}>
                    {item.matchScore}%
                  </div>
                  <div className="text-xs text-gray-400">Match Score</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Resume: {item.resumeFile}</span>
                  <span>Job: {item.jobDescFile}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Career Insights</h2>
        <p className="text-gray-400">Understand your job market positioning</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Analyses Done', value: analysisHistory.length.toString(), icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
          { label: 'Avg Match Score', value: analysisHistory.length > 0 ? `${Math.round(analysisHistory.reduce((sum, item) => sum + item.matchScore, 0) / analysisHistory.length)}%` : '0%', icon: Target, color: 'from-emerald-500 to-teal-500' },
          { label: 'Best Match', value: analysisHistory.length > 0 ? `${Math.max(...analysisHistory.map(item => item.matchScore))}%` : '0%', icon: Award, color: 'from-purple-500 to-pink-500' },
          { label: 'Improvement', value: '+12%', icon: TrendingUp, color: 'from-orange-500 to-red-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tips and Recommendations */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          Career Enhancement Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-emerald-400">Strengths to Leverage</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                Strong technical foundation in core technologies
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                Good experience level for target positions
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                Well-structured resume format
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-yellow-400">Areas for Growth</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                Consider learning cloud technologies (AWS, Azure)
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                Add more industry-specific certifications
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                Include more quantified achievements
              </li>
            </ul>
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Job Match Intelligence</h1>
                <p className="text-gray-400">AI-powered resume and job description analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mb-12 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 w-fit">
          {[
            { id: 'analyzer', label: 'Job Match Analyzer', icon: Brain },
            { id: 'history', label: 'Analysis History', icon: Clock },
            { id: 'insights', label: 'Career Insights', icon: PieChart }
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
        <div className="max-w-6xl mx-auto">
          {activeTab === 'analyzer' && renderAnalyzer()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'insights' && renderInsights()}
        </div>
      </div>
    </div>
  );
};

export default JobMatchIntelligence;