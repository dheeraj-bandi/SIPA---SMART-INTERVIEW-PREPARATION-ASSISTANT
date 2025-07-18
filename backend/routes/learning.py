from flask import Blueprint, request, jsonify
import logging
from services.learning_service import LearningService
from utils.response_formatter import format_response, format_error
from utils.validators import validate_session_id
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

learning_bp = Blueprint('learning', __name__)

# Initialize service
learning_service = LearningService()

@learning_bp.route('/dashboard/<user_id>', methods=['GET'])
def get_dashboard(user_id):
    """Get user learning dashboard"""
    try:
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Getting dashboard for user: {user_id}")
        dashboard_data = learning_service.get_user_dashboard(user_id)
        
        return format_response(dashboard_data)
        
    except Exception as e:
        logger.error(f"Error getting dashboard: {str(e)}")
        return format_error(f'Dashboard retrieval failed: {str(e)}', 500)

@learning_bp.route('/courses', methods=['GET'])
def get_courses():
    """Get courses with optional filtering"""
    try:
        # Get filter parameters
        filters = {
            'search': request.args.get('search', ''),
            'category': request.args.get('category', 'all'),
            'difficulty': request.args.get('difficulty', 'all'),
            'sortBy': request.args.get('sortBy', 'popular')
        }
        
        logger.info(f"Getting courses with filters: {filters}")
        courses = learning_service.get_courses(filters)
        
        return format_response({
            'courses': courses,
            'total': len(courses),
            'filters': filters
        })
        
    except Exception as e:
        logger.error(f"Error getting courses: {str(e)}")
        return format_error(f'Courses retrieval failed: {str(e)}', 500)

@learning_bp.route('/courses/<course_id>', methods=['GET'])
def get_course_details(course_id):
    """Get detailed course information"""
    try:
        user_id = request.args.get('user_id', 'default_user')
        
        logger.info(f"Getting course details for course: {course_id}, user: {user_id}")
        course_details = learning_service.get_course_details(course_id, user_id)
        
        return format_response(course_details)
        
    except Exception as e:
        logger.error(f"Error getting course details: {str(e)}")
        return format_error(f'Course details retrieval failed: {str(e)}', 500)

@learning_bp.route('/courses/<course_id>/enroll', methods=['POST'])
def enroll_in_course(course_id):
    """Enroll user in a course"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default_user')
        
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Enrolling user {user_id} in course {course_id}")
        result = learning_service.enroll_in_course(user_id, course_id)
        
        return format_response(result)
        
    except Exception as e:
        logger.error(f"Error enrolling in course: {str(e)}")
        return format_error(f'Course enrollment failed: {str(e)}', 500)

@learning_bp.route('/courses/<course_id>/modules/<module_id>/complete', methods=['POST'])
def complete_module(course_id, module_id):
    """Mark a module as completed"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default_user')
        
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Completing module {module_id} in course {course_id} for user {user_id}")
        result = learning_service.complete_module(user_id, course_id, module_id)
        
        return format_response(result)
        
    except Exception as e:
        logger.error(f"Error completing module: {str(e)}")
        return format_error(f'Module completion failed: {str(e)}', 500)

@learning_bp.route('/courses/<course_id>/modules/<module_id>/quiz/submit', methods=['POST'])
def submit_quiz(course_id, module_id):
    """Submit quiz answers"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default_user')
        answers = data.get('answers', {})
        
        if not user_id:
            return format_error('User ID required', 400)
        
        if not answers:
            return format_error('Quiz answers required', 400)
        
        logger.info(f"Submitting quiz for module {module_id} in course {course_id}")
        result = learning_service.submit_quiz(user_id, course_id, module_id, answers)
        
        return format_response(result)
        
    except Exception as e:
        logger.error(f"Error submitting quiz: {str(e)}")
        return format_error(f'Quiz submission failed: {str(e)}', 500)

@learning_bp.route('/courses/<course_id>/modules/<module_id>/assignment/submit', methods=['POST'])
def submit_assignment(course_id, module_id):
    """Submit assignment"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default_user')
        
        if not user_id:
            return format_error('User ID required', 400)
        
        submission_data = {
            'projectUrl': data.get('projectUrl'),
            'demoUrl': data.get('demoUrl'),
            'comments': data.get('comments'),
            'files': data.get('files', [])
        }
        
        logger.info(f"Submitting assignment for module {module_id} in course {course_id}")
        result = learning_service.submit_assignment(user_id, course_id, module_id, submission_data)
        
        return format_response(result)
        
    except Exception as e:
        logger.error(f"Error submitting assignment: {str(e)}")
        return format_error(f'Assignment submission failed: {str(e)}', 500)

@learning_bp.route('/learning-paths', methods=['GET'])
def get_learning_paths():
    """Get learning paths"""
    try:
        user_id = request.args.get('user_id', 'default_user')
        
        logger.info(f"Getting learning paths for user: {user_id}")
        learning_paths = learning_service.get_learning_paths(user_id)
        
        return format_response({
            'learningPaths': learning_paths,
            'total': len(learning_paths)
        })
        
    except Exception as e:
        logger.error(f"Error getting learning paths: {str(e)}")
        return format_error(f'Learning paths retrieval failed: {str(e)}', 500)

@learning_bp.route('/achievements/<user_id>', methods=['GET'])
def get_achievements(user_id):
    """Get user achievements"""
    try:
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Getting achievements for user: {user_id}")
        achievements = learning_service.get_achievements(user_id)
        
        # Calculate achievement stats
        earned_achievements = [a for a in achievements if a['earned']]
        total_points = sum(a['points'] for a in earned_achievements)
        
        return format_response({
            'achievements': achievements,
            'stats': {
                'totalAchievements': len(achievements),
                'earnedAchievements': len(earned_achievements),
                'totalPoints': total_points,
                'completionRate': (len(earned_achievements) / len(achievements)) * 100 if achievements else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting achievements: {str(e)}")
        return format_error(f'Achievements retrieval failed: {str(e)}', 500)

@learning_bp.route('/certificates/<user_id>', methods=['GET'])
def get_certificates(user_id):
    """Get user certificates"""
    try:
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Getting certificates for user: {user_id}")
        certificates = learning_service.get_certificates(user_id)
        
        # Calculate certificate stats
        earned_certificates = [c for c in certificates if c['earned']]
        in_progress = [c for c in certificates if not c['earned']]
        
        return format_response({
            'certificates': certificates,
            'stats': {
                'totalCertificates': len(certificates),
                'earnedCertificates': len(earned_certificates),
                'inProgress': len(in_progress),
                'verificationScore': 98  # Mock verification score
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting certificates: {str(e)}")
        return format_error(f'Certificates retrieval failed: {str(e)}', 500)

@learning_bp.route('/progress/<user_id>', methods=['GET'])
def get_user_progress(user_id):
    """Get comprehensive user progress"""
    try:
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Getting progress for user: {user_id}")
        
        # Get all user data
        dashboard_data = learning_service.get_user_dashboard(user_id)
        achievements = learning_service.get_achievements(user_id)
        certificates = learning_service.get_certificates(user_id)
        learning_paths = learning_service.get_learning_paths(user_id)
        
        progress_data = {
            'dashboard': dashboard_data,
            'achievements': achievements,
            'certificates': certificates,
            'learningPaths': learning_paths,
            'summary': {
                'overallProgress': dashboard_data['overallProgress'],
                'coursesCompleted': len([c for c in dashboard_data['enrolledCourses'] if c.get('progress', 0) == 100]),
                'skillsLearned': len(set().union(*[c.get('skills', []) for c in dashboard_data['enrolledCourses']])),
                'hoursLearned': dashboard_data['stats']['hoursLearned'],
                'achievementsEarned': len([a for a in achievements if a['earned']]),
                'certificatesEarned': len([c for c in certificates if c['earned']])
            }
        }
        
        return format_response(progress_data)
        
    except Exception as e:
        logger.error(f"Error getting user progress: {str(e)}")
        return format_error(f'Progress retrieval failed: {str(e)}', 500)

@learning_bp.route('/search', methods=['GET'])
def search_content():
    """Search courses, learning paths, and content"""
    try:
        query = request.args.get('q', '')
        content_type = request.args.get('type', 'all')  # courses, paths, all
        
        if not query:
            return format_error('Search query required', 400)
        
        logger.info(f"Searching for: {query}, type: {content_type}")
        
        results = {
            'courses': [],
            'learningPaths': [],
            'query': query
        }
        
        if content_type in ['courses', 'all']:
            courses = learning_service.get_courses({'search': query})
            results['courses'] = courses
        
        if content_type in ['paths', 'all']:
            learning_paths = learning_service.get_learning_paths('default_user')
            # Filter learning paths by query
            filtered_paths = [
                path for path in learning_paths
                if query.lower() in path['title'].lower() or 
                   query.lower() in path['description'].lower() or
                   any(query.lower() in skill.lower() for skill in path['skills'])
            ]
            results['learningPaths'] = filtered_paths
        
        total_results = len(results['courses']) + len(results['learningPaths'])
        results['totalResults'] = total_results
        
        return format_response(results)
        
    except Exception as e:
        logger.error(f"Error searching content: {str(e)}")
        return format_error(f'Search failed: {str(e)}', 500)

@learning_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """Get personalized course recommendations"""
    try:
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Getting recommendations for user: {user_id}")
        
        # Get user's enrolled courses and skills
        enrolled_courses = learning_service.get_user_enrolled_courses(user_id)
        user_skills = set()
        for course in enrolled_courses:
            user_skills.update(course.get('skills', []))
        
        # Get all courses
        all_courses = learning_service.get_courses()
        
        # Simple recommendation algorithm
        recommendations = []
        for course in all_courses:
            # Skip if already enrolled
            if any(c['id'] == course['id'] for c in enrolled_courses):
                continue
            
            # Calculate relevance score based on skill overlap
            course_skills = set(course.get('skills', []))
            skill_overlap = len(user_skills.intersection(course_skills))
            relevance_score = skill_overlap / len(course_skills) if course_skills else 0
            
            if relevance_score > 0.2:  # At least 20% skill overlap
                course['relevanceScore'] = relevance_score
                course['reason'] = f"Matches {skill_overlap} of your existing skills"
                recommendations.append(course)
        
        # Sort by relevance score
        recommendations.sort(key=lambda x: x['relevanceScore'], reverse=True)
        
        return format_response({
            'recommendations': recommendations[:6],  # Top 6 recommendations
            'userSkills': list(user_skills),
            'totalRecommendations': len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return format_error(f'Recommendations failed: {str(e)}', 500)

@learning_bp.route('/analytics/<user_id>', methods=['GET'])
def get_learning_analytics(user_id):
    """Get detailed learning analytics"""
    try:
        if not user_id:
            return format_error('User ID required', 400)
        
        logger.info(f"Getting analytics for user: {user_id}")
        
        # Get user data
        enrolled_courses = learning_service.get_user_enrolled_courses(user_id)
        achievements = learning_service.get_achievements(user_id)
        
        # Calculate analytics
        analytics = {
            'learningVelocity': {
                'coursesPerMonth': len(enrolled_courses) / 6,  # Assuming 6 months of data
                'hoursPerWeek': sum(c.get('timeSpent', 0) for c in enrolled_courses) / 24,  # 24 weeks
                'completionRate': len([c for c in enrolled_courses if c.get('progress', 0) == 100]) / len(enrolled_courses) * 100 if enrolled_courses else 0
            },
            'skillDistribution': {},
            'difficultyPreference': {},
            'categoryPreference': {},
            'streakData': {
                'currentStreak': learning_service.calculate_learning_streak(user_id),
                'longestStreak': 15,  # Mock data
                'weeklyGoal': 10,
                'weeklyProgress': 7
            },
            'timeAnalytics': {
                'totalHours': sum(c.get('timeSpent', 0) for c in enrolled_courses),
                'averageSessionLength': 45,  # minutes
                'preferredLearningTime': 'evening',
                'weeklyActivity': learning_service.get_weekly_activity(user_id)
            }
        }
        
        # Calculate skill distribution
        all_skills = []
        for course in enrolled_courses:
            all_skills.extend(course.get('skills', []))
        
        from collections import Counter
        skill_counts = Counter(all_skills)
        analytics['skillDistribution'] = dict(skill_counts.most_common(10))
        
        # Calculate difficulty preference
        difficulty_counts = Counter(c.get('difficulty', 'Unknown') for c in enrolled_courses)
        analytics['difficultyPreference'] = dict(difficulty_counts)
        
        # Calculate category preference
        category_counts = Counter(c.get('category', 'Unknown') for c in enrolled_courses)
        analytics['categoryPreference'] = dict(category_counts)
        
        return format_response(analytics)
        
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        return format_error(f'Analytics retrieval failed: {str(e)}', 500)