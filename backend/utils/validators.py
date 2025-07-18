import os
import magic
import logging
from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)

def validate_file(file: FileStorage) -> bool:
    """Validate uploaded file"""
    if not file or not file.filename:
        return False
    
    # Check file extension
    allowed_extensions = {'.pdf', '.docx', '.txt'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        logger.warning(f"Invalid file extension: {file_extension}")
        return False
    
    # Check file size (16MB limit)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer
    
    max_size = 16 * 1024 * 1024  # 16MB
    if file_size > max_size:
        logger.warning(f"File too large: {file_size} bytes")
        return False
    
    if file_size == 0:
        logger.warning("Empty file uploaded")
        return False
    
    return True

def validate_session_id(session_id: str) -> bool:
    """Validate session ID format"""
    if not session_id:
        return False
    
    # Check if it's a valid UUID format (basic check)
    import re
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    return bool(uuid_pattern.match(session_id))

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    import re
    # Remove or replace dangerous characters
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    return filename

def validate_text_content(text: str) -> bool:
    """Validate extracted text content"""
    if not text or not text.strip():
        return False
    
    # Check minimum length (should have some meaningful content)
    if len(text.strip()) < 50:
        logger.warning("Text content too short")
        return False
    
    # Check for reasonable character distribution
    alpha_chars = sum(c.isalpha() for c in text)
    if alpha_chars < len(text) * 0.3:  # At least 30% alphabetic characters
        logger.warning("Text content appears to be mostly non-alphabetic")
        return False
    
    return True