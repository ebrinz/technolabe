#!/usr/bin/env python3
"""
Logging configuration for the project
"""
import os
import sys
import logging
import nltk

def setup_logging(log_level=logging.INFO):
    """Set up logging configuration"""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Create logs directory if it doesn't exist
    os.makedirs("utils/logs", exist_ok=True)
    
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.FileHandler("utils/logs/pdf_extractor.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger("PDFExtractor")

# Function to download NLTK resources with error handling
def download_nltk_resources():
    """Download required NLTK resources"""
    logger = logging.getLogger("PDFExtractor")
    try:
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        logger.info("NLTK resources downloaded successfully")
    except Exception as e:
        logger.error(f"Error downloading NLTK resources: {e}")
        logger.error("You may need to manually download these resources")
        logger.error("Try running: python -c 'import nltk; nltk.download(\"punkt\"); nltk.download(\"stopwords\")'")