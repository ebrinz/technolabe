from flask import Flask, request, jsonify
from flask_cors import CORS
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart
from flatlib.const import *
from flatlib.ephem import ephem
import math
from cachetools import TTLCache
from dataclasses import dataclass
from typing import Dict, List, Optional
import threading

# Define dataclasses first
@dataclass
class ChartPoint:
    longitude: float
    latitude: float
    movement: str  # Direct, Retrograde, or Stationary
    sign: str
    house: Optional[int] = None

@dataclass
class Aspect:
    planet1: str
    planet2: str
    aspect_type: str
    angle: float
    orb: float
    applying: bool

# Main chart class
class AstroChart:
    # Traditional planets only since flatlib focuses on traditional astrology
    PLANETS = [SUN, MOON, MERCURY, VENUS, MARS, JUPITER, SATURN]
    HOUSES = [HOUSE1, HOUSE2, HOUSE3, HOUSE4, HOUSE5, HOUSE6, 
              HOUSE7, HOUSE8, HOUSE9, HOUSE10, HOUSE11, HOUSE12]
    
    ASPECTS = {
        'Conjunction': {'angle': 0, 'orb': 8},
        'Sextile': {'angle': 60, 'orb': 6},
        'Square': {'angle': 90, 'orb': 8},
        'Trine': {'angle': 120, 'orb': 8},
        'Opposition': {'angle': 180, 'orb': 8}
    }

    RULERSHIPS = {
        'Aries': 'Mars',
        'Taurus': 'Venus',
        'Gemini': 'Mercury',
        'Cancer': 'Moon',
        'Leo': 'Sun',
        'Virgo': 'Mercury',
        'Libra': 'Venus',
        'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter',
        'Capricorn': 'Saturn',
        'Aquarius': 'Saturn',
        'Pisces': 'Jupiter'
    }

    EXALTATIONS = {
        'Sun': 'Aries',
        'Moon': 'Taurus',
        'Mercury': 'Virgo',
        'Venus': 'Pisces',
        'Mars': 'Capricorn',
        'Jupiter': 'Cancer',
        'Saturn': 'Libra'
    }

    DETRIMENTS = {
        'Sun': 'Aquarius',
        'Moon': 'Capricorn',
        'Mercury': ['Sagittarius', 'Pisces'],
        'Venus': ['Aries', 'Scorpio'],
        'Mars': ['Libra', 'Taurus'],
        'Jupiter': ['Gemini', 'Virgo'],
        'Saturn': ['Cancer', 'Leo']
    }

    FALLS = {
        'Sun': 'Libra',
        'Moon': 'Scorpio',
        'Mercury': 'Pisces',
        'Venus': 'Virgo',
        'Mars': 'Cancer',
        'Jupiter': 'Capricorn',
        'Saturn': 'Aries'
    }

    def __init__(self, date_str: str, time_str: str, lat: float, lon: float):
        self.datetime = Datetime(date_str, time_str)
        self.geopos = GeoPos(lat, lon)
        self.chart = Chart(self.datetime, self.geopos)
        self.essential_dignities = self._calculate_essential_dignities()

    def _calculate_essential_dignities(self) -> Dict:
        dignities = {}
        for planet in self.PLANETS:
            obj = self.chart.get(planet)
            planet_name = planet.capitalize()
            dignities[planet_name] = {
                'ruler': self._get_sign_ruler(obj.sign),
                'exaltation': self._get_exaltation(planet_name, obj.sign),
                'detriment': self._is_in_detriment(planet_name, obj.sign),
                'fall': self._is_in_fall(planet_name, obj.sign)
            }
        return dignities

    def _get_sign_ruler(self, sign: str) -> str:
        return self.RULERSHIPS.get(sign, '')

    def _get_exaltation(self, planet: str, sign: str) -> bool:
        return self.EXALTATIONS.get(planet) == sign

    def _is_in_detriment(self, planet: str, sign: str) -> bool:
        detriment_signs = self.DETRIMENTS.get(planet, [])
        if isinstance(detriment_signs, list):
            return sign in detriment_signs
        return sign == detriment_signs

    def _is_in_fall(self, planet: str, sign: str) -> bool:
        return self.FALLS.get(planet) == sign

    def get_point_data(self, point_name: str) -> ChartPoint:
        obj = self.chart.get(point_name)
        house_num = self._find_house_number(obj.lon)
        
        # Get movement status using flatlib's motion property
        if hasattr(obj, 'motion'):
            movement = obj.motion
        else:
            # Fallback for objects that don't have motion (like houses)
            movement = "Direct"
        
        return ChartPoint(
            longitude=obj.lon,
            latitude=obj.lat,
            movement=movement,
            sign=obj.sign,
            house=house_num
        )

    def _find_house_number(self, lon: float) -> int:
        houses = [(i+1, self.chart.get(house).lon) for i, house in enumerate(self.HOUSES)]
        houses.append((1, houses[0][1] + 360))  # Add wrapped first house
        
        for i in range(len(houses)-1):
            start = houses[i][1]
            end = houses[i+1][1]
            point_lon = lon if lon > start else lon + 360
            
            if start <= point_lon < end:
                return houses[i][0]
        return 1

    def get_all_points(self) -> Dict[str, ChartPoint]:
        points = {}
        for planet in self.PLANETS:
            try:
                points[planet.capitalize()] = self.get_point_data(planet)
            except Exception as e:
                print(f"Error getting data for {planet}: {str(e)}")
        return points

    def get_house_cusps(self) -> Dict[str, float]:
        return {f"House{i+1}": self.chart.get(house).lon 
                for i, house in enumerate(self.HOUSES)}

    def calculate_aspects(self, include_applying: bool = True) -> List[Aspect]:
        aspects = []
        for i, p1 in enumerate(self.PLANETS):
            for p2 in self.PLANETS[i + 1:]:
                planet1 = self.chart.get(p1)
                planet2 = self.chart.get(p2)
                
                diff = abs(planet1.lon - planet2.lon)
                if diff > 180:
                    diff = 360 - diff
                
                for aspect_name, aspect_data in self.ASPECTS.items():
                    orb = abs(diff - aspect_data['angle'])
                    if orb <= aspect_data['orb']:
                        # Default to False for applying status since we can't reliably calculate it
                        # without speed data
                        applying = False
                        
                        aspects.append(Aspect(
                            planet1=p1.capitalize(),
                            planet2=p2.capitalize(),
                            aspect_type=aspect_name,
                            angle=diff,
                            orb=orb,
                            applying=applying
                        ))
        
        return aspects

# Initialize Flask application
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3001", "http://localhost:3000"]}})

chart_cache = TTLCache(maxsize=100, ttl=30)
cache_lock = threading.Lock()

@app.route('/chart', methods=['POST'])
def get_chart():
    try:
        data = request.json
        cache_key = f"{data['date']}_{data['time']}_{data['lat']}_{data['lon']}"
        
        with cache_lock:
            if cache_key in chart_cache:
                return jsonify(chart_cache[cache_key])
        
        chart = AstroChart(
            data['date'].replace('-', '/'),
            data['time'],
            float(data['lat']),
            float(data['lon'])
        )
        
        result = {
            'points': {name: vars(point) for name, point in chart.get_all_points().items()},
            'houses': chart.get_house_cusps(),
            'aspects': [vars(aspect) for aspect in chart.calculate_aspects()],
            'essential_dignities': chart.essential_dignities
        }
        
        with cache_lock:
            chart_cache[cache_key] = result
            
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/quick-chart', methods=['POST'])
def get_quick_chart():
    try:
        data = request.json
        chart = AstroChart(
            data['date'].replace('-', '/'),
            data['time'],
            float(data['lat']),
            float(data['lon'])
        )
        
        result = {
            'houses': chart.get_house_cusps(),
            'points': {name: vars(point) for name, point in chart.get_all_points().items()}
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)