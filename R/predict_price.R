# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: R/predict_price.R
# Description: Real-time price inference supporting model selection:
#              - Random Forest Regression
#              - Decision Tree Regression
#              - Linear Regression
# ==============================================================================

suppressPackageStartupMessages({
  library(randomForest)
  library(rpart)
})

predict_price_from_inputs <- function(input_list, model_choice = "random_forest", models_dir = file.path("R", "saved_models")) {
  if (!dir.exists(models_dir)) {
    if (dir.exists("saved_models")) {
      models_dir <- "saved_models"
    } else if (dir.exists(file.path("..", "R", "saved_models"))) {
      models_dir <- file.path("..", "R", "saved_models")
    }
  }
  
  meta_path <- file.path(models_dir, "models_metadata.rds")
  if (!file.exists(meta_path)) {
    stop("Model metadata not found. Please run the training pipeline first.")
  }
  metadata <- readRDS(meta_path)
  
  # Normalize model choice
  m_key <- tolower(gsub("[ _-]", "", model_choice))
  
  model_filename <- if (grepl("linear", m_key)) {
    "linear_regression.rds"
  } else if (grepl("tree|rpart", m_key)) {
    "decision_tree.rds"
  } else {
    "random_forest.rds"
  }
  
  model_path <- file.path(models_dir, model_filename)
  if (!file.exists(model_path)) {
    model_path <- file.path(models_dir, "best_model.rds")
  }
  
  model_obj <- readRDS(model_path)
  
  # Ensure input is a data frame
  input_df <- as.data.frame(input_list, stringsAsFactors = FALSE)
  
  # Extract expected factor levels (if from Random Forest or metadata)
  rf_model_path <- file.path(models_dir, "random_forest.rds")
  rf_model <- if (file.exists(rf_model_path)) readRDS(rf_model_path) else NULL
  
  factor_levels <- if (!is.null(rf_model$forest) && !is.null(rf_model$forest$xlevels)) {
    rf_model$forest$xlevels
  } else if (!is.null(model_obj$xlevels)) {
    model_obj$xlevels
  } else {
    list()
  }
  
  # Format factor columns
  for (f_col in names(factor_levels)) {
    lvl <- factor_levels[[f_col]]
    if (is.character(lvl) && length(lvl) > 0 && f_col %in% colnames(input_df)) {
      val <- as.character(input_df[[f_col]])
      if (!val %in% lvl) {
        val <- lvl[1] # fallback to first valid level
      }
      input_df[[f_col]] <- factor(val, levels = lvl)
    }
  }
  
  # Estimate Carpet_Area_SqFt if omitted or 0 (~75% of Super Area)
  if (!("Carpet_Area_SqFt" %in% colnames(input_df)) || is.na(input_df$Carpet_Area_SqFt) || input_df$Carpet_Area_SqFt == 0) {
    if ("Super_Area_SqFt" %in% colnames(input_df)) {
      input_df$Carpet_Area_SqFt <- round(as.numeric(input_df$Super_Area_SqFt) * 0.75, 2)
    }
  }
  
  # Format numeric columns
  numeric_cols <- c("BHK", "Bathrooms", "Super_Area_SqFt", "Carpet_Area_SqFt",
                    "Floor_Number", "Total_Floors", "Age_of_Property",
                    "Parking", "Lift_Available", "Gated_Community",
                    "Distance_to_Metro_km", "Distance_to_City_Center_km")
  for (ncol in numeric_cols) {
    if (ncol %in% colnames(input_df)) {
      input_df[[ncol]] <- as.numeric(input_df[[ncol]])
    } else {
      input_df[[ncol]] <- 0
    }
  }
  
  # Predict price
  pred_val <- predict(model_obj, newdata = input_df)
  predicted_lakhs <- round(as.numeric(pred_val[1]), 2)
  predicted_rupees <- round(predicted_lakhs * 100000)
  
  # Match model metrics from comparison table
  formal_name <- if (grepl("linear", m_key)) {
    "Linear Regression"
  } else if (grepl("tree|rpart", m_key)) {
    "Decision Tree Regression"
  } else {
    "Random Forest Regression"
  }
  
  row_match <- metadata$metrics[metadata$metrics$Algorithm == formal_name, ]
  r_squared <- if (nrow(row_match) > 0) row_match$R_Squared[1] else metadata$best_r_squared
  mae       <- if (nrow(row_match) > 0) row_match$MAE[1] else NA
  rmse      <- if (nrow(row_match) > 0) row_match$RMSE[1] else NA
  
  # Select corresponding evaluation points for actual vs predicted plot
  eval_key <- if (grepl("linear", m_key)) "linear_regression" else if (grepl("tree|rpart", m_key)) "decision_tree" else "random_forest"
  actual_vs_pred_points <- if (!is.null(metadata$test_eval_points)) {
    metadata$test_eval_points[[eval_key]]
  } else {
    data.frame(actual = metadata$test_actual, predicted = metadata$test_predicted, ideal = metadata$test_actual)
  }
  
  return(list(
    predictedPrice = predicted_rupees,
    predictedLakhs = predicted_lakhs,
    modelName = formal_name,
    modelKey = eval_key,
    rSquared = r_squared,
    mae = mae,
    rmse = rmse,
    currency = "INR",
    actualVsPredicted = actual_vs_pred_points
  ))
}
