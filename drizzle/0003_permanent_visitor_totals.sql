CREATE TABLE analytics_visitor_totals (
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  first_referrer TEXT NOT NULL,
  visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country, region, first_referrer)
);

-- Preserve all visitor counts still present when upgrading the live database.
INSERT INTO analytics_visitor_totals(day,country,region,first_referrer,visitors)
SELECT day,country,region,first_referrer,COUNT(*)
FROM analytics_visitors
GROUP BY day,country,region,first_referrer;
