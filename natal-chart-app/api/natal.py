from flask import Flask, request, jsonify
from flask_cors import CORS
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart
from flatlib.const import *
from flatlib.ephem import ephem
# from flatlib.tools import getSign
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
    # Traditional planets that are directly supported by flatlib
    TRADITIONAL_PLANETS = [SUN, MOON, MERCURY, VENUS, MARS, JUPITER, SATURN]
    # Modern planets that we'll try to get from ephem
    MODERN_PLANETS = [URANUS, NEPTUNE, PLUTO, CHIRON]
    
    HOUSES = [HOUSE1, HOUSE2, HOUSE3, HOUSE4, HOUSE5, HOUSE6, 
              HOUSE7, HOUSE8, HOUSE9, HOUSE10, HOUSE11, HOUSE12]
    
    ASPECTS = {
        'Conjunction': {'angle': 0, 'orb': 8},
        'Sextile': {'angle': 60, 'orb': 6},
        'Square': {'angle': 90, 'orb': 8},
        'Trine': {'angle': 120, 'orb': 8},
        'Opposition': {'angle': 180, 'orb': 8}
    }

    # Rest of your constants remain the same...

    def __init__(self, date_str: str, time_str: str, lat: float, lon: float):
        self.datetime = Datetime(date_str, time_str)
        self.geopos = GeoPos(lat, lon)
        self.chart = Chart(self.datetime, self.geopos)
        
        # Determine which planets are actually available
        self.available_planets = self._get_available_planets()
        self.essential_dignities = self._calculate_essential_dignities()

    def _get_available_planets(self):
        """Determine which planets are available in this flatlib installation"""
        available = []
        
        # Traditional planets are always available through the Chart object
        for planet in self.TRADITIONAL_PLANETS:
            available.append(planet)
            
        # Test which modern planets are available through ephem
        for planet in self.MODERN_PLANETS:
            try:
                # Just test if we can get the position
                pos = ephem.getPosition(self.datetime, self.geopos, planet)
                if pos:
                    available.append(planet)
            except Exception as e:
                print(f"Planet {planet} not supported: {e}")
                
        return available

    def _calculate_essential_dignities(self) -> Dict:
        dignities = {}
        for planet in self.TRADITIONAL_PLANETS:
            try:
                obj = self.chart.get(planet)
                planet_name = planet.capitalize()
                dignities[planet_name] = {
                    'ruler': self._get_sign_ruler(obj.sign),
                    'exaltation': self._get_exaltation(planet_name, obj.sign),
                    'detriment': self._is_in_detriment(planet_name, obj.sign),
                    'fall': self._is_in_fall(planet_name, obj.sign)
                }
            except Exception as e:
                print(f"Cannot calculate dignities for {planet}: {e}")
        return dignities

    def _get_sign_ruler(self, sign: str) -> str:
        """Get the planetary ruler of a sign"""
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
        return RULERSHIPS.get(sign, '')

    def _get_exaltation(self, planet: str, sign: str) -> bool:
        """Check if a planet is exalted in a sign"""
        EXALTATIONS = {
            'Sun': 'Aries',
            'Moon': 'Taurus',
            'Mercury': 'Virgo',
            'Venus': 'Pisces',
            'Mars': 'Capricorn',
            'Jupiter': 'Cancer',
            'Saturn': 'Libra'
        }
        return EXALTATIONS.get(planet) == sign

    def _is_in_detriment(self, planet: str, sign: str) -> bool:
        """Check if a planet is in detriment in a sign"""
        DETRIMENTS = {
            'Sun': 'Aquarius',
            'Moon': 'Capricorn',
            'Mercury': ['Sagittarius', 'Pisces'],
            'Venus': ['Aries', 'Scorpio'],
            'Mars': ['Libra', 'Taurus'],
            'Jupiter': ['Gemini', 'Virgo'],
            'Saturn': ['Cancer', 'Leo']
        }
        detriment_signs = DETRIMENTS.get(planet, [])
        if isinstance(detriment_signs, list):
            return sign in detriment_signs
        return sign == detriment_signs

    def _is_in_fall(self, planet: str, sign: str) -> bool:
        """Check if a planet is in fall in a sign"""
        FALLS = {
            'Sun': 'Libra',
            'Moon': 'Scorpio',
            'Mercury': 'Pisces',
            'Venus': 'Virgo',
            'Mars': 'Cancer',
            'Jupiter': 'Capricorn',
            'Saturn': 'Aries'
        }
        return FALLS.get(planet) == sign

    def get_point_data(self, point_name: str) -> ChartPoint:
        if point_name in self.MODERN_PLANETS:
            # For modern planets, get directly from ephem
            try:
                pos = ephem.getPosition(self.datetime, self.geopos, point_name)
                lon = pos.lon
                lat = pos.lat
                
                # Calculate sign manually
                sign_index = int(lon / 30) % 12
                sign_names = ['Aries', 'Taurus', 'Gemini', 'Cancer', 
                            'Leo', 'Virgo', 'Libra', 'Scorpio',
                            'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                sign = sign_names[sign_index]
                
                movement = "Direct"  # Default for modern planets
            except Exception as e:
                print(f"Error processing modern planet {point_name}: {e}")
                # Return placeholder data if can't get the actual position
                lon = 0
                lat = 0
                sign = "Unknown"
                movement = "Unknown"
        else:
            obj = self.chart.get(point_name)
            lon = obj.lon
            lat = obj.lat
            sign = obj.sign
            movement = obj.motion if hasattr(obj, 'motion') else "Direct"
        house_num = self._find_house_number(lon)
        return ChartPoint(
            longitude=lon,
            latitude=lat,
            movement=movement,
            sign=sign,
            house=house_num
        )


    def get_all_points(self) -> Dict[str, ChartPoint]:
        points = {}
        for planet in self.TRADITIONAL_PLANETS:
            if planet in self.available_planets:
                try:
                    points[planet.capitalize()] = self.get_point_data(planet)
                except Exception as e:
                    print(f"Error getting data for {planet}: {str(e)}")
        for planet in self.MODERN_PLANETS:
            if planet in self.available_planets:
                try:
                    if isinstance(planet, str):
                        points[planet] = self.get_point_data(planet)
                    else:
                        points[planet.capitalize()] = self.get_point_data(planet)
                except Exception as e:
                    print(f"Error getting data for {planet}: {str(e)}")
        missing_planets = self.get_missing_modern_planets()
        points.update(missing_planets)
        return points

    def calculate_aspects(self, include_applying: bool = True) -> List[Aspect]:
        aspects = []
        planet_positions = []
        
        # Get positions for all available planets (traditional + modern)
        for planet in self.available_planets:
            try:
                if planet in self.TRADITIONAL_PLANETS:
                    obj = self.chart.get(planet)
                    planet_positions.append((planet.capitalize(), obj.lon))
                else:
                    pos = ephem.getPosition(self.datetime, self.geopos, planet)
                    if isinstance(planet, str):
                        planet_positions.append((planet, pos.lon))
                    else:
                        planet_positions.append((planet.capitalize(), pos.lon))
            except Exception as e:
                print(f"Could not get planet {planet}: {e}")
        
        # Add missing modern planets
        missing_planets = self.get_missing_modern_planets()
        for name, point in missing_planets.items():
            planet_positions.append((name, point.longitude))
        
        # Calculate aspects between all planets
        for i, (p1_name, p1_lon) in enumerate(planet_positions):
            for p2_name, p2_lon in planet_positions[i + 1:]:
                diff = abs(p1_lon - p2_lon)
                if diff > 180:
                    diff = 360 - diff
                    
                for aspect_name, aspect_data in self.ASPECTS.items():
                    orb = abs(diff - aspect_data['angle'])
                    if orb <= aspect_data['orb']:
                        aspects.append(Aspect(
                            planet1=p1_name,
                            planet2=p2_name,
                            aspect_type=aspect_name,
                            angle=diff,
                            orb=orb,
                            applying=False  # Can't calculate without speed data
                        ))           
        return aspects
    
    def get_missing_modern_planets(self) -> Dict[str, ChartPoint]:
        """Generate placeholder data for missing modern planets"""
        missing = {}
        modern_names = ['Uranus', 'Neptune', 'Pluto']
        
        for name in modern_names:
            if name not in self.available_planets:
                # Generate a placeholder position based on average orbital position
                if name == 'Uranus':
                    lon = (30 * 8 + 15) % 360  # Middle of Aquarius
                elif name == 'Neptune':
                    lon = (30 * 11 + 15) % 360  # Middle of Pisces  
                elif name == 'Pluto':
                    lon = (30 * 9 + 15) % 360  # Middle of Scorpio
                
                sign_index = int(lon / 30) % 12
                sign_names = ['Aries', 'Taurus', 'Gemini', 'Cancer', 
                            'Leo', 'Virgo', 'Libra', 'Scorpio',
                            'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                
                missing[name] = ChartPoint(
                    longitude=lon,
                    latitude=0,
                    movement='Direct',
                    sign=sign_names[sign_index],
                    house=self._find_house_number(lon)
                )
        
        return missing
    
    def get_house_cusps(self) -> Dict[str, float]:
        """Get the longitudes of all house cusps"""
        cusps = {}
        for i, house in enumerate(self.HOUSES):
            try:
                house_obj = self.chart.get(house)
                cusps[f"House{i+1}"] = house_obj.lon
            except Exception as e:
                print(f"Error getting house {house}: {e}")
                cusps[f"House{i+1}"] = (i * 30) % 360     
        return cusps
    
    def _find_house_number(self, lon: float) -> int:
        """Find which house a longitude falls in"""
        houses = []
        for i, house in enumerate(self.HOUSES):
            house_obj = self.chart.get(house)
            houses.append((i+1, house_obj.lon))
        houses.append((1, houses[0][1] + 360))
        houses.sort(key=lambda x: x[1])
        lon = lon % 360
        for i in range(len(houses)-1):
            start = houses[i][1]
            end = houses[i+1][1]
            if start <= lon < end:
                return houses[i][0]
        return 1



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