# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: setup.R
# Description: Automated dependency installer for R environment.
# ==============================================================================

cat("========================================================\n")
cat("Checking R Packages for Real Estate Predictor Project...\n")
cat("========================================================\n")

required_packages <- c(
  "dplyr",
  "tidyr",
  "ggplot2",
  "reshape2",
  "caret",
  "rpart",
  "randomForest",
  "plumber",
  "jsonlite"
)

missing_packages <- required_packages[!(required_packages %in% installed.packages()[, "Package"])]

if (length(missing_packages) > 0) {
  cat("Installing missing package(s):", paste(missing_packages, collapse = ", "), "\n")
  install.packages(missing_packages, repos = "https://cloud.r-project.org")
  cat("All required packages installed successfully!\n")
} else {
  cat("All required R packages are already installed. No action needed.\n")
}

cat("========================================================\n")
cat("R environment is ready!\n")
cat("========================================================\n")
