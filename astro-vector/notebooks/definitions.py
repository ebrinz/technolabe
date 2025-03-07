ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

HOUSES = [
    "House1", "House2", "House3", "House4", "House5", "House6",
    "House7", "House8", "House9", "House10", "House11", "House12"
]

PLANETS = [
    "Sun", "Moon", "Mercury", "Venus", "Mars", 
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    "Ascendent"
]

ASPECTS = [
        'Conjunction',
        'Sextile',
        'Square',
        'Trine',
        'Opposition'
]

DIGNITIES = [
        'ruler',
        'exaltation',
        'detriment',
        'fall'     
]


SIGN_KEYWORDS = {
    "Aries": ["action", "initiative", "impulsive", "leadership", "courage", "energy", "assertive", 
              "pioneering", "independent", "competitive", "passionate", "head", "cardinal", "fire", 
              "mars", "self", "direct", "first", "warrior", "spontaneous", "bold"],
    
    "Taurus": ["stability", "persistence", "practical", "patient", "reliable", "sensual", "stubborn", 
               "determined", "material", "possessive", "loyal", "neck", "fixed", "earth", "venus", 
               "steady", "secure", "resources", "possessions", "endurance", "pleasure"],
    
    "Gemini": ["communication", "adaptability", "curiosity", "versatile", "intellectual", "social", 
               "restless", "flexible", "witty", "playful", "expressive", "arms", "mutable", "air", 
               "mercury", "dual", "information", "connection", "learning", "messenger", "quick"],
    
    "Cancer": ["emotional", "nurturing", "protective", "intuitive", "sensitive", "caring", "moody", 
               "domestic", "receptive", "imaginative", "empathetic", "chest", "cardinal", "water", 
               "moon", "home", "mother", "security", "memory", "family", "private"],
    
    "Leo": ["creative", "confident", "generous", "dramatic", "proud", "loyal", "charismatic", 
            "dignified", "enthusiastic", "courageous", "warm", "heart", "fixed", "fire", "sun", 
            "spotlight", "performer", "royalty", "leadership", "vitality", "passion"],
    
    "Virgo": ["analytical", "practical", "detail", "perfectionist", "discriminating", "precise", 
              "methodical", "organized", "helpful", "modest", "critical", "abdomen", "mutable", 
              "earth", "mercury", "service", "health", "work", "routine", "improvement", "pure"],
    
    "Libra": ["balance", "harmony", "partnership", "diplomatic", "fair", "sociable", "indecisive", 
              "aesthetic", "charming", "idealistic", "cooperative", "kidneys", "cardinal", "air", 
              "venus", "relationships", "justice", "beauty", "peace", "equality", "refined"],
    
    "Scorpio": ["intense", "passionate", "secretive", "transformative", "powerful", "magnetic", 
                "controlling", "investigative", "determined", "loyal", "complex", "reproductive", 
                "fixed", "water", "pluto", "mars", "depth", "crisis", "rebirth", "desire", "mystery"],
    
    "Sagittarius": ["adventurous", "optimistic", "philosophical", "freedom", "expansive", "honest", 
                    "outspoken", "enthusiastic", "generous", "idealistic", "restless", "hips", 
                    "mutable", "fire", "jupiter", "exploration", "belief", "travel", "meaning", 
                    "truth", "growth"],
    
    "Capricorn": ["ambitious", "disciplined", "patient", "cautious", "responsible", "practical", 
                  "persevering", "traditional", "serious", "reserved", "hardworking", "knees", 
                  "cardinal", "earth", "saturn", "career", "structure", "authority", "achievement", 
                  "time", "maturity"],
    
    "Aquarius": ["innovative", "independent", "humanitarian", "inventive", "detached", "progressive", 
                 "eccentric", "rebellious", "intellectual", "unpredictable", "idealistic", "ankles", 
                 "fixed", "air", "uranus", "saturn", "future", "friendship", "society", "freedom", 
                 "revolutionary"],
    
    "Pisces": ["compassionate", "intuitive", "dreamy", "spiritual", "artistic", "empathetic", 
               "sensitive", "escapist", "imaginative", "mystical", "receptive", "feet", "mutable", 
               "water", "neptune", "jupiter", "surrender", "dissolution", "faith", "unity", 
               "transcendence"]
}


HOUSE_KEYWORDS = {
    "House1": ["self", "identity", "appearance", "personality", "beginnings", "body", "first impressions", 
               "self-awareness", "vitality", "attitude", "personal expression", "ego", "character", 
               "physical body", "birth", "new starts", "individuality", "personal projects"],
    
    "House2": ["possessions", "values", "money", "resources", "self-worth", "income", "stability", 
               "security", "talents", "material comfort", "financial affairs", "belongings", "assets", 
               "earning capacity", "personal resources", "basic needs", "financial security"],
    
    "House3": ["communication", "learning", "siblings", "neighbors", "early education", "transportation", 
               "short trips", "writing", "thinking", "immediate environment", "local community", 
               "mental activity", "curiosity", "exchange of ideas", "informal education", "daily movement"],
    
    "House4": ["home", "family", "roots", "private life", "foundation", "heritage", "security", 
               "ancestry", "domestic matters", "childhood", "emotional base", "real estate", 
               "personal sanctuary", "parentage", "living conditions", "endings", "inner life"],
    
    "House5": ["creativity", "pleasure", "children", "romance", "self-expression", "hobbies", "play", 
               "joy", "entertainment", "artistry", "love affairs", "gambling", "recreation", "performance", 
               "talent", "creative projects", "risk-taking", "fun", "fertility"],
    
    "House6": ["work", "service", "health", "routine", "duty", "skills", "daily habits", "employees", 
               "efficiency", "wellness", "practical details", "self-improvement", "organization", 
               "hygiene", "helpfulness", "pets", "adjustment", "daily responsibilities"],
    
    "House7": ["partnerships", "relationships", "marriage", "contracts", "cooperation", "other people", 
               "negotiation", "agreements", "public", "alliances", "collaboration", "diplomacy", 
               "open enemies", "projected self", "business partners", "sharing", "counseling"],
    
    "House8": ["transformation", "shared resources", "intimacy", "rebirth", "sexuality", "legacy", 
               "mysteries", "regeneration", "taxes", "debt", "investments", "psychology", "inheritance", 
               "change", "death", "other people's money", "joint finances", "power dynamics"],
    
    "House9": ["philosophy", "higher education", "travel", "spirituality", "beliefs", "expansion", 
               "foreign cultures", "religion", "law", "publishing", "world view", "wisdom", "academic study", 
               "ethics", "inspiration", "distant journeys", "teaching", "mind expansion", "truth"],
    
    "House10": ["career", "public image", "reputation", "achievements", "authority", "profession", 
                "ambition", "responsibility", "social standing", "status", "recognition", "fame", 
                "vocation", "worldly honors", "legacy", "public role", "goals", "aspirations"],
    
    "House11": ["friendships", "groups", "community", "hopes", "wishes", "social causes", "humanitarian interests", 
                "networks", "associations", "social ideals", "teams", "collective goals", "innovation", 
                "technology", "non-conformity", "like-minded others", "social reform", "future vision"],
    
    "House12": ["unconscious", "spirituality", "isolation", "secrets", "hidden things", "sacrifice", 
                "seclusion", "limitations", "service", "confinement", "cosmic connection", "transcendence", 
                "hidden enemies", "self-undoing", "compassion", "intuition", "dreams", "mysticism", "karma"]
}

PLANET_KEYWORDS = {
    "sun": ["identity", "vitality", "ego", "consciousness", "self-expression", "will", "purpose", "father", "authority", "leadership"],
    "moon": ["emotions", "instincts", "unconscious", "nurturing", "mother", "habits", "moods", "home", "security", "needs"],
    "mercury": ["communication", "intellect", "perception", "reasoning", "language", "learning", "information", "analysis", "adaptability", "exchange"],
    "venus": ["love", "beauty", "harmony", "attraction", "values", "pleasure", "art", "relationships", "aesthetics", "affection"],
    "mars": ["action", "energy", "drive", "passion", "courage", "competition", "sexuality", "aggression", "initiative", "desire"],
    "jupiter": ["expansion", "growth", "abundance", "optimism", "faith", "wisdom", "philosophy", "opportunity", "luck", "higher learning"],
    "saturn": ["structure", "discipline", "responsibility", "limitations", "authority", "time", "patience", "restriction", "maturity", "career"],
    "uranus": ["innovation", "rebellion", "change", "originality", "technology", "disruption", "freedom", "revolution", "awakening", "radical"],
    "neptune": ["dreams", "intuition", "spirituality", "imagination", "illusion", "mysticism", "compassion", "dissolution", "transcendence", "idealism"],
    "pluto": ["transformation", "power", "regeneration", "intensity", "destruction", "rebirth", "control", "depth", "evolution", "obsession"],
    "Ascendent": []
}


ASPECTS_KEYWORDS = {}

DIGNITIES_KEYWORDS = {}


ELEMENTS_KEYWORDS = {
    "fire": ["aries", "leo", "sagittarius", "passionate", "energetic", "inspired", "action", "spirit", "enthusiasm", "impulsive"],
    "earth": ["taurus", "virgo", "capricorn", "practical", "stable", "reliable", "material", "grounded", "sensual", "productive"],
    "air": ["gemini", "libra", "aquarius", "intellectual", "communicative", "social", "ideas", "objective", "rational", "theoretical"],
    "water": ["cancer", "scorpio", "pisces", "emotional", "intuitive", "sensitive", "feeling", "receptive", "empathetic", "subjective"]
}