# word2vec model for semantic exxploration and context generation

### training set includes...
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
The Project Gutenberg eBook of Studies in Occultism, by H. P. Blavatsky_.pdf
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


#### View the most common words and basic model info
```
python explore_word2vec.py --model models/astro_vec_model
```
#### Find words similar to "astrology"
```
python explore_word2vec.py --model models/astro_vec_model --word astrology --topn 15
```
#### Visualize relationships between zodiac signs
```
python explore_word2vec.py --model models/astro_vec_model --visualize aries,taurus,gemini,cancer,leo,virgo,libra,scorpio,sagittarius,capricorn,aquarius,pisces --output zodiac_signs.png
```
#### Explore specific astrological categories
```
python explore_word2vec.py --model models/astro_vec_model --categories planets,elements
```
#### Analyze relationships between word pairs
```
python explore_word2vec.py --model models/astro_vec_model --pairs word_pairs.txt
```
#### Example content for word_pairs.txt
```
mars,war
venus,love
jupiter,expansion
saturn,restriction
moon,emotions
```