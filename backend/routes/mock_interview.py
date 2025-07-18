from flask import Blueprint, request, jsonify
import logging
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from utils.response_formatter import format_response, format_error

logger = logging.getLogger(__name__)

mock_interview_bp = Blueprint('mock_interview', __name__)

# Mock interview questions database
INTERVIEW_QUESTIONS = {
    'technical': [
        {
            'id': 'tech-1',
            'category': 'Data Structures',
            'difficulty': 'Medium',
            'question': 'Explain the difference between an array and a linked list. When would you use each?',
            'expectedKeywords': ['array', 'linked list', 'memory', 'access time', 'insertion', 'deletion'],
            'timeLimit': 120,
            'followUpQuestions': ['How would you implement a dynamic array?']
        },
        {
            'id': 'tech-2',
            'category': 'Algorithms',
            'difficulty': 'Hard',
            'question': 'Describe how you would implement a binary search algorithm and analyze its time complexity.',
            'expectedKeywords': ['binary search', 'sorted array', 'divide and conquer', 'O(log n)', 'time complexity'],
            'timeLimit': 180,
            'followUpQuestions': ['What happens if the array is not sorted?']
        },
        {
            'id': 'tech-3',
            'category': 'System Design',
            'difficulty': 'Hard',
            'question': 'How would you design a URL shortener like bit.ly? Walk me through your architecture.',
            'expectedKeywords': ['database', 'hashing', 'scalability', 'load balancer', 'caching', 'API'],
            'timeLimit': 300,
            'followUpQuestions': ['How would you handle 1 million requests per second?']
        }
    ],
    'behavioral': [
        {
            'id': 'beh-1',
            'category': 'Leadership',
            'difficulty': 'Medium',
            'question': 'Tell me about a time when you had to lead a team through a challenging project.',
            'expectedKeywords': ['leadership', 'team', 'challenge', 'communication', 'result', 'collaboration'],
            'timeLimit': 180,
            'followUpQuestions': ['How did you handle team conflicts?']
        },
        {
            'id': 'beh-2',
            'category': 'Problem Solving',
            'difficulty': 'Medium',
            'question': 'Describe a situation where you had to solve a complex technical problem under pressure.',
            'expectedKeywords': ['problem solving', 'pressure', 'analysis', 'solution', 'outcome', 'learning'],
            'timeLimit': 150,
            'followUpQuestions': ['What would you do differently next time?']
        }
    ],
    'system-design': [
        {
            'id': 'sys-1',
            'category': 'Scalability',
            'difficulty': 'Hard',
            'question': 'Design a chat application like WhatsApp that can handle millions of users.',
            'expectedKeywords': ['websockets', 'database', 'message queue', 'load balancer', 'microservices', 'real-time'],
            'timeLimit': 600,
            'followUpQuestions': ['How would you handle message delivery guarantees?']
        }
    ],
    'coding': [
        {
            'id': 'code-1',
            'category': 'Arrays',
            'difficulty': 'Medium',
            'question': 'Given an array of integers, find two numbers that add up to a target sum.',
            'expectedKeywords': ['two sum', 'hash map', 'array', 'target', 'time complexity', 'space complexity'],
            'timeLimit': 300,
            'followUpQuestions': ['What if there are multiple solutions?']
        }
    ]
}

# In-memory storage for interview sessions (in production, use a database)
interview_sessions = {}

@mock_interview_bp.route('/start', methods=['POST'])
def start_interview():
    """Start a new mock interview session"""
    try:
        data = request.get_json()
        
        if not data:
            return format_error('No data provided', 400)
        
        interview_type = data.get('type', 'technical')
        difficulty = data.get('difficulty', 'Medium')
        duration = data.get('duration', 30)  # minutes
        
        # Validate input
        if interview_type not in INTERVIEW_QUESTIONS:
            return format_error('Invalid interview type', 400)
        
        if difficulty not in ['Easy', 'Medium', 'Hard']:
            return format_error('Invalid difficulty level', 400)
        
        # Get questions for the interview
        questions = INTERVIEW_QUESTIONS[interview_type]
        filtered_questions = [q for q in questions if q['difficulty'] == difficulty]
        
        # Limit questions based on duration (roughly 5 minutes per question)
        max_questions = max(1, duration // 5)
        selected_questions = filtered_questions[:max_questions]
        
        if not selected_questions:
            return format_error('No questions available for the selected criteria', 400)
        
        # Create interview session
        session_id = str(uuid.uuid4())
        session = {
            'id': session_id,
            'type': interview_type,
            'difficulty': difficulty,
            'duration': duration,
            'questions': selected_questions,
            'currentQuestionIndex': 0,
            'startTime': datetime.now().isoformat(),
            'responses': [],
            'status': 'in-progress'
        }
        
        interview_sessions[session_id] = session
        
        logger.info(f"Started interview session {session_id} with {len(selected_questions)} questions")
        
        return format_response({
            'sessionId': session_id,
            'questions': selected_questions,
            'totalQuestions': len(selected_questions),
            'estimatedDuration': len(selected_questions) * 5  # minutes
        })
        
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        return format_error(f'Failed to start interview: {str(e)}', 500)

@mock_interview_bp.route('/submit-response', methods=['POST'])
def submit_response():
    """Submit a response to an interview question"""
    try:
        data = request.get_json()
        
        if not data:
            return format_error('No data provided', 400)
        
        session_id = data.get('sessionId')
        question_id = data.get('questionId')
        transcription = data.get('transcription', '')
        duration = data.get('duration', 0)
        
        if not session_id or session_id not in interview_sessions:
            return format_error('Invalid session ID', 400)
        
        session = interview_sessions[session_id]
        
        # Find the question
        current_question = None
        for q in session['questions']:
            if q['id'] == question_id:
                current_question = q
                break
        
        if not current_question:
            return format_error('Question not found', 400)
        
        # Analyze the response
        analysis = analyze_response(transcription, current_question)
        
        # Create response record
        response = {
            'questionId': question_id,
            'transcription': transcription,
            'duration': duration,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        }
        
        # Add to session
        session['responses'].append(response)
        
        # Move to next question or complete interview
        if session['currentQuestionIndex'] < len(session['questions']) - 1:
            session['currentQuestionIndex'] += 1
            next_question = session['questions'][session['currentQuestionIndex']]
            
            return format_response({
                'nextQuestion': next_question,
                'currentIndex': session['currentQuestionIndex'],
                'totalQuestions': len(session['questions']),
                'analysis': analysis
            })
        else:
            # Interview completed
            session['status'] = 'completed'
            session['endTime'] = datetime.now().isoformat()
            
            # Calculate final results
            results = calculate_interview_results(session)
            
            return format_response({
                'completed': True,
                'results': results,
                'analysis': analysis
            })
        
    except Exception as e:
        logger.error(f"Error submitting response: {str(e)}")
        return format_error(f'Failed to submit response: {str(e)}', 500)

@mock_interview_bp.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get interview session details"""
    try:
        if session_id not in interview_sessions:
            return format_error('Session not found', 404)
        
        session = interview_sessions[session_id]
        return format_response(session)
        
    except Exception as e:
        logger.error(f"Error getting session: {str(e)}")
        return format_error(f'Failed to get session: {str(e)}', 500)

@mock_interview_bp.route('/results/<session_id>', methods=['GET'])
def get_results(session_id):
    """Get interview results"""
    try:
        if session_id not in interview_sessions:
            return format_error('Session not found', 404)
        
        session = interview_sessions[session_id]
        
        if session['status'] != 'completed':
            return format_error('Interview not completed yet', 400)
        
        results = calculate_interview_results(session)
        return format_response(results)
        
    except Exception as e:
        logger.error(f"Error getting results: {str(e)}")
        return format_error(f'Failed to get results: {str(e)}', 500)

def analyze_response(transcription: str, question: Dict) -> Dict:
    """Analyze interview response using simple heuristics"""
    try:
        # Simple keyword matching
        keywords = question.get('expectedKeywords', [])
        transcription_lower = transcription.lower()
        
        matched_keywords = []
        for keyword in keywords:
            if keyword.lower() in transcription_lower:
                matched_keywords.append(keyword)
        
        keyword_score = (len(matched_keywords) / len(keywords)) * 100 if keywords else 0
        
        # Simple metrics based on response length and content
        word_count = len(transcription.split())
        
        # Scoring heuristics
        length_score = min(100, (word_count / 50) * 100)  # Optimal around 50 words
        
        # Mock emotion analysis (in real implementation, use audio analysis)
        emotion_analysis = {
            'energy': min(100, word_count * 2),  # More words = more energy
            'clarity': keyword_score,  # Keyword match indicates clarity
            'pace': 75,  # Mock pace score
            'confidence': min(100, (word_count / 30) * 100)  # Confidence based on response length
        }
        
        # Overall score
        overall_score = (keyword_score * 0.4 + length_score * 0.3 + emotion_analysis['confidence'] * 0.3)
        
        # Generate feedback
        feedback = []
        if keyword_score >= 70:
            feedback.append("Great use of relevant technical terms!")
        elif keyword_score >= 40:
            feedback.append("Good technical knowledge, try to include more specific terms.")
        else:
            feedback.append("Consider including more technical details in your response.")
        
        if word_count < 20:
            feedback.append("Try to provide more detailed explanations.")
        elif word_count > 100:
            feedback.append("Good detail, but try to be more concise.")
        
        return {
            'keywordMatch': round(keyword_score, 1),
            'matchedKeywords': matched_keywords,
            'wordCount': word_count,
            'emotionAnalysis': emotion_analysis,
            'overallScore': round(overall_score, 1),
            'feedback': feedback
        }
        
    except Exception as e:
        logger.error(f"Error analyzing response: {str(e)}")
        return {
            'keywordMatch': 0,
            'matchedKeywords': [],
            'wordCount': 0,
            'emotionAnalysis': {'energy': 0, 'clarity': 0, 'pace': 0, 'confidence': 0},
            'overallScore': 0,
            'feedback': ['Analysis failed']
        }

def calculate_interview_results(session: Dict) -> Dict:
    """Calculate final interview results"""
    try:
        responses = session.get('responses', [])
        
        if not responses:
            return {
                'overallScore': 0,
                'categoryScores': {'technical': 0, 'communication': 0, 'confidence': 0, 'clarity': 0},
                'strengths': [],
                'improvements': ['Complete the interview to get results'],
                'recommendations': ['Practice more interview questions']
            }
        
        # Calculate average scores
        total_score = sum(r['analysis']['overallScore'] for r in responses)
        overall_score = total_score / len(responses)
        
        # Calculate category scores
        avg_keyword_match = sum(r['analysis']['keywordMatch'] for r in responses) / len(responses)
        avg_confidence = sum(r['analysis']['emotionAnalysis']['confidence'] for r in responses) / len(responses)
        avg_clarity = sum(r['analysis']['emotionAnalysis']['clarity'] for r in responses) / len(responses)
        avg_energy = sum(r['analysis']['emotionAnalysis']['energy'] for r in responses) / len(responses)
        
        category_scores = {
            'technical': round(avg_keyword_match, 1),
            'communication': round(avg_clarity, 1),
            'confidence': round(avg_confidence, 1),
            'clarity': round(avg_energy, 1)
        }
        
        # Generate strengths and improvements
        strengths = []
        improvements = []
        recommendations = []
        
        if category_scores['technical'] >= 70:
            strengths.append("Strong technical knowledge")
        else:
            improvements.append("Enhance technical depth in responses")
            recommendations.append("Review fundamental concepts in your field")
        
        if category_scores['communication'] >= 70:
            strengths.append("Clear communication skills")
        else:
            improvements.append("Improve communication clarity")
            recommendations.append("Practice explaining complex concepts simply")
        
        if category_scores['confidence'] >= 70:
            strengths.append("Confident delivery")
        else:
            improvements.append("Build confidence in delivery")
            recommendations.append("Practice more technical interviews")
        
        if overall_score >= 80:
            recommendations.append("You're well-prepared for interviews!")
        elif overall_score >= 60:
            recommendations.append("Good foundation, focus on weak areas")
        else:
            recommendations.append("More practice needed across all areas")
        
        return {
            'overallScore': round(overall_score, 1),
            'categoryScores': category_scores,
            'strengths': strengths,
            'improvements': improvements,
            'recommendations': recommendations,
            'totalQuestions': len(session['questions']),
            'completedQuestions': len(responses),
            'averageResponseTime': sum(r.get('duration', 0) for r in responses) / len(responses) if responses else 0
        }
        
    except Exception as e:
        logger.error(f"Error calculating results: {str(e)}")
        return {
            'overallScore': 0,
            'categoryScores': {'technical': 0, 'communication': 0, 'confidence': 0, 'clarity': 0},
            'strengths': [],
            'improvements': ['Error calculating results'],
            'recommendations': ['Please try again']
        }

@mock_interview_bp.route('/questions/<interview_type>', methods=['GET'])
def get_questions(interview_type):
    """Get available questions for an interview type"""
    try:
        if interview_type not in INTERVIEW_QUESTIONS:
            return format_error('Invalid interview type', 400)
        
        questions = INTERVIEW_QUESTIONS[interview_type]
        return format_response({
            'type': interview_type,
            'questions': questions,
            'total': len(questions)
        })
        
    except Exception as e:
        logger.error(f"Error getting questions: {str(e)}")
        return format_error(f'Failed to get questions: {str(e)}', 500)

@mock_interview_bp.route('/types', methods=['GET'])
def get_interview_types():
    """Get available interview types"""
    try:
        types = []
        for interview_type, questions in INTERVIEW_QUESTIONS.items():
            types.append({
                'type': interview_type,
                'name': interview_type.replace('-', ' ').title(),
                'questionCount': len(questions),
                'difficulties': list(set(q['difficulty'] for q in questions))
            })
        
        return format_response({
            'types': types,
            'total': len(types)
        })
        
    except Exception as e:
        logger.error(f"Error getting interview types: {str(e)}")
        return format_error(f'Failed to get interview types: {str(e)}', 500)