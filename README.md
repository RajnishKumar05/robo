### **Environmental Monitoring and Obstacle Detection Rover**  

#### **1. Overview**  
The rover is an advanced environmental monitoring and obstacle detection system designed to collect real-time data on temperature, humidity, air quality, and soil moisture. It also integrates an ultrasonic sensor to detect obstacles, ensuring seamless navigation in various terrains. The data collected by the rover is displayed on an interactive dashboard for real-time visualization and analysis.  

📷 **Rover Image:** ![View Rover](https://github.com/user-attachments/assets/68dcefe0-524a-40ff-a75a-20751d1eb774)  

#### **2. Sensor Modules and Their Functions**  

- **DHT11 Sensor (Temperature & Humidity Monitoring)**  
  The DHT11 sensor accurately measures the surrounding temperature and humidity levels. This data is essential for environmental assessment and can help in weather prediction and climate monitoring.  

- **MQ135 Air Quality Sensor**  
  The MQ135 sensor detects harmful gases and measures air quality levels in the environment. It provides valuable insights into pollution levels, making it suitable for air quality monitoring applications.  

- **Soil Moisture Sensor**  
  This sensor determines the moisture content in the soil, which is crucial for agricultural and irrigation applications. It helps in assessing the water needs of crops and optimizing irrigation systems.  

- **Ultrasonic Sensor (Obstacle Detection)**  
  The ultrasonic sensor is integrated into the rover for real-time obstacle detection. It ensures safe navigation by detecting and avoiding hurdles in the rover’s path, making it useful for autonomous or semi-autonomous movement.  

#### **3. Dashboard System**  
The rover’s dashboard is a user-friendly interface that displays sensor data in real-time. It provides:  

- **Live Temperature & Humidity Readings** to monitor climatic conditions.  
- **Air Quality Index Visualization** for pollution analysis.  
- **Soil Moisture Levels** to assist in irrigation planning.  
- **Obstacle Detection Alerts** using ultrasonic sensor data to prevent collisions.  

📊 **Dashboard Screenshots:**  
- ![Dashboard Screenshot 1](https://github.com/user-attachments/assets/9fc2ee7d-ad50-4cdf-b598-34c4dac1a7fd)  
- ![Dashboard Screenshot 2](https://github.com/user-attachments/assets/2486a346-70c6-4493-9c1d-e8fa8f799750)  
- ![Dashboard Screenshot 3](https://github.com/user-attachments/assets/e3e195b5-f748-47bf-a3c9-f083091d70b8)  

The dashboard offers an intuitive visualization of all data, enabling users to analyze trends and make data-driven decisions efficiently.  

#### **4. Applications**  
- **Environmental Monitoring**: Assess air quality, humidity, and temperature trends.  
- **Agriculture & Irrigation**: Optimize watering schedules using soil moisture data.  
- **Autonomous Navigation**: Enhance movement efficiency with obstacle detection.  
- **Research & Development**: Study climatic conditions and air pollution patterns.  

#### **5. Code Explanation**  
Below is a brief explanation of the core code components used in the rover project:

**ESP32 Code for Data Collection & Transmission:**
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#define DHTPIN 4  // Pin where DHT11 is connected
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "Your_SSID";
const char* password = "Your_PASSWORD";
const char* serverUrl = "http://your-server-url.com/data";

void setup() {
    Serial.begin(115200);
    dht.begin();
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
}

void loop() {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor!");
        return;
    }

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    String jsonPayload = "{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + "}";
    int httpResponseCode = http.POST(jsonPayload);
    Serial.println("Data sent: " + jsonPayload);
    http.end();
    delay(5000);
}
```

**React.js Code for Dashboard Data Fetching:**
```jsx
import React, { useEffect, useState } from "react";

const Dashboard = () => {
    const [data, setData] = useState({ temperature: "--", humidity: "--" });

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("http://your-server-url.com/data");
            const result = await response.json();
            setData(result);
        };
        fetchData();
    }, []);

    return (
        <div>
            <h2>Environmental Monitoring Dashboard</h2>
            <p>Temperature: {data.temperature}°C</p>
            <p>Humidity: {data.humidity}%</p>
        </div>
    );
};

export default Dashboard;
```

This rover, combined with its dashboard, serves as a comprehensive solution for environmental monitoring, making it suitable for research, industrial, and agricultural applications. 🚀

