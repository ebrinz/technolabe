#!/usr/bin/env python3
"""
Word2Vec model training for astrological text
"""
import os
import logging
import multiprocessing
import time
from gensim.models import Word2Vec

logger = logging.getLogger("PDFExtractor")

def train_word2vec_model(sentences, model_path='models/astro_vec_model', 
                        vector_size=300, window=5, min_count=5):
    """Train a Word2Vec model on preprocessed sentences."""
    if not sentences:
        logger.warning("No sentences provided for Word2Vec training.")
        return None
    
    logger.info("Training Word2Vec model...")
    model_start_time = time.time()
    
    try:
        # Set parameters for Word2Vec
        cores = multiprocessing.cpu_count()
        logger.info(f"Using {cores} CPU cores for training")
        
        w2v_model = Word2Vec(
            sentences=sentences,
            vector_size=vector_size,  # Dimension of the word vectors
            window=window,           # Context window size
            min_count=min_count,     # Minimum word frequency
            workers=cores,           # Use multiple cores for training
            sg=1                     # Use skip-gram (1) instead of CBOW (0)
        )
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save model
        w2v_model.save(model_path)
        model_time = time.time() - model_start_time
        logger.info(f"Word2Vec model saved to {model_path} (training took {model_time:.2f} seconds)")
        
        # Print some statistics
        vocab_size = len(w2v_model.wv.index_to_key)
        logger.info(f"Vocabulary size: {vocab_size} words")
        
        # Example of finding similar words to check model quality
        if vocab_size > 0:
            try:
                sample_word = w2v_model.wv.index_to_key[0]
                similar_words = w2v_model.wv.most_similar(sample_word, topn=5)
                logger.info(f"Words most similar to '{sample_word}': {similar_words}")
                
                # Also try for a common domain-specific word if it exists in vocabulary
                for domain_word in ['astrology', 'planet', 'zodiac', 'magic', 'occult', 'leo']:
                    if domain_word in w2v_model.wv:
                        similar = w2v_model.wv.most_similar(domain_word, topn=5)
                        logger.info(f"Words most similar to '{domain_word}': {similar}")
                        break
            except Exception as e:
                logger.error(f"Couldn't show similar words: {e}")
        
        return w2v_model
        
    except Exception as e:
        logger.error(f"Error training Word2Vec model: {e}")
        return None