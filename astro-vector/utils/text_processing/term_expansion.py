#!/usr/bin/env python3
"""
Astrological term expansion and management for text processing
"""
import re

def expand_astrological_terms(text):
    """Expand common astrological abbreviations to their full forms."""
    # Mapping of abbreviated forms to full words
    abbrev_map = {
        r'\bari\b': 'aries',
        r'\btau\b': 'taurus',
        r'\bgem\b': 'gemini',
        r'\bcan\b': 'cancer',
        r'\bleo\b': 'leo',
        r'\bvir\b': 'virgo',
        r'\blib\b': 'libra',
        r'\bsco\b': 'scorpio',
        r'\bsag\b': 'sagittarius',
        r'\bcap\b': 'capricorn',
        r'\baqu\b': 'aquarius',
        r'\bpis\b': 'pisces',
        
        # Planets and celestial bodies
        r'\bsun\b': 'sun',
        r'\bmoo\b': 'moon',
        r'\bmer\b': 'mercury',
        r'\bven\b': 'venus',
        r'\bmar\b': 'mars',
        r'\bjup\b': 'jupiter',
        r'\bsat\b': 'saturn',
        r'\bura\b': 'uranus',
        r'\bnep\b': 'neptune',
        r'\bplu\b': 'pluto',
        
        # Aspects
        r'\bconj\b': 'conjunction',
        r'\bopp\b': 'opposition',
        r'\bsqu\b': 'square',
        r'\btri\b': 'trine',
        r'\bsex\b': 'sextile',
        r'\bqui\b': 'quincunx',
        
        # Other terms
        r'\basc\b': 'ascendant',
        r'\bdes\b': 'descendant',
        r'\bmc\b': 'midheaven',
        r'\bic\b': 'imum coeli',
        r'\bret\b': 'retrograde',
        r'\bprog\b': 'progression',
        r'\btran\b': 'transit',
        r'\bnat\b': 'natal',
        r'\bsyn\b': 'synastry',
        r'\bhoro\b': 'horoscope',
        r'\bast\b': 'astrology'
    }
    
    # Apply all replacements
    for pattern, replacement in abbrev_map.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    return text

# Lists of astrological terms to preserve during text processing
def get_astro_terms():
    """Return comprehensive set of astrological terms to preserve in tokenization."""
    # Zodiac signs (full names)
    zodiac_signs = {
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    }
    
    # Planets and celestial bodies (full names)
    celestial_bodies = {
        'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 
        'uranus', 'neptune', 'pluto', 'chiron', 'ceres', 'pallas', 'juno', 'vesta',
        'north node', 'south node', 'true node', 'mean node', 'lilith', 'fortuna'
    }
    
    # Chart points
    chart_points = {
        'ascendant', 'midheaven', 'descendant', 'imum coeli', 'vertex', 'part of fortune'
    }
    
    # Aspects (full names)
    aspects = {
        'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx', 
        'semisextile', 'semisquare', 'sesquiquadrate', 'quintile', 'biquintile'
    }
    
    # Houses
    houses = {
        'first house', 'second house', 'third house', 'fourth house', 'fifth house', 
        'sixth house', 'seventh house', 'eighth house', 'ninth house', 'tenth house', 
        'eleventh house', 'twelfth house'
    }
    
    # General astrological terms
    general_terms = {
        'natal', 'transit', 'progression', 'direction', 'return', 'synastry', 'composite',
        'retrograde', 'direct', 'stationary', 'combust', 'cazimi', 'void of course',
        'detriment', 'fall', 'exaltation', 'rulership', 'domicile', 'peregrine',
        'horoscope', 'chart', 'ephemeris', 'zodiac', 'ecliptic', 'equinox', 'solstice'
    }
    
    # Elements and modalities
    qualities = {
        'fire', 'earth', 'air', 'water', 'cardinal', 'fixed', 'mutable'
    }
    
    # Vedic/Jyotish terms
    vedic_terms = {
        'nakshatra', 'rashi', 'dasha', 'bhava', 'graha', 'yoga', 'karana'
    }
    
    # Astrological traditions
    traditions = {
        'astrology', 'tropical', 'sidereal', 'heliocentric', 'geocentric',
        'vedic', 'jyotish', 'hellenistic', 'medieval', 'horary', 'electional'
    }
    
    # Multi-word phrases
    multi_word_terms = {
        'new moon', 'full moon', 'first quarter', 'last quarter', 'waxing crescent',
        'waning crescent', 'waxing gibbous', 'waning gibbous', 'solar eclipse',
        'lunar eclipse', 'solar return', 'lunar return', 'venus return',
        'mercury retrograde', 'venus retrograde', 'mars retrograde',
        'jupiter retrograde', 'saturn retrograde'
    }
    
    # Combine all term sets
    all_terms = set()
    all_terms.update(zodiac_signs)
    all_terms.update(celestial_bodies)
    all_terms.update(chart_points)
    all_terms.update(aspects)
    all_terms.update(houses)
    all_terms.update(general_terms)
    all_terms.update(qualities)
    all_terms.update(vedic_terms)
    all_terms.update(traditions)
    all_terms.update(multi_word_terms)
    
    return all_terms, multi_word_terms