from fpdf import FPDF
import os
import logging
from datetime import datetime
from typing import Dict, List

logger = logging.getLogger(__name__)

class ReportGenerator:
    def __init__(self):
        """Initialize PDF report generator"""
        self.pdf = None
        
    def generate_pdf_report(self, analysis_result: Dict, output_path: str) -> bool:
        """Generate comprehensive PDF report"""
        try:
            self.pdf = FPDF()
            self.pdf.add_page()
            self.pdf.set_auto_page_break(auto=True, margin=15)
            
            # Add content sections
            self._add_header()
            self._add_executive_summary(analysis_result)
            self._add_score_breakdown(analysis_result)
            self._add_skills_analysis(analysis_result)
            self._add_recommendations(analysis_result)
            
            if analysis_result.get('jobMatchScore'):
                self._add_job_match_analysis(analysis_result)
            
            self._add_footer()
            
            # Save the PDF
            self.pdf.output(output_path)
            logger.info(f"PDF report generated successfully: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error generating PDF report: {str(e)}")
            return False

    def generate_job_match_report(self, match_result: Dict, output_path: str) -> bool:
        """Generate job match analysis PDF report"""
        try:
            self.pdf = FPDF()
            self.pdf.add_page()
            self.pdf.set_auto_page_break(auto=True, margin=15)
            
            # Add content sections
            self._add_match_header()
            self._add_match_summary(match_result)
            self._add_match_breakdown(match_result)
            self._add_skills_comparison(match_result)
            self._add_match_recommendations(match_result)
            self._add_footer()
            
            # Save the PDF
            self.pdf.output(output_path)
            logger.info(f"Job match PDF report generated successfully: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error generating job match PDF report: {str(e)}")
            return False
    
    def _add_header(self):
        """Add report header"""
        # Title
        self.pdf.set_font('Arial', 'B', 20)
        self.pdf.set_text_color(0, 51, 102)  # Dark blue
        self.pdf.cell(0, 15, 'SIPA Resume Analysis Report', 0, 1, 'C')
        
        # Subtitle
        self.pdf.set_font('Arial', '', 12)
        self.pdf.set_text_color(128, 128, 128)  # Gray
        self.pdf.cell(0, 10, f'Generated on {datetime.now().strftime("%B %d, %Y")}', 0, 1, 'C')
        self.pdf.ln(10)

    def _add_match_header(self):
        """Add job match report header"""
        # Title
        self.pdf.set_font('Arial', 'B', 20)
        self.pdf.set_text_color(0, 51, 102)  # Dark blue
        self.pdf.cell(0, 15, 'SIPA Job Match Analysis Report', 0, 1, 'C')
        
        # Subtitle
        self.pdf.set_font('Arial', '', 12)
        self.pdf.set_text_color(128, 128, 128)  # Gray
        self.pdf.cell(0, 10, f'Generated on {datetime.now().strftime("%B %d, %Y")}', 0, 1, 'C')
        self.pdf.ln(10)
    
    def _add_executive_summary(self, analysis_result: Dict):
        """Add executive summary section"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.set_text_color(0, 0, 0)
        self.pdf.cell(0, 10, 'Executive Summary', 0, 1, 'L')
        self.pdf.ln(5)
        
        # Overall score
        final_score = analysis_result.get('finalScore', 0)
        self.pdf.set_font('Arial', '', 12)
        
        # Score interpretation
        if final_score >= 80:
            interpretation = "Excellent - Your resume is well-optimized and ready for applications."
            color = (0, 128, 0)  # Green
        elif final_score >= 60:
            interpretation = "Good - Your resume has strong foundations with room for improvement."
            color = (255, 165, 0)  # Orange
        else:
            interpretation = "Needs Improvement - Focus on the recommendations below to strengthen your resume."
            color = (255, 0, 0)  # Red
        
        self.pdf.set_text_color(*color)
        self.pdf.cell(0, 8, f'Overall Score: {final_score}/100', 0, 1, 'L')
        self.pdf.set_text_color(0, 0, 0)
        self.pdf.multi_cell(0, 6, interpretation)
        self.pdf.ln(10)

    def _add_match_summary(self, match_result: Dict):
        """Add job match summary section"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.set_text_color(0, 0, 0)
        self.pdf.cell(0, 10, 'Job Match Summary', 0, 1, 'L')
        self.pdf.ln(5)
        
        # Overall match score
        overall_score = match_result.get('overall_score', 0)
        self.pdf.set_font('Arial', '', 12)
        
        # Score interpretation
        if overall_score >= 80:
            interpretation = "Excellent Match - You are a strong candidate for this position."
            color = (0, 128, 0)  # Green
        elif overall_score >= 60:
            interpretation = "Good Match - You meet most requirements with some areas to strengthen."
            color = (255, 165, 0)  # Orange
        else:
            interpretation = "Moderate Match - Consider developing missing skills for better alignment."
            color = (255, 0, 0)  # Red
        
        self.pdf.set_text_color(*color)
        self.pdf.cell(0, 8, f'Overall Match Score: {overall_score}%', 0, 1, 'L')
        self.pdf.set_text_color(0, 0, 0)
        self.pdf.multi_cell(0, 6, interpretation)
        self.pdf.ln(10)
    
    def _add_score_breakdown(self, analysis_result: Dict):
        """Add detailed score breakdown"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.cell(0, 10, 'Score Breakdown', 0, 1, 'L')
        self.pdf.ln(5)
        
        scores = analysis_result.get('scores', {})
        score_labels = {
            'skillsMatch': 'Skills Match',
            'sectionsComplete': 'Sections Complete',
            'writingQuality': 'Writing Quality',
            'verbStrength': 'Verb Strength',
            'formatting': 'Formatting'
        }
        
        self.pdf.set_font('Arial', '', 11)
        for key, score in scores.items():
            label = score_labels.get(key, key)
            
            # Score bar visualization (text-based)
            bar_length = int(score / 5)  # Scale to 20 characters max
            bar = '█' * bar_length + '░' * (20 - bar_length)
            
            self.pdf.cell(60, 8, f'{label}:', 0, 0, 'L')
            self.pdf.cell(20, 8, f'{score}/100', 0, 0, 'L')
            self.pdf.set_font('Arial', '', 8)
            self.pdf.cell(0, 8, bar, 0, 1, 'L')
            self.pdf.set_font('Arial', '', 11)
        
        self.pdf.ln(10)

    def _add_match_breakdown(self, match_result: Dict):
        """Add match score breakdown"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.cell(0, 10, 'Match Score Breakdown', 0, 1, 'L')
        self.pdf.ln(5)
        
        scores = {
            'Skills Match': match_result.get('skills_match', 0),
            'Experience Match': match_result.get('experience_match', 0),
            'Semantic Match': match_result.get('semantic_match', 0),
            'Keyword Match': match_result.get('keyword_match', 0)
        }
        
        self.pdf.set_font('Arial', '', 11)
        for label, score in scores.items():
            # Score bar visualization (text-based)
            bar_length = int(score / 5)  # Scale to 20 characters max
            bar = '█' * bar_length + '░' * (20 - bar_length)
            
            self.pdf.cell(60, 8, f'{label}:', 0, 0, 'L')
            self.pdf.cell(20, 8, f'{score:.1f}%', 0, 0, 'L')
            self.pdf.set_font('Arial', '', 8)
            self.pdf.cell(0, 8, bar, 0, 1, 'L')
            self.pdf.set_font('Arial', '', 11)
        
        self.pdf.ln(10)
    
    def _add_skills_analysis(self, analysis_result: Dict):
        """Add skills analysis section"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.cell(0, 10, 'Skills Analysis', 0, 1, 'L')
        self.pdf.ln(5)
        
        # Found skills
        found_skills = analysis_result.get('foundSkills', [])
        if found_skills:
            self.pdf.set_font('Arial', 'B', 12)
            self.pdf.set_text_color(0, 128, 0)
            self.pdf.cell(0, 8, f'Skills Found ({len(found_skills)}):', 0, 1, 'L')
            self.pdf.set_font('Arial', '', 10)
            self.pdf.set_text_color(0, 0, 0)
            
            skills_text = ', '.join(found_skills)
            self.pdf.multi_cell(0, 6, skills_text)
            self.pdf.ln(5)
        
        # Missing/Recommended skills
        missing_skills = analysis_result.get('missingSkills', [])
        if missing_skills:
            self.pdf.set_font('Arial', 'B', 12)
            self.pdf.set_text_color(255, 140, 0)
            self.pdf.cell(0, 8, f'Recommended Skills ({len(missing_skills)}):', 0, 1, 'L')
            self.pdf.set_font('Arial', '', 10)
            self.pdf.set_text_color(0, 0, 0)
            
            skills_text = ', '.join(missing_skills)
            self.pdf.multi_cell(0, 6, skills_text)
            self.pdf.ln(5)
        
        # Strong verbs
        strong_verbs = analysis_result.get('strongVerbs', [])
        if strong_verbs:
            self.pdf.set_font('Arial', 'B', 12)
            self.pdf.set_text_color(0, 0, 255)
            self.pdf.cell(0, 8, f'Strong Action Verbs Used ({len(strong_verbs)}):', 0, 1, 'L')
            self.pdf.set_font('Arial', '', 10)
            self.pdf.set_text_color(0, 0, 0)
            
            verbs_text = ', '.join(strong_verbs)
            self.pdf.multi_cell(0, 6, verbs_text)
        
        self.pdf.ln(10)

    def _add_skills_comparison(self, match_result: Dict):
        """Add skills comparison section"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.cell(0, 10, 'Skills Comparison', 0, 1, 'L')
        self.pdf.ln(5)
        
        # Matching skills
        matching_skills = match_result.get('matching_skills', [])
        if matching_skills:
            self.pdf.set_font('Arial', 'B', 12)
            self.pdf.set_text_color(0, 128, 0)
            self.pdf.cell(0, 8, f'Matching Skills ({len(matching_skills)}):', 0, 1, 'L')
            self.pdf.set_font('Arial', '', 10)
            self.pdf.set_text_color(0, 0, 0)
            
            skills_text = ', '.join(matching_skills)
            self.pdf.multi_cell(0, 6, skills_text)
            self.pdf.ln(5)
        
        # Missing skills
        missing_skills = match_result.get('missing_skills', [])
        if missing_skills:
            self.pdf.set_font('Arial', 'B', 12)
            self.pdf.set_text_color(255, 140, 0)
            self.pdf.cell(0, 8, f'Skills to Develop ({len(missing_skills)}):', 0, 1, 'L')
            self.pdf.set_font('Arial', '', 10)
            self.pdf.set_text_color(0, 0, 0)
            
            skills_text = ', '.join(missing_skills)
            self.pdf.multi_cell(0, 6, skills_text)
            self.pdf.ln(5)
        
        # Missing keywords
        missing_keywords = match_result.get('missing_keywords', [])
        if missing_keywords:
            self.pdf.set_font('Arial', 'B', 12)
            self.pdf.set_text_color(255, 0, 0)
            self.pdf.cell(0, 8, f'Important Keywords to Include ({len(missing_keywords)}):', 0, 1, 'L')
            self.pdf.set_font('Arial', '', 10)
            self.pdf.set_text_color(0, 0, 0)
            
            keywords_text = ', '.join(missing_keywords[:10])  # Limit to first 10
            self.pdf.multi_cell(0, 6, keywords_text)
        
        self.pdf.ln(10)
    
    def _add_recommendations(self, analysis_result: Dict):
        """Add recommendations section"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.cell(0, 10, 'AI Recommendations', 0, 1, 'L')
        self.pdf.ln(5)
        
        suggestions = analysis_result.get('suggestions', [])
        if suggestions:
            self.pdf.set_font('Arial', '', 11)
            for i, suggestion in enumerate(suggestions, 1):
                self.pdf.set_font('Arial', 'B', 11)
                self.pdf.cell(10, 8, f'{i}.', 0, 0, 'L')
                self.pdf.set_font('Arial', '', 11)
                
                # Handle long suggestions
                remaining_width = self.pdf.w - self.pdf.l_margin - self.pdf.r_margin - 10
                self.pdf.multi_cell(remaining_width, 6, suggestion, 0, 'L')
                self.pdf.ln(2)
        else:
            self.pdf.set_font('Arial', '', 11)
            self.pdf.multi_cell(0, 6, 'Great job! Your resume shows strong optimization across all areas.')
        
        self.pdf.ln(10)

    def _add_match_recommendations(self, match_result: Dict):
        """Add match-specific recommendations section"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.cell(0, 10, 'Improvement Recommendations', 0, 1, 'L')
        self.pdf.ln(5)
        
        recommendations = match_result.get('recommendations', [])
        if recommendations:
            self.pdf.set_font('Arial', '', 11)
            for i, recommendation in enumerate(recommendations, 1):
                self.pdf.set_font('Arial', 'B', 11)
                self.pdf.cell(10, 8, f'{i}.', 0, 0, 'L')
                self.pdf.set_font('Arial', '', 11)
                
                # Handle long recommendations
                remaining_width = self.pdf.w - self.pdf.l_margin - self.pdf.r_margin - 10
                self.pdf.multi_cell(remaining_width, 6, recommendation, 0, 'L')
                self.pdf.ln(2)
        else:
            self.pdf.set_font('Arial', '', 11)
            self.pdf.multi_cell(0, 6, 'Excellent match! You appear to be well-qualified for this position.')
        
        self.pdf.ln(10)
    
    def _add_job_match_analysis(self, analysis_result: Dict):
        """Add job match analysis section"""
        self.pdf.set_font('Arial', 'B', 16)
        self.pdf.cell(0, 10, 'Job Match Analysis', 0, 1, 'L')
        self.pdf.ln(5)
        
        job_match_score = analysis_result.get('jobMatchScore', 0)
        self.pdf.set_font('Arial', '', 12)
        self.pdf.cell(0, 8, f'Job Match Score: {job_match_score}%', 0, 1, 'L')
        self.pdf.ln(3)
        
        missing_keywords = analysis_result.get('missingKeywords', [])
        if missing_keywords:
            self.pdf.set_font('Arial', 'B', 12)
            self.pdf.cell(0, 8, 'Missing Keywords for Better Match:', 0, 1, 'L')
            self.pdf.set_font('Arial', '', 10)
            
            keywords_text = ', '.join(missing_keywords)
            self.pdf.multi_cell(0, 6, keywords_text)
        
        self.pdf.ln(10)
    
    def _add_footer(self):
        """Add report footer"""
        self.pdf.ln(20)
        self.pdf.set_font('Arial', 'I', 10)
        self.pdf.set_text_color(128, 128, 128)
        self.pdf.multi_cell(0, 6, 
            'This report was generated by SIPA (Smart Interview Preparation Assistant) using advanced AI analysis. '
            'The recommendations are based on industry best practices and current hiring trends. '
            'For best results, customize your resume for each specific job application.')
        
        # Add page number
        self.pdf.set_y(-15)
        self.pdf.set_font('Arial', 'I', 8)
        self.pdf.cell(0, 10, f'Page {self.pdf.page_no()}', 0, 0, 'C')