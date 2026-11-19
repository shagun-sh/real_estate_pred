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

---

## 5. Quick Start & Setup Guide (Run on Any PC)

### Prerequisites
Before running on a new computer, ensure you have:
1. **R (version 4.0+)**: [Download from CRAN](https://cran.r-project.org/bin/windows/base/)
2. **Node.js (version 18+)**: [Download from nodejs.org](https://nodejs.org/)
3. **Git**: [Download from git-scm.com](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd R_PBL
```

---

### Step 2: One-Click Environment Setup
Run the automated setup script to install all required R packages (`dplyr`, `caret`, `randomForest`, `plumber`, etc.) and Node modules:
- **Double-click `setup.bat`**
*(Or in terminal: `.\setup.bat`)*

---

### Step 3: Launch Both Servers
- **Double-click `restart_servers.bat`**

This will automatically launch:
1. **R Plumber API Backend** at `http://127.0.0.1:8000`
2. **React Dashboard Frontend** at `http://localhost:3000`

To stop all servers at any time, simply double-click **`stop_servers.bat`**.

---

## 6. College Viva & Presentation Q&A Guide

**Q1: Why did you choose Random Forest as your primary model?**  
*Answer:* Real estate prices exhibit non-linear interactions (e.g., location value compounds with area, and premium floors add more value in high-rise metros). Random Forest uses an ensemble of bagged decision trees with feature sub-sampling, reducing variance and capturing non-linear relationships without overfitting, resulting in an $R^2$ of **70.67%** compared to Linear Regression's **62.69%**.

**Q2: How do you prevent data leakage during model training?**  
*Answer:* The dataset was partitioned into an 80% training set and a 20% independent testing set using `caret::createDataPartition`. All transformations (such as factor level mappings and metrics computation) were fitted solely on the training partition and validated strictly on the held-out test partition.

**Q3: How does the React frontend communicate with R?**  
*Answer:* We use **R Plumber**, a lightweight framework that converts standard R functions into HTTP REST endpoints using special roxygen comments (`#* @post`, `#* @get`). React sends JSON payloads via `fetch()` to Plumber endpoints, which passes the inputs to our saved serialized `.rds` models and returns the predicted valuation and metrics in real-time.

**Q4: What are the most influential price drivers in Indian urban real estate?**  
*Answer:* Using Mean Squared Error degradation (`%IncMSE`) from our Random Forest model, the top price determinants are:
1. **Super Built-up Area (Sq. Ft.)**
2. **City / Metropolitan Location**
3. **Locality Type (Gated Community vs. Standalone)**
4. **Number of Bedrooms (BHK) and Bathrooms**
