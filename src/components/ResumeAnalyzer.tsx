import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Sparkles,
  Eye,
  BarChart3,
  Zap,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  Award,
  Clock,
  Users,
  Loader2,
  Home
} from 'lucide-react';

interface AnalysisResult {
  finalScore: number;
  scores: {
    skillsMatch: number;
    sectionsComplete: number;
    writingQuality: number;
    verbStrength: number;
    formatting: number;
  };
  foundSkills: string[];
  missingSkills: string[];
  strongVerbs: string[];
  missingSections: string[];
  readabilityScore: number;
  suggestions: string[];
  session_id?: string;
}

interface ResumeAnalyzerProps {
  onBack: () => void;
}

const API_BASE_URL = 'http://localhost:5000/api';

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        setResumeFile(file);
      }
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setResumeFile(file);
  };

  const analyzeResume = async () => {
    if (!resumeFile) return;

    setIsAnalyzing(true);
    setStep('analyzing');
    setAnalysisProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

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

      const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
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
        setStep('results');
      } else {
        throw new Error(result.message || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      setStep('upload');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!analysisResult?.session_id) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/resume/report/${analysisResult.session_id}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Resume_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
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

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse top-1/4 left-1/4" />
          <div className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000 bottom-1/4 right-1/4" />
        </div>

        <div className="relative z-10 p-6 lg:p-12">
          {/* Header */}
          <div className="flex items-center mb-12">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 mr-6"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">AI Resume Analyzer</h1>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <p className="text-red-300">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                Upload Resume
              </h3>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                } ${resumeFile ? 'bg-emerald-500/10 border-emerald-400' : 'bg-white/5'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                
                {resumeFile ? (
                  <div className="flex items-center justify-center">
                    <FileCheck className="w-12 h-12 text-emerald-400 mb-4" />
                    <div className="ml-4">
                      <p className="text-emerald-400 font-semibold">{resumeFile.name}</p>
                      <p className="text-gray-400 text-sm">Ready for analysis</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-blue-400 transition-colors duration-300" />
                    <p className="text-lg font-medium mb-2">Drop your resume here</p>
                    <p className="text-gray-400 mb-4">or click to browse</p>
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Choose File
                    </button>
                    <p className="text-xs text-gray-500 mt-4">Supports PDF and DOCX files</p>
                  </>
                )}
              </div>
            </div>

            {/* Analysis Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Brain, title: "AI Analysis", desc: "Advanced NLP processing" },
                { icon: BarChart3, title: "Detailed Scoring", desc: "5 key metrics evaluation" },
                { icon: Sparkles, title: "Smart Suggestions", desc: "Personalized improvements" }
              ].map((feature, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-blue-400 mb-3" />
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Analyze Button */}
            <div className="text-center">
              <button
                onClick={analyzeResume}
                disabled={!resumeFile || isAnalyzing}
                className={`group relative px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  resumeFile && !isAnalyzing
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/25' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2 inline group-hover:animate-pulse" />
                    Analyze Resume with AI
                  </>
                )}
              </button>
              {!resumeFile && (
                <p className="text-gray-400 text-sm mt-3">Please upload a resume to continue</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
            <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Analyzing Your Resume</h2>
          <p className="text-gray-300 mb-6">Our AI is processing your document...</p>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-400">{Math.round(analysisProgress)}% Complete</p>
        </div>
      </div>
    );
  }

  if (step === 'results' && analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse top-1/4 left-1/4" />
          <div className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 bottom-1/4 right-1/4" />
        </div>

        <div className="relative z-10 p-6 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center">
              <button 
                onClick={() => setStep('upload')}
                className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 mr-6"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Analyze Another
              </button>
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 mr-6"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">Analysis Complete</h1>
              </div>
            </div>
            
            <button 
              onClick={downloadReport}
              disabled={isDownloading}
              className="flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              Download Report
            </button>
          </div>

          <div className="max-w-7xl mx-auto">
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
                      strokeDasharray={`${analysisResult.finalScore * 2.51} 251`}
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
                      <div className={`text-4xl font-bold ${getScoreColor(analysisResult.finalScore)}`}>
                        {analysisResult.finalScore}
                      </div>
                      <div className="text-gray-400 text-sm">out of 100</div>
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Resume Score</h2>
                <p className="text-gray-300">
                  {analysisResult.finalScore >= 80 ? 'Excellent! Your resume is well-optimized.' :
                   analysisResult.finalScore >= 60 ? 'Good! Some improvements recommended.' :
                   'Needs improvement. Follow our suggestions below.'}
                </p>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.entries(analysisResult.scores).map(([key, score], index) => {
                const titles = {
                  skillsMatch: 'Skills Match',
                  sectionsComplete: 'Sections Complete',
                  writingQuality: 'Writing Quality',
                  verbStrength: 'Verb Strength',
                  formatting: 'Formatting'
                };
                
                return (
                  <div key={key} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{titles[key as keyof typeof titles]}</h3>
                      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${getScoreGradient(score)} h-2 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${score}%`, animationDelay: `${index * 200}ms` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Skills Analysis */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                  Skills Found ({analysisResult.foundSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.foundSkills.map((skill, index) => (
                    <span key={index} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  Recommended Skills ({analysisResult.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingSkills.map((skill, index) => (
                    <span key={index} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm border border-yellow-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-blue-400" />
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-200">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ResumeAnalyzer;