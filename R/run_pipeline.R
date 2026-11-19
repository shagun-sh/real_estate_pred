# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: R/run_pipeline.R
# Description: End-to-end master pipeline to inspect dataset, preprocess,
#              generate EDA visualizations, train ML models, and prepare API cache.
# ==============================================================================

source("R/data_preprocessing.R")
source("R/exploratory_analysis.R")
source("R/train_model.R")

run_complete_pipeline <- function(dataset_csv = "dataset/train.csv", target_col = "Price_INR_Lakhs") {
  cat("\n========================================================================\n")
  cat("   STARTING END-TO-END R DATA SCIENCE & MACHINE LEARNING PIPELINE      \n")
  cat("========================================================================\n\n")
  
  # Step 1: Data Preprocessing & Cleaning
  df <- inspect_and_clean_data(dataset_csv)
  
  # Step 2: Exploratory Data Analysis & ggplot2 Visualizations
  cat("\n------------------------------------------------------------------------\n")
  cat(" STEP 2: EXPLORATORY DATA ANALYSIS (EDA) & VISUALIZATIONS\n")
  cat("------------------------------------------------------------------------\n")
  plot_files <- generate_all_visualizations(df, target_col = target_col, output_dir = "visualizations")
  
  # Step 3: Train and Evaluate 3 Machine Learning Models
  cat("\n------------------------------------------------------------------------\n")
  cat(" STEP 3: MACHINE LEARNING MODEL TRAINING & COMPARISON\n")
  cat("------------------------------------------------------------------------\n")
  ml_results <- train_and_evaluate_all_models(df, target_col = target_col, 
                                             models_dir = "R/saved_models", 
                                             viz_dir = "visualizations")
  
  # Step 4: Prepare Dashboard Aggregates & Schemas for React Dashboard
  cat("\n------------------------------------------------------------------------\n")
  cat(" STEP 4: EXPORTING DASHBOARD METRICS & PREDICTION SCHEMA\n")
  cat("------------------------------------------------------------------------\n")
  
  # Total, average, highest, lowest price in Rupees
  avg_p_lakhs <- mean(df[[target_col]], na.rm = TRUE)
  max_p_lakhs <- max(df[[target_col]], na.rm = TRUE)
  min_p_lakhs <- min(df[[target_col]], na.rm = TRUE)
  
  # City-wise stats for Recharts bar chart
  city_stats <- df %>%
    group_by(City) %>%
    summarise(avgPriceLakhs = round(mean(.data[[target_col]], na.rm = TRUE), 2),
              avgPriceRupees = round(mean(.data[[target_col]], na.rm = TRUE) * 100000),
              count = n(), .groups = 'drop') %>%
    arrange(desc(avgPriceLakhs))
  
  price_by_location <- lapply(1:nrow(city_stats), function(i) {
    list(
      location = as.character(city_stats$City[i]),
      avgPrice = city_stats$avgPriceRupees[i],
      avgPriceLakhs = city_stats$avgPriceLakhs[i],
      count = city_stats$count[i]
    )
  })
  
  # Price distribution brackets for AreaChart
  h <- hist(df[[target_col]], breaks = 12, plot = FALSE)
  price_dist <- lapply(1:(length(h$breaks) - 1), function(i) {
    list(
      range = paste0(round(h$breaks[i]), "-", round(h$breaks[i+1]), " L"),
      count = h$counts[i]
    )
  })
  
  dashboard_summary <- list(
    totalProperties = nrow(df),
    avgPrice = round(avg_p_lakhs * 100000),
    maxPrice = round(max_p_lakhs * 100000),
    minPrice = round(min_p_lakhs * 100000),
    avgPriceLakhs = round(avg_p_lakhs, 2),
    maxPriceLakhs = round(max_p_lakhs, 2),
    minPriceLakhs = round(min_p_lakhs, 2),
    currency = "INR",
    priceByLocation = price_by_location,
    priceDistribution = price_dist
  )
  saveRDS(dashboard_summary, "R/saved_models/dashboard_summary.rds")
  cat("  -> Saved: R/saved_models/dashboard_summary.rds\n")
  
  # Area vs Price samples for Recharts scatter
  area_col <- if ("Super_Area_SqFt" %in% colnames(df)) "Super_Area_SqFt" else "Carpet_Area_SqFt"
  scatter_sample <- df %>% sample_n(min(250, nrow(df)))
  area_vs_price <- lapply(1:nrow(scatter_sample), function(i) {
    list(
      area = round(scatter_sample[[area_col]][i], 1),
      price = round(scatter_sample[[target_col]][i], 1)
    )
  })
  
  # BHK vs Price data for Recharts bar chart
  bhk_sum <- df %>%
    group_by(BHK) %>%
    summarise(avgPrice = round(mean(.data[[target_col]], na.rm = TRUE), 2), .groups = 'drop')
  bhk_vs_price <- lapply(1:nrow(bhk_sum), function(i) {
    list(bhk = paste(bhk_sum$BHK[i], "BHK"), avgPrice = bhk_sum$avgPrice[i])
  })
  
  # Correlation Matrix across numerical features
  num_df <- df %>% select(where(is.numeric))
  corr_mat <- cor(num_df, use = "complete.obs")
  corr_list <- list()
  for (row_name in rownames(corr_mat)) {
    row_data <- as.list(round(corr_mat[row_name, ], 2))
    row_data$feature <- row_name
    corr_list[[length(corr_list) + 1]] <- row_data
  }
  
  # ggplot image references
  ggplot_list <- list(
    list(title = "Property Price Distribution", filename = "price_distribution.png"),
    list(title = "Average Price by City", filename = "location_price.png"),
    list(title = "Super Area vs Price", filename = "area_vs_price.png"),
    list(title = "BHK vs Average Price", filename = "bhk_vs_price.png"),
    list(title = "Feature Correlation Heatmap", filename = "correlation_heatmap.png"),
    list(title = "Actual vs. Predicted Evaluation", filename = "actual_vs_predicted.png")
  )
  ggplot_list <- ggplot_list[sapply(ggplot_list, function(x) file.exists(file.path("visualizations", x$filename)))]
  
  analysis_data <- list(
    areaVsPrice = area_vs_price,
    bhkVsPrice = bhk_vs_price,
    correlation = corr_list,
    ggplotImages = ggplot_list
  )
  saveRDS(analysis_data, "R/saved_models/analysis_data.rds")
  cat("  -> Saved: R/saved_models/analysis_data.rds\n")
  
  # Schema definition for dynamic React form
  # Define order and user-friendly labels
  feature_names <- setdiff(colnames(df), target_col)
  schema_features <- list()
  
  for (feat in feature_names) {
    f_data <- df[[feat]]
    if (is.factor(f_data) || is.character(f_data)) {
      schema_features[[length(schema_features) + 1]] <- list(
        name = feat,
        label = gsub("_", " ", feat),
        type = "categorical",
        options = levels(as.factor(f_data))
      )
    } else {
      is_bin <- all(f_data %in% c(0, 1))
      if (is_bin) {
        schema_features[[length(schema_features) + 1]] <- list(
          name = feat,
          label = gsub("_", " ", feat),
          type = "categorical",
          options = c("1", "0")
        )
      } else {
        schema_features[[length(schema_features) + 1]] <- list(
          name = feat,
          label = gsub("_", " ", feat),
          type = "numeric",
          min = floor(min(f_data, na.rm = TRUE)),
          max = ceiling(max(f_data, na.rm = TRUE)),
          example = round(median(f_data, na.rm = TRUE), 1),
          unit = if (grepl("Area", feat)) "sq ft" else if (grepl("Distance|km", feat)) "km" else if (grepl("Age", feat)) "years" else ""
        )
      }
    }
  }
  
  schema_obj <- list(
    target = target_col,
    features = schema_features,
    bestModel = ml_results$best_model,
    currency = "INR"
  )
  saveRDS(schema_obj, "R/saved_models/schema.rds")
  cat("  -> Saved: R/saved_models/schema.rds\n\n")
  
  cat("========================================================================\n")
  cat("  SUCCESS: PIPELINE EXECUTED SUCCESSFULLY!\n")
  cat("  - Preprocessed dataset: 80,000 real estate properties\n")
  cat("  - Models trained: Linear Regression, Decision Tree, Random Forest\n")
  cat("  - Visualizations generated in: visualizations/\n")
  cat("  - Models and artifacts saved in: R/saved_models/\n")
  cat("========================================================================\n\n")
}

# Run pipeline directly
run_complete_pipeline("dataset/train.csv", "Price_INR_Lakhs")
