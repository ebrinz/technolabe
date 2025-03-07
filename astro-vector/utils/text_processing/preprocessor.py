#!/usr/bin/env python3
"""
Text preprocessing functionality for Word2Vec
"""
import re
import logging
from tqdm import tqdm
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from utils.text_processing.term_expansion import expand_astrological_terms, get_astro_terms

logger = logging.getLogger("PDFExtractor")

def preprocess_text(text):
    """Preprocess text for Word2Vec with full word preservation."""
    # Check if text was OCR processed
    is_ocr = False
    if text.startswith("[OCR_PROCESSED]"):
        is_ocr = True
        text = text.replace("[OCR_PROCESSED]", "", 1).strip()
    
    # Expand abbreviations to full words
    text = expand_astrological_terms(text)
    
    # Split by paragraphs
    paragraphs = text.split('[PARA]')
    logger.debug(f"Split text into {len(paragraphs)} paragraphs")
    
    # Pre-cleaning of common issues
    clean_paragraphs = []
    for paragraph in paragraphs:
        if not paragraph.strip():
            continue
            
        # Clean up common PDF extraction artifacts
        # Fix hyphenated words that got split across lines
        paragraph = re.sub(r'(\w+)-\s+(\w+)', r'\1\2', paragraph)
        
        # Fix spacing issues
        paragraph = re.sub(r'(\w)\.(\w)', r'\1. \2', paragraph)
        
        # Clean up common OCR errors if text was OCR-processed
        if is_ocr:
            # Fix common OCR misrecognitions
            paragraph = re.sub(r'([0-9])([a-zA-Z])', r'\1 \2', paragraph)  # Fix stuck numbers and letters
            paragraph = re.sub(r'([a-zA-Z])([0-9])', r'\1 \2', paragraph)  # Fix stuck letters and numbers
            
        clean_paragraphs.append(paragraph)
    
    # Process each paragraph into sentences
    all_sentences = []
    skipped_toc = 0
    skipped_refs = 0
    
    for paragraph in clean_paragraphs:
        # Skip TOC patterns: lines with dots or repeated spaces and numbers
        if re.search(r'\.{3,}|\s{3,}\d+$', paragraph) or re.search(r'^\s*\d+\.[\s\.]', paragraph):
            skipped_toc += 1
            continue
            
        # Skip reference/bibliography patterns
        if re.match(r'^references|^bibliography|^works cited|^footnotes', paragraph.lower()):
            skipped_refs += 1
            continue
            
        # Better sentence tokenization for astrological texts
        try:
            # Handle special cases where periods might not end sentences
            # (common in astrological texts with abbreviations)
            paragraph = re.sub(r'(\b[A-Z][a-z]{1,2})\. ', r'\1_DOT_ ', paragraph)  # Preserve abbreviations
            
            sentences = sent_tokenize(paragraph.strip())
            
            # Restore abbreviation periods
            cleaned_sentences = [s.replace('_DOT_', '.') for s in sentences]
            all_sentences.extend(cleaned_sentences)
        except Exception as e:
            # If sentence tokenization fails, split by periods as fallback
            logger.debug(f"Sentence tokenization failed, using fallback: {e}")
            rough_sentences = paragraph.strip().split('. ')
            all_sentences.extend([s + '.' for s in rough_sentences if s])
    
    logger.debug(f"Skipped {skipped_toc} TOC-like paragraphs and {skipped_refs} reference sections")
    logger.debug(f"Extracted {len(all_sentences)} sentences from paragraphs")
    
    # Get astrological terms to preserve as full words
    all_astro_terms, multi_word_terms = get_astro_terms()
    
    # Also preserve numerical references common in astrology
    preserve_patterns = [
        r'\d+°', r'\d+\s*degrees?',  # Degrees
        r'\d+♈', r'\d+♉', r'\d+♊', r'\d+♋', r'\d+♌', r'\d+♍', 
        r'\d+♎', r'\d+♏', r'\d+♐', r'\d+♑', r'\d+♒', r'\d+♓',  # Sign positions
        r'\d+\s*[a-zA-Z]+\s*house'  # House positions
    ]
    
    # Load stopwords but preserve domain terms
    stop_words = set(stopwords.words('english')) - all_astro_terms
    
    # Tokenize sentences into words
    tokenized_sentences = []
    skipped_copyright = 0
    skipped_short = 0
    skipped_few_words = 0
    
    for sentence in tqdm(all_sentences, desc="Processing sentences", leave=False):
        # Skip copyright notices and URLs
        if re.search(r'copyright|©|\bwww\.|\bhttp', sentence.lower()):
            skipped_copyright += 1
            continue
            
        # Skip sentences that are too short (likely headers or partial content)
        # But be more lenient with OCR text which might have lost some words
        min_words = 3 if is_ocr else 4
        if len(sentence.split()) < min_words:
            skipped_short += 1
            continue
            
        # Skip very long sentences which are likely parsing errors
        if len(sentence.split()) > 100:
            continue
            
        # Pre-process to handle multi-word astrological terms
        clean_sentence = sentence.lower()
        
        # Preserve multi-word terms by joining them with underscores
        for term in multi_word_terms:
            if term in clean_sentence:
                pattern = r'\b' + re.escape(term) + r'\b'
                replacement = term.replace(' ', '_')
                clean_sentence = re.sub(pattern, replacement, clean_sentence)
        
        # Basic cleaning but preserve apostrophes for terms like "planet's"
        clean_sentence = re.sub(r'[^\w\s\'_]', ' ', clean_sentence)
        
        # Normalize whitespace
        clean_sentence = re.sub(r'\s+', ' ', clean_sentence).strip()
        
        # Tokenize
        words = word_tokenize(clean_sentence)
        
        # Further process tokens with domain knowledge
        processed_words = []
        for word in words:
            word = word.lower()
            
            # Restore multi-word terms
            if '_' in word and word.replace('_', ' ') in multi_word_terms:
                word = word.replace('_', ' ')
            
            # Keep domain-specific terms regardless of length
            if word in all_astro_terms:
                processed_words.append(word)
            # Check for numerical patterns to preserve
            elif any(re.match(pattern, word) for pattern in preserve_patterns):
                processed_words.append(word)
            # Otherwise apply normal filtering
            elif word not in stop_words and len(word) > 2:
                processed_words.append(word)
        
        # Skip sentences with too few meaningful words
        min_meaningful = 2 if is_ocr else 3  # Be more lenient with OCR text
        if len(processed_words) >= min_meaningful:
            tokenized_sentences.append(processed_words)
        else:
            skipped_few_words += 1
    
    logger.debug(f"Skipped {skipped_copyright} copyright notices/URLs")
    logger.debug(f"Skipped {skipped_short} short sentences")
    logger.debug(f"Skipped {skipped_few_words} sentences with too few meaningful words")
    logger.debug(f"Retained {len(tokenized_sentences)} cleaned sentences for Word2Vec")
    
    return tokenized_sentences