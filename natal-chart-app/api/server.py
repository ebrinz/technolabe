from flask import Flask, request, jsonify
from flask_cors import CORS
from natal import NatalChart
import traceback

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3001", "http://localhost:3000"]}})

@app.route('/natal-chart', methods=['POST'])
def get_natal_chart():
    try:
        data = request.json
        print("Received data:", data)
        
        chart = NatalChart(
            data['date'].replace('-', '/'),
            data['time'],
            float(data['lat']), 
            float(data['lon'])
        )
        
        result = {
            'planets': chart.get_planet_positions(),
            'houses': chart.get_houses(),
            'aspects': chart.get_aspects()
        }
        return jsonify(result)
        
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)