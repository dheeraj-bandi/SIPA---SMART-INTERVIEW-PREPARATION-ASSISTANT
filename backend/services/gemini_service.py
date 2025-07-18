import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
from typing import List, Dict, Optional
import json
import time

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        """Initialize Gemini AI service"""
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        self.is_configured_flag = False
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                self.is_configured_flag = True
                logger.info("Gemini AI service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini AI: {str(e)}")
        else:
            logger.warning("Gemini API key not found in environment variables")
    
    def is_configured(self) -> bool:
        """Check if Gemini service is properly configured"""
        return self.is_configured_flag
    
    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        if not self.is_configured():
            return False
        
        try:
            # Test with a simple prompt
            response = self.model.generate_content("Test connection")
            return True
        except Exception as e:
            logger.error(f"Gemini service unavailable: {str(e)}")
            return False
    
    def rewrite_resume(self, resume_text: str, suggestions: List[str], missing_skills: List[str]) -> str:
        """Rewrite resume using Gemini AI with improvement suggestions"""
        if not self.is_configured():
            raise Exception("Gemini AI service not configured")
        
        try:
            # Create comprehensive prompt for resume rewriting
            prompt = self._create_rewrite_prompt(resume_text, suggestions, missing_skills)
            
            logger.info("Sending resume rewrite request to Gemini...")
            response = self.model.generate_content(prompt)
            
            if response.text:
                logger.info("Resume rewrite completed successfully")
                return response.text.strip()
            else:
                raise Exception("Empty response from Gemini AI")
                
        except Exception as e:
            logger.error(f"Error rewriting resume with Gemini: {str(e)}")
            raise Exception(f"Resume rewrite failed: {str(e)}")
    
    def get_targeted_suggestions(self, analysis_result: Dict, focus_area: str) -> List[str]:
        """Get targeted suggestions for specific areas of improvement"""
        if not self.is_configured():
            raise Exception("Gemini AI service not configured")
        
        try:
            prompt = self._create_suggestions_prompt(analysis_result, focus_area)
            
            logger.info(f"Getting targeted suggestions for: {focus_area}")
            response = self.model.generate_content(prompt)
            
            if response.text:
                # Parse the response to extract suggestions
                suggestions = self._parse_suggestions_response(response.text)
                logger.info(f"Generated {len(suggestions)} targeted suggestions")
                return suggestions
            else:
                raise Exception("Empty response from Gemini AI")
                
        except Exception as e:
            logger.error(f"Error getting suggestions from Gemini: {str(e)}")
            raise Exception(f"Failed to get suggestions: {str(e)}")
    
    def analyze_resume_content(self, resume_text: str) -> Dict:
        """Get detailed content analysis from Gemini"""
        if not self.is_configured():
            raise Exception("Gemini AI service not configured")
        
        try:
            prompt = self._create_analysis_prompt(resume_text)
            
            logger.info("Requesting detailed content analysis from Gemini...")
            response = self.model.generate_content(prompt)
            
            if response.text:
                # Parse structured response
                analysis = self._parse_analysis_response(response.text)
                logger.info("Content analysis completed")
                return analysis
            else:
                raise Exception("Empty response from Gemini AI")
                
        except Exception as e:
            logger.error(f"Error analyzing content with Gemini: {str(e)}")
            raise Exception(f"Content analysis failed: {str(e)}")
    
    def optimize_for_ats(self, resume_text: str, job_description: str) -> Dict:
        """Optimize resume for ATS (Applicant Tracking System)"""
        if not self.is_configured():
            raise Exception("Gemini AI service not configured")
        
        try:
            prompt = self._create_ats_optimization_prompt(resume_text, job_description)
            
            logger.info("Optimizing resume for ATS...")
            response = self.model.generate_content(prompt)
            
            if response.text:
                optimization = self._parse_ats_response(response.text)
                logger.info("ATS optimization completed")
                return optimization
            else:
                raise Exception("Empty response from Gemini AI")
                
        except Exception as e:
            logger.error(f"Error optimizing for ATS: {str(e)}")
            raise Exception(f"ATS optimization failed: {str(e)}")
    
    def _create_rewrite_prompt(self, resume_text: str, suggestions: List[str], missing_skills: List[str]) -> str:
        """Create a comprehensive prompt for resume rewriting"""
        prompt = f"""
As a professional resume writer and career coach, please rewrite the following resume to make it more professional, impactful, and ATS-friendly.

CURRENT RESUME:
{resume_text}

IMPROVEMENT AREAS IDENTIFIED:
{chr(10).join(f"• {suggestion}" for suggestion in suggestions)}

RECOMMENDED SKILLS TO CONSIDER ADDING:
{', '.join(missing_skills)}

REWRITING GUIDELINES:
1. Use strong action verbs (achieved, engineered, optimized, etc.)
2. Quantify achievements with numbers and percentages where possible
3. Improve formatting and structure for better readability
4. Enhance professional language and tone
5. Ensure ATS compatibility with proper keywords
6. Maintain truthfulness - only enhance existing content, don't fabricate
7. Use consistent formatting throughout
8. Include relevant technical skills naturally in context
9. Improve bullet points for impact and clarity
10. Ensure proper section organization

Please provide the rewritten resume with clear section headers and professional formatting.
Focus on making each bullet point more impactful while maintaining accuracy.
"""
        return prompt
    
    def _create_suggestions_prompt(self, analysis_result: Dict, focus_area: str) -> str:
        """Create prompt for targeted suggestions"""
        focus_prompts = {
            'skills': "Focus on technical skills, certifications, and competencies",
            'formatting': "Focus on resume structure, layout, and visual presentation",
            'content': "Focus on content quality, achievements, and descriptions",
            'ats': "Focus on ATS optimization and keyword usage",
            'general': "Provide comprehensive improvement suggestions"
        }
        
        focus_instruction = focus_prompts.get(focus_area, focus_prompts['general'])
        
        prompt = f"""
As a professional career coach, analyze this resume analysis data and provide specific, actionable improvement suggestions.

ANALYSIS DATA:
Final Score: {analysis_result.get('finalScore', 'N/A')}/100
Skills Found: {', '.join(analysis_result.get('foundSkills', []))}
Missing Skills: {', '.join(analysis_result.get('missingSkills', []))}
Missing Sections: {', '.join(analysis_result.get('missingSections', []))}
Current Suggestions: {', '.join(analysis_result.get('suggestions', []))}

FOCUS AREA: {focus_instruction}

Please provide 5-8 specific, actionable suggestions that will help improve this resume.
Format your response as a numbered list with clear, concise recommendations.
Each suggestion should be specific and implementable.
"""
        return prompt
    
    def _create_analysis_prompt(self, resume_text: str) -> str:
        """Create prompt for detailed content analysis"""
        prompt = f"""
As an expert resume analyst, provide a detailed analysis of this resume's content quality.

RESUME TEXT:
{resume_text}

Please analyze and provide insights on:
1. Overall content strength and professional presentation
2. Achievement quantification and impact statements
3. Industry-relevant keywords and technical skills
4. Career progression and experience narrative
5. Areas where content could be more compelling
6. Specific recommendations for content improvement

Provide your analysis in a structured format with clear sections and actionable insights.
"""
        return prompt
    
    def _create_ats_optimization_prompt(self, resume_text: str, job_description: str) -> str:
        """Create prompt for ATS optimization"""
        prompt = f"""
As an ATS (Applicant Tracking System) optimization expert, analyze this resume against the job description and provide optimization recommendations.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Please provide:
1. ATS compatibility score (1-100)
2. Key missing keywords that should be included
3. Keyword density recommendations
4. Formatting suggestions for ATS compatibility
5. Section organization improvements
6. Specific phrases to include for better matching

Format your response with clear sections and actionable recommendations.
"""
        return prompt
    
    def _parse_suggestions_response(self, response_text: str) -> List[str]:
        """Parse suggestions from Gemini response"""
        suggestions = []
        lines = response_text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            # Look for numbered or bulleted items
            if (line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.')) or 
                line.startswith(('•', '-', '*'))):
                # Remove numbering/bullets and clean up
                suggestion = line.split('.', 1)[-1].strip() if '.' in line else line[1:].strip()
                if suggestion:
                    suggestions.append(suggestion)
        
        # If no structured format found, split by sentences
        if not suggestions:
            sentences = response_text.split('.')
            suggestions = [s.strip() for s in sentences if len(s.strip()) > 20][:8]
        
        return suggestions[:8]  # Return max 8 suggestions
    
    def _parse_analysis_response(self, response_text: str) -> Dict:
        """Parse analysis response into structured data"""
        # This is a simplified parser - in production, you might want more sophisticated parsing
        return {
            "content_analysis": response_text,
            "timestamp": time.time(),
            "analysis_type": "content_quality"
        }
    
    def _parse_ats_response(self, response_text: str) -> Dict:
        """Parse ATS optimization response"""
        # Extract key information from the response
        # This is a simplified implementation
        return {
            "ats_analysis": response_text,
            "timestamp": time.time(),
            "optimization_type": "ats_compatibility"
        }
    
    def generate_cover_letter(self, resume_text: str, job_description: str, company_name: str) -> str:
        """Generate a personalized cover letter"""
        if not self.is_configured():
            raise Exception("Gemini AI service not configured")
        
        try:
            prompt = f"""
As a professional career coach, write a compelling cover letter based on this resume and job description.

RESUME SUMMARY:
{resume_text[:1000]}...

JOB DESCRIPTION:
{job_description}

COMPANY NAME: {company_name}

Please write a professional cover letter that:
1. Shows enthusiasm for the specific role and company
2. Highlights relevant experience from the resume
3. Demonstrates knowledge of the company/role requirements
4. Uses a professional yet engaging tone
5. Is concise (3-4 paragraphs)
6. Includes a strong opening and closing

Format as a complete cover letter ready to send.
"""
            
            logger.info(f"Generating cover letter for {company_name}")
            response = self.model.generate_content(prompt)
            
            if response.text:
                logger.info("Cover letter generated successfully")
                return response.text.strip()
            else:
                raise Exception("Empty response from Gemini AI")
                
        except Exception as e:
            logger.error(f"Error generating cover letter: {str(e)}")
            raise Exception(f"Cover letter generation failed: {str(e)}")