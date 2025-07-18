import logging
import json
from typing import Dict, List, Optional, Tuple
from collections import Counter
import re
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

class JobMatcher:
    def __init__(self):
        """Initialize the Job Matcher with NLP models and data"""
        self.setup_spacy()
        self.setup_job_keywords()
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
    def setup_spacy(self):
        """Load spaCy model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.error("spaCy English model not found. Please install it with: python -m spacy download en_core_web_sm")
            raise
    
    def setup_job_keywords(self):
        """Initialize job-related keywords and categories"""
        self.skill_categories = {
            'programming_languages': [
                'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
                'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala', 'R', 'MATLAB', 'SQL'
            ],
            'frameworks': [
                'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
                'FastAPI', 'Spring', 'Laravel', 'Rails', 'ASP.NET', 'jQuery', 'Bootstrap'
            ],
            'databases': [
                'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Cassandra',
                'DynamoDB', 'Oracle', 'SQL Server', 'Firebase', 'Supabase'
            ],
            'cloud_devops': [
                'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
                'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible'
            ],
            'ai_ml': [
                'Machine Learning', 'Deep Learning', 'Neural Networks', 'TensorFlow',
                'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter'
            ],
            'tools': [
                'Git', 'Linux', 'Unix', 'Bash', 'VS Code', 'IntelliJ', 'Postman',
                'Swagger', 'REST API', 'GraphQL', 'Microservices'
            ]
        }
        
        self.experience_levels = {
            'entry': ['entry', 'junior', 'graduate', 'intern', '0-1', '0-2'],
            'mid': ['mid', 'intermediate', '2-4', '3-5', '2-5'],
            'senior': ['senior', 'lead', '5+', '5-8', '7+'],
            'principal': ['principal', 'staff', 'architect', '8+', '10+']
        }
        
        self.job_types = ['full-time', 'part-time', 'contract', 'remote', 'hybrid']
        
        self.salary_ranges = {
            'entry': (40000, 80000),
            'mid': (80000, 120000),
            'senior': (120000, 180000),
            'principal': (180000, 300000)
        }
    
    def analyze_job_match(self, resume_text: str, job_description: str, user_preferences: Optional[Dict] = None) -> Dict:
        """
        Analyze how well a resume matches a job description
        """
        logger.info("Starting job match analysis...")
        
        try:
            # Clean and preprocess texts
            resume_clean = self.clean_text(resume_text)
            job_clean = self.clean_text(job_description)
            
            # Extract features from both texts
            resume_features = self.extract_features(resume_clean)
            job_features = self.extract_features(job_clean)
            
            # Calculate various match scores
            skills_match = self.calculate_skills_match(resume_features, job_features)
            experience_match = self.calculate_experience_match(resume_features, job_features)
            semantic_match = self.calculate_semantic_similarity(resume_clean, job_clean)
            keyword_match = self.calculate_keyword_match(resume_clean, job_clean)
            
            # Calculate overall match score
            overall_score = self.calculate_overall_score(
                skills_match, experience_match, semantic_match, keyword_match
            )
            
            # Generate recommendations
            recommendations = self.generate_recommendations(
                resume_features, job_features, skills_match
            )
            
            # Identify missing skills and keywords
            missing_skills = self.identify_missing_skills(resume_features, job_features)
            missing_keywords = self.identify_missing_keywords(resume_clean, job_clean)
            
            result = {
                'overall_score': round(overall_score, 1),
                'skills_match': round(skills_match['score'], 1),
                'experience_match': round(experience_match['score'], 1),
                'semantic_match': round(semantic_match, 1),
                'keyword_match': round(keyword_match, 1),
                'matching_skills': skills_match['matching'],
                'missing_skills': missing_skills,
                'missing_keywords': missing_keywords[:10],  # Top 10
                'recommendations': recommendations,
                'job_requirements': job_features,
                'resume_profile': resume_features
            }
            
            logger.info(f"Job match analysis completed. Overall score: {overall_score}")
            return result
            
        except Exception as e:
            logger.error(f"Error in job match analysis: {str(e)}")
            raise Exception(f"Job match analysis failed: {str(e)}")
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text.strip())
        # Remove special characters but keep important punctuation
        text = re.sub(r'[^\w\s\-\.\,\;\:\(\)\[\]\/\@\+\#]', '', text)
        return text.lower()
    
    def extract_features(self, text: str) -> Dict:
        """Extract relevant features from text"""
        doc = self.nlp(text)
        
        # Extract skills by category
        skills = {}
        for category, skill_list in self.skill_categories.items():
            found_skills = []
            for skill in skill_list:
                if skill.lower() in text:
                    found_skills.append(skill)
            skills[category] = found_skills
        
        # Extract experience level
        experience_level = self.extract_experience_level(text)
        
        # Extract education
        education = self.extract_education(text)
        
        # Extract certifications
        certifications = self.extract_certifications(text)
        
        # Extract job titles/roles
        job_titles = self.extract_job_titles(text)
        
        return {
            'skills': skills,
            'experience_level': experience_level,
            'education': education,
            'certifications': certifications,
            'job_titles': job_titles,
            'total_skills': sum(len(skills_list) for skills_list in skills.values())
        }
    
    def extract_experience_level(self, text: str) -> str:
        """Extract experience level from text"""
        for level, keywords in self.experience_levels.items():
            for keyword in keywords:
                if keyword in text:
                    return level
        return 'unknown'
    
    def extract_education(self, text: str) -> List[str]:
        """Extract education information"""
        education_keywords = [
            'bachelor', 'master', 'phd', 'doctorate', 'degree', 'university',
            'college', 'computer science', 'engineering', 'mathematics'
        ]
        found_education = []
        for keyword in education_keywords:
            if keyword in text:
                found_education.append(keyword)
        return list(set(found_education))
    
    def extract_certifications(self, text: str) -> List[str]:
        """Extract certifications"""
        cert_keywords = [
            'aws certified', 'azure certified', 'google cloud', 'cissp',
            'pmp', 'scrum master', 'kubernetes', 'docker certified'
        ]
        found_certs = []
        for cert in cert_keywords:
            if cert in text:
                found_certs.append(cert)
        return found_certs
    
    def extract_job_titles(self, text: str) -> List[str]:
        """Extract job titles/roles"""
        title_keywords = [
            'developer', 'engineer', 'architect', 'manager', 'lead',
            'senior', 'junior', 'principal', 'director', 'analyst'
        ]
        found_titles = []
        for title in title_keywords:
            if title in text:
                found_titles.append(title)
        return list(set(found_titles))
    
    def calculate_skills_match(self, resume_features: Dict, job_features: Dict) -> Dict:
        """Calculate skills match score"""
        resume_skills = set()
        job_skills = set()
        
        # Flatten skills from all categories
        for category_skills in resume_features['skills'].values():
            resume_skills.update([skill.lower() for skill in category_skills])
        
        for category_skills in job_features['skills'].values():
            job_skills.update([skill.lower() for skill in category_skills])
        
        if not job_skills:
            return {'score': 0, 'matching': [], 'missing': list(job_skills)}
        
        # Calculate overlap
        matching_skills = resume_skills.intersection(job_skills)
        missing_skills = job_skills - resume_skills
        
        # Calculate score
        score = (len(matching_skills) / len(job_skills)) * 100 if job_skills else 0
        
        return {
            'score': score,
            'matching': list(matching_skills),
            'missing': list(missing_skills)
        }
    
    def calculate_experience_match(self, resume_features: Dict, job_features: Dict) -> Dict:
        """Calculate experience level match"""
        resume_exp = resume_features['experience_level']
        job_exp = job_features['experience_level']
        
        # Define experience level hierarchy
        exp_hierarchy = {'entry': 1, 'mid': 2, 'senior': 3, 'principal': 4, 'unknown': 0}
        
        resume_level = exp_hierarchy.get(resume_exp, 0)
        job_level = exp_hierarchy.get(job_exp, 0)
        
        if job_level == 0:  # Unknown job requirement
            score = 50  # Neutral score
        elif resume_level >= job_level:
            score = 100  # Meets or exceeds requirement
        elif resume_level == job_level - 1:
            score = 75   # Close match
        else:
            score = max(0, 100 - (job_level - resume_level) * 25)
        
        return {
            'score': score,
            'resume_level': resume_exp,
            'job_level': job_exp
        }
    
    def calculate_semantic_similarity(self, resume_text: str, job_text: str) -> float:
        """Calculate semantic similarity using TF-IDF and cosine similarity"""
        try:
            # Fit vectorizer on both texts
            corpus = [resume_text, job_text]
            tfidf_matrix = self.vectorizer.fit_transform(corpus)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return similarity * 100
            
        except Exception as e:
            logger.warning(f"Error calculating semantic similarity: {str(e)}")
            return 0.0
    
    def calculate_keyword_match(self, resume_text: str, job_text: str) -> float:
        """Calculate keyword overlap percentage"""
        # Extract important keywords from job description
        job_words = set(word for word in job_text.split() if len(word) > 3)
        resume_words = set(word for word in resume_text.split() if len(word) > 3)
        
        # Remove common words
        common_words = {'with', 'have', 'will', 'work', 'team', 'experience', 'skills'}
        job_words -= common_words
        resume_words -= common_words
        
        if not job_words:
            return 0
        
        # Calculate overlap
        overlap = job_words.intersection(resume_words)
        return (len(overlap) / len(job_words)) * 100
    
    def calculate_overall_score(self, skills_match: Dict, experience_match: Dict, 
                              semantic_match: float, keyword_match: float) -> float:
        """Calculate weighted overall match score"""
        weights = {
            'skills': 0.4,
            'experience': 0.2,
            'semantic': 0.25,
            'keywords': 0.15
        }
        
        overall = (
            skills_match['score'] * weights['skills'] +
            experience_match['score'] * weights['experience'] +
            semantic_match * weights['semantic'] +
            keyword_match * weights['keywords']
        )
        
        return overall
    
    def identify_missing_skills(self, resume_features: Dict, job_features: Dict) -> List[str]:
        """Identify skills missing from resume but required for job"""
        resume_skills = set()
        job_skills = set()
        
        for category_skills in resume_features['skills'].values():
            resume_skills.update([skill.lower() for skill in category_skills])
        
        for category_skills in job_features['skills'].values():
            job_skills.update([skill.lower() for skill in category_skills])
        
        missing = job_skills - resume_skills
        return list(missing)[:10]  # Return top 10
    
    def identify_missing_keywords(self, resume_text: str, job_text: str) -> List[str]:
        """Identify important keywords missing from resume"""
        # Get word frequency from job description
        job_words = [word for word in job_text.split() if len(word) > 3]
        word_freq = Counter(job_words)
        
        # Get resume words
        resume_words = set(resume_text.split())
        
        # Find missing important words
        missing_keywords = []
        for word, freq in word_freq.most_common(50):
            if freq > 1 and word not in resume_words:
                # Filter out common words
                if word not in ['with', 'have', 'will', 'work', 'team', 'experience']:
                    missing_keywords.append(word)
        
        return missing_keywords[:15]
    
    def generate_recommendations(self, resume_features: Dict, job_features: Dict, 
                               skills_match: Dict) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Skills recommendations
        if skills_match['score'] < 70:
            missing_skills = skills_match['missing'][:5]
            if missing_skills:
                recommendations.append(
                    f"Consider learning these in-demand skills: {', '.join(missing_skills)}"
                )
        
        # Experience recommendations
        resume_exp = resume_features['experience_level']
        job_exp = job_features['experience_level']
        
        if resume_exp == 'entry' and job_exp in ['mid', 'senior']:
            recommendations.append(
                "Highlight any relevant projects, internships, or coursework to demonstrate practical experience"
            )
        
        # Education recommendations
        if not resume_features['education'] and job_features['education']:
            recommendations.append(
                "Consider highlighting relevant educational background or certifications"
            )
        
        # Certification recommendations
        if not resume_features['certifications'] and job_features['certifications']:
            recommendations.append(
                "Industry certifications could strengthen your profile for this role"
            )
        
        # General recommendations
        if len(recommendations) == 0:
            recommendations.append(
                "Your profile shows strong alignment with this role. Consider customizing your resume to highlight the most relevant experiences."
            )
        
        return recommendations[:5]
    
    def find_similar_jobs(self, user_profile: Dict, job_listings: List[Dict], 
                         limit: int = 10) -> List[Dict]:
        """Find jobs similar to user profile"""
        logger.info("Finding similar jobs for user profile...")
        
        try:
            # Create user profile text
            user_text = self.create_profile_text(user_profile)
            
            # Calculate similarity with each job
            job_scores = []
            for job in job_listings:
                job_text = f"{job['title']} {job['description']} {' '.join(job.get('skills', []))}"
                
                # Calculate match score
                match_result = self.analyze_job_match(user_text, job_text)
                
                job_with_score = job.copy()
                job_with_score['match_score'] = match_result['overall_score']
                job_with_score['skills_match'] = match_result['skills_match']
                job_with_score['missing_skills'] = match_result['missing_skills']
                
                job_scores.append(job_with_score)
            
            # Sort by match score and return top results
            job_scores.sort(key=lambda x: x['match_score'], reverse=True)
            
            logger.info(f"Found {len(job_scores)} job matches")
            return job_scores[:limit]
            
        except Exception as e:
            logger.error(f"Error finding similar jobs: {str(e)}")
            return []
    
    def create_profile_text(self, user_profile: Dict) -> str:
        """Create text representation of user profile"""
        text_parts = []
        
        if 'title' in user_profile:
            text_parts.append(user_profile['title'])
        
        if 'skills' in user_profile:
            text_parts.extend(user_profile['skills'])
        
        if 'experience' in user_profile:
            text_parts.append(user_profile['experience'])
        
        if 'education' in user_profile:
            text_parts.append(user_profile['education'])
        
        return ' '.join(text_parts)
    
    def get_skill_recommendations(self, user_skills: List[str], target_role: str) -> List[str]:
        """Get skill recommendations based on target role"""
        role_skill_map = {
            'frontend developer': ['React', 'Vue.js', 'Angular', 'TypeScript', 'CSS', 'HTML'],
            'backend developer': ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'REST API'],
            'full stack developer': ['React', 'Node.js', 'Python', 'SQL', 'MongoDB', 'TypeScript'],
            'data scientist': ['Python', 'R', 'Machine Learning', 'Pandas', 'NumPy', 'TensorFlow'],
            'devops engineer': ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux'],
            'mobile developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android']
        }
        
        target_skills = role_skill_map.get(target_role.lower(), [])
        user_skills_lower = [skill.lower() for skill in user_skills]
        
        recommended = []
        for skill in target_skills:
            if skill.lower() not in user_skills_lower:
                recommended.append(skill)
        
        return recommended[:8]