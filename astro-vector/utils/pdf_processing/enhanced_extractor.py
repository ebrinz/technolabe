#!/usr/bin/env python3
"""
Enhanced PDF extraction using pdfplumber
"""
import re
import logging
from tqdm import tqdm

logger = logging.getLogger("PDFExtractor")

def extract_with_pdfplumber(pdf_path):
    """Extract text using pdfplumber with enhanced settings."""
    text = ""
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            # Get total pages
            total_pages = len(pdf.pages)
            logger.debug(f"PDF has {total_pages} pages")
            
            # Process each page with enhanced extraction
            for page_num, page in enumerate(tqdm(pdf.pages, desc=f"pdfplumber extraction", leave=False)):
                try:
                    # Try different extraction approaches and pick the best one
                    extraction_results = []
                    
                    # 1. Standard extraction
                    standard_text = page.extract_text() or ""
                    extraction_results.append(standard_text)
                    
                    # 2. Extraction with different tolerance settings
                    try:
                        # Try looser character grouping
                        loose_text = page.extract_text(x_tolerance=3, y_tolerance=3) or ""
                        extraction_results.append(loose_text)
                        
                        # Try tighter character grouping for dense text
                        tight_text = page.extract_text(x_tolerance=1, y_tolerance=1) or ""
                        extraction_results.append(tight_text)
                    except:
                        pass
                    
                    # 3. Extract tables and convert to text
                    table_text = ""
                    try:
                        tables = page.extract_tables()
                        if tables:
                            for table in tables:
                                for row in table:
                                    table_text += " ".join([str(cell or "") for cell in row]) + " "
                        if table_text:
                            extraction_results.append(table_text)
                    except:
                        pass
                    
                    # Pick the extraction with the most text
                    if extraction_results:
                        # Sort by length and get the longest text
                        extraction_results.sort(key=lambda x: len(x.strip()), reverse=True)
                        best_text = extraction_results[0]
                        
                        # Add paragraph markers and clean up
                        best_text = re.sub(r'\n\s*\n', ' [PARA] ', best_text)
                        best_text = re.sub(r'\n', ' ', best_text)
                        
                        # Add to overall text
                        text += best_text + " [PARA] "
                        
                except Exception as e:
                    logger.error(f"Error processing page {page_num} with pdfplumber: {e}")
                    continue
        
        # Clean up text
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Fix common extraction issues
        text = re.sub(r'([a-z])- ([a-z])', r'\1\2', text)  # Fix hyphenated words
        text = re.sub(r'^\d+$', '', text, flags=re.MULTILINE)  # Remove standalone page numbers
        
        # Remove common header/footer patterns
        text = re.sub(r'\[\w+\s+\d+\]', '', text)  # Remove [Page XX] patterns
        text = re.sub(r'Page \d+ of \d+', '', text)  # Remove "Page X of Y" patterns
        
        # Log extraction stats
        word_count = len(text.split())
        logger.info(f"Extracted {len(text)} chars ({word_count} words) with enhanced pdfplumber")
        
    except Exception as e:
        logger.error(f"Error with pdfplumber extraction: {e}")
    
    return text