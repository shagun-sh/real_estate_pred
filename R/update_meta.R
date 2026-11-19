# ==============================================================================
# Add per-model test evaluation points and feature importance to metadata
# ==============================================================================

suppressPackageStartupMessages({
  library(randomForest)
  library(rpart)
  library(dplyr)
})

models_dir <- if (dir.exists(file.path("R", "saved_models"))) file.path("R", "saved_models") else "saved_models"
meta_path  <- file.path(models_dir, "models_metadata.rds")
meta       <- readRDS(meta_path)

lm_model <- readRDS(file.path(models_dir, "linear_regression.rds"))
dt_model <- readRDS(file.path(models_dir, "decision_tree.rds"))
rf_model <- readRDS(file.path(models_dir, "random_forest.rds"))

# Read sample of train.csv to get test partition for actual vs predicted
set.seed(42)
dataset_path <- if (file.exists(file.path("dataset", "train.csv"))) file.path("dataset", "train.csv") else file.path("..", "dataset", "train.csv")
df <- read.csv(dataset_path, stringsAsFactors = FALSE)
df <- df %>% distinct() %>% select(-Property_ID)

char_cols <- names(select(df, where(is.character)))
for (col in char_cols) {
  df[[col]] <- as.factor(df[[col]])
}

sample_indices <- sample(seq_len(nrow(df)), 15000)
df_work <- df[sample_indices, ]

library(caret)
train_index <- createDataPartition(df_work$Price_INR_Lakhs, p = 0.8, list = FALSE)
test_data   <- df_work[-train_index, ]
test_sample <- head(test_data, 200)

actuals <- test_sample$Price_INR_Lakhs
preds_lm <- round(as.numeric(predict(lm_model, newdata = test_sample)), 2)
preds_dt <- round(as.numeric(predict(dt_model, newdata = test_sample)), 2)
preds_rf <- round(as.numeric(predict(rf_model, newdata = test_sample)), 2)

# Feature importance from Random Forest
imp_mat <- importance(rf_model)
imp_df <- data.frame(
  Feature = rownames(imp_mat),
  Importance = round(imp_mat[, "%IncMSE"], 2),
  stringsAsFactors = FALSE
) %>% arrange(desc(Importance))

meta$test_actual <- actuals
meta$test_eval_points <- list(
  linear_regression = data.frame(actual = actuals, predicted = preds_lm, ideal = actuals),
  decision_tree     = data.frame(actual = actuals, predicted = preds_dt, ideal = actuals),
  random_forest     = data.frame(actual = actuals, predicted = preds_rf, ideal = actuals)
)
meta$feature_importance <- imp_df

saveRDS(meta, meta_path)
cat("Successfully updated models_metadata.rds with all 3 models evaluation curves and importance!\n")

