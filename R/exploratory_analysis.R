# ==============================================================================
# REAL ESTATE PRICE PREDICTOR & ANALYSIS
# File: R/exploratory_analysis.R
# Description: Exploratory Data Analysis (EDA) and ggplot2 visualizations.
# ==============================================================================

suppressPackageStartupMessages({
  library(ggplot2)
  library(dplyr)
  library(reshape2)
})

# Custom clean aesthetic theme matching the minimal Navy/Blue dashboard
theme_dashboard <- function() {
  theme_minimal(base_family = "sans") +
    theme(
      plot.title = element_text(face = "bold", size = 13, color = "#0f2942", margin = ggplot2::margin(b = 6)),
      plot.subtitle = element_text(size = 9, color = "#64748b", margin = ggplot2::margin(b = 10)),
      axis.title = element_text(face = "bold", size = 10, color = "#0f2942"),
      axis.text = element_text(size = 9, color = "#475569"),
      panel.grid.major = element_line(color = "#f1f5f9"),
      panel.grid.minor = element_blank(),
      plot.background = element_rect(fill = "#ffffff", color = NA),
      panel.background = element_rect(fill = "#ffffff", color = NA),
      legend.position = "bottom"
    )
}

#' Generate and export all required ggplot2 charts
generate_all_visualizations <- function(df, target_col = "Price_INR_Lakhs", output_dir = "visualizations") {
  if (!dir.exists(output_dir)) dir.create(output_dir, recursive = TRUE)
  saved_plots <- list()
  
  cat("--> 1. Generating Property Price Distribution Plot...\n")
  p_dist <- ggplot(df, aes(x = .data[[target_col]])) +
    geom_histogram(fill = "#2563eb", color = "#ffffff", bins = 40, alpha = 0.85) +
    geom_vline(aes(xintercept = median(.data[[target_col]], na.rm = TRUE)),
               color = "#ef4444", linetype = "dashed", linewidth = 1) +
    annotate("text", x = median(df[[target_col]], na.rm = TRUE) * 1.5, y = 5000,
             label = paste("Median:", round(median(df[[target_col]], na.rm = TRUE), 1), "Lakhs"),
             color = "#ef4444", fontface = "bold", size = 3.5) +
    labs(
      title = "Property Price Distribution (INR Lakhs)",
      subtitle = "Frequency distribution of property sale valuations across Indian urban areas",
      x = "Sale Price (INR in Lakhs)",
      y = "Number of Properties"
    ) +
    theme_dashboard()
  
  dist_file <- file.path(output_dir, "price_distribution.png")
  ggsave(dist_file, plot = p_dist, width = 7.5, height = 4.8, dpi = 300)
  saved_plots$price_distribution <- dist_file
  
  cat("--> 2. Generating Average Price by City Plot...\n")
  if ("City" %in% colnames(df)) {
    city_stats <- df %>%
      group_by(City) %>%
      summarise(Avg_Price = mean(.data[[target_col]], na.rm = TRUE), Count = n(), .groups = 'drop') %>%
      arrange(desc(Avg_Price))
    
    p_city <- ggplot(city_stats, aes(x = reorder(City, Avg_Price), y = Avg_Price)) +
      geom_col(fill = "#0f2942", width = 0.65) +
      geom_text(aes(label = sprintf("₹%.1f L", Avg_Price)), hjust = -0.15, size = 3, color = "#0f2942", fontface = "bold") +
      coord_flip() +
      scale_y_continuous(expand = expansion(mult = c(0, 0.15))) +
      labs(
        title = "Average Property Price by Indian Urban City",
        subtitle = "Comparative valuation across major urban real estate markets",
        x = "City",
        y = "Average Valuation (INR Lakhs)"
      ) +
      theme_dashboard()
    
    city_file <- file.path(output_dir, "location_price.png")
    ggsave(city_file, plot = p_city, width = 7.5, height = 4.8, dpi = 300)
    saved_plots$location_price <- city_file
  }
  
  cat("--> 3. Generating Super Area vs Price Scatter Plot...\n")
  area_col <- if ("Super_Area_SqFt" %in% colnames(df)) "Super_Area_SqFt" else "Carpet_Area_SqFt"
  if (area_col %in% colnames(df)) {
    # Sample 3,000 points for crisp visual scatter plot without clutter
    scatter_sample <- df %>% sample_n(min(3000, nrow(df)))
    p_area <- ggplot(scatter_sample, aes(x = .data[[area_col]], y = .data[[target_col]])) +
      geom_point(color = "#2563eb", alpha = 0.4, size = 1.6) +
      geom_smooth(method = "lm", color = "#ef4444", linewidth = 1.1, se = TRUE) +
      labs(
        title = "Property Area vs. Sale Price",
        subtitle = paste("Direct linear relationship between", area_col, "and Price_INR_Lakhs"),
        x = paste(area_col, "(Square Feet)"),
        y = "Price (INR Lakhs)"
      ) +
      theme_dashboard()
    
    area_file <- file.path(output_dir, "area_vs_price.png")
    ggsave(area_file, plot = p_area, width = 7.5, height = 4.8, dpi = 300)
    saved_plots$area_vs_price <- area_file
  }
  
  cat("--> 4. Generating BHK vs Price Bar Chart...\n")
  if ("BHK" %in% colnames(df)) {
    bhk_summary <- df %>%
      group_by(BHK) %>%
      summarise(Avg_Price = mean(.data[[target_col]], na.rm = TRUE), Count = n(), .groups = 'drop')
    
    p_bhk <- ggplot(bhk_summary, aes(x = factor(BHK), y = Avg_Price)) +
      geom_col(fill = "#1d4ed8", width = 0.6) +
      geom_text(aes(label = sprintf("₹%.1f L", Avg_Price)), vjust = -0.5, size = 3.2, fontface = "bold", color = "#0f2942") +
      scale_y_continuous(expand = expansion(mult = c(0, 0.15))) +
      labs(
        title = "Average Property Price by BHK (Bedroom Count)",
        subtitle = "Impact of room capacity on property valuation",
        x = "BHK (Bedrooms)",
        y = "Average Valuation (INR Lakhs)"
      ) +
      theme_dashboard()
    
    bhk_file <- file.path(output_dir, "bhk_vs_price.png")
    ggsave(bhk_file, plot = p_bhk, width = 7.5, height = 4.8, dpi = 300)
    saved_plots$bhk_vs_price <- bhk_file
  }
  
  cat("--> 5. Generating Correlation Heatmap...\n")
  num_df <- df %>% select(where(is.numeric))
  if (ncol(num_df) >= 2) {
    corr_mat <- cor(num_df, use = "complete.obs")
    melted_corr <- melt(corr_mat)
    
    p_corr <- ggplot(melted_corr, aes(x = Var1, y = Var2, fill = value)) +
      geom_tile(color = "white") +
      geom_text(aes(label = sprintf("%.2f", value)), color = "white", size = 2.8, fontface = "bold") +
      scale_fill_gradient2(low = "#ef4444", high = "#2563eb", mid = "#94a3b8", midpoint = 0, limit = c(-1, 1), name = "Pearson r") +
      labs(
        title = "Feature Correlation Heatmap",
        subtitle = "Correlation matrix across all numerical housing characteristics",
        x = "", y = ""
      ) +
      theme_dashboard() +
      theme(axis.text.x = element_text(angle = 45, hjust = 1, size = 8),
            axis.text.y = element_text(size = 8))
    
    corr_file <- file.path(output_dir, "correlation_heatmap.png")
    ggsave(corr_file, plot = p_corr, width = 8, height = 6.5, dpi = 300)
    saved_plots$correlation_heatmap <- corr_file
  }
  
  cat("All ggplot2 Visualizations generated and saved to 'visualizations/' directory.\n\n")
  return(saved_plots)
}
