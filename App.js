import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import './App.css';
import DayNightLogo from './assets/logo.png';

const App = () => {
  const [sensorData, setSensorData] = useState({
    airQuality: null,
    distance: null,
    moisture: null,
    temperature: null,
    humidity: null,
    rainPrediction: null,  // Add rain prediction to state
  });

  const [history, setHistory] = useState({
    time: [],
    airQuality: [],
    distance: [],
    moisture: [],
    temperature: [],
    humidity: [],
  });

  const [visibleGraph, setVisibleGraph] = useState(null);
  const [graphType, setGraphType] = useState('line');
  const [theme, setTheme] = useState('day');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'day' ? 'night' : 'day'));
  };

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.75.80/ws');

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const rainPrediction = getRainPrediction(data.temperature, data.humidity); // Calculate rain prediction

        setSensorData({
          airQuality: data.airQuality,
          distance: data.distance,
          moisture: data.moisture,
          temperature: data.temperature,
          humidity: data.humidity,
          rainPrediction, // Update the rain prediction in state
        });

        setHistory((prevHistory) => {
          const newHistory = {
            time: [...prevHistory.time, new Date().toLocaleTimeString()],
            airQuality: [...prevHistory.airQuality, data.airQuality],
            distance: [...prevHistory.distance, data.distance],
            moisture: [...prevHistory.moisture, data.moisture],
            temperature: [...prevHistory.temperature, data.temperature],
            humidity: [...prevHistory.humidity, data.humidity],
          };

          if (newHistory.time.length > 50) {
            Object.keys(newHistory).forEach((key) => newHistory[key].shift());
          }

          return newHistory;
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  // Utility: Get color for current value based on safety levels
  const getValueColor = (sensor, value) => {
    if (sensor === 'airQuality') return value > 200 ? 'red' : value > 100 ? 'yellow' : 'green';
    if (sensor === 'temperature') return value > 40 ? 'red' : value > 25 ? 'yellow' : 'green';
    if (sensor === 'humidity') return value > 70 ? 'red' : value > 50 ? 'yellow' : 'green';
    if (sensor === 'distance') return value < 10 ? 'red' : value < 50 ? 'yellow' : 'green';
    if (sensor === 'moisture') return value < 30 ? 'red' : value < 60 ? 'yellow' : 'green';
    return 'black';
  };

  // Calculate rain prediction based on temperature and humidity
  const getRainPrediction = (temperature, humidity) => {
    if (humidity > 80 && temperature < 20) {
      return 'Rain is likely!';
    } else if (humidity > 60 && temperature < 30) {
      return 'Chance of rain.';
    } else {
      return 'No rain expected.';
    }
  };
  const generateCSV = () => {
    const headers = ['Time', 'Air Quality', 'Distance', 'Moisture', 'Temperature', 'Humidity', 'Rain Prediction'];
    const rows = history.time.map((time, index) => [
      time,
      history.airQuality[index],
      history.distance[index],
      history.moisture[index],
      history.temperature[index],
      history.humidity[index],
      getRainPrediction(history.temperature[index], history.humidity[index]),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  };
  const downloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'sensor_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics and assign severity colors
  const calculateStatistics = (data) => {
    if (!data || data.length === 0) return {};
    const sortedData = [...data].sort((a, b) => a - b);
    const mean = (data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2);
    const median =
      data.length % 2 === 0
        ? ((sortedData[data.length / 2 - 1] + sortedData[data.length / 2]) / 2).toFixed(2)
        : sortedData[Math.floor(data.length / 2)].toFixed(2);
    const mode = Object.entries(
      data.reduce((countMap, value) => {
        countMap[value] = (countMap[value] || 0) + 1;
        return countMap;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key)[0];
    const max = Math.max(...data).toFixed(2);
    const min = Math.min(...data).toFixed(2);

    return { mean, median, mode, max, min };
  };

  // Prepare Plotly data
  const prepareData = (sensor, color) => {
    switch (graphType) {
      case 'line':
        return {
          x: history.time,
          y: history[sensor],
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color },
          name: sensor,
        };
      case 'bar':
        return {
          x: history.time,
          y: history[sensor],
          type: 'bar',
          marker: { color },
          name: sensor,
        };
      case 'scatter':
        return {
          x: history.time,
          y: history[sensor],
          type: 'scatter',
          mode: 'markers',
          marker: { color },
          name: sensor,
        };
      case 'pie':
        return {
          labels: history.time.slice(-10),
          values: history[sensor].slice(-10),
          type: 'pie',
          hole: 0.4,
        };
      case '3d-pie':
        return {
          labels: history.time.slice(-10),
          values: history[sensor].slice(-10),
          type: 'pie',
          hole: 0.4,
          textinfo: 'label+percent',
        };
      case 'heatmap':
        return {
          z: [history[sensor]],
          x: history.time,
          y: [sensor],
          type: 'heatmap',
          colorscale: 'Viridis',
        };
      default:
        return {};
    }
  };

  const layout = {
    title: `${visibleGraph?.charAt(0).toUpperCase() + visibleGraph?.slice(1)} Data`,
    xaxis: { title: 'Time' },
    yaxis: { title: 'Sensor Value' },
    plot_bgcolor: theme === 'day' ? 'white' : '#121212',
    paper_bgcolor: theme === 'day' ? 'white' : '#121212',
    font: { color: theme === 'day' ? 'black' : 'white' },
    margin: { l: 40, r: 40, b: 40, t: 40 },
    width: 1000,
    height: 500,
  };

  return (
    <div className={`app-container ${theme}`}>
      <div className="left-panel">
        {Object.keys(sensorData).map((sensor) => {
          const color = getValueColor(sensor, sensorData[sensor]);
          const stats = calculateStatistics(history[sensor]);

          return visibleGraph === sensor ? (
            <div key={sensor} className="graph-item">
              <div className="sensor-value" style={{ color }}>
                {sensor.charAt(0).toUpperCase() + sensor.slice(1)}: {sensorData[sensor]}
              </div>
              <div className="csv-download">
                <button onClick={downloadCSV}>Download CSV</button>
              </div>
              <div className="statistics">
                <div className="mean" style={{ color: getValueColor(sensor, stats.mean) }}>
                  Mean: {stats.mean}|
                </div>
                <div className="median" style={{ color: getValueColor(sensor, stats.median) }}>
                  Median: {stats.median}|
                </div>
                <div className="mode" style={{ color: getValueColor(sensor, stats.mode) }}>
                  Mode: {stats.mode}|
                </div>
                <div className="max" style={{ color: getValueColor(sensor, stats.max) }}>
                  Max: {stats.max}|
                </div>
                <div className="min" style={{ color: getValueColor(sensor, stats.min) }}>
                  Min: {stats.min}
                </div>
              </div>
              <Plot data={[prepareData(sensor, color)]} layout={layout} config={{ displayModeBar: false }} />
              
            </div>
            
          ) : null;
        })}
      </div>

      <div className="right-panel">
        <h1 className="header">Real-time Sensor Data</h1>
        <button onClick={toggleTheme}>
          <img src={DayNightLogo} alt="Day-Night Logo" className="theme-logo" />
        </button>
        

        <div className="sensor-buttons">
          {Object.keys(sensorData).map((sensor) => (
            <button key={sensor} onClick={() => setVisibleGraph(sensor)}>
              {sensor.charAt(0).toUpperCase() + sensor.slice(1)}
            </button>
          ))}
        </div>

        

        <div className="graph-type-buttons">
          <h3>Graph Type:</h3>
          <button onClick={() => setGraphType('line')}>Line</button>
          <button onClick={() => setGraphType('bar')}>Bar</button>
          <button onClick={() => setGraphType('scatter')}>Scatter</button>
          <button onClick={() => setGraphType('heatmap')}>Heatmap</button>
          <button onClick={() => setGraphType('pie')}>Pie</button>
        </div>
      </div>
    </div>
  );

    
};

export default App;
