CREATE TABLE analytics_visitors (
  day TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  first_referrer TEXT NOT NULL,
  country TEXT NOT NULL,
  PRIMARY KEY (day, visitor_hash)
);
CREATE TABLE analytics_daily (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT NOT NULL,
  country TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path, referrer, country)
);
CREATE INDEX idx_analytics_daily_day ON analytics_daily(day);
