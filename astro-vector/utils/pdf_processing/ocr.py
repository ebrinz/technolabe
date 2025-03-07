#!/usr/bin/env python3
"""
OCR processing for scanned PDF documents
"""
import os
import re
import logging
import multiprocessing
import PyPDF2
from tqdm import tqdm

logger = logging.getLogger("PDFExtractor")

def process_with_ocr(pdf_path):
    """Process scanned PDF with OCR using pytesseract with enhanced settings."""
    text = ""
    try:
        import pytesseract
        from pdf2image import convert_from_path
        from PIL import Image, ImageEnhance, ImageFilter
        
        # Only process a sample of pages for very large files
        file_size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
        
        # Adjust page processing based on file size
        max_pages = 5 if file_size_mb > 50 else (15 if file_size_mb > 20 else 50)
        
        # Get total pages first to intelligently sample
        try:
            with open(pdf_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                total_pdf_pages = len(pdf_reader.pages)
        except:
            total_pdf_pages = 100  # default assumption if can't determine
        
        # For very large PDFs, sample pages throughout the document instead of just first few
        pages_to_process = []
        if total_pdf_pages > max_pages:
            # Sample pages from beginning, middle, and end
            step = total_pdf_pages // max_pages
            for i in range(0, total_pdf_pages, step):
                if len(pages_to_process) < max_pages:
                    pages_to_process.append(i + 1)  # +1 because pdf2image uses 1-indexing
        else:
            pages_to_process = list(range(1, total_pdf_pages + 1))
        
        # Convert PDF to images with optimized settings
        logger.info(f"Converting {len(pages_to_process)} pages from PDF to images for OCR")
        try:
            # Try with higher DPI for better text recognition
            images = convert_from_path(
                pdf_path, 
                dpi=300,  # Higher DPI for better quality
                fmt="jpeg",  # JPEG often works better for OCR
                thread_count=multiprocessing.cpu_count(),
                use_pdftocairo=True,  # Usually better quality
                timeout=60,
                size=(1000, None),  # Resize to reasonable width, maintain aspect ratio
                pages=pages_to_process
            )
        except Exception as e:
            logger.warning(f"Error converting with high-quality settings: {e}")
            # Fall back to more conservative settings
            try:
                images = convert_from_path(
                    pdf_path, 
                    dpi=150, 
                    thread_count=2,
                    pages=pages_to_process
                )
            except Exception as e:
                logger.warning(f"Error with fallback settings: {e}")
                # Last resort with minimal settings
                images = convert_from_path(
                    pdf_path, 
                    dpi=72, 
                    single_file=True,
                    pages=pages_to_process[:5]  # Only try first 5 pages
                )
        
        logger.info(f"Processing {len(images)} pages with OCR")
        ocr_config = '--psm 1 --oem 3'  # Automatic page segmentation with LSTM OCR engine
        
        for i, image in enumerate(tqdm(images, desc="OCR Processing", leave=False)):
            try:
                # Preprocess image for better OCR results
                processed_image = image.copy()
                
                # Convert to grayscale
                processed_image = processed_image.convert('L')
                
                # Enhance contrast
                enhancer = ImageEnhance.Contrast(processed_image)
                processed_image = enhancer.enhance(2.0)
                
                # Sharpen image
                processed_image = processed_image.filter(ImageFilter.SHARPEN)
                
                # Perform OCR with optimized settings
                page_text = pytesseract.image_to_string(
                    processed_image,
                    config=ocr_config,
                    lang='eng'  # Use English language data
                )
                
                # If minimal text was extracted, try different OCR settings
                if len(page_text.strip()) < 100:
                    # Try a different page segmentation mode
                    page_text = pytesseract.image_to_string(
                        processed_image,
                        config='--psm 3 --oem 3',  # Fully automatic page segmentation
                        lang='eng'
                    )
                
                # Add extracted text with paragraph markers
                page_text = re.sub(r'\n\s*\n', ' [PARA] ', page_text)
                text += page_text + " "
                
            except Exception as e:
                logger.error(f"Error processing OCR on page {i+1}: {e}")
                continue
            
        # Clean up text and fix common OCR issues
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Fix common OCR errors
        text = re.sub(r'([a-zA-Z]),([a-zA-Z])', r'\1, \2', text)  # Fix missing spaces after commas
        text = re.sub(r'([a-zA-Z])\.([A-Z])', r'\1. \2', text)   # Fix missing spaces after periods
        text = re.sub(r'l([^a-zA-Z\s])', r'i\1', text)           # Common l/i confusion
        
        # Log stats
        logger.info(f"Extracted {len(text)} chars with OCR")
        word_count = len(text.split())
        logger.info(f"Word count from OCR: {word_count} words")
        
        # Add a marker to indicate OCR-processed text
        text = "[OCR_PROCESSED] " + text
        
    except Exception as e:
        logger.error(f"Error with OCR processing: {e}")
    
    return text