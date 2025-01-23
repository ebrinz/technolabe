from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart
from flatlib.const import (
   SUN, MOON, MERCURY, VENUS, MARS, 
   JUPITER, SATURN, URANUS, NEPTUNE, PLUTO,
   HOUSE1, HOUSE2, HOUSE3, HOUSE4, HOUSE5, HOUSE6,
   HOUSE7, HOUSE8, HOUSE9, HOUSE10, HOUSE11, HOUSE12
)
import matplotlib.pyplot as plt
import math

class NatalChart:
    PLANETS = [SUN, MOON, MERCURY, VENUS, MARS, JUPITER, SATURN, URANUS, NEPTUNE, PLUTO]
    HOUSES = [HOUSE1, HOUSE2, HOUSE3, HOUSE4, HOUSE5, HOUSE6, 
             HOUSE7, HOUSE8, HOUSE9, HOUSE10, HOUSE11, HOUSE12]

    def __init__(self, date_str, time_str, lat, lon):
        self.date = date_str
        self.time = time_str
        self.datetime = Datetime(date_str, time_str)
        self.geopos = GeoPos(lat, lon)
        self.chart = Chart(self.datetime, self.geopos)

        self.PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
                    'Jupiter', 'Saturn'] # add back outer planets later
        self.HOUSES = [f'House{i}' for i in range(1, 13)]
       
    def get_planet_positions(self):
        planets = {}
        for planet in self.PLANETS:
            obj = self.chart.get(planet)
            house_num = 1
            # Find which house contains this planet's longitude
            for house in self.HOUSES:
                house_obj = self.chart.get(house)
                next_house = self.chart.get(self.HOUSES[(self.HOUSES.index(house) + 1) % 12])
                if (house_obj.lon <= obj.lon < next_house.lon) or \
                    (house_obj.lon > next_house.lon and (obj.lon >= house_obj.lon or obj.lon < next_house.lon)):
                    break
                house_num += 1
                
            planets[planet] = {
                'longitude': obj.lon,
                'latitude': obj.lat,
                'sign': obj.sign,
                'house': house_num
            }
        return planets
   
    def get_houses(self):
        houses = {}
        for house in self.HOUSES:
            obj = self.chart.get(house)
            houses[house] = {
                'longitude': obj.lon,
                'sign': obj.sign
            }
        return houses
   
    def get_aspects(self):
        aspects = []
        for i in range(len(self.PLANETS)):
            for j in range(i + 1, len(self.PLANETS)):
                planet1 = self.chart.get(self.PLANETS[i])
                planet2 = self.chart.get(self.PLANETS[j])
               
                diff = abs(planet1.lon - planet2.lon)
                if diff > 180:
                    diff = 360 - diff
                   
                aspect_type = None
                if abs(diff - 0) <= 8:
                    aspect_type = 'Conjunction'
                elif abs(diff - 60) <= 8:
                    aspect_type = 'Sextile'
                elif abs(diff - 90) <= 8:
                    aspect_type = 'Square'
                elif abs(diff - 120) <= 8:
                    aspect_type = 'Trine'
                elif abs(diff - 180) <= 8:
                    aspect_type = 'Opposition'
                   
                if aspect_type:
                    aspects.append({
                        'planet1': self.PLANETS[i],
                        'planet2': self.PLANETS[j],
                        'aspect': aspect_type,
                        'angle': round(diff, 2)
                    })
        return aspects
   
    def plot_chart(self, save_path=None):
        fig = plt.figure(figsize=(12, 12))
        ax = fig.add_subplot(111, projection='polar')
       
        circle = plt.Circle((0, 0), 1, transform=ax.transData._b, fill=False)
        ax.add_artist(circle)
       
        houses = self.get_houses()
        for house, data in houses.items():
            angle = math.radians(data['longitude'])
            ax.plot([angle, angle], [0, 1], 'k-', alpha=0.3)
           
        planets = self.get_planet_positions()
        for planet, data in planets.items():
            angle = math.radians(data['longitude'])
            ax.plot(angle, 0.8, 'bo')
            ax.text(angle, 0.85, planet, ha='center', va='bottom')
           
        ax.set_theta_direction(-1)
        ax.set_theta_zero_location('N')
        ax.set_rticks([])
       
        if save_path:
            plt.savefig(save_path)
        plt.close()