from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import json
from datetime import datetime
import logging
from werkzeug.utils import secure_filename
import tempfile
import shutil

# Import our analysis modules
from services.resume_analyzer import ResumeAnalyzer
from services.gemini_service import GeminiService
from services.file_processor import FileProcessor
from services.job_matcher import JobMatcher
from services.learning_service import LearningService
from utils.validators import validate_file
from utils.response_formatter import format_response, format_error

# Import route blueprints
from routes.job_match import job_match_bp
from routes.learning import learning_bp
from routes.mock_interview import mock_interview_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # Allow Vite dev server

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['TEMP_FOLDER'] = 'temp'

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['TEMP_FOLDER'], exist_ok=True)

# Initialize services
resume_analyzer = ResumeAnalyzer()
gemini_service = GeminiService()
file_processor = FileProcessor()
job_matcher = JobMatcher()
learning_service = LearningService()

# Register blueprints
app.register_blueprint(job_match_bp, url_prefix='/api/job-match')
app.register_blueprint(learning_bp, url_prefix='/api/learning')
app.register_blueprint(mock_interview_bp, url_prefix='/api/mock-interview')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'gemini': gemini_service.is_available(),
            'file_processor': True,
            'job_matcher': True,
            'learning_service': True,
            'mock_interview': True
        }
    })

@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume():
    """Main resume analysis endpoint"""
    try:
        # Validate request
        if 'resume' not in request.files:
            return format_error('No resume file provided', 400)
        
        resume_file = request.files['resume']
        
        # Validate file
        if not validate_file(resume_file):
            return format_error('Invalid resume file format. Please upload PDF or DOCX.', 400)
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Create temporary directory for this session
        session_dir = os.path.join(app.config['TEMP_FOLDER'], session_id)
        os.makedirs(session_dir, exist_ok=True)
        
        try:
            # Save and process resume
            resume_path = os.path.join(session_dir, secure_filename(resume_file.filename))
            resume_file.save(resume_path)
            
            logger.info(f"Processing resume: {resume_file.filename}")
            resume_text = file_processor.extract_text(resume_path)
            
            if not resume_text.strip():
                return format_error('Could not extract text from resume. Please check the file format.', 400)
            
            # Perform analysis
            logger.info("Starting resume analysis...")
            analysis_result = resume_analyzer.analyze_resume(resume_text)
            
            # Add session info
            analysis_result['session_id'] = session_id
            analysis_result['timestamp'] = datetime.now().isoformat()
            analysis_result['files'] = {
                'resume': resume_file.filename
            }
            
            # Save analysis result
            result_path = os.path.join(session_dir, 'analysis_result.json')
            with open(result_path, 'w') as f:
                json.dump(analysis_result, f, indent=2)
            
            logger.info(f"Analysis completed. Score: {analysis_result.get('finalScore', 'N/A')}")
            return format_response(analysis_result)
            
        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}")
            return format_error(f'Analysis failed: {str(e)}', 500)
        
        finally:
            # Clean up temporary files after a delay (in production, use a background task)
            pass
    
    except Exception as e:
        logger.error(f"Unexpected error in analyze_resume: {str(e)}")
        return format_error('Internal server error', 500)

@app.route('/api/resume/rewrite', methods=['POST'])
def rewrite_resume():
    """AI-powered resume rewriting using Gemini"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return format_error('Session ID required', 400)
        
        session_id = data['session_id']
        session_dir = os.path.join(app.config['TEMP_FOLDER'], session_id)
        
        if not os.path.exists(session_dir):
            return format_error('Session not found', 404)
        
        # Load analysis result
        result_path = os.path.join(session_dir, 'analysis_result.json')
        if not os.path.exists(result_path):
            return format_error('Analysis result not found', 404)
        
        with open(result_path, 'r') as f:
            analysis_result = json.load(f)
        
        # Get original resume text
        resume_files = [f for f in os.listdir(session_dir) if f.endswith(('.pdf', '.docx'))]
        if not resume_files:
            return format_error('Original resume file not found', 404)
        
        resume_path = os.path.join(session_dir, resume_files[0])
        resume_text = file_processor.extract_text(resume_path)
        
        # Generate rewritten resume using Gemini
        logger.info("Starting resume rewrite with Gemini...")
        rewritten_content = gemini_service.rewrite_resume(
            resume_text, 
            analysis_result.get('suggestions', []),
            analysis_result.get('missingSkills', [])
        )
        
        # Save rewritten resume
        rewrite_result = {
            'original_text': resume_text,
            'rewritten_text': rewritten_content,
            'timestamp': datetime.now().isoformat(),
            'improvements_applied': analysis_result.get('suggestions', [])
        }
        
        rewrite_path = os.path.join(session_dir, 'rewritten_resume.json')
        with open(rewrite_path, 'w') as f:
            json.dump(rewrite_result, f, indent=2)
        
        logger.info("Resume rewrite completed")
        return format_response(rewrite_result)
        
    except Exception as e:
        logger.error(f"Error in rewrite_resume: {str(e)}")
        return format_error(f'Rewrite failed: {str(e)}', 500)

@app.route('/api/resume/report/<session_id>', methods=['GET'])
def generate_report(session_id):
    """Generate and download PDF report"""
    try:
        session_dir = os.path.join(app.config['TEMP_FOLDER'], session_id)
        
        if not os.path.exists(session_dir):
            return format_error('Session not found', 404)
        
        # Load analysis result
        result_path = os.path.join(session_dir, 'analysis_result.json')
        if not os.path.exists(result_path):
            return format_error('Analysis result not found', 404)
        
        with open(result_path, 'r') as f:
            analysis_result = json.load(f)
        
        # Generate PDF report
        from services.report_generator import ReportGenerator
        report_generator = ReportGenerator()
        
        pdf_path = os.path.join(session_dir, 'resume_analysis_report.pdf')
        report_generator.generate_pdf_report(analysis_result, pdf_path)
        
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'Resume_Analysis_Report_{session_id[:8]}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return format_error('Report generation failed', 500)

@app.route('/api/resume/suggestions', methods=['POST'])
def get_ai_suggestions():
    """Get additional AI suggestions for improvement"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return format_error('Session ID required', 400)
        
        session_id = data['session_id']
        focus_area = data.get('focus_area', 'general')  # general, skills, formatting, content
        
        session_dir = os.path.join(app.config['TEMP_FOLDER'], session_id)
        result_path = os.path.join(session_dir, 'analysis_result.json')
        
        if not os.path.exists(result_path):
            return format_error('Analysis result not found', 404)
        
        with open(result_path, 'r') as f:
            analysis_result = json.load(f)
        
        # Get targeted suggestions from Gemini
        suggestions = gemini_service.get_targeted_suggestions(analysis_result, focus_area)
        
        return format_response({
            'focus_area': focus_area,
            'suggestions': suggestions,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting AI suggestions: {str(e)}")
        return format_error('Failed to get suggestions', 500)

@app.errorhandler(413)
def too_large(e):
    return format_error('File too large. Maximum size is 16MB.', 413)

@app.errorhandler(404)
def not_found(e):
    return format_error('Endpoint not found', 404)

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal server error: {str(e)}")
    return format_error('Internal server error', 500)

if __name__ == '__main__':
    # Check if Gemini API key is configured
    if not gemini_service.is_configured():
        logger.warning("Gemini API key not configured. Some features may not work.")
    
    logger.info("Starting SIPA Backend Server...")
    logger.info("Available endpoints:")
    logger.info("  POST /api/resume/analyze - Analyze resume")
    logger.info("  POST /api/resume/rewrite - Rewrite resume with AI")
    logger.info("  GET  /api/resume/report/<session_id> - Download PDF report")
    logger.info("  POST /api/resume/suggestions - Get AI suggestions")
    logger.info("  POST /api/job-match/analyze - Analyze job match")
    logger.info("  POST /api/job-match/analyze-files - Analyze job match with files")
    logger.info("  GET  /api/job-match/report/<session_id> - Download job match report")
    logger.info("  POST /api/job-match/find-similar - Find similar jobs")
    logger.info("  GET  /api/learning/dashboard/<user_id> - Get learning dashboard")
    logger.info("  GET  /api/learning/courses - Get courses")
    logger.info("  GET  /api/learning/learning-paths - Get learning paths")
    logger.info("  GET  /api/learning/achievements/<user_id> - Get achievements")
    logger.info("  GET  /api/learning/certificates/<user_id> - Get certificates")
    logger.info("  POST /api/mock-interview/start - Start mock interview")
    logger.info("  POST /api/mock-interview/submit-response - Submit interview response")
    logger.info("  GET  /api/mock-interview/results/<session_id> - Get interview results")
    logger.info("  GET  /api/health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)