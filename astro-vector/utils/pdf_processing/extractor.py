#!/usr/bin/env python3
"""
Core PDF text extraction functionality
"""
import os
import re
import logging
import PyPDF2
from tqdm import tqdm

logger = logging.getLogger("PDFExtractor")

def is_valid_pdf(file_obj):
    """Check if a file is a valid PDF."""
    try:
        # Save current file position
        pos = file_obj.tell()
        
        # Read the first few bytes to check for PDF signature
        header = file_obj.read(5)
        
        # Reset file position
        file_obj.seek(pos)
        
        # Check if it starts with PDF signature (%PDF-)
        return header.startswith(b'%PDF-')
    except Exception:
        return False
               
def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file with improved extraction techniques."""
    text = ""
    try:
        logger.debug(f"Opening file: {pdf_path}")
        with open(pdf_path, 'rb') as file:
            # Check if file is actually a PDF
            if not is_valid_pdf(file):
                logger.warning(f"Warning: {pdf_path} does not appear to be a valid PDF file")
                return ""
                
            # Reset file position after validation check
            file.seek(0)
            
            # Try pdfplumber first if available (generally better quality)
            try:
                import pdfplumber
                logger.debug(f"Using pdfplumber for {pdf_path}")
                with pdfplumber.open(pdf_path) as pdf:
                    total_pages = len(pdf.pages)
                    
                    if total_pages == 0:
                        logger.warning(f"Warning: {pdf_path} contains no pages")
                        return ""
                    
                    # Extract text from each page
                    for page_num in tqdm(range(total_pages), 
                                       desc=f"Extracting text with pdfplumber", 
                                       leave=False):
                        try:
                            page = pdf.pages[page_num]
                            
                            # First try standard text extraction
                            page_text = page.extract_text() or ""
                            
                            # If minimal text, try with different settings
                            if len(page_text.strip()) < 100:
                                # Try with different settings (helps with some PDFs)
                                try:
                                    page_text = page.extract_text(x_tolerance=3, y_tolerance=3) or ""
                                except:
                                    pass
                                    
                                # Try extracting tables if available and minimal text
                                if len(page_text.strip()) < 100:
                                    try:
                                        tables = page.extract_tables()
                                        if tables:
                                            for table in tables:
                                                for row in table:
                                                    page_text += " " + " ".join([str(cell or "") for cell in row])
                                    except:
                                        pass
                            
                            if page_text:
                                # Clean up the page text and add paragraph markers
                                page_text = re.sub(r'\n\s*\n', ' [PARA] ', page_text)
                                page_text = re.sub(r'\n', ' ', page_text)
                                text += page_text + " "
                        except Exception as e:
                            logger.error(f"Error processing page {page_num} with pdfplumber: {e}")
                            continue
                
                # If we got text, return it
                if text.strip():
                    logger.debug(f"Successfully extracted {len(text)} chars with pdfplumber")
                    
                    # Clean up extra spaces
                    text = re.sub(r'\s+', ' ', text).strip()
                    
                    # Remove common header/footer patterns
                    text = re.sub(r'\[\w+\s+\d+\]', '', text)  # Remove [Page XX] patterns
                    text = re.sub(r'Page \d+ of \d+', '', text)  # Remove "Page X of Y" patterns
                    
                    return text
            except ImportError:
                logger.debug("pdfplumber not available, using PyPDF2")
            except Exception as e:
                logger.error(f"pdfplumber failed: {e}")
                
            # Fall back to PyPDF2 enhanced extraction
            logger.debug(f"Falling back to PyPDF2 for {pdf_path}")
            
            # Create PDF reader
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            if total_pages == 0:
                logger.warning(f"Warning: {pdf_path} contains no pages")
                return ""
            
            # Try multiple extraction methods
            for page_num in tqdm(range(total_pages), 
                                desc=f"Extracting with PyPDF2", 
                                leave=False):
                try:
                    page = pdf_reader.pages[page_num]
                    
                    # Try regular extract_text
                    page_text = page.extract_text() or ""
                    
                    # If extract_text doesn't work, try raw content streams
                    if not page_text.strip() and "/Contents" in page:
                        try:
                            content = page["/Contents"].get_data()
                            # Improved pattern for extracting text from content streams
                            text_pattern = re.compile(rb'(\(.*?\))')
                            matches = text_pattern.findall(content)
                            
                            # Better handling of content stream text
                            if matches:
                                try:
                                    content_text = b' '.join(matches).decode('utf-8', errors='replace')
                                except:
                                    content_text = b' '.join(matches).decode('latin-1', errors='replace')
                                
                                # Clean up escaped chars and common PDF markup
                                content_text = re.sub(r'\\(\d{3}|n|r|t|f|b|\\|\(|\))', ' ', content_text)
                                page_text = content_text
                        except Exception as e:
                            logger.debug(f"Error extracting content stream: {e}")
                    
                    # If still no text, try more aggressive content extraction
                    if not page_text.strip():
                        try:
                            # Try to extract all string objects from the page
                            if "/Resources" in page and "/Font" in page["/Resources"]:
                                raw_objects = str(page.get_object())
                                # Extract anything that looks like text
                                text_matches = re.findall(r'\((.*?)\)', raw_objects)
                                if text_matches:
                                    page_text = " ".join(text_matches)
                        except:
                            pass
                            
                    if page_text:
                        # Add paragraph markers and clean up
                        page_text = re.sub(r'\n\s*\n', ' [PARA] ', page_text)
                        page_text = re.sub(r'\n', ' ', page_text)
                        text += page_text + " "
                except Exception as e:
                    logger.error(f"Error processing page {page_num} in {pdf_path}: {e}")
                    continue
        
        # Clean up extra spaces and normalize text
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove common header/footer patterns
        text = re.sub(r'\[\w+\s+\d+\]', '', text)  # Remove [Page XX] patterns
        text = re.sub(r'Page \d+ of \d+', '', text)  # Remove "Page X of Y" patterns
        text = re.sub(r'^\d+$', '', text, flags=re.MULTILINE)  # Remove standalone page numbers
        
        # Fix common PDF extraction issues
        text = re.sub(r'([a-z])- ([a-z])', r'\1\2', text)  # Fix hyphenated words
        
        logger.debug(f"Extracted {len(text)} characters from {pdf_path}")
        
        # If very little text was extracted for a multi-page document, that's suspicious
        if len(text) < 1000 and total_pages > 10:
            logger.warning(f"Suspiciously little text ({len(text)} chars) from {total_pages} pages")
            
    except Exception as e:
        logger.error(f"Error processing {pdf_path}: {e}")
    
    return text