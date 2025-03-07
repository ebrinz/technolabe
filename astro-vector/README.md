# Astro-Vector: Word2Vec Model for Astrological Semantic Exploration

This project builds a word2vec model trained on astrological texts to explore semantic relationships between astrological concepts. The model can be used to find similar terms, visualize relationships between concepts, and explore the semantic space of astrological terminology.

## Getting Started

### Prerequisites

This project requires Python 3.6+ and the following dependencies:
- gensim
- numpy
- matplotlib
- scikit-learn
- nltk
- tqdm

Optional dependencies for enhanced PDF processing:
- pdfplumber
- pytesseract
- pdf2image

Install dependencies using pip:
```
pip install -r requirements.txt
```

## Usage

### Text Extraction and Model Training

The `extract_and_train.py` script extracts text from PDF files and trains a Word2Vec model:

```
python extract_and_train.py --pdf_dir data/docs --raw_output data/extracted_text.txt --clean_output data/cleaned_text.txt --model_output models/astro_vec_model
```

Parameters:
- `--pdf_dir` (required): Directory containing PDF files
- `--raw_output`: File to save raw extracted text (default: data/extracted_text.txt)
- `--clean_output`: File to save cleaned text (default: data/cleaned_text.txt)
- `--model_output`: File to save Word2Vec model (default: models/astro_vec_model)
- `--debug`: Enable debug logging
- `--skip_model`: Skip Word2Vec model training (extract text only)
- `--vector_size`: Dimension of word vectors (default: 300)
- `--window`: Context window size (default: 5)
- `--min_count`: Minimum word frequency (default: 5)

The script performs the following steps:
1. Extracts text from all PDF files in the specified directory
2. Intelligently handles scanned documents with OCR when needed
3. Cleans and preprocesses the text for Word2Vec training
4. Trains a Word2Vec model on the processed text
5. Saves both raw and cleaned text files for inspection
6. Saves the trained model for later use

### Training Dataset

The model was trained on a collection of astrological texts, including both traditional astrology books and occult texts:

```
1two85kx8wu79mgk7jzy.pdf
202004132156500824Anil_Kumar_Porwa_jyotir_Western_Astrology.pdf
45674591.pdf
9780470098400-0735493.pdf
A.K. Gour_Astrology of Professions.pdf
Acarya K._Know Yourself…your signs …your destiny.pdf
An Outline of Occult Science by Rudolf Steiner.pdf
Astrology for Beginners_Anil Kumar Jain_rectification.pdf
AstrologyforBeginners.pdf
BigThree.pdf
CERN-ARCH-PMC-06-353.pdf
Cosmic Symbolism _ Project Gutenberg.pdf
Essential_Astrology_-_Amy_Herring.pdf
Human Animals by Frank Hamel--A Project Gutenberg eBook_.pdf
Intro-To-Astrology-27-03-2012.pdf
SaturninSigns.pdf
SiderealAstrologyChart.pdf
The Project Gutenberg eBook of Occult Chemistry, by Annie Besant and Charles W. Leadbeater.pdf
The Project Gutenberg eBook of Studies in Occultism, by H. P. Blavatsky_.pdf
The Project Gutenberg eBook of Thaumaturgia; Or, Elucidations of the Marvellous, by Oxonian.pdf
The Project Gutenberg eBook of The Human Aura, by Swami Panchadasi_.pdf
The Project Gutenberg eBook of The Initiates of the Flame, by Manly Palmer Hall_.pdf
The Project Gutenberg eBook of The Kybalion A Study of The Hermetic Philosophy of Ancient Egypt and Greece, by Three Initiates.pdf
The Project Gutenberg eBook of The Light of Egypt; Or, The Science of the Soul and the Stars — Volume 2, by Thomas H. Burgoyne and Belle M. Wagner.pdf
The Project Gutenberg eBook of The White Spark, by Orville Livingston Leach_.pdf
The Project Gutenberg eBook of Within the Temple of Isis, by Belle M. Wagner_.pdf
The Secrets of Black Arts _ Project Gutenberg.pdf
The Zodiac.pdf
The lesser key of Solomon _ Project Gutenberg.pdf
VedicAstrologyChart.pdf
VedicAstrologyforEveryone.pdf
elements-of-astrology.pdf
goeyardi-et-al-2021-financial-analysis-method-based-on-astrology-fibonacci-and-astronacci-to-find-a-date-of-direction.pdf
lal-ketab-astrology-book.pdf
service-gdc-gdclccn-ca-31-00-07-69-ca31000769-ca31000769.pdf
theonlyastrologybookyouwilleverneed.pdf
use-of-fixed-stars-in-astrology.pdf
vedic_astro_textbook.pdf
```


### Exploring the Word2Vec Model

Once the model is trained, you can explore it using the included tools:

#### View the most common words and basic model info
```
python notebooks/word2vec-explorer.py --model models/astro_vec_model
```

#### Find words similar to a specific term
```
python notebooks/word2vec-explorer.py --model models/astro_vec_model --word astrology --topn 15
```

#### Visualize relationships between zodiac signs
```
python notebooks/word2vec-explorer.py --model models/astro_vec_model --visualize aries,taurus,gemini,cancer,leo,virgo,libra,scorpio,sagittarius,capricorn,aquarius,pisces --output zodiac_signs.png
```

#### Explore specific astrological categories
```
python notebooks/word2vec-explorer.py --model models/astro_vec_model --categories planets,elements
```

#### Analyze relationships between word pairs
This feature allows you to explore the semantic relationships between pairs of words in the model:

```
python notebooks/word2vec-explorer.py --model models/astro_vec_model --pairs notebooks/word_pairs.txt
```

The word_pairs.txt file should contain pairs of related concepts, one pair per line:
```
mars,war
venus,love
jupiter,expansion
saturn,restriction
moon,emotions
```

## Additional Features

- **OCR Support**: The system will automatically detect scanned PDFs and use OCR to extract text
- **Intelligent Processing**: Large files are handled with special care to optimize performance
- **Enhanced Extraction**: Uses multiple strategies to extract text from difficult PDFs
- **Visualization**: Explore word relationships through 2D visualizations using t-SNE

## Project Structure

- `/data`: Contains PDF documents and extracted text
- `/models`: Stores trained Word2Vec models 
- `/notebooks`: Jupyter notebooks for exploring the model
- `/utils`: Core functionality modules
  - `/pdf_processing`: PDF text extraction utilities
  - `/text_processing`: Text cleaning and preprocessing
  - `/model`: Word2Vec training and handling