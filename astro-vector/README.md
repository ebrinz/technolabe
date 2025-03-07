# View the most common words and basic model info
python word2vec-explorer.py astro_vec_model

# Explore words similar to "astrology"
python word2vec-explorer.py astro_vec_model --word astrology

# Test if your model captures analogies like "mars is to war as venus is to ?"
python word2vec-explorer.py astro_vec_model --analogy mars war venus

# Visualize relationships between zodiac signs
python word2vec-explorer.py astro_vec_model --visualize aries taurus gemini cancer leo virgo libra scorpio sagittarius capricorn aquarius pisces