# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: R/train_model.R
# Description: Train, evaluate, and save 3 ML Regression Models:
#              1. Linear Regression
#              2. Decision Tree Regression (rpart)
#              3. Random Forest Regression (randomForest)
# ==============================================================================

suppressPackageStartupMessages({
  library(caret)
  library(rpart)
  library(randomForest)
  library(ggplot2)
  library(dplyr)
})

# Evaluation metrics calculation function
calculate_regression_metrics <- function(actual, predicted) {
  mae <- mean(abs(actual - predicted), na.rm = TRUE)
  rmse <- sqrt(mean((actual - predicted)^2, na.rm = TRUE))
  ss_total <- sum((actual - mean(actual, na.rm = TRUE))^2, na.rm = TRUE)
  ss_res <- sum((actual - predicted)^2, na.rm = TRUE)
  r_squared <- 1 - (ss_res / ss_total)
  
  return(list(MAE = round(mae, 2), RMSE = round(rmse, 2), RSquared = round(max(0, r_squared), 4)))
}

#' Train all 3 models, compare on test set, and save .rds artifacts
train_and_evaluate_all_models <- function(df, target_col = "Price_INR_Lakhs", models_dir = "R/saved_models", viz_dir = "visualizations") {
  if (!dir.exists(models_dir)) dir.create(models_dir, recursive = TRUE)
  if (!dir.exists(viz_dir)) dir.create(viz_dir, recursive = TRUE)
  
  set.seed(42)
  
  # For balanced efficiency and high precision, take a sample of 15,000 observations if dataset is larger
  if (nrow(df) > 15000) {
    cat(sprintf("Using stratified sample of 15,000 rows (out of %d) for model training & test benchmarking...\n", nrow(df)))
    sample_indices <- sample(seq_len(nrow(df)), 15000)
    df_work <- df[sample_indices, ]
  } else {
    df_work <- df
  }
  
  # Train/Test Split (80% Train, 20% Test)
  cat("Dividing data into 80% Training and 20% Testing sets (No data leakage)...\n")
  train_index <- createDataPartition(df_work[[target_col]], p = 0.8, list = FALSE)
  train_data <- df_work[train_index, ]
  test_data  <- df_work[-train_index, ]
  
  cat(sprintf("  Training Samples: %d\n  Testing Samples:  %d\n\n", nrow(train_data), nrow(test_data)))
  
  formula_str <- as.formula(paste(target_col, "~ ."))
  
  # --------------------------------------------------------------------------
  # 1. Linear Regression
  # --------------------------------------------------------------------------
  cat("--> [1/3] Training Linear Regression Model...\n")
  start_time <- Sys.time()
  lm_model <- lm(formula_str, data = train_data)
  lm_preds <- predict(lm_model, newdata = test_data)
  lm_time  <- round(as.numeric(difftime(Sys.time(), start_time, units = "secs")), 2)
  lm_metrics <- calculate_regression_metrics(test_data[[target_col]], lm_preds)
  cat(sprintf("    Linear Regression: R² = %.4f | RMSE = %.2f | MAE = %.2f (took %.2fs)\n", 
              lm_metrics$RSquared, lm_metrics$RMSE, lm_metrics$MAE, lm_time))
  
  # --------------------------------------------------------------------------
  # 2. Decision Tree Regression (rpart)
  # --------------------------------------------------------------------------
  cat("--> [2/3] Training Decision Tree Regression (rpart)...\n")
  start_time <- Sys.time()
  dt_model <- rpart(formula_str, data = train_data, method = "anova",
                    control = rpart.control(cp = 0.005, minsplit = 15, maxdepth = 12))
  dt_preds <- predict(dt_model, newdata = test_data)
  dt_time  <- round(as.numeric(difftime(Sys.time(), start_time, units = "secs")), 2)
  dt_metrics <- calculate_regression_metrics(test_data[[target_col]], dt_preds)
  cat(sprintf("    Decision Tree:     R² = %.4f | RMSE = %.2f | MAE = %.2f (took %.2fs)\n", 
              dt_metrics$RSquared, dt_metrics$RMSE, dt_metrics$MAE, dt_time))
  
  # --------------------------------------------------------------------------
  # 3. Random Forest Regression (randomForest)
  # --------------------------------------------------------------------------
  cat("--> [3/3] Training Random Forest Regression (ntree=80)...\n")
  start_time <- Sys.time()
  rf_model <- randomForest(formula_str, data = train_data, ntree = 80, 
                           mtry = 4, importance = TRUE)
  rf_preds <- predict(rf_model, newdata = test_data)
  rf_time  <- round(as.numeric(difftime(Sys.time(), start_time, units = "secs")), 2)
  rf_metrics <- calculate_regression_metrics(test_data[[target_col]], rf_preds)
  cat(sprintf("    Random Forest:     R² = %.4f | RMSE = %.2f | MAE = %.2f (took %.2fs)\n\n", 
              rf_metrics$RSquared, rf_metrics$RMSE, rf_metrics$MAE, rf_time))
  
  # --------------------------------------------------------------------------
  # Comparative Performance Summary Table
  # --------------------------------------------------------------------------
  comparison_table <- data.frame(
    Algorithm = c("Linear Regression", "Decision Tree Regression", "Random Forest Regression"),
    MAE = c(lm_metrics$MAE, dt_metrics$MAE, rf_metrics$MAE),
    RMSE = c(lm_metrics$RMSE, dt_metrics$RMSE, rf_metrics$RMSE),
    R_Squared = c(lm_metrics$RSquared, dt_metrics$RSquared, rf_metrics$RSquared),
    stringsAsFactors = FALSE
  )
  
  cat("========================================================================\n")
  cat(" MODEL BENCHMARK PERFORMANCE COMPARISON MATRIX (TEST DATASET)\n")
  cat("========================================================================\n")
  print(comparison_table)
  cat("========================================================================\n\n")
  
  # Select best model based on highest R-squared
  best_idx <- which.max(comparison_table$R_Squared)
  best_model_name <- comparison_table$Algorithm[best_idx]
  cat(sprintf(">>> BEST PERFORMING MODEL IDENTIFIED: %s (R² = %.2f%%) <<<\n\n", 
              best_model_name, comparison_table$R_Squared[best_idx] * 100))
  
  # Save individual models to RDS
  saveRDS(lm_model, file.path(models_dir, "linear_regression.rds"))
  saveRDS(dt_model, file.path(models_dir, "decision_tree.rds"))
  saveRDS(rf_model, file.path(models_dir, "random_forest.rds"))
  
  best_model_obj <- switch(best_idx,
                           "1" = lm_model,
                           "2" = dt_model,
                           "3" = rf_model)
  best_preds <- switch(best_idx,
                       "1" = lm_preds,
                       "2" = dt_preds,
                       "3" = rf_preds)
  
  saveRDS(best_model_obj, file.path(models_dir, "best_model.rds"))
  
  # Save metadata and test evaluation samples
  test_sample_size <- min(200, nrow(test_data))
  meta_obj <- list(
    metrics = comparison_table,
    best_model_name = best_model_name,
    best_r_squared = comparison_table$R_Squared[best_idx],
    test_actual = test_data[[target_col]][1:test_sample_size],
    test_predicted = round(best_preds[1:test_sample_size], 2),
    target_col = target_col,
    feature_names = setdiff(colnames(df), target_col)
  )
  saveRDS(meta_obj, file.path(models_dir, "models_metadata.rds"))
  
  # --------------------------------------------------------------------------
  # Actual vs Predicted Visualization using ggplot2
  # --------------------------------------------------------------------------
  cat("--> Generating Actual vs Predicted ggplot2 Figure...\n")
  eval_plot_df <- data.frame(
    Actual = test_data[[target_col]],
    Predicted = best_preds
  ) %>% sample_n(min(1500, nrow(test_data)))
  
  p_actual_vs_pred <- ggplot(eval_plot_df, aes(x = Actual, y = Predicted)) +
    geom_point(color = "#2563eb", alpha = 0.5, size = 1.8) +
    geom_abline(intercept = 0, slope = 1, color = "#ef4444", linetype = "dashed", linewidth = 1.2) +
    labs(
      title = paste("Actual vs. Predicted Property Prices (", best_model_name, ")", sep = ""),
      subtitle = sprintf("Test Set Evaluation: R² = %.3f | RMSE = %.2f L | MAE = %.2f L", 
                         comparison_table$R_Squared[best_idx], comparison_table$RMSE[best_idx], comparison_table$MAE[best_idx]),
      x = "Actual Price (INR in Lakhs)",
      y = "Predicted Price (INR in Lakhs)"
    ) +
    theme_minimal() +
    theme(
      plot.title = element_text(face = "bold", size = 13, color = "#0f2942"),
      plot.subtitle = element_text(size = 9, color = "#64748b"),
      panel.grid.major = element_line(color = "#f1f5f9"),
      plot.background = element_rect(fill = "#ffffff", color = NA)
    )
  
  pred_plot_path <- file.path(viz_dir, "actual_vs_predicted.png")
  ggsave(pred_plot_path, plot = p_actual_vs_pred, width = 7.5, height = 5.2, dpi = 300)
  cat(sprintf("Saved Actual vs Predicted chart to '%s'\n\n", pred_plot_path))
  
  return(list(comparison = comparison_table, best_model = best_model_name))
}
