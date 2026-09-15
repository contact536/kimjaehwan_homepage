ALTER TABLE analytics_visitors ADD COLUMN region TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_analytics_visitors_day_region ON analytics_visitors(day, country, region);
