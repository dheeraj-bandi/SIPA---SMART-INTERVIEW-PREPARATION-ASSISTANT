# SIPA - Smart Interview Preparation Assistant

![SIPA Logo](https://img.shields.io/badge/SIPA-AI%20Powered-blue?style=for-the-badge&logo=brain&logoColor=white)

A comprehensive AI-powered platform designed to help job seekers excel in technical interviews through intelligent resume analysis, mock interview simulations, and personalized learning paths.

## 🌟 Features

### 🧠 AI Resume Analyzer
- **Advanced NLP Processing**: Analyzes resume content using sophisticated natural language processing
- **Comprehensive Scoring**: 5-metric evaluation system (Skills Match, Sections Complete, Writing Quality, Verb Strength, Formatting)
- **Smart Suggestions**: Personalized improvement recommendations
- **PDF Report Generation**: Downloadable detailed analysis reports
- **Skills Gap Analysis**: Identifies missing skills and provides recommendations

### 🎯 Job Match Intelligence
- **AI-Powered Matching**: Compares resumes against job descriptions with detailed scoring
- **Job Listings Integration**: Browse and analyze job opportunities
- **Skills Recommendation**: Suggests skills to learn based on target roles
- **Market Insights**: Job market trends and salary analysis
- **Profile Optimization**: Personalized profile enhancement suggestions

### 📚 Interview Preparation Guide
- **Comprehensive Topics**: Covers Data Structures, Algorithms, System Design, Security, and more
- **Difficulty Levels**: Beginner to Advanced content
- **Interactive Learning**: Searchable and filterable content
- **Study Roadmap**: 12-week structured preparation plan
- **Success Tips**: Expert advice and proven strategies

### 🎤 Mock Interview Simulator
- **Real-time Audio Processing**: Speech-to-text transcription and analysis
- **Multiple Interview Types**: Technical, Behavioral, System Design, and Coding challenges
- **AI Feedback**: Emotion analysis, confidence scoring, and keyword matching
- **Customizable Sessions**: Adjustable difficulty, duration, and question types
- **Detailed Results**: Comprehensive performance analysis with improvement suggestions

## 🏗️ Project Structure

```
sipa-ai-resume-analyzer/
├── README.md
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── index.html
│
├── src/                          # Frontend React Application
│   ├── main.tsx                  # Application entry point
│   ├── App.tsx                   # Main application component
│   ├── index.css                 # Global styles
│   ├── vite-env.d.ts            # Vite type definitions
│   └── components/               # React components
│       ├── ResumeAnalyzer.tsx    # AI resume analysis interface
│       ├── InterviewPrepGuide.tsx # Interview preparation content
│       ├── JobMatchIntelligence.tsx # Job matching and analysis
│       └── MockInterviewSimulator.tsx # Mock interview interface
│
└── backend/                      # Python Flask Backend
    ├── app.py                    # Main Flask application
    ├── requirements.txt          # Python dependencies
    ├── .env.example             # Environment variables template
    │
    ├── services/                 # Core business logic
    │   ├── resume_analyzer.py    # Resume analysis engine
    │   ├── gemini_service.py     # Google Gemini AI integration
    │   ├── file_processor.py     # File upload and text extraction
    │   ├── job_matcher.py        # Job matching algorithms
    │   ├── learning_service.py   # Learning content management
    │   └── report_generator.py   # PDF report generation
    │
    ├── routes/                   # API route handlers
    │   ├── job_match.py         # Job matching endpoints
    │   ├── learning.py          # Learning content endpoints
    │   └── mock_interview.py    # Mock interview endpoints
    │
    └── utils/                    # Utility functions
        ├── validators.py         # Input validation
        └── response_formatter.py # API response formatting
```

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Git**

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sipa-ai-resume-analyzer
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download required NLP models**
   ```bash
   python -m spacy download en_core_web_sm
   python -m nltk.downloader punkt stopwords
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   FLASK_ENV=development
   FLASK_DEBUG=True
   MAX_FILE_SIZE=16777216
   ALLOWED_EXTENSIONS=pdf,docx,txt
   ```

6. **Start the backend server**
   ```bash
   python app.py
   ```
   The backend API will be available at `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Google Gemini AI API Key (Required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# File Upload Settings
MAX_FILE_SIZE=16777216  # 16MB in bytes
ALLOWED_EXTENSIONS=pdf,docx,txt

# Optional: Database Configuration (for production)
DATABASE_URL=your_database_url_here
```

### Getting API Keys

1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

## 📖 Usage Guide

### 1. Resume Analysis

1. **Upload Resume**: Navigate to the Resume Analyzer and upload your PDF or DOCX resume
2. **AI Analysis**: The system processes your resume using advanced NLP
3. **Review Results**: Get detailed scoring across 5 key metrics
4. **Download Report**: Generate and download a comprehensive PDF report
5. **Implement Suggestions**: Follow AI-generated recommendations for improvement

### 2. Job Matching

1. **Browse Jobs**: Explore available job listings
2. **Analyze Match**: Click "Analyze Match" on any job to see compatibility
3. **Review Insights**: Get detailed breakdown of skills match and recommendations
4. **Update Profile**: Enhance your profile based on insights

### 3. Interview Preparation

1. **Study Topics**: Browse comprehensive interview topics by category
2. **Practice Questions**: Review common interview questions
3. **Follow Roadmap**: Use the 12-week preparation plan
4. **Apply Tips**: Implement expert interview strategies

### 4. Mock Interviews

1. **Configure Session**: Choose interview type, difficulty, and duration
2. **Start Interview**: Begin the AI-powered mock interview
3. **Record Responses**: Answer questions using voice recording
4. **Get Feedback**: Receive detailed analysis and improvement suggestions
5. **Track Progress**: Monitor your interview performance over time

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
python app.py        # Start Flask development server
pip install -r requirements.txt  # Install dependencies
```

### Technology Stack

**Frontend:**
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons

**Backend:**
- **Flask** web framework
- **spaCy** for NLP processing
- **NLTK** for text analysis
- **Google Gemini AI** for advanced AI features
- **PyMuPDF** for PDF processing
- **python-docx** for DOCX processing

### API Endpoints

#### Resume Analysis
- `POST /api/resume/analyze` - Analyze uploaded resume
- `GET /api/resume/report/<session_id>` - Download PDF report
- `POST /api/resume/suggestions` - Get AI suggestions

#### Job Matching
- `POST /api/job-match/analyze` - Analyze job match
- `POST /api/job-match/find-similar` - Find similar jobs
- `GET /api/jobs/listings` - Get job listings

#### Mock Interviews
- `POST /api/mock-interview/start` - Start interview session
- `POST /api/mock-interview/submit-response` - Submit response
- `GET /api/mock-interview/results/<session_id>` - Get results

#### Learning Content
- `GET /api/learning/courses` - Get available courses
- `GET /api/learning/dashboard/<user_id>` - Get user dashboard
- `GET /api/learning/achievements/<user_id>` - Get achievements

## 🔒 Security Features

- **File Validation**: Strict file type and size validation
- **Input Sanitization**: All user inputs are sanitized
- **CORS Protection**: Configured for secure cross-origin requests
- **Error Handling**: Comprehensive error handling and logging

## 🚀 Deployment

### Frontend Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting service** (Netlify, Vercel, etc.)
   ```bash
   # Example for Netlify
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### Backend Deployment

1. **Prepare for production**
   ```bash
   pip install gunicorn
   ```

2. **Create production configuration**
   ```bash
   # Create gunicorn.conf.py
   bind = "0.0.0.0:5000"
   workers = 4
   worker_class = "sync"
   timeout = 120
   ```

3. **Deploy to cloud service** (Heroku, AWS, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **spaCy model not found**
   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **NLTK data missing**
   ```bash
   python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
   ```

3. **Port already in use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

4. **CORS errors**
   - Ensure backend is running on `http://localhost:5000`
   - Check CORS configuration in `app.py`

### Performance Optimization

- **File Size**: Keep uploaded files under 16MB
- **Browser**: Use modern browsers for best performance
- **Network**: Ensure stable internet connection for AI features

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

## 🎯 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced video interview analysis
- [ ] Integration with job boards
- [ ] Mobile application
- [ ] Advanced AI coaching
- [ ] Team interview preparation

---

## 👥 Contributors

Thanks to the amazing contributors who made this project possible:

- [Chaitanya Sai Kurapati](https://github.com/ChaitanyaSaik) – Creator & Maintainer  
- [Bandi Dheeraj](https://github.com/dheeraj-bandi) – Contributor (Feature Development / Bug Fixes / Testing / etc.)


**Built with ❤️ for job seekers worldwide**

*Empowering careers through AI-driven preparation*
