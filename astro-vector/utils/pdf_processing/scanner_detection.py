#!/usr/bin/env python3
"""
Functions for detecting scanned PDF documents
"""
import os
import logging
import PyPDF2

logger = logging.getLogger("PDFExtractor")

def check_if_scanned_pdf(pdf_path):
    """Check if PDF appears to be a scanned document with improved detection heuristics."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            if total_pages == 0:
                return False
                
            # For large PDFs, sample pages from different sections
            if total_pages > 10:
                # Sample beginning, middle, and end
                pages_to_check = [0, total_pages // 4, total_pages // 2, 
                                 (3 * total_pages) // 4, total_pages - 1]
                pages_to_check = [p for p in pages_to_check if p < total_pages]
            else:
                # For smaller PDFs, check all pages up to 5
                pages_to_check = list(range(min(5, total_pages)))
            
            # Track stats to make better determination
            text_lengths = []
            has_images = False
            
            for page_num in pages_to_check:
                page = pdf_reader.pages[page_num]
                text = page.extract_text() or ""
                text_lengths.append(len(text.strip()))
                
                # Check for image objects in the page
                if "/XObject" in page:
                    xobjects = page["/XObject"]
                    if xobjects:
                        for obj in xobjects:
                            if hasattr(xobjects[obj], "get") and xobjects[obj].get("/Subtype") == "/Image":
                                has_images = True
                                break
            
            # Calculate average text per page
            avg_text_len = sum(text_lengths) / len(text_lengths) if text_lengths else 0
            
            # Heuristics to determine if it's likely a scanned document:
            # 1. Very little text on average (< 100 chars) but has images
            if avg_text_len < 100 and has_images:
                logger.debug(f"PDF likely scanned: avg text {avg_text_len:.1f} chars with images")
                return True
                
            # 2. No text at all but document has pages
            if avg_text_len < 10 and total_pages > 0:
                logger.debug(f"PDF likely scanned: almost no extractable text ({avg_text_len:.1f} chars)")
                return True
                
            # 3. Text is very uneven between pages (some have text, others don't)
            if text_lengths and max(text_lengths) > 500 and min(text_lengths) < 50:
                text_pages = sum(1 for length in text_lengths if length > 100)
                if text_pages < len(text_lengths) // 2:  # Less than half pages have substantial text
                    logger.debug(f"PDF likely partially scanned: uneven text distribution")
                    return True
                    
            # 4. Check file size vs text ratio - large files with little text are often scanned
            file_size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
            if file_size_mb > 2 and avg_text_len < 200:  # Large file but little text
                chars_per_mb = avg_text_len * total_pages / file_size_mb
                if chars_per_mb < 500:  # Very low text density
                    logger.debug(f"PDF likely scanned: low text-to-size ratio ({chars_per_mb:.1f} chars/MB)")
                    return True
                    
            return False
    except Exception as e:
        logger.debug(f"Error checking if PDF is scanned: {e}")
        return False