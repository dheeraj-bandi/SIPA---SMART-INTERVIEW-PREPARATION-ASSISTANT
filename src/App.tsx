import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Target,
  Users,
  Zap,
  FileText,
  TrendingUp,
  Shield,
  ChevronRight,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import InterviewPrepGuide from './components/InterviewPrepGuide';
import JobMatchIntelligence from './components/JobMatchIntelligence';
import MockInterviewSimulator from './components/MockInterviewSimulator';

// --- NEW IMPORT FOR OUR SINGLE CANVAS BACKGROUND ---
import FloatingParticlesCanvas from './components/canvas-designs/FloatingParticlesCanvas'; // We'll create this next

// Home Page Component
const HomePage: React.FC = () => {
  // Removed mousePosition and scrollY state as they are no longer needed for the main background
  // If your new canvas animation needs mouse or scroll, re-add them to the canvas component itself or here and pass as props.
  const navigate = useNavigate();

  // Removed useEffect for mousemove and scroll as the main background doesn't need it.
  // If FloatingParticlesCanvas needs them, implement inside that component or pass as props.

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Resume Analysis",
      description: "Get intelligent feedback on your resume with detailed scoring and improvement suggestions using advanced NLP algorithms.",
      gradient: "from-purple-500 to-pink-500",
      path: "/resume-analyzer"
    },
    {
      icon: Target,
      title: "Job Match Intelligence",
      description: "Compare your resume against job descriptions to identify gaps and optimize your application for specific roles.",
      gradient: "from-blue-500 to-cyan-500",
      path: "/job-match"
    },
    {
      icon: BookOpen,
      title: "Interview Preparation Guide",
      description: "Comprehensive guide covering essential topics, concepts, and questions for technical interview success.",
      gradient: "from-emerald-500 to-teal-500",
      path: "/interview-prep"
    },
    {
      icon: Users,
      title: "Mock Interview Simulator",
      description: "Practice with AI-generated questions tailored to your profile and receive real-time feedback on your responses.",
      gradient: "from-orange-500 to-red-500",
      path: "/mock-interview"
    }
  ];

  const stats = [
    { number: "98%", label: "Success Rate", icon: CheckCircle },
    { number: "50K+", label: "Users Trained", icon: Users },
    { number: "2.5x", label: "Interview Success", icon: TrendingUp },
    { number: "4.9", label: "User Rating", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden relative">
      {/* --- NEW SINGLE CANVAS BACKGROUND ELEMENT --- */}
      {/* This will cover the entire background with our new animation */}
      <FloatingParticlesCanvas className="absolute inset-0 z-0" />
      {/* --- END NEW CANVAS BACKGROUND ELEMENT --- */}


      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SIPA
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-blue-400 transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-blue-400 transition-colors duration-200">How It Works</a>
          <a href="#pricing" className="hover:text-blue-400 transition-colors duration-200">Pricing</a>
          <Link
            to="/resume-analyzer"
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8 hover:bg-white/20 transition-all duration-300">
              <Zap className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm font-medium">AI-Powered Interview Preparation</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              Master Your Next
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Tech Interview
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your interview preparation with AI-driven resume analysis, personalized feedback,
              and comprehensive study guides. Land your dream job with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/resume-analyzer"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 flex items-center"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <button className="group flex items-center px-8 py-4 border-2 border-white/30 rounded-full text-lg font-semibold hover:border-white/50 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* 3D Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'slideInUp 0.8s ease-out forwards'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 text-center">
                  <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Intelligent Features for
              <span className="block bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Career Success
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven interview strategies
              to give you the competitive edge you need.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 300}ms`
                }}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  <Link
                    to={feature.path}
                    className="flex items-center text-blue-400 hover:text-blue-300 font-semibold group-hover:translate-x-2 transition-all duration-300"
                  >
                    Learn More
                    <ChevronRight className="ml-1 w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl border border-white/20 backdrop-blur-sm">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-lg" />
            <div className="relative z-10">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of successful candidates who used SIPA to land their dream jobs.
                Start your AI-powered preparation today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/resume-analyzer"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  Start Free Trial
                </Link>
                <button className="text-gray-300 hover:text-white transition-colors duration-200">
                  Schedule a Demo →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 lg:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 mb-6 lg:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">SIPA</span>
            </Link>

            <div className="text-gray-400 text-center lg:text-right">
              <p>&copy; 2024 Smart Interview Preparation Assistant. All rights reserved.</p>
              <p className="text-sm mt-2">Empowering careers through AI-driven preparation.</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer onBack={() => window.history.back()} />} />
        <Route path="/interview-prep" element={<InterviewPrepGuide onBack={() => window.history.back()} />} />
        <Route path="/job-match" element={<JobMatchIntelligence onBack={() => window.history.back()} />} />
        <Route path="/mock-interview" element={<MockInterviewSimulator onBack={() => window.history.back()} />} />
      </Routes>
    </Router>
  );
}

export default App;