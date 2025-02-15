export const generateChart = async (params) => {
    try {
      const response = await fetch('http://localhost:5000/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          lat: params.lat,
          lon: params.lng,
          date: params.date,
          time: params.time
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  };