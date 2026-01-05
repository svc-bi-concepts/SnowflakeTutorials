# Performance Best Practices

<div class="hero-section" markdown>
## :material-speedometer: Optimize Your Snowflake Connections

Maximize query performance from BI tools
</div>

## Overview

Performance optimization spans three layers:

1. **Snowflake Configuration** — Warehouse sizing, caching, clustering
2. **BI Tool Settings** — Connection mode, query optimization
3. **Query Design** — Efficient SQL, data modeling

---

## Snowflake Optimization

### Warehouse Sizing

Choose the right warehouse size for your workload:

| Size | Credits/Hour | Best For |
|------|-------------|----------|
| X-Small | 1 | Simple queries, testing |
| Small | 2 | Light dashboards |
| Medium | 4 | Standard BI workloads |
| Large | 8 | Complex queries, multiple users |
| X-Large+ | 16+ | Heavy analytical workloads |

```sql
-- Create dedicated BI warehouse
CREATE WAREHOUSE bi_warehouse
    WAREHOUSE_SIZE = 'MEDIUM'
    AUTO_SUSPEND = 300        -- Suspend after 5 minutes idle
    AUTO_RESUME = TRUE        -- Auto-resume on query
    INITIALLY_SUSPENDED = TRUE
    MIN_CLUSTER_COUNT = 1
    MAX_CLUSTER_COUNT = 3     -- Scale out for concurrency
    SCALING_POLICY = 'STANDARD';

-- Monitor warehouse usage
SELECT 
    WAREHOUSE_NAME,
    AVG(AVG_RUNNING) as avg_queries,
    AVG(AVG_QUEUED_LOAD) as avg_queued
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_LOAD_HISTORY
WHERE START_TIME > DATEADD(day, -7, CURRENT_TIMESTAMP())
GROUP BY WAREHOUSE_NAME;
```

### Result Caching

Leverage Snowflake's result cache for repeated queries:

```sql
-- Enable result caching (default is on)
ALTER SESSION SET USE_CACHED_RESULT = TRUE;

-- Check cache hit rate
SELECT 
    QUERY_TYPE,
    COUNT(*) as query_count,
    SUM(CASE WHEN BYTES_SCANNED = 0 THEN 1 ELSE 0 END) as cache_hits,
    ROUND(cache_hits / query_count * 100, 2) as cache_hit_pct
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE START_TIME > DATEADD(day, -1, CURRENT_TIMESTAMP())
GROUP BY QUERY_TYPE
HAVING query_count > 10
ORDER BY query_count DESC;
```

### Clustering Keys

Optimize large tables for common query patterns:

```sql
-- Add clustering to frequently filtered columns
ALTER TABLE sales CLUSTER BY (sale_date, region);

-- Check clustering depth
SELECT SYSTEM$CLUSTERING_DEPTH('sales');

-- View clustering information
SELECT SYSTEM$CLUSTERING_INFORMATION('sales');
```

### Materialized Views

Pre-compute expensive aggregations:

```sql
-- Create materialized view for common aggregations
CREATE MATERIALIZED VIEW mv_daily_sales AS
SELECT 
    DATE_TRUNC('day', sale_date) as sale_day,
    region,
    product_category,
    SUM(amount) as total_sales,
    COUNT(*) as transaction_count
FROM sales
GROUP BY 1, 2, 3;

-- Query uses materialized view automatically
SELECT * FROM mv_daily_sales WHERE sale_day >= '2024-01-01';
```

---

## BI Tool Optimization

### Connection Mode Selection

| Mode | Performance | Data Freshness | Best For |
|------|-------------|----------------|----------|
| **Import/Extract** | :zap: Fastest | Scheduled refresh | Dashboards, exploration |
| **DirectQuery/Live** | :warning: Variable | Real-time | Large datasets, RLS |

#### When to Use Import/Extract

- Dashboard requires fast response
- Data doesn't change frequently
- Complex calculations in BI tool
- Offline access needed

#### When to Use DirectQuery/Live

- Data must be real-time
- Dataset too large for import
- Row-level security required
- Minimize data duplication

### Tableau Optimization

**Extract Optimization:**

```sql
-- Create optimized view for Tableau extract
CREATE VIEW tableau_sales_extract AS
SELECT 
    sale_date,
    region,
    product_id,
    customer_id,
    quantity,
    amount
FROM sales
WHERE sale_date >= DATEADD(year, -2, CURRENT_DATE());
```

**Initial SQL for Performance:**

```sql
-- Set session parameters for Tableau
ALTER SESSION SET STATEMENT_TIMEOUT_IN_SECONDS = 3600;
USE WAREHOUSE tableau_wh;
USE ROLE tableau_analyst;
```

**Best Practices:**

1. Use extracts for complex visualizations
2. Filter data at source level
3. Limit dimensions in views
4. Avoid table calculations on large datasets
5. Use Tableau's performance recorder

### Power BI Optimization

**Query Folding:**

Ensure transformations push to Snowflake:

```powerquery
// Good: Folds to Snowflake
let
    Source = Snowflake.Databases("account.snowflakecomputing.com", "WAREHOUSE"),
    DB = Source{[Name="ANALYTICS"]}[Data],
    Schema = DB{[Name="PUBLIC"]}[Data],
    Table = Schema{[Name="SALES"]}[Data],
    Filtered = Table.SelectRows(Table, each [SALE_DATE] > #date(2024, 1, 1))
in
    Filtered
```

**DirectQuery Settings:**

1. Enable **Query reduction** in options
2. Use **Aggregations** for large tables
3. Limit visuals per page
4. Avoid bi-directional relationships

### Excel Optimization

**Efficient Queries:**

```sql
-- Use SQL query instead of loading entire table
SELECT 
    region,
    product,
    SUM(sales) as total_sales
FROM sales
WHERE year = 2024
GROUP BY region, product
ORDER BY total_sales DESC
LIMIT 1000;
```

---

## Query Design

### Efficient SQL Patterns

**Select Only Needed Columns:**

```sql
-- Bad: SELECT *
SELECT * FROM customers;

-- Good: Select specific columns
SELECT customer_id, name, email FROM customers;
```

**Filter Early:**

```sql
-- Bad: Filter after join
SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date > '2024-01-01';

-- Good: Filter before join (if applicable)
WITH recent_orders AS (
    SELECT * FROM orders WHERE order_date > '2024-01-01'
)
SELECT * FROM recent_orders o
JOIN customers c ON o.customer_id = c.id;
```

**Use Appropriate Aggregations:**

```sql
-- Aggregate before joining when possible
WITH order_summary AS (
    SELECT customer_id, SUM(amount) as total
    FROM orders
    GROUP BY customer_id
)
SELECT c.name, os.total
FROM customers c
JOIN order_summary os ON c.id = os.customer_id;
```

### Create Optimized Views

```sql
-- Create view for BI tools with common filters
CREATE VIEW bi_sales_summary AS
SELECT 
    DATE_TRUNC('day', sale_date) as sale_day,
    region,
    product_category,
    SUM(quantity) as units_sold,
    SUM(amount) as revenue,
    COUNT(DISTINCT customer_id) as unique_customers
FROM sales
WHERE sale_date >= DATEADD(year, -2, CURRENT_DATE())
GROUP BY 1, 2, 3;

-- Create secure view for row-level security
CREATE SECURE VIEW bi_sales_by_region AS
SELECT * FROM bi_sales_summary
WHERE region IN (SELECT allowed_region FROM user_access WHERE user_email = CURRENT_USER());
```

---

## Monitoring Performance

### Query Performance Dashboard

```sql
-- Top slow queries
SELECT 
    QUERY_ID,
    USER_NAME,
    WAREHOUSE_NAME,
    EXECUTION_TIME / 1000 as exec_seconds,
    BYTES_SCANNED / 1e9 as gb_scanned,
    QUERY_TEXT
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE START_TIME > DATEADD(day, -1, CURRENT_TIMESTAMP())
    AND EXECUTION_TIME > 30000  -- Over 30 seconds
ORDER BY EXECUTION_TIME DESC
LIMIT 20;

-- Warehouse utilization
SELECT 
    WAREHOUSE_NAME,
    DATE_TRUNC('hour', START_TIME) as hour,
    AVG(AVG_RUNNING) as avg_concurrent_queries,
    MAX(QUEUED_LOAD) as max_queued
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_LOAD_HISTORY
WHERE START_TIME > DATEADD(day, -7, CURRENT_TIMESTAMP())
GROUP BY 1, 2
ORDER BY 1, 2;
```

### Query Profiler

Use Snowflake's query profiler for optimization:

```sql
-- View query profile
SELECT * FROM TABLE(GET_QUERY_OPERATOR_STATS(LAST_QUERY_ID()));

-- Analyze specific query
SELECT * FROM TABLE(GET_QUERY_OPERATOR_STATS('01abc123-...'));
```

---

## Performance Checklist

### Snowflake Setup

- [ ] Appropriate warehouse size selected
- [ ] Auto-suspend configured (5-10 minutes)
- [ ] Result caching enabled
- [ ] Clustering keys on large tables
- [ ] Materialized views for common aggregations

### BI Tool Configuration

- [ ] Correct connection mode (Import vs DirectQuery)
- [ ] Query optimization enabled
- [ ] Appropriate refresh schedules
- [ ] Limited visuals per dashboard

### Query Design

- [ ] Select only needed columns
- [ ] Filter at source level
- [ ] Pre-aggregate when possible
- [ ] Optimize joins
- [ ] Test and profile queries

---

## Common Performance Issues

??? question "Queries are slow"
    **Solutions:**
    
    1. Scale up warehouse size
    2. Check clustering on filtered columns
    3. Review query profile for bottlenecks
    4. Use materialized views
    5. Add filters to reduce data scanned

??? question "Dashboard takes long to load"
    **Solutions:**
    
    1. Switch to Import/Extract mode
    2. Reduce visuals per page
    3. Pre-aggregate data in Snowflake
    4. Use incremental refresh
    5. Check warehouse isn't suspended

??? question "Warehouse queuing queries"
    **Solutions:**
    
    1. Enable multi-cluster warehouse
    2. Separate warehouses by workload
    3. Schedule heavy queries off-peak
    4. Increase warehouse size
    5. Optimize slow queries

??? question "High Snowflake costs"
    **Solutions:**
    
    1. Review warehouse auto-suspend settings
    2. Use smaller warehouse for simple queries
    3. Schedule extracts during off-peak
    4. Optimize expensive queries
    5. Use result caching effectively

---

## Quick Reference

### Warehouse Sizing Guide

| Concurrent Users | Light Queries | Heavy Queries |
|-----------------|---------------|---------------|
| 1-5 | X-Small/Small | Medium |
| 5-20 | Small/Medium | Large |
| 20-50 | Medium/Large | X-Large |
| 50+ | Multi-cluster | Multi-cluster |

### Key SQL Commands

```sql
-- Suspend/resume warehouse
ALTER WAREHOUSE bi_wh SUSPEND;
ALTER WAREHOUSE bi_wh RESUME;

-- Scale warehouse
ALTER WAREHOUSE bi_wh SET WAREHOUSE_SIZE = 'LARGE';

-- Check current warehouse
SELECT CURRENT_WAREHOUSE();

-- View query history
SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE START_TIME > DATEADD(hour, -1, CURRENT_TIMESTAMP())
ORDER BY START_TIME DESC;
```

---

## Next Steps

- **[Security Best Practices](security.md)** — Secure configuration
- **[Troubleshooting](../troubleshooting.md)** — Common issues
- **[Tableau Guide](../bi-tools/tableau.md)** — Tool-specific optimization

