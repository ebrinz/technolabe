#!/usr/bin/env python3
"""
Explore the Word2Vec model by finding similar words and visualizing
the embeddings using dimensionality reduction.
"""
import os
import sys
import argparse
import logging
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
from gensim.models import Word2Vec

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("W2VExplorer")

def load_model(model_path):
    """Load the Word2Vec model from the given path."""
    try:
        logger.info(f"Loading model from {model_path}")
        model = Word2Vec.load(model_path)
        logger.info(f"Model loaded with vocabulary size: {len(model.wv.index_to_key)}")
        return model
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return None

def find_similar_words(model, word, topn=10):
    """Find and print words most similar to the given word."""
    if model is None:
        return
    
    try:
        # Check if word is in vocabulary
        if word not in model.wv:
            logger.warning(f"Word '{word}' not in vocabulary")
            # Suggest similar words that are in vocabulary
            suggestions = []
            for vocab_word in model.wv.index_to_key[:1000]:  # Check first 1000 words
                if word.lower() in vocab_word.lower() or vocab_word.lower() in word.lower():
                    suggestions.append(vocab_word)
                    if len(suggestions) >= 5:
                        break
            
            if suggestions:
                logger.info(f"Similar words in vocabulary: {', '.join(suggestions)}")
            return
        
        # Find similar words
        similar_words = model.wv.most_similar(word, topn=topn)
        
        # Print results
        print(f"Words most similar to '{word}':")
        for similar_word, similarity in similar_words:
            print(f"  {similar_word}: {similarity:.4f}")
            
        return similar_words
    
    except Exception as e:
        logger.error(f"Error finding similar words: {e}")
        return None

def visualize_words(model, words_to_visualize, output_file=None):
    """Visualize word embeddings using t-SNE."""
    if model is None:
        return
    
    try:
        # Check which words are in vocabulary
        valid_words = [word for word in words_to_visualize if word in model.wv]
        missing_words = set(words_to_visualize) - set(valid_words)
        
        if missing_words:
            logger.warning(f"Words not in vocabulary: {', '.join(missing_words)}")
        
        if not valid_words:
            logger.error("No words to visualize!")
            return
        
        # Get word vectors
        word_vectors = [model.wv[word] for word in valid_words]
        
        # Convert to numpy array
        word_vectors = np.array(word_vectors)
        
        # Use t-SNE to reduce dimensionality
        logger.info("Performing t-SNE dimensionality reduction...")
        tsne = TSNE(n_components=2, random_state=42, perplexity=min(30, max(5, len(valid_words)-1)))
        coords = tsne.fit_transform(word_vectors)
        
        # Create plot
        plt.figure(figsize=(12, 10))
        
        # Plot points
        x = coords[:, 0]
        y = coords[:, 1]
        plt.scatter(x, y, marker='o')
        
        # Add labels
        for i, word in enumerate(valid_words):
            plt.annotate(word, xy=(x[i], y[i]), xytext=(5, 2),
                        textcoords='offset points', ha='right', va='bottom',
                        fontsize=11)
        
        plt.title("Word Embeddings Visualization")
        plt.grid(True)
        
        # Save or show plot
        if output_file:
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            logger.info(f"Visualization saved to {output_file}")
        else:
            plt.show()
            
    except Exception as e:
        logger.error(f"Error visualizing words: {e}")

def explore_categories(model, categories):
    """Explore words in different astrological categories."""
    if model is None:
        return
    
    # Define category lists
    category_lists = {
        "planets": ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],
        "signs": ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"],
        "houses": ["ascendant", "midheaven", "first house", "second house", "third house", "fourth house", 
                  "fifth house", "sixth house", "seventh house", "eighth house", "ninth house", "tenth house",
                  "eleventh house", "twelfth house"],
        "aspects": ["conjunction", "opposition", "trine", "square", "sextile", "quincunx"],
        "elements": ["fire", "earth", "air", "water"],
        "modalities": ["cardinal", "fixed", "mutable"]
    }
    
    # Process each requested category
    for category in categories:
        if category not in category_lists:
            logger.warning(f"Unknown category: {category}")
            continue
            
        words = category_lists[category]
        valid_words = [word for word in words if word in model.wv]
        
        if not valid_words:
            logger.warning(f"No words from category '{category}' found in vocabulary!")
            continue
            
        print(f"\n=== {category.upper()} ===")
        
        # Find similar words for each word in the category
        for word in valid_words:
            similar = model.wv.most_similar(word, topn=3)
            similar_str = ", ".join([f"{w} ({s:.2f})" for w, s in similar])
            print(f"{word}: {similar_str}")
        
        # Optionally visualize this category
        output_file = f"visualization_{category}.png"
        visualize_words(model, valid_words, output_file)
        
def search_word_pairs(model, pairs_file):
    """Search for relationships between word pairs from a file."""
    if model is None or not pairs_file:
        return
    
    try:
        with open(pairs_file, 'r') as f:
            pairs = [line.strip().split(',') for line in f if line.strip()]
        
        print("\n=== WORD PAIRS ANALYSIS ===")
        for pair in pairs:
            if len(pair) != 2:
                continue
                
            word1, word2 = pair[0].strip(), pair[1].strip()
            
            # Check if words are in vocabulary
            if word1 not in model.wv or word2 not in model.wv:
                print(f"Pair ({word1}, {word2}): One or both words not in vocabulary")
                continue
                
            # Calculate similarity
            similarity = model.wv.similarity(word1, word2)
            print(f"Similarity between '{word1}' and '{word2}': {similarity:.4f}")
            
            # Find words related to both
            try:
                related = model.wv.most_similar(positive=[word1, word2], topn=3)
                related_str = ", ".join([f"{w} ({s:.2f})" for w, s in related])
                print(f"  Words related to both: {related_str}")
            except:
                pass
                
            # Find the difference (word2 - word1)
            try:
                diff = model.wv.most_similar(positive=[word2], negative=[word1], topn=3)
                diff_str = ", ".join([f"{w} ({s:.2f})" for w, s in diff])
                print(f"  '{word2}' not '{word1}': {diff_str}")
            except:
                pass
                
            print()
    
    except Exception as e:
        logger.error(f"Error processing word pairs: {e}")

def main():
    """Main function to explore the Word2Vec model."""
    parser = argparse.ArgumentParser(description='Explore a Word2Vec model')
    parser.add_argument('--model', type=str, default='../models/astro_vec_model', help='Path to the Word2Vec model')
    parser.add_argument('--word', type=str, help='Word to find similar words')
    parser.add_argument('--topn', type=int, default=10, help='Number of similar words to find')
    parser.add_argument('--visualize', type=str, help='Comma-separated list of words to visualize')
    parser.add_argument('--output', type=str, help='Output file for visualization (PNG)')
    parser.add_argument('--categories', type=str, help='Comma-separated list of categories to explore (planets,signs,houses,aspects,elements,modalities)')
    parser.add_argument('--pairs', type=str, help='File with word pairs to analyze (one pair per line, comma-separated)')
    
    args = parser.parse_args()
    
    # Load model
    model = load_model(args.model)
    if model is None:
        return 1
    
    # Parse actions
    actions_performed = 0
    
    # Find similar words
    if args.word:
        find_similar_words(model, args.word, args.topn)
        actions_performed += 1
    
    # Visualize words
    if args.visualize:
        words_to_visualize = [word.strip() for word in args.visualize.split(',')]
        visualize_words(model, words_to_visualize, args.output)
        actions_performed += 1
    
    # Explore categories
    if args.categories:
        categories = [cat.strip() for cat in args.categories.split(',')]
        explore_categories(model, categories)
        actions_performed += 1
    
    # Analyze word pairs
    if args.pairs:
        search_word_pairs(model, args.pairs)
        actions_performed += 1
    
    # If no actions were performed, print vocabulary stats
    if actions_performed == 0:
        vocab_size = len(model.wv.index_to_key)
        print(f"Model vocabulary size: {vocab_size} words")
        print(f"Vector size: {model.wv.vector_size}")
        
        print("\nTop 20 most frequent words:")
        for i, word in enumerate(model.wv.index_to_key[:20]):
            print(f"{i+1}. {word}")
        
        print("\nUse --word, --visualize, --categories, or --pairs to explore the model.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())