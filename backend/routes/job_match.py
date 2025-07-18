from flask import Blueprint, request, jsonify
import logging
from services.job_matcher import JobMatcher
from services.file_processor import FileProcessor
from utils.response_formatter import format_response, format_error
from utils.validators import validate_file
import os
import uuid
import json
from datetime import datetime
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

job_match_bp = Blueprint('job_match', __name__)

# Initialize services
job_matcher = JobMatcher()
file_processor = FileProcessor()

@job_match_bp.route('/analyze', methods=['POST'])
def analyze_job_match():
    """Analyze job match between resume and job description"""
    try:
        # Get form data
        data = request.get_json()
        
        if not data:
            return format_error('No data provided', 400)
        
        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')
        user_preferences = data.get('user_preferences', {})
        
        if not resume_text or not job_description:
            return format_error('Both resume text and job description are required', 400)
        
        logger.info("Starting job match analysis...")
        
        # Perform job match analysis
        match_result = job_matcher.analyze_job_match(
            resume_text, 
            job_description, 
            user_preferences
        )
        
        # Add metadata
        match_result['timestamp'] = datetime.now().isoformat()
        match_result['analysis_id'] = str(uuid.uuid4())
        
        logger.info(f"Job match analysis completed. Score: {match_result['overall_score']}")
        return format_response(match_result)
        
    except Exception as e:
        logger.error(f"Error in job match analysis: {str(e)}")
        return format_error(f'Job match analysis failed: {str(e)}', 500)

@job_match_bp.route('/analyze-files', methods=['POST'])
def analyze_job_match_files():
    """Analyze job match using uploaded files"""
    try:
        # Validate request
        if 'resume' not in request.files:
            return format_error('No resume file provided', 400)
        
        resume_file = request.files['resume']
        job_desc_file = request.files.get('job_description')
        job_desc_text = request.form.get('job_description_text', '')
        
        # Validate files
        if not validate_file(resume_file):
            return format_error('Invalid resume file format', 400)
        
        if job_desc_file and not validate_file(job_desc_file):
            return format_error('Invalid job description file format', 400)
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        session_dir = os.path.join('temp', session_id)
        os.makedirs(session_dir, exist_ok=True)
        
        try:
            # Process resume file
            resume_filename = secure_filename(resume_file.filename)
            resume_path = os.path.join(session_dir, resume_filename)
            resume_file.save(resume_path)
            resume_text = file_processor.extract_text(resume_path)
            
            if not resume_text.strip():
                return format_error('Could not extract text from resume file', 400)
            
            # Process job description
            if job_desc_file:
                job_desc_filename = secure_filename(job_desc_file.filename)
                job_desc_path = os.path.join(session_dir, job_desc_filename)
                job_desc_file.save(job_desc_path)
                job_description = file_processor.extract_text(job_desc_path)
                
                if not job_description.strip():
                    return format_error('Could not extract text from job description file', 400)
            else:
                job_description = job_desc_text
            
            if not job_description.strip():
                return format_error('Job description is required', 400)
            
            logger.info("Starting file-based job match analysis...")
            
            # Perform analysis
            match_result = job_matcher.analyze_job_match(resume_text, job_description)
            
            # Add session info
            match_result['session_id'] = session_id
            match_result['timestamp'] = datetime.now().isoformat()
            match_result['files'] = {
                'resume': resume_filename,
                'job_description': job_desc_file.filename if job_desc_file else 'text_input'
            }
            
            # Save result
            result_path = os.path.join(session_dir, 'match_result.json')
            with open(result_path, 'w') as f:
                json.dump(match_result, f, indent=2)
            
            logger.info(f"File-based job match analysis completed. Score: {match_result['overall_score']}")
            return format_response(match_result)
            
        except Exception as e:
            logger.error(f"Error processing files: {str(e)}")
            return format_error(f'File processing failed: {str(e)}', 500)
        
    except Exception as e:
        logger.error(f"Error in file-based job match analysis: {str(e)}")
        return format_error('Analysis failed', 500)

@job_match_bp.route('/find-similar', methods=['POST'])
def find_similar_jobs():
    """Find jobs similar to user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return format_error('No data provided', 400)
        
        user_profile = data.get('user_profile', {})
        job_listings = data.get('job_listings', [])
        limit = data.get('limit', 10)
        
        if not user_profile:
            return format_error('User profile is required', 400)
        
        if not job_listings:
            return format_error('Job listings are required', 400)
        
        logger.info(f"Finding similar jobs for user profile...")
        
        # Find similar jobs
        similar_jobs = job_matcher.find_similar_jobs(user_profile, job_listings, limit)
        
        result = {
            'similar_jobs': similar_jobs,
            'total_analyzed': len(job_listings),
            'returned_count': len(similar_jobs),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Found {len(similar_jobs)} similar jobs")
        return format_response(result)
        
    except Exception as e:
        logger.error(f"Error finding similar jobs: {str(e)}")
        return format_error(f'Similar job search failed: {str(e)}', 500)

@job_match_bp.route('/skill-recommendations', methods=['POST'])
def get_skill_recommendations():
    """Get skill recommendations for target role"""
    try:
        data = request.get_json()
        
        if not data:
            return format_error('No data provided', 400)
        
        user_skills = data.get('user_skills', [])
        target_role = data.get('target_role', '')
        
        if not target_role:
            return format_error('Target role is required', 400)
        
        logger.info(f"Getting skill recommendations for role: {target_role}")
        
        # Get recommendations
        recommended_skills = job_matcher.get_skill_recommendations(user_skills, target_role)
        
        result = {
            'target_role': target_role,
            'current_skills': user_skills,
            'recommended_skills': recommended_skills,
            'skills_to_add': len(recommended_skills),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Generated {len(recommended_skills)} skill recommendations")
        return format_response(result)
        
    except Exception as e:
        logger.error(f"Error getting skill recommendations: {str(e)}")
        return format_error(f'Skill recommendation failed: {str(e)}', 500)

@job_match_bp.route('/job-insights', methods=['POST'])
def get_job_insights():
    """Get insights about job market trends"""
    try:
        data = request.get_json()
        
        job_listings = data.get('job_listings', [])
        target_skills = data.get('target_skills', [])
        
        if not job_listings:
            return format_error('Job listings are required', 400)
        
        logger.info("Analyzing job market insights...")
        
        # Analyze job market trends
        insights = analyze_job_market_trends(job_listings, target_skills)
        
        result = {
            'insights': insights,
            'analyzed_jobs': len(job_listings),
            'timestamp': datetime.now().isoformat()
        }
        
        return format_response(result)
        
    except Exception as e:
        logger.error(f"Error getting job insights: {str(e)}")
        return format_error(f'Job insights analysis failed: {str(e)}', 500)

@job_match_bp.route('/report/<session_id>', methods=['GET'])
def generate_match_report(session_id):
    """Generate and download job match report"""
    try:
        session_dir = os.path.join('temp', session_id)
        
        if not os.path.exists(session_dir):
            return format_error('Session not found', 404)
        
        # Load match result
        result_path = os.path.join(session_dir, 'match_result.json')
        if not os.path.exists(result_path):
            return format_error('Match result not found', 404)
        
        with open(result_path, 'r') as f:
            match_result = json.load(f)
        
        # Generate PDF report
        from services.report_generator import ReportGenerator
        report_generator = ReportGenerator()
        
        pdf_path = os.path.join(session_dir, 'job_match_report.pdf')
        report_generator.generate_job_match_report(match_result, pdf_path)
        
        from flask import send_file
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'Job_Match_Report_{session_id[:8]}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Error generating match report: {str(e)}")
        return format_error('Report generation failed', 500)

def analyze_job_market_trends(job_listings: list, target_skills: list) -> dict:
    """Analyze job market trends from listings"""
    from collections import Counter
    
    # Extract skills from all job listings
    all_skills = []
    salary_ranges = []
    locations = []
    companies = []
    
    for job in job_listings:
        if 'skills' in job:
            all_skills.extend(job['skills'])
        if 'salary' in job:
            salary_ranges.append(job['salary'])
        if 'location' in job:
            locations.append(job['location'])
        if 'company' in job:
            companies.append(job['company'])
    
    # Calculate trends
    skill_demand = Counter(all_skills)
    location_demand = Counter(locations)
    top_companies = Counter(companies)
    
    # Calculate average salaries (simplified)
    avg_salary = "Data not available"
    if salary_ranges:
        # This is a simplified calculation - in production you'd parse salary strings
        avg_salary = f"${len(salary_ranges) * 75000:,} - ${len(salary_ranges) * 95000:,}"
    
    insights = {
        'top_skills_in_demand': dict(skill_demand.most_common(10)),
        'top_locations': dict(location_demand.most_common(5)),
        'top_hiring_companies': dict(top_companies.most_common(5)),
        'average_salary_range': avg_salary,
        'total_jobs_analyzed': len(job_listings),
        'skill_match_rate': calculate_skill_match_rate(target_skills, all_skills)
    }
    
    return insights

def calculate_skill_match_rate(target_skills: list, market_skills: list) -> dict:
    """Calculate how well target skills match market demand"""
    if not target_skills:
        return {'match_rate': 0, 'matching_skills': [], 'missing_skills': []}
    
    market_skills_lower = [skill.lower() for skill in market_skills]
    target_skills_lower = [skill.lower() for skill in target_skills]
    
    matching = [skill for skill in target_skills_lower if skill in market_skills_lower]
    missing = [skill for skill in target_skills_lower if skill not in market_skills_lower]
    
    match_rate = (len(matching) / len(target_skills_lower)) * 100 if target_skills_lower else 0
    
    return {
        'match_rate': round(match_rate, 1),
        'matching_skills': matching,
        'missing_skills': missing
    }