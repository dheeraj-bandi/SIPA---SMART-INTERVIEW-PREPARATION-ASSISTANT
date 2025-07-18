import spacy
import textstat
import nltk
from collections import Counter
import re
import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class ResumeAnalyzer:
    def __init__(self):
        """Initialize the Resume Analyzer with NLP models and data"""
        self.setup_nltk()
        self.setup_spacy()
        self.setup_keywords()
        
    def setup_nltk(self):
        """Download required NLTK data"""
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords', quiet=True)
    
    def setup_spacy(self):
        """Load spaCy model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.error("spaCy English model not found. Please install it with: python -m spacy download en_core_web_sm")
            raise
    
    def setup_keywords(self):
        """Initialize keyword lists for analysis"""
        self.technical_keywords = [
            # Programming Languages
            "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
            "PHP", "Ruby", "Scala", "R", "MATLAB", "SQL", "HTML", "CSS", "Dart", "Perl",
            
            # Frameworks & Libraries
            "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "FastAPI",
            "Spring", "Laravel", "Rails", "ASP.NET", "jQuery", "Bootstrap", "Tailwind CSS",
            "Next.js", "Nuxt.js", "Svelte", "Flutter", "React Native", "Ionic",
            
            # Databases
            "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Cassandra", "DynamoDB",
            "Oracle", "SQL Server", "Firebase", "Supabase", "Neo4j", "InfluxDB",
            
            # Cloud & DevOps
            "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitLab CI",
            "GitHub Actions", "Terraform", "Ansible", "Chef", "Puppet", "Vagrant",
            
            # AI/ML & Data Science
            "Machine Learning", "Deep Learning", "Neural Networks", "TensorFlow", "PyTorch",
            "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter",
            "Apache Spark", "Hadoop", "Kafka", "Airflow", "MLflow", "Kubeflow",
            
            # Tools & Technologies
            "Git", "Linux", "Unix", "Bash", "PowerShell", "Vim", "VS Code", "IntelliJ",
            "Postman", "Swagger", "REST API", "GraphQL", "Microservices", "Agile", "Scrum",
            "JIRA", "Confluence", "Slack", "Teams", "Figma", "Adobe Creative Suite"
        ]
        
        self.strong_verbs = [
            "achieved", "administered", "analyzed", "architected", "automated", "built",
            "collaborated", "configured", "created", "delivered", "deployed", "designed",
            "developed", "engineered", "enhanced", "established", "executed", "implemented",
            "improved", "increased", "initiated", "integrated", "launched", "led",
            "managed", "migrated", "optimized", "orchestrated", "organized", "performed",
            "planned", "produced", "programmed", "reduced", "refactored", "resolved",
            "scaled", "streamlined", "supervised", "transformed", "upgraded", "utilized"
        ]
        
        self.expected_sections = [
            "education", "experience", "projects", "skills", "certifications",
            "achievements", "awards", "publications", "volunteer", "interests"
        ]
    
    def analyze_resume(self, resume_text: str, job_desc_text: Optional[str] = None) -> Dict:
        """Main analysis function that processes the resume"""
        logger.info("Starting comprehensive resume analysis...")
        
        # Clean and preprocess text
        cleaned_text = self.clean_text(resume_text)
        doc = self.nlp(cleaned_text)
        
        # Perform all analyses
        skills_analysis = self.analyze_skills(cleaned_text)
        sections_analysis = self.analyze_sections(cleaned_text)
        writing_analysis = self.analyze_writing_quality(cleaned_text, doc)
        verb_analysis = self.analyze_verb_strength(doc)
        formatting_analysis = self.analyze_formatting(resume_text)
        
        # Calculate individual scores
        scores = {
            "skillsMatch": min(len(skills_analysis['found_skills']) * 8, 100),
            "sectionsComplete": max(0, 100 - len(sections_analysis['missing_sections']) * 12),
            "writingQuality": writing_analysis['score'],
            "verbStrength": verb_analysis['score'],
            "formatting": formatting_analysis['score']
        }
        
        # Calculate final score
        final_score = round(sum(scores.values()) / len(scores), 1)
        
        # Job matching analysis if job description provided
        job_match_analysis = None
        if job_desc_text:
            job_match_analysis = self.analyze_job_match(cleaned_text, job_desc_text)
        
        # Generate suggestions
        suggestions = self.generate_suggestions(
            skills_analysis, sections_analysis, writing_analysis, 
            verb_analysis, formatting_analysis, job_match_analysis
        )
        
        # Compile final result
        result = {
            "finalScore": final_score,
            "scores": scores,
            "foundSkills": skills_analysis['found_skills'],
            "missingSkills": skills_analysis['recommended_skills'],
            "strongVerbs": verb_analysis['found_verbs'],
            "missingSections": sections_analysis['missing_sections'],
            "readabilityScore": writing_analysis['readability'],
            "suggestions": suggestions,
            "detailedAnalysis": {
                "skillsAnalysis": skills_analysis,
                "sectionsAnalysis": sections_analysis,
                "writingAnalysis": writing_analysis,
                "verbAnalysis": verb_analysis,
                "formattingAnalysis": formatting_analysis
            }
        }
        
        # Add job match data if available
        if job_match_analysis:
            result["jobMatchScore"] = job_match_analysis['match_score']
            result["missingKeywords"] = job_match_analysis['missing_keywords']
            result["detailedAnalysis"]["jobMatchAnalysis"] = job_match_analysis
        
        logger.info(f"Analysis completed. Final score: {final_score}")
        return result
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text for analysis"""
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text.strip())
        # Remove special characters but keep important punctuation
        text = re.sub(r'[^\w\s\-\.\,\;\:\(\)\[\]\/\@\+\#]', '', text)
        return text
    
    def analyze_skills(self, text: str) -> Dict:
        """Analyze technical skills mentioned in the resume"""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.technical_keywords:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        # Remove duplicates and sort
        found_skills = sorted(list(set(found_skills)))
        
        # Suggest additional skills based on found ones
        recommended_skills = self.suggest_related_skills(found_skills)
        
        return {
            "found_skills": found_skills,
            "recommended_skills": recommended_skills[:10],  # Top 10 recommendations
            "skill_count": len(found_skills),
            "skill_categories": self.categorize_skills(found_skills)
        }
    
    def suggest_related_skills(self, found_skills: List[str]) -> List[str]:
        """Suggest related skills based on found skills"""
        skill_relationships = {
            "Python": ["Django", "Flask", "FastAPI", "Pandas", "NumPy", "TensorFlow"],
            "JavaScript": ["React", "Node.js", "Express.js", "Vue.js", "Angular"],
            "React": ["Redux", "Next.js", "TypeScript", "Jest", "React Native"],
            "AWS": ["Docker", "Kubernetes", "Terraform", "Jenkins", "Linux"],
            "Machine Learning": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Jupyter"],
            "Docker": ["Kubernetes", "AWS", "Linux", "Jenkins", "Terraform"]
        }
        
        recommended = []
        found_lower = [skill.lower() for skill in found_skills]
        
        for skill in found_skills:
            if skill in skill_relationships:
                for related_skill in skill_relationships[skill]:
                    if related_skill.lower() not in found_lower and related_skill not in recommended:
                        recommended.append(related_skill)
        
        return recommended
    
    def categorize_skills(self, skills: List[str]) -> Dict:
        """Categorize skills into different types"""
        categories = {
            "Programming Languages": [],
            "Frameworks & Libraries": [],
            "Databases": [],
            "Cloud & DevOps": [],
            "AI/ML & Data Science": [],
            "Tools & Technologies": []
        }
        
        # This is a simplified categorization - in production, you'd want a more comprehensive mapping
        programming_langs = ["Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust"]
        frameworks = ["React", "Angular", "Vue.js", "Django", "Flask", "Spring", "Express.js"]
        databases = ["MongoDB", "PostgreSQL", "MySQL", "Redis", "DynamoDB"]
        cloud_devops = ["AWS", "Azure", "Docker", "Kubernetes", "Jenkins", "Terraform"]
        ai_ml = ["Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy"]
        
        for skill in skills:
            if skill in programming_langs:
                categories["Programming Languages"].append(skill)
            elif skill in frameworks:
                categories["Frameworks & Libraries"].append(skill)
            elif skill in databases:
                categories["Databases"].append(skill)
            elif skill in cloud_devops:
                categories["Cloud & DevOps"].append(skill)
            elif skill in ai_ml:
                categories["AI/ML & Data Science"].append(skill)
            else:
                categories["Tools & Technologies"].append(skill)
        
        return {k: v for k, v in categories.items() if v}  # Remove empty categories
    
    def analyze_sections(self, text: str) -> Dict:
        """Analyze resume sections completeness"""
        text_lower = text.lower()
        found_sections = []
        missing_sections = []
        
        for section in self.expected_sections:
            if section in text_lower:
                found_sections.append(section)
            else:
                missing_sections.append(section)
        
        return {
            "found_sections": found_sections,
            "missing_sections": missing_sections,
            "completeness_score": (len(found_sections) / len(self.expected_sections)) * 100
        }
    
    def analyze_writing_quality(self, text: str, doc) -> Dict:
        """Analyze writing quality and readability"""
        # Readability scores
        flesch_score = textstat.flesch_reading_ease(text)
        flesch_kincaid = textstat.flesch_kincaid_grade(text)
        
        # Sentence analysis
        sentences = nltk.sent_tokenize(text)
        avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / len(sentences)
        
        # Word analysis
        words = text.split()
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Calculate overall writing score
        readability_score = max(0, min(100, flesch_score))
        sentence_score = 100 if 15 <= avg_sentence_length <= 25 else max(0, 100 - abs(20 - avg_sentence_length) * 3)
        word_score = 100 if 4 <= avg_word_length <= 6 else max(0, 100 - abs(5 - avg_word_length) * 10)
        
        overall_score = round((readability_score + sentence_score + word_score) / 3)
        
        return {
            "score": overall_score,
            "readability": round(flesch_score, 1),
            "grade_level": round(flesch_kincaid, 1),
            "avg_sentence_length": round(avg_sentence_length, 1),
            "avg_word_length": round(avg_word_length, 1),
            "total_sentences": len(sentences),
            "total_words": len(words)
        }
    
    def analyze_verb_strength(self, doc) -> Dict:
        """Analyze the strength of action verbs used"""
        verbs = [token.lemma_.lower() for token in doc if token.pos_ == "VERB"]
        found_strong_verbs = [verb for verb in verbs if verb in self.strong_verbs]
        
        # Remove duplicates
        unique_strong_verbs = list(set(found_strong_verbs))
        
        # Calculate score based on variety and frequency of strong verbs
        verb_variety_score = min(len(unique_strong_verbs) * 10, 100)
        verb_frequency_score = min(len(found_strong_verbs) * 5, 100)
        overall_score = round((verb_variety_score + verb_frequency_score) / 2)
        
        return {
            "score": overall_score,
            "found_verbs": unique_strong_verbs,
            "total_strong_verbs": len(found_strong_verbs),
            "unique_strong_verbs": len(unique_strong_verbs),
            "weak_verbs_to_replace": self.find_weak_verbs(doc)
        }
    
    def find_weak_verbs(self, doc) -> List[str]:
        """Find weak verbs that should be replaced"""
        weak_verbs = ["did", "made", "got", "had", "was", "were", "worked", "helped", "used"]
        found_weak = []
        
        for token in doc:
            if token.pos_ == "VERB" and token.lemma_.lower() in weak_verbs:
                found_weak.append(token.text.lower())
        
        return list(set(found_weak))[:5]  # Return top 5 weak verbs
    
    def analyze_formatting(self, text: str) -> Dict:
        """Analyze resume formatting and structure"""
        # Count bullet points
        bullet_count = text.count("•") + text.count("- ") + text.count("* ")
        
        # Check for consistent formatting patterns
        has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
        has_phone = bool(re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text))
        has_dates = bool(re.search(r'\b\d{4}\b', text))  # Year patterns
        
        # Check for section headers (capitalized words)
        section_headers = len(re.findall(r'\b[A-Z][A-Z\s]+\b', text))
        
        # Calculate formatting score
        bullet_score = min(bullet_count * 10, 100)
        contact_score = (has_email + has_phone) * 50
        structure_score = min(section_headers * 10, 100)
        date_score = 100 if has_dates else 0
        
        overall_score = round((bullet_score + contact_score + structure_score + date_score) / 4)
        
        return {
            "score": overall_score,
            "bullet_points": bullet_count,
            "has_email": has_email,
            "has_phone": has_phone,
            "has_dates": has_dates,
            "section_headers": section_headers,
            "formatting_issues": self.identify_formatting_issues(text)
        }
    
    def identify_formatting_issues(self, text: str) -> List[str]:
        """Identify specific formatting issues"""
        issues = []
        
        if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            issues.append("Missing email address")
        
        if not re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text):
            issues.append("Missing phone number")
        
        if text.count("•") + text.count("- ") + text.count("* ") < 5:
            issues.append("Insufficient use of bullet points")
        
        if len(re.findall(r'\b[A-Z][A-Z\s]+\b', text)) < 3:
            issues.append("Unclear section headers")
        
        return issues
    
    def analyze_job_match(self, resume_text: str, job_desc_text: str) -> Dict:
        """Analyze how well the resume matches the job description"""
        # Tokenize and clean both texts
        resume_words = set(word.lower() for word in resume_text.split() if len(word) > 2)
        job_words = set(word.lower() for word in job_desc_text.split() if len(word) > 2)
        
        # Find overlapping keywords
        overlap = resume_words.intersection(job_words)
        match_score = round((len(overlap) / len(job_words)) * 100, 1)
        
        # Find missing important keywords
        job_word_freq = Counter(word.lower() for word in job_desc_text.split() if len(word) > 2)
        important_missing = []
        
        for word, freq in job_word_freq.most_common(20):
            if freq > 2 and word not in resume_words and word not in ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']:
                important_missing.append(word)
        
        return {
            "match_score": match_score,
            "overlapping_keywords": list(overlap)[:15],
            "missing_keywords": important_missing[:10],
            "total_job_keywords": len(job_words),
            "matched_keywords": len(overlap)
        }
    
    def generate_suggestions(self, skills_analysis: Dict, sections_analysis: Dict, 
                           writing_analysis: Dict, verb_analysis: Dict, 
                           formatting_analysis: Dict, job_match_analysis: Optional[Dict]) -> List[str]:
        """Generate personalized improvement suggestions"""
        suggestions = []
        
        # Skills suggestions
        if len(skills_analysis['found_skills']) < 8:
            suggestions.append(f"Add more technical skills. Consider including: {', '.join(skills_analysis['recommended_skills'][:3])}")
        
        # Sections suggestions
        if sections_analysis['missing_sections']:
            missing = ', '.join(sections_analysis['missing_sections'][:3])
            suggestions.append(f"Add missing sections to strengthen your resume: {missing}")
        
        # Writing quality suggestions
        if writing_analysis['score'] < 70:
            if writing_analysis['readability'] < 50:
                suggestions.append("Improve readability by using shorter sentences and simpler words")
            if writing_analysis['avg_sentence_length'] > 25:
                suggestions.append("Break down long sentences for better readability")
        
        # Verb strength suggestions
        if verb_analysis['score'] < 70:
            suggestions.append(f"Use stronger action verbs. Replace weak verbs like: {', '.join(verb_analysis['weak_verbs_to_replace'][:3])}")
            if len(verb_analysis['found_verbs']) < 5:
                suggestions.append("Include more diverse action verbs to showcase your achievements")
        
        # Formatting suggestions
        if formatting_analysis['score'] < 70:
            for issue in formatting_analysis['formatting_issues'][:2]:
                suggestions.append(f"Formatting improvement: {issue}")
        
        # Job match suggestions
        if job_match_analysis and job_match_analysis['match_score'] < 70:
            if job_match_analysis['missing_keywords']:
                keywords = ', '.join(job_match_analysis['missing_keywords'][:3])
                suggestions.append(f"Include job-relevant keywords: {keywords}")
        
        # General suggestions
        if len(suggestions) == 0:
            suggestions.append("Great resume! Consider adding quantified achievements to make it even stronger")
        
        return suggestions[:8]  # Return top 8 suggestions