

## For initial chart loading or detailed updates:

```
fetch('http://localhost:5000/chart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-01-30',
    time: '12:00',
    lat: 40.7128,
    lon: -74.0060
  })
})
```

```
curl -X POST http://localhost:5000/chart \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-30",
    "time": "12:00",
    "lat": 40.7128,
    "lon": -74.0060
  }'
```

## For rapid updates during map scrolling:

javascriptCopyfetch('http://localhost:5000/quick-chart', {
  method: 'POST',
  // same body structure as above
})





TODOs
```
- Midpoints between planets
- Arabic parts (like Part of Fortune)
- Fixed stars
- Additional aspect patterns (Grand Trines, T-Squares, etc.)
- Declination and parallel aspects
- Harmonic charts
```