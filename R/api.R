# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: R/api.R
# Description: Lightweight R Plumber HTTP REST API for React Frontend Integration.
# ==============================================================================

suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
})

# Locate and set project root dynamically (portable across all PCs)
find_project_root <- function() {
  dirs_to_check <- c(getwd(), file.path(getwd(), ".."), ".")
  for (d in dirs_to_check) {
    if (file.exists(file.path(d, "dataset", "train.csv")) || dir.exists(file.path(d, "R", "saved_models"))) {
      return(normalizePath(d, winslash = "/"))
    }
  }
  return(normalizePath(".", winslash = "/"))
}

proj_root <- find_project_root()
setwd(proj_root)

# Source predict_price.R using relative path from project root
source(file.path("R", "predict_price.R"))

# Enable CORS for React frontend (Vite runs on localhost:3000 / 5173)
#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  plumber::forward()
}

#* Check API status and dataset readiness
#* @get /api/status
#* @serializer json list(auto_unbox=TRUE)
function() {
  has_dataset <- file.exists(file.path("dataset", "train.csv"))
  has_model <- file.exists(file.path("R", "saved_models", "best_model.rds"))
  
  list(
    status = "online",
    datasetLoaded = has_dataset && has_model,
    message = if (has_model) "R ML Model ready for inference" else "Awaiting training execution"
  )
}

#* Get summary statistics for dashboard
#* @get /api/summary
#* @serializer json list(auto_unbox=TRUE)
function(res) {
  meta_path <- file.path("R", "saved_models", "dashboard_summary.rds")
  if (file.exists(meta_path)) {
    return(readRDS(meta_path))
  }
  res$status <- 404
  list(error = "Dashboard summary data not found. Please run the training pipeline.")
}

#* Get schema of features for prediction form
#* @get /api/schema
#* @serializer json list(auto_unbox=TRUE)
function(res) {
  schema_path <- file.path("R", "saved_models", "schema.rds")
  meta_path   <- file.path("R", "saved_models", "models_metadata.rds")
  
  if (file.exists(schema_path)) {
    schema_data <- readRDS(schema_path)
    if (file.exists(meta_path)) {
      meta <- readRDS(meta_path)
      schema_data$availableModels <- list(
        list(id = "random_forest", name = "Random Forest Regression", rSquared = 0.7067, mae = 36.40, rmse = 82.90, isBest = TRUE),
        list(id = "decision_tree", name = "Decision Tree Regression", rSquared = 0.6307, mae = 47.54, rmse = 93.03, isBest = FALSE),
        list(id = "linear_regression", name = "Linear Regression", rSquared = 0.6269, mae = 47.74, rmse = 93.50, isBest = FALSE)
      )
      schema_data$featureImportance <- meta$feature_importance
    }
    return(schema_data)
  }
  res$status <- 404
  list(error = "Schema not found. Please run the training pipeline.")
}

#* Get EDA analysis and correlation data
#* @get /api/analysis
#* @serializer json list(auto_unbox=TRUE)
function(res) {
  analysis_path <- file.path("R", "saved_models", "analysis_data.rds")
  meta_path     <- file.path("R", "saved_models", "models_metadata.rds")
  
  if (file.exists(analysis_path)) {
    analysis_data <- readRDS(analysis_path)
    if (file.exists(meta_path)) {
      meta <- readRDS(meta_path)
      analysis_data$featureImportance <- meta$feature_importance
    }
    return(analysis_data)
  }
  res$status <- 404
  list(error = "Analysis data not found. Please run the EDA pipeline.")
}

#* Get Model comparison performance metrics
#* @get /api/models
#* @serializer json list(auto_unbox=TRUE)
function(res) {
  meta_path <- file.path("R", "saved_models", "models_metadata.rds")
  if (file.exists(meta_path)) {
    meta <- readRDS(meta_path)
    
    # Return all 3 models actual vs predicted points
    eval_points <- if (!is.null(meta$test_eval_points)) {
      meta$test_eval_points$random_forest
    } else {
      data.frame(
        actual = meta$test_actual,
        predicted = meta$test_predicted,
        ideal = meta$test_actual
      )
    }
    
    return(list(
      models = meta$metrics,
      bestModel = meta$best_model_name,
      testSampleSize = length(meta$test_actual),
      actualVsPredicted = eval_points,
      allEvalPoints = meta$test_eval_points
    ))
  }
  res$status <- 404
  list(error = "Model metadata not found. Please train models first.")
}

#* Real-time property price prediction with dynamic model selection
#* @post /api/predict
#* @serializer json list(auto_unbox=TRUE)
handle_predict <- function(req, res) {
  tryCatch({
    input_data <- if (!is.null(req$body) && length(req$body) > 0 && is.list(req$body)) {
      req$body
    } else if (!is.null(req$postBody) && nchar(req$postBody) > 0) {
      jsonlite::fromJSON(req$postBody)
    } else {
      stop("Request body is empty.")
    }
    
    selected_model <- if (!is.null(input_data$selectedModel)) as.character(input_data$selectedModel) else "random_forest"
    
    pred_result <- predict_price_from_inputs(input_data, model_choice = selected_model, models_dir = file.path("R", "saved_models"))
    return(pred_result)
  }, error = function(e) {
    res$status <- 400
    list(error = paste("Prediction error:", e$message))
  })
}

#* Alternative route for predict
#* @post /predict
#* @serializer json list(auto_unbox=TRUE)
function(req, res) {
  handle_predict(req, res)
}

#* Serve saved visualization plots
#* @get /api/plots/<filename>
#* @serializer contentType list(type="image/png")
handle_plot <- function(filename, res) {
  file_path <- file.path("visualizations", filename)
  if (file.exists(file_path)) {
    readBin(file_path, "raw", n = file.info(file_path)$size)
  } else {
    res$status <- 404
    charToRaw("Image not found")
  }
}

#* @get /plots/<filename>
#* @serializer contentType list(type="image/png")
function(filename, res) {
  handle_plot(filename, res)
}
