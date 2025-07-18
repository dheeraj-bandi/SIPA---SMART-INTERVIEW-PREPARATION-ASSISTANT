from flask import jsonify
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def format_response(data, message="Success", status_code=200):
    """Format successful API response"""
    response = {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }
    
    return jsonify(response), status_code

def format_error(message, status_code=400, error_code=None):
    """Format error API response"""
    response = {
        "success": False,
        "message": message,
        "error_code": error_code,
        "timestamp": datetime.now().isoformat()
    }
    
    logger.error(f"API Error {status_code}: {message}")
    return jsonify(response), status_code

def format_validation_error(errors):
    """Format validation error response"""
    response = {
        "success": False,
        "message": "Validation failed",
        "errors": errors,
        "timestamp": datetime.now().isoformat()
    }
    
    return jsonify(response), 400