# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: R/run_api.R
# Description: Launcher script for the R Plumber HTTP REST API server.
# ==============================================================================

library(plumber)

# Find project root
api_file <- if (file.exists(file.path("R", "api.R"))) {
  file.path("R", "api.R")
} else if (file.exists("api.R")) {
  "api.R"
} else {
  file.path("..", "R", "api.R")
}

cat("Plumbing API file:", api_file, "\n")
pr <- plumber::plumb(api_file)

cat("Starting R Plumber API on http://127.0.0.1:8000 ...\n")
pr$run(host = "127.0.0.1", port = 8000)

