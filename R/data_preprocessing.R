# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: R/data_preprocessing.R
# Description: Data loading, inspection, cleaning, and preprocessing pipeline.
# ==============================================================================

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
})

#' Inspect and summarize the dataset
inspect_and_clean_data <- function(file_path = "dataset/train.csv") {
  cat("\n=======================================================\n")
  cat(" 1. INSPECTING DATASET: ", file_path, "\n")
  cat("=======================================================\n")
  
  if (!file.exists(file_path)) {
    stop("Dataset file does not exist: ", file_path)
  }
  
  # Load data efficiently
  df <- read.csv(file_path, stringsAsFactors = FALSE)
  
  cat("Dataset Dimensions:\n")
  cat("  Total Rows:   ", nrow(df), "\n")
  cat("  Total Columns:", ncol(df), "\n\n")
  
  cat("Columns & Data Types:\n")
  col_info <- data.frame(
    Column = names(df),
    Type = sapply(df, class),
    N_Unique = sapply(df, function(x) length(unique(x))),
    Missing_NA = colSums(is.na(df))
  )
  print(col_info, row.names = FALSE)
  
  # Check for duplicate records
  dup_count <- sum(duplicated(df))
  cat("\nDuplicate Rows Found:", dup_count, "\n")
  if (dup_count > 0) {
    df <- df %>% distinct()
    cat("Removed duplicates. New total rows:", nrow(df), "\n")
  }
  
  # Drop non-predictive identifiers (e.g. Property_ID)
  if ("Property_ID" %in% colnames(df)) {
    cat("Removing non-predictive identifier: Property_ID\n")
    df <- df %>% select(-Property_ID)
  }
  
  # Handle missing values if any
  num_cols <- names(select(df, where(is.numeric)))
  for (col in num_cols) {
    if (any(is.na(df[[col]]))) {
      med_val <- median(df[[col]], na.rm = TRUE)
      df[[col]][is.na(df[[col]])] <- med_val
      cat(sprintf("Imputed missing values in numeric '%s' with median: %.2f\n", col, med_val))
    }
  }
  
  char_cols <- names(select(df, where(is.character)))
  for (col in char_cols) {
    df[[col]][is.na(df[[col]]) | df[[col]] == ""] <- "Unknown"
    df[[col]] <- as.factor(df[[col]])
    cat(sprintf("Converted '%s' to factor with %d levels: %s\n", col, nlevels(df[[col]]), paste(head(levels(df[[col]]), 5), collapse = ", ")))
  }
  
  # Ensure binary variables are treated appropriately
  binary_cols <- c("Parking", "Lift_Available", "Gated_Community")
  for (b_col in binary_cols) {
    if (b_col %in% colnames(df)) {
      df[[b_col]] <- as.integer(df[[b_col]])
    }
  }
  
  cat("=======================================================\n")
  cat(" Preprocessing Completed Successfully!\n")
  cat("=======================================================\n\n")
  
  return(df)
}
