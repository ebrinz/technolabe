# technolabe

Work in progress: A tool for exploring astrological natal charts across time and space. The goal is to enable discovery of interesting astrological patterns and auspicious timing by visualizing how natal charts change based on location and time.

## Getting Started

1. Install dependencies:
```bash
# Install Python dependencies
pip install flask flask-cors flatlib matplotlib

# Install Node dependencies 
cd natal-chart-app
npm install
```

2. Start the backend server (in one terminal):
```bash
cd natal-chart-app
npm run api
```

3. Start the frontend (in another terminal):
```bash
cd natal-chart-app
npm run dev
```

4. Open http://localhost:3001

## Features

- Interactive map selection of birth location
- Real-time natal chart updates
- Visual display of planetary positions and aspects
- House placement calculations
