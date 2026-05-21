# 🌫️ Intelligent Air Quality Monitoring & Forecasting System

---

## 📌 Project Overview

This project applies **Machine Learning and Web Technologies** to analyze air quality data and provide real-time AQI monitoring, forecasting, and intelligent recommendations.

Air pollution is a major environmental issue in countries like Pakistan, where cities such as Lahore and Karachi frequently experience hazardous PM2.5 levels. Existing AQI systems lack real-time accuracy, predictive capabilities, and localized decision support.

This system solves those limitations by providing:
- Real-time AQI monitoring  
- Machine learning-based forecasting  
- Interactive dashboards  
- Smart alerts and health recommendations  

---

## 📂 Dataset

- Sources:
  - Air Quality APIs (PM2.5, PM10, humidity, temperature)
  - Historical AQI datasets
- Format:
  - JSON / API responses
  - Processed into structured datasets for analysis and ML models

---

## ⚙️ Workflow

### 1. Data Collection
- Collected real-time AQI data from APIs
- Integrated environmental parameters (PM2.5, PM10, weather data)
- Stored structured data for processing

---

### 2. Feature Engineering
- AQI index normalization  
- Time-based features (hourly/daily trends)  
- Pollution level categorization  
- Location-based grouping  
- Historical trend generation  

---

### 3. Exploratory Data Analysis (EDA)
- AQI trend visualization  
- Pollution level distribution  
- City-wise comparison  
- Weather vs AQI correlation  
- Time-series pattern analysis  

---

### 4. Machine Learning Models

We trained and compared:

- Linear Regression (baseline forecasting)
- Random Forest Regressor
- XGBoost Regressor

---

### 5. Evaluation Metrics

- MAE (Mean Absolute Error)  
- RMSE (Root Mean Squared Error)  
- R² Score  
- Forecast accuracy comparison  

---

## 🏆 Results Summary

| Model              | MAE   | RMSE  | R² Score |
|-------------------|-------|-------|----------|
| Linear Regression  | ~XX   | ~XX   | ~XX      |
| Random Forest      | ~XX   | ~XX   | ~XX      |
| XGBoost            | ~XX   | ~XX   | ~XX      |

👉 XGBoost performed best for AQI prediction in most experiments.

---

## 📊 Visualizations

- AQI trend charts  
- Pollution heatmaps  
- Forecast vs actual comparison  
- City-wise AQI analysis  
- Correlation heatmaps  

---

## 🧰 Tech Stack

- Python 🐍  
- Pandas / NumPy  
- Scikit-learn  
- XGBoost  
- Matplotlib / Seaborn  
- React.js (Frontend)  
- Django (Backend)  
- Leaflet.js (Maps)  
- Chart.js (Visualization)  

---

## 🚀 How to Run

### 1. Clone repository
```bash
git clone https://github.com/your-username/air-quality-system.git
cd air-quality-system
```

---

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

---

### 3. Run backend (Django)
```bash
python manage.py runserver
```

---

### 4. Run frontend (React)
```bash
npm install
npm start
```

---

## 📦 Requirements

```
pandas
numpy
matplotlib
seaborn
scikit-learn
xgboost
django
djangorestframework
```

---

## 📈 Future Improvements

- Deep learning-based AQI forecasting (LSTM)  
- Satellite pollution data integration  
- Mobile application version  
- Real-time government API integration  
- Smog detection using computer vision  

---

## 👩‍💻 Author

**Hamna Mushtaq**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
