#!/usr/bin/env python3
"""
Main entry point for PDF text extraction and Word2Vec model training
"""
import os
import sys
import glob
import time
import logging
import argparse
import traceback
import multiprocessing
from tqdm import tqdm

# Import custom modules
from utils.common.logging_config import setup_logging, download_nltk_resources
from utils.pdf_processing.extractor import extract_text_from_pdf
from utils.pdf_processing.enhanced_extractor import extract_with_pdfplumber
from utils.pdf_processing.scanner_detection import check_if_scanned_pdf
from utils.pdf_processing.ocr import process_with_ocr
from utils.text_processing.preprocessor import preprocess_text
from utils.model.word2vec_trainer import train_word2vec_model

def process_directory(pdf_dir, output_file='data/extracted_text.txt', cleaned_output='data/cleaned_text.txt', 
                     word2vec_file='models/astro_vec_model', vector_size=300, window=5, min_count=5, skip_model=False):
    """Process all PDFs in a directory and train a Word2Vec model."""
    logger = logging.getLogger("PDFExtractor")
    start_time = time.time()
    logger.info(f"Starting processing of directory: {pdf_dir}")
    
    # Get all PDF files
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    
    if not pdf_files:
        logger.warning(f"No PDF files found in {pdf_dir}")
        return
    
    # Sort PDFs by file size for more efficient processing (smaller files first)
    pdf_files_with_size = []
    for pdf_file in pdf_files:
        try:
            size = os.path.getsize(pdf_file)
            pdf_files_with_size.append((pdf_file, size))
        except:
            pdf_files_with_size.append((pdf_file, 0))
    
    # Sort by size (smallest first)
    pdf_files_with_size.sort(key=lambda x: x[1])
    pdf_files = [file for file, _ in pdf_files_with_size]
    
    logger.info(f"Found {len(pdf_files)} PDF files. Processing (sorted by size)...")
    
    # Check for optional extraction libraries
    has_pdfplumber = False
    has_ocr = False
    
    try:
        import pdfplumber
        has_pdfplumber = True
        logger.info("pdfplumber available for enhanced text extraction")
    except ImportError:
        logger.warning("pdfplumber not available. Install with: pip install pdfplumber")
    
    try:
        import pytesseract
        from pdf2image import convert_from_path
        has_ocr = True
        logger.info("OCR capabilities available for scanned documents")
    except ImportError:
        logger.warning("OCR not available. Install with: pip install pytesseract pdf2image")
    
    # Create output directories if they don't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    os.makedirs(os.path.dirname(cleaned_output), exist_ok=True)
    
    # Process all files
    all_sentences = []
    processed_files = 0
    skipped_files = 0
    ocr_processed = 0
    fallback_processed = 0
    
    # Save both raw and cleaned text for inspection
    with open(output_file, 'w', encoding='utf-8') as out_file, \
         open(cleaned_output, 'w', encoding='utf-8') as clean_file:
        
        for pdf_file in tqdm(pdf_files, desc="Processing PDF files"):
            logger.info(f"Processing {pdf_file}...")
            filename = os.path.basename(pdf_file)
            file_start_time = time.time()
            
            try:
                # Get file size
                file_size_mb = os.path.getsize(pdf_file) / (1024 * 1024)
                logger.debug(f"File size: {file_size_mb:.2f} MB")
                
                # Extract text with different strategies based on file size and type
                text = ""
                
                # For very large files, sample pages to check if OCR needed
                if file_size_mb > 20:
                    logger.info(f"Large file detected ({file_size_mb:.1f}MB): {filename}")
                    
                    # Try regular extraction first
                    text = extract_text_from_pdf(pdf_file)
                    
                    # If minimal text extracted, check if OCR is needed
                    if len(text.strip()) < 1000 and has_ocr:
                        is_scanned = check_if_scanned_pdf(pdf_file)
                        if is_scanned:
                            logger.info(f"Large scanned document detected, using OCR for {filename}")
                            text = process_with_ocr(pdf_file)
                            ocr_processed += 1
                else:
                    # Standard extraction for normal files
                    text = extract_text_from_pdf(pdf_file)
                
                # If primary extraction failed, try fallbacks
                if not text and has_pdfplumber:
                    logger.info(f"Primary extraction failed, trying pdfplumber for {filename}")
                    text = extract_with_pdfplumber(pdf_file)
                    fallback_processed += 1
                
                # If still no text and has OCR, try OCR as last resort
                if (not text or len(text.strip()) < 500) and has_ocr:
                    is_scanned = check_if_scanned_pdf(pdf_file)
                    if is_scanned:
                        logger.info(f"Potential scanned document detected, using OCR for {filename}")
                        text = process_with_ocr(pdf_file)
                        ocr_processed += 1
                    # Even if not detected as scanned, try OCR if almost no text was extracted
                    elif len(text.strip()) < 100:
                        logger.info(f"Minimal text extracted, trying OCR as last resort for {filename}")
                        ocr_text = process_with_ocr(pdf_file)
                        # Only use OCR text if it's better than what we had
                        if len(ocr_text.strip()) > len(text.strip()) * 2:  # At least twice as much text
                            text = ocr_text
                            ocr_processed += 1
                            logger.info(f"OCR extraction successful, got {len(text.strip())} chars")
                        else:
                            logger.info(f"OCR didn't improve extraction quality, keeping original text")
                
                if not text:
                    logger.warning(f"No text extracted from {filename}, skipping")
                    skipped_files += 1
                    continue
                
                # Save raw text for inspection
                out_file.write(f"\n\n=== {filename} ===\n\n")
                out_file.write(text)
                
                # Preprocess for Word2Vec
                logger.debug(f"Preprocessing text from {filename}")
                sentences = preprocess_text(text)
                num_sentences = len(sentences)
                all_sentences.extend(sentences)
                
                # Save cleaned text (what will actually be used for Word2Vec)
                clean_file.write(f"\n\n=== {filename} ===\n\n")
                for sentence in sentences:
                    clean_file.write(' '.join(sentence) + '\n')
                
                processed_files += 1
                file_time = time.time() - file_start_time
                logger.info(f"Processed {filename}: {num_sentences} sentences in {file_time:.2f} seconds")
                
            except Exception as e:
                logger.error(f"Error fully processing {filename}: {e}")
                logger.debug(f"Exception details:", exc_info=True)
                skipped_files += 1
                continue
    
    logger.info(f"Raw extracted text saved to {output_file}")
    logger.info(f"Cleaned text for Word2Vec saved to {cleaned_output}")
    
    processing_time = time.time() - start_time
    logger.info(f"Processing complete in {processing_time:.2f} seconds")
    logger.info(f"Successfully processed {processed_files} files ({ocr_processed} with OCR, {fallback_processed} with fallback)")
    logger.info(f"Skipped {skipped_files} files")
    logger.info(f"Found {len(all_sentences)} sentences for Word2Vec training")
    
    # Train Word2Vec model
    if all_sentences and not skip_model:
        model = train_word2vec_model(
            sentences=all_sentences,
            model_path=word2vec_file,
            vector_size=vector_size,
            window=window,
            min_count=min_count
        )
    elif skip_model:
        logger.info("Skipping Word2Vec model training as requested")
    else:
        logger.warning("No sentences extracted for Word2Vec training.")
        
    total_time = time.time() - start_time
    logger.info(f"Total processing time: {total_time:.2f} seconds")
    
    return {
        "processed_files": processed_files,
        "skipped_files": skipped_files,
        "ocr_processed": ocr_processed,
        "fallback_processed": fallback_processed,
        "total_sentences": len(all_sentences),
        "processing_time": processing_time,
        "total_time": total_time
    }

def main():
    """Main entry point for the script."""
    # Set up logging
    logger = setup_logging()
    
    # Download NLTK resources
    download_nltk_resources()
    
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(description='Extract text from PDFs and build a Word2Vec model')
    parser.add_argument('--pdf_dir', type=str, required=True, help='Directory containing PDF files')
    parser.add_argument('--raw_output', type=str, default='data/extracted_text.txt', help='File to save raw extracted text')
    parser.add_argument('--clean_output', type=str, default='data/cleaned_text.txt', help='File to save cleaned text')
    parser.add_argument('--model_output', type=str, default='models/astro_vec_model', help='File to save Word2Vec model')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    parser.add_argument('--skip_model', action='store_true', help='Skip Word2Vec model training')
    parser.add_argument('--vector_size', type=int, default=300, help='Dimension of word vectors (default: 300)')
    parser.add_argument('--window', type=int, default=5, help='Context window size (default: 5)')
    parser.add_argument('--min_count', type=int, default=5, help='Minimum word frequency (default: 5)')
    
    args = parser.parse_args()
    
    # Set logging level based on debug flag
    if args.debug:
        setup_logging(logging.DEBUG)
        logger.setLevel(logging.DEBUG)
        logger.debug("Debug logging enabled")
    
    # Print start time
    start_time = time.time()
    logger.info(f"Starting PDF text extraction at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Display configuration
    logger.info(f"Configuration:")
    logger.info(f"  PDF Directory: {args.pdf_dir}")
    logger.info(f"  Raw Output: {args.raw_output}")
    logger.info(f"  Cleaned Output: {args.clean_output}")
    logger.info(f"  Model Output: {args.model_output if not args.skip_model else 'Skipped'}")
    if not args.skip_model:
        logger.info(f"  Vector Size: {args.vector_size}")
        logger.info(f"  Window Size: {args.window}")
        logger.info(f"  Min Word Count: {args.min_count}")
    
    # Process the directory
    try:
        results = process_directory(
            args.pdf_dir, 
            output_file=args.raw_output, 
            cleaned_output=args.clean_output, 
            word2vec_file=args.model_output,
            vector_size=args.vector_size,
            window=args.window,
            min_count=args.min_count,
            skip_model=args.skip_model
        )
        
        # Print completion time and duration
        end_time = time.time()
        total_duration = end_time - start_time
        logger.info(f"Process completed at {time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Total execution time: {total_duration:.2f} seconds ({total_duration/60:.2f} minutes)")
        return 0
        
    except KeyboardInterrupt:
        logger.warning("Process interrupted by user")
        return 130
    except Exception as e:
        logger.error(f"An error occurred during processing: {e}")
        # Print detailed traceback for debugging
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())