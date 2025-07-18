import logging
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)

class LearningService:
    def __init__(self):
        """Initialize Learning Service"""
        self.setup_course_data()
        
    def setup_course_data(self):
        """Initialize course and learning path data"""
        self.courses = {
            '1': {
                'id': '1',
                'title': 'Complete React Developer Course',
                'description': 'Master React from basics to advanced concepts with real-world projects',
                'instructor': {
                    'name': 'Sarah Johnson',
                    'title': 'Senior Frontend Engineer at Google',
                    'rating': 4.8,
                    'students': 15420
                },
                'duration': '42 hours',
                'difficulty': 'Intermediate',
                'rating': 4.8,
                'students': 15420,
                'certificate': True,
                'price': 89.99,
                'skills': ['React', 'JavaScript', 'Redux', 'React Router', 'Testing'],
                'category': 'Web Development',
                'modules': [
                    {
                        'id': '1',
                        'title': 'Introduction to React',
                        'type': 'video',
                        'duration': '15:30',
                        'completed': False,
                        'videoUrl': 'https://www.youtube.com/embed/Ke90Tje7VS0',
                        'description': 'Learn what React is and why it\'s popular',
                        'resources': [
                            {'title': 'React Documentation', 'type': 'link', 'url': 'https://react.dev'},
                            {'title': 'Course Slides', 'type': 'pdf', 'url': '/resources/react-intro.pdf'}
                        ]
                    },
                    {
                        'id': '2',
                        'title': 'React Fundamentals Quiz',
                        'type': 'quiz',
                        'duration': '15:00',
                        'completed': False,
                        'quiz': {
                            'questions': [
                                {
                                    'id': 'q1',
                                    'type': 'multiple-choice',
                                    'question': 'What is React?',
                                    'options': ['A framework', 'A library', 'A programming language'],
                                    'correctAnswer': 'A library',
                                    'points': 10
                                }
                            ],
                            'timeLimit': 900,
                            'passingScore': 70
                        }
                    }
                ]
            }
        }
        
        self.learning_paths = {
            '1': {
                'id': '1',
                'title': 'Full Stack Web Developer',
                'description': 'Complete path from frontend to backend development',
                'courses': ['1'],
                'duration': '6 months',
                'difficulty': 'Intermediate',
                'skills': ['React', 'Node.js', 'Python', 'MongoDB'],
                'jobRoles': ['Full Stack Developer', 'Web Developer'],
                'estimatedSalary': '$70,000 - $120,000'
            }
        }
        
        self.user_progress = {}
        self.achievements = {}
        
    def get_user_dashboard(self, user_id: str) -> Dict:
        """Get user dashboard data"""
        try:
            # Get user's enrolled courses
            enrolled_courses = self.get_user_enrolled_courses(user_id)
            
            # Calculate stats
            total_hours = sum(course.get('completedHours', 0) for course in enrolled_courses)
            certificates_earned = len([c for c in enrolled_courses if c.get('progress', 0) == 100])
            current_streak = self.calculate_learning_streak(user_id)
            
            # Get recent achievements
            recent_achievements = self.get_recent_achievements(user_id)
            
            # Get learning activity
            weekly_activity = self.get_weekly_activity(user_id)
            
            return {
                'stats': {
                    'coursesEnrolled': len(enrolled_courses),
                    'hoursLearned': total_hours,
                    'certificatesEarned': certificates_earned,
                    'currentStreak': current_streak
                },
                'enrolledCourses': enrolled_courses,
                'recentAchievements': recent_achievements,
                'weeklyActivity': weekly_activity,
                'overallProgress': self.calculate_overall_progress(user_id)
            }
            
        except Exception as e:
            logger.error(f"Error getting user dashboard: {str(e)}")
            raise Exception(f"Dashboard retrieval failed: {str(e)}")
    
    def get_courses(self, filters: Optional[Dict] = None) -> List[Dict]:
        """Get courses with optional filtering"""
        try:
            courses = list(self.courses.values())
            
            if filters:
                search = filters.get('search', '').lower()
                category = filters.get('category', 'all')
                difficulty = filters.get('difficulty', 'all')
                
                if search:
                    courses = [c for c in courses if 
                             search in c['title'].lower() or 
                             search in c['description'].lower() or
                             any(search in skill.lower() for skill in c['skills'])]
                
                if category != 'all':
                    courses = [c for c in courses if c['category'].lower() == category.lower()]
                
                if difficulty != 'all':
                    courses = [c for c in courses if c['difficulty'].lower() == difficulty.lower()]
            
            return courses
            
        except Exception as e:
            logger.error(f"Error getting courses: {str(e)}")
            raise Exception(f"Course retrieval failed: {str(e)}")
    
    def get_course_details(self, course_id: str, user_id: str) -> Dict:
        """Get detailed course information"""
        try:
            if course_id not in self.courses:
                raise Exception("Course not found")
            
            course = self.courses[course_id].copy()
            
            # Add user-specific data
            user_progress = self.get_user_course_progress(user_id, course_id)
            course['progress'] = user_progress.get('progress', 0)
            course['enrolled'] = user_progress.get('enrolled', False)
            course['lastAccessed'] = user_progress.get('lastAccessed')
            
            # Add module completion status
            for module in course['modules']:
                module['completed'] = user_progress.get('completedModules', {}).get(module['id'], False)
                module['locked'] = self.is_module_locked(user_id, course_id, module['id'])
            
            return course
            
        except Exception as e:
            logger.error(f"Error getting course details: {str(e)}")
            raise Exception(f"Course details retrieval failed: {str(e)}")
    
    def enroll_in_course(self, user_id: str, course_id: str) -> Dict:
        """Enroll user in a course"""
        try:
            if course_id not in self.courses:
                raise Exception("Course not found")
            
            # Initialize user progress if not exists
            if user_id not in self.user_progress:
                self.user_progress[user_id] = {}
            
            if course_id not in self.user_progress[user_id]:
                self.user_progress[user_id][course_id] = {
                    'enrolled': True,
                    'enrolledDate': datetime.now().isoformat(),
                    'progress': 0,
                    'completedModules': {},
                    'lastAccessed': datetime.now().isoformat(),
                    'timeSpent': 0
                }
            
            # Award enrollment achievement
            self.award_achievement(user_id, 'first_enrollment')
            
            return {
                'success': True,
                'message': 'Successfully enrolled in course',
                'courseId': course_id,
                'enrolledDate': self.user_progress[user_id][course_id]['enrolledDate']
            }
            
        except Exception as e:
            logger.error(f"Error enrolling in course: {str(e)}")
            raise Exception(f"Course enrollment failed: {str(e)}")
    
    def complete_module(self, user_id: str, course_id: str, module_id: str) -> Dict:
        """Mark a module as completed"""
        try:
            if course_id not in self.courses:
                raise Exception("Course not found")
            
            # Initialize progress if needed
            if user_id not in self.user_progress:
                self.user_progress[user_id] = {}
            if course_id not in self.user_progress[user_id]:
                self.user_progress[user_id][course_id] = {
                    'enrolled': True,
                    'progress': 0,
                    'completedModules': {},
                    'lastAccessed': datetime.now().isoformat()
                }
            
            # Mark module as completed
            self.user_progress[user_id][course_id]['completedModules'][module_id] = {
                'completed': True,
                'completedDate': datetime.now().isoformat()
            }
            
            # Update course progress
            course = self.courses[course_id]
            total_modules = len(course['modules'])
            completed_modules = len(self.user_progress[user_id][course_id]['completedModules'])
            progress = (completed_modules / total_modules) * 100
            
            self.user_progress[user_id][course_id]['progress'] = progress
            self.user_progress[user_id][course_id]['lastAccessed'] = datetime.now().isoformat()
            
            # Check for achievements
            if completed_modules == 1:
                self.award_achievement(user_id, 'first_module')
            if progress == 100:
                self.award_achievement(user_id, 'course_completion')
            
            # Unlock next module
            next_module = self.get_next_module(course_id, module_id)
            
            return {
                'success': True,
                'progress': progress,
                'nextModule': next_module,
                'achievements': self.get_recent_achievements(user_id)
            }
            
        except Exception as e:
            logger.error(f"Error completing module: {str(e)}")
            raise Exception(f"Module completion failed: {str(e)}")
    
    def submit_quiz(self, user_id: str, course_id: str, module_id: str, answers: Dict) -> Dict:
        """Submit quiz answers and calculate score"""
        try:
            course = self.courses.get(course_id)
            if not course:
                raise Exception("Course not found")
            
            module = next((m for m in course['modules'] if m['id'] == module_id), None)
            if not module or module['type'] != 'quiz':
                raise Exception("Quiz module not found")
            
            quiz = module.get('quiz')
            if not quiz:
                raise Exception("Quiz data not found")
            
            # Calculate score
            total_points = 0
            earned_points = 0
            
            for question in quiz['questions']:
                total_points += question['points']
                if answers.get(question['id']) == question['correctAnswer']:
                    earned_points += question['points']
            
            score_percentage = (earned_points / total_points) * 100 if total_points > 0 else 0
            passed = score_percentage >= quiz['passingScore']
            
            # Save quiz result
            if user_id not in self.user_progress:
                self.user_progress[user_id] = {}
            if course_id not in self.user_progress[user_id]:
                self.user_progress[user_id][course_id] = {'quizResults': {}}
            if 'quizResults' not in self.user_progress[user_id][course_id]:
                self.user_progress[user_id][course_id]['quizResults'] = {}
            
            self.user_progress[user_id][course_id]['quizResults'][module_id] = {
                'score': score_percentage,
                'passed': passed,
                'attempts': self.user_progress[user_id][course_id]['quizResults'].get(module_id, {}).get('attempts', 0) + 1,
                'submittedDate': datetime.now().isoformat(),
                'answers': answers
            }
            
            # If passed, mark module as completed
            if passed:
                self.complete_module(user_id, course_id, module_id)
            
            return {
                'success': True,
                'score': score_percentage,
                'passed': passed,
                'passingScore': quiz['passingScore'],
                'earnedPoints': earned_points,
                'totalPoints': total_points,
                'canRetake': self.user_progress[user_id][course_id]['quizResults'][module_id]['attempts'] < quiz.get('maxAttempts', 3)
            }
            
        except Exception as e:
            logger.error(f"Error submitting quiz: {str(e)}")
            raise Exception(f"Quiz submission failed: {str(e)}")
    
    def submit_assignment(self, user_id: str, course_id: str, module_id: str, submission_data: Dict) -> Dict:
        """Submit assignment"""
        try:
            course = self.courses.get(course_id)
            if not course:
                raise Exception("Course not found")
            
            module = next((m for m in course['modules'] if m['id'] == module_id), None)
            if not module or module['type'] != 'assignment':
                raise Exception("Assignment module not found")
            
            # Save assignment submission
            if user_id not in self.user_progress:
                self.user_progress[user_id] = {}
            if course_id not in self.user_progress[user_id]:
                self.user_progress[user_id][course_id] = {'assignments': {}}
            if 'assignments' not in self.user_progress[user_id][course_id]:
                self.user_progress[user_id][course_id]['assignments'] = {}
            
            submission_id = str(uuid.uuid4())
            self.user_progress[user_id][course_id]['assignments'][module_id] = {
                'submissionId': submission_id,
                'submittedDate': datetime.now().isoformat(),
                'projectUrl': submission_data.get('projectUrl'),
                'demoUrl': submission_data.get('demoUrl'),
                'comments': submission_data.get('comments'),
                'files': submission_data.get('files', []),
                'status': 'submitted',
                'grade': None,
                'feedback': None
            }
            
            # Mark module as completed
            self.complete_module(user_id, course_id, module_id)
            
            # Award assignment achievement
            self.award_achievement(user_id, 'assignment_submission')
            
            return {
                'success': True,
                'submissionId': submission_id,
                'message': 'Assignment submitted successfully',
                'submittedDate': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error submitting assignment: {str(e)}")
            raise Exception(f"Assignment submission failed: {str(e)}")
    
    def get_learning_paths(self, user_id: str) -> List[Dict]:
        """Get learning paths with user progress"""
        try:
            paths = []
            for path_id, path_data in self.learning_paths.items():
                path = path_data.copy()
                
                # Calculate progress based on enrolled courses
                total_courses = len(path['courses'])
                completed_courses = 0
                
                for course_id in path['courses']:
                    user_course_progress = self.get_user_course_progress(user_id, course_id)
                    if user_course_progress.get('progress', 0) == 100:
                        completed_courses += 1
                
                path['progress'] = (completed_courses / total_courses) * 100 if total_courses > 0 else 0
                path['enrolled'] = any(
                    self.get_user_course_progress(user_id, course_id).get('enrolled', False)
                    for course_id in path['courses']
                )
                
                paths.append(path)
            
            return paths
            
        except Exception as e:
            logger.error(f"Error getting learning paths: {str(e)}")
            raise Exception(f"Learning paths retrieval failed: {str(e)}")
    
    def get_achievements(self, user_id: str) -> List[Dict]:
        """Get user achievements"""
        try:
            all_achievements = [
                {
                    'id': 'first_enrollment',
                    'title': 'First Steps',
                    'description': 'Enroll in your first course',
                    'icon': 'trophy',
                    'points': 50,
                    'rarity': 'common'
                },
                {
                    'id': 'first_module',
                    'title': 'Learning Begins',
                    'description': 'Complete your first module',
                    'icon': 'book',
                    'points': 100,
                    'rarity': 'common'
                },
                {
                    'id': 'course_completion',
                    'title': 'Course Master',
                    'description': 'Complete your first course',
                    'icon': 'award',
                    'points': 500,
                    'rarity': 'rare'
                },
                {
                    'id': 'assignment_submission',
                    'title': 'Hands-On Learner',
                    'description': 'Submit your first assignment',
                    'icon': 'code',
                    'points': 200,
                    'rarity': 'uncommon'
                }
            ]
            
            user_achievements = self.achievements.get(user_id, {})
            
            for achievement in all_achievements:
                achievement_id = achievement['id']
                if achievement_id in user_achievements:
                    achievement['earned'] = True
                    achievement['earnedDate'] = user_achievements[achievement_id]['earnedDate']
                else:
                    achievement['earned'] = False
                    achievement['earnedDate'] = None
            
            return all_achievements
            
        except Exception as e:
            logger.error(f"Error getting achievements: {str(e)}")
            raise Exception(f"Achievements retrieval failed: {str(e)}")
    
    def get_certificates(self, user_id: str) -> List[Dict]:
        """Get user certificates"""
        try:
            certificates = []
            
            for course_id, course in self.courses.items():
                if not course.get('certificate'):
                    continue
                
                user_progress = self.get_user_course_progress(user_id, course_id)
                if user_progress.get('enrolled', False):
                    certificate = {
                        'courseId': course_id,
                        'courseTitle': course['title'],
                        'instructor': course['instructor']['name'],
                        'progress': user_progress.get('progress', 0),
                        'earned': user_progress.get('progress', 0) == 100,
                        'skills': course['skills'],
                        'duration': course['duration'],
                        'difficulty': course['difficulty']
                    }
                    
                    if certificate['earned']:
                        certificate['earnedDate'] = user_progress.get('completedDate')
                        certificate['certificateId'] = f"CERT-{course_id}-{user_id}"
                    
                    certificates.append(certificate)
            
            return certificates
            
        except Exception as e:
            logger.error(f"Error getting certificates: {str(e)}")
            raise Exception(f"Certificates retrieval failed: {str(e)}")
    
    def get_user_enrolled_courses(self, user_id: str) -> List[Dict]:
        """Get courses user is enrolled in"""
        enrolled_courses = []
        user_data = self.user_progress.get(user_id, {})
        
        for course_id, progress_data in user_data.items():
            if progress_data.get('enrolled', False):
                course = self.courses.get(course_id, {}).copy()
                course.update({
                    'progress': progress_data.get('progress', 0),
                    'lastAccessed': progress_data.get('lastAccessed'),
                    'timeSpent': progress_data.get('timeSpent', 0)
                })
                enrolled_courses.append(course)
        
        return enrolled_courses
    
    def get_user_course_progress(self, user_id: str, course_id: str) -> Dict:
        """Get user progress for specific course"""
        return self.user_progress.get(user_id, {}).get(course_id, {})
    
    def calculate_learning_streak(self, user_id: str) -> int:
        """Calculate user's current learning streak"""
        # Simplified implementation - in production, track daily activity
        return 12  # Mock streak
    
    def get_recent_achievements(self, user_id: str) -> List[Dict]:
        """Get recently earned achievements"""
        user_achievements = self.achievements.get(user_id, {})
        recent = []
        
        for achievement_id, data in user_achievements.items():
            earned_date = datetime.fromisoformat(data['earnedDate'])
            if (datetime.now() - earned_date).days <= 7:  # Last 7 days
                recent.append({
                    'id': achievement_id,
                    'earnedDate': data['earnedDate'],
                    'title': data.get('title', achievement_id),
                    'points': data.get('points', 0)
                })
        
        return recent[:5]  # Return last 5
    
    def get_weekly_activity(self, user_id: str) -> List[Dict]:
        """Get weekly learning activity"""
        # Mock data - in production, track actual activity
        return [
            {'day': 'Mon', 'hours': 2},
            {'day': 'Tue', 'hours': 1.5},
            {'day': 'Wed', 'hours': 3},
            {'day': 'Thu', 'hours': 2.5},
            {'day': 'Fri', 'hours': 1},
            {'day': 'Sat', 'hours': 4},
            {'day': 'Sun', 'hours': 2}
        ]
    
    def calculate_overall_progress(self, user_id: str) -> int:
        """Calculate user's overall learning progress"""
        enrolled_courses = self.get_user_enrolled_courses(user_id)
        if not enrolled_courses:
            return 0
        
        total_progress = sum(course.get('progress', 0) for course in enrolled_courses)
        return int(total_progress / len(enrolled_courses))
    
    def is_module_locked(self, user_id: str, course_id: str, module_id: str) -> bool:
        """Check if module is locked for user"""
        course = self.courses.get(course_id)
        if not course:
            return True
        
        # Find module index
        module_index = next((i for i, m in enumerate(course['modules']) if m['id'] == module_id), -1)
        if module_index == -1:
            return True
        
        # First module is always unlocked
        if module_index == 0:
            return False
        
        # Check if previous module is completed
        previous_module = course['modules'][module_index - 1]
        user_progress = self.get_user_course_progress(user_id, course_id)
        completed_modules = user_progress.get('completedModules', {})
        
        return previous_module['id'] not in completed_modules
    
    def get_next_module(self, course_id: str, current_module_id: str) -> Optional[Dict]:
        """Get next module in course"""
        course = self.courses.get(course_id)
        if not course:
            return None
        
        current_index = next((i for i, m in enumerate(course['modules']) if m['id'] == current_module_id), -1)
        if current_index == -1 or current_index >= len(course['modules']) - 1:
            return None
        
        return course['modules'][current_index + 1]
    
    def award_achievement(self, user_id: str, achievement_id: str):
        """Award achievement to user"""
        if user_id not in self.achievements:
            self.achievements[user_id] = {}
        
        if achievement_id not in self.achievements[user_id]:
            self.achievements[user_id][achievement_id] = {
                'earnedDate': datetime.now().isoformat(),
                'title': achievement_id.replace('_', ' ').title(),
                'points': 100  # Default points
            }
            logger.info(f"Achievement '{achievement_id}' awarded to user {user_id}")