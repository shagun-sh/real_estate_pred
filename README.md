# Real Estate Price Prediction and Analysis Using R and Machine Learning

A complete, college-level Problem-Based Learning (PBL) project that integrates **R** for statistical data preprocessing, exploratory data analysis (EDA), and machine learning regression with an interactive **React.js** analytics dashboard.

---

## 1. Project Overview & Architecture

Real estate valuation is influenced by multi-dimensional characteristics including city, location, built-up area, room count (BHK), property age, and amenities.

This project implements an end-to-end data science workflow in **R** comparing three distinct regression algorithms (**Linear Regression**, **Decision Tree Regression**, and **Random Forest Regression**). The trained models are served via an **R Plumber API** and integrated with an interactive **React frontend dashboard** featuring live model switching, actual vs. predicted evaluation, and mortgage affordability modeling.

---

## 2. Interactive Features for Project Demonstration

1. **Interactive Model Switcher (Inference Engine):**
   - Seamlessly toggle between **Random Forest Regression (Best, $R^2 = 70.67\%$)**, **Decision Tree ($R^2 = 63.07\%$)**, and **Linear Regression ($R^2 = 62.69\%$)** before predicting.
   - Observe how different algorithms weigh the same property specifications and produce distinct valuations.

2. **Unified Model Performance & Scatter Evaluation:**
   - Immediately upon prediction, scroll down to inspect the **Actual vs. Predicted Price scatter plot** corresponding specifically to the selected algorithm.
   - Compare test observations against the ideal 45-degree line of perfect prediction ($y = x$).

3. **Interactive EMI & Mortgage Affordability Calculator:**
   - Computes monthly installments (EMI), loan principal, and total interest based on the model's predicted price.
   - Interactive sliders for **Down Payment %** (10% to 50%), **Loan Tenure** (5 to 30 years), and **Interest Rate** (7.0% to 12.0%).

4. **Interactive Inter-City Market Comparator (in Data Analysis):**
   - Select any two Indian cities from the dataset (e.g. Bangalore vs. Mumbai, or Delhi vs. Pune).
   - Real-time side-by-side comparison of average property prices, average unit size, price per square foot, and valuation delta.

5. **Random Forest Variable Importance Driver Chart:**
   - Visualizes feature rankings by `%IncMSE` (Mean Squared Error degradation when permuted), highlighting key price drivers: City, Super Area, Locality Type, and Age.

---

## 3. Technology Stack

### Data Science & Machine Learning (R)
- **R (v4.6.2)**
- **dplyr & tidyr:** Preprocessing, cleaning, and factor encoding
- **ggplot2 & reshape2:** High-resolution charts and correlation heatmap
- **caret:** 80/20 train/test partition (no data leakage)
- **rpart:** Decision Tree Regression
- **randomForest:** Ensemble bagging with feature sub-sampling
- **plumber & jsonlite:** HTTP REST API exposing endpoints with CORS and unboxed JSON

### Frontend & Analytics UI
- **React.js (v18+)** with **Vite**
- **Recharts:** Responsive client-side interactive charting
- **Lucide React:** Modern UI iconography
- **Custom CSS:** Minimalist navy (`#0f2942`) and blue (`#2563eb`) palette

---

## 4. Machine Learning Benchmark Results

Evaluated on an independent test dataset (20% held-out test split, 3,000 observations):

| Algorithm | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | R-Squared ($R^2$) | Status |
|---|---|---|---|---|
| **Linear Regression** | 47.74 Lakhs | 93.50 Lakhs | 62.69% | Available |
| **Decision Tree Regression (`rpart`)** | 47.54 Lakhs | 93.03 Lakhs | 63.07% | Available |
| **Random Forest Regression (`randomForest`)** | **36.40 Lakhs** | **82.90 Lakhs** | **70.67%** | **Best Performing Model** |

 Standalone)**
4. **Number of Bedrooms (BHK) and Bathrooms**
