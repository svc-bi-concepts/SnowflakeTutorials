# Power BI Connection Guide

<div class="hero-section" markdown>
## :material-chart-box: Connect Power BI to Snowflake

Complete guide for Power BI Desktop and Service on Windows (with Mac alternatives)
</div>

## Overview

Power BI integrates with Snowflake through both DirectQuery and Import modes. While Power BI Desktop is Windows-only, the Power BI Service works on any platform.

### Platform Support

| Component | Windows | macOS | Web |
|-----------|:-------:|:-----:|:---:|
| **Power BI Desktop** | :white_check_mark: Full | :x: Not Available | :x: N/A |
| **Power BI Service** | :white_check_mark: Full | :white_check_mark: Full | :white_check_mark: Full |
| **Power BI Mobile** | :white_check_mark: | :white_check_mark: | N/A |

### Authentication Support

| Method | Power BI Desktop | Power BI Service |
|--------|:----------------:|:----------------:|
| Username/Password | :white_check_mark: | :white_check_mark: |
| OAuth (Azure AD) | :white_check_mark: | :white_check_mark: |
| SSO | :white_check_mark: | :white_check_mark: |
| Key-Pair | :x: | :x: |

!!! warning "No Key-Pair Support"
    Power BI does not support key-pair authentication for Snowflake. Use OAuth/SSO for secure connections.

---

## Quick Start (Windows)

### Step 1: Open Power BI and Get Data

1. Launch **Power BI Desktop**
2. Click **Get Data** → **Database** → **Snowflake**
3. Click **Connect**

### Step 2: Enter Connection Details

| Field | Description | Example |
|-------|-------------|---------|
| **Server** | Snowflake account URL | `xy12345.us-east-1.snowflakecomputing.com` |
| **Warehouse** | Compute warehouse | `ANALYTICS_WH` |
| **Database** | Optional default | `ANALYTICS` |

### Step 3: Choose Data Connectivity Mode

| Mode | Description | Best For |
|------|-------------|----------|
| **Import** | Loads data into Power BI | Small-medium datasets, fast dashboards |
| **DirectQuery** | Queries Snowflake live | Large datasets, real-time data |

### Step 4: Authenticate

Select authentication method and enter credentials.

---

## Authentication Methods

=== "Username & Password"

    ### Database Authentication
    
    <span class="security-badge security-low">Basic Security</span>
    
    !!! danger "Not for Production - MFA Required"
        **Snowflake is requiring MFA (Multi-Factor Authentication) for all accounts.** Username and password authentication is **not suitable for production environments** because:
        
        - MFA will be required, which breaks automated connections and scheduled refreshes
        - Credentials stored in connection files pose security risks
        - No centralized identity management
        
        **Use OAuth/SSO or Programmatic Access Tokens for production environments.**
    
    **Configuration:**
    
    !!! warning "Test/Development Only"
        This method should only be used for test/development accounts, not production.
    
    1. In authentication dialog, select **Database**
    2. Enter:
        - **User name**: Your Snowflake username
        - **Password**: Your Snowflake password
    3. Click **Connect**
    
    <div class="pros-cons-grid" markdown>
    <div class="pros-box" markdown>
    #### Pros
    - Simple and fast setup
    - Works immediately
    - No additional configuration
    </div>
    <div class="cons-box" markdown>
    #### Cons
    - Less secure
    - Credentials stored in report
    - MFA may cause issues
    - Not recommended for production
    </div>
    </div>
    
    !!! warning "Scheduled Refresh with MFA"
        If MFA is enabled, scheduled refreshes in Power BI Service will fail. Use OAuth/SSO instead.

=== "OAuth / SSO"

    ### Microsoft Entra ID (Azure AD) SSO
    
    <span class="security-badge security-high">High Security</span>
    
    Use your organizational Azure AD credentials for seamless SSO.
    
    **Prerequisites:**
    
    1. Snowflake configured for Azure AD OAuth
    2. Power BI and Snowflake in same Azure tenant (or federated)
    3. Matching user identities
    
    **Power BI Desktop Configuration:**
    
    1. Select **Microsoft Account** authentication
    2. Click **Sign in**
    3. Complete Azure AD authentication
    4. MFA handled automatically if configured
    
    **Power BI Service SSO:**
    
    When using DirectQuery, users authenticate with their own credentials:
    
    1. Publish report to Power BI Service
    2. Configure data source settings:
        - **Gateway** → Not required for SSO
        - **Authentication method** → OAuth2
        - **SSO** → Enable "Use SSO via Azure AD"
    
    <div class="pros-cons-grid" markdown>
    <div class="pros-box" markdown>
    #### Pros
    - Enterprise-grade security
    - Native MFA support
    - Single sign-on experience
    - Centralized user management
    - Audit trail via Azure AD
    </div>
    <div class="cons-box" markdown>
    #### Cons
    - Requires Azure AD configuration
    - Snowflake OAuth setup needed
    - Token expiration handling
    - More complex initial setup
    </div>
    </div>

=== "AAD with DirectQuery"

    ### AAD SSO for DirectQuery
    
    Enable row-level security with user identity passthrough.
    
    **Snowflake Configuration:**
    
    ```sql
    -- Create Azure AD OAuth integration
    CREATE OR REPLACE SECURITY INTEGRATION powerbi_aad_oauth
        TYPE = EXTERNAL_OAUTH
        ENABLED = TRUE
        EXTERNAL_OAUTH_TYPE = AZURE
        EXTERNAL_OAUTH_ISSUER = 'https://sts.windows.net/<tenant-id>/'
        EXTERNAL_OAUTH_JWS_KEYS_URL = 'https://login.microsoftonline.com/<tenant-id>/discovery/v2.0/keys'
        EXTERNAL_OAUTH_AUDIENCE_LIST = ('https://<account>.snowflakecomputing.com')
        EXTERNAL_OAUTH_TOKEN_USER_MAPPING_CLAIM = 'upn'
        EXTERNAL_OAUTH_SNOWFLAKE_USER_MAPPING_ATTRIBUTE = 'login_name';
    ```
    
    **Power BI Service Configuration:**
    
    1. Go to **Power BI Admin Portal**
    2. Navigate to **Tenant settings**
    3. Enable **Snowflake SSO** option
    4. Configure allowed domains
    
    **Benefits:**
    
    - User identity flows to Snowflake
    - Snowflake RBAC applies per user
    - Audit logs show actual user
    - No shared service account

---

## macOS Users

Power BI Desktop is not available for macOS. Here are your options:

### Option 1: Power BI Service (Web)

:white_check_mark: **Recommended for viewing and basic editing**

1. Go to [app.powerbi.com](https://app.powerbi.com)
2. Sign in with organizational account
3. View reports and dashboards
4. Create reports using web authoring

**Limitations:**

- Cannot create complex data models
- Limited Power Query capabilities
- No custom visuals development

### Option 2: Virtual Machine

:white_check_mark: **Full Power BI Desktop experience**

| Solution | Cost | Performance |
|----------|------|-------------|
| **Parallels Desktop** | ~$100/year | Excellent |
| **VMware Fusion** | ~$200 one-time | Excellent |
| **UTM** (free) | Free | Good |

**Setup:**

1. Install VM software
2. Install Windows 11
3. Install Power BI Desktop
4. Connect to Snowflake normally

### Option 3: Azure Virtual Desktop

:white_check_mark: **Cloud-based Windows desktop**

1. Set up Azure Virtual Desktop
2. Access via web browser or app
3. Use Power BI Desktop remotely
4. Data stays in cloud (security benefit)

### Option 4: Use Tableau Instead

Consider [Tableau](tableau.md) which has native macOS support with full functionality.

---

## Connection Modes

### Import Mode

Data is loaded into Power BI's in-memory engine.

```mermaid
graph LR
    A(Snowflake) -->|Scheduled Refresh| B(Power BI Dataset)
    B --> C(Reports/Dashboards)
    style B fill:#f9f,stroke:#333
```

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### When to Use Import
- Dataset < 1 GB
- Dashboard performance is priority
- Data doesn't change frequently
- Complex DAX calculations needed
- Offline access required
</div>
<div class="cons-box" markdown>
#### Import Limitations
- Data refresh required
- Memory constraints
- Dataset size limits
- Stale data between refreshes
- Storage costs (Power BI Service)
</div>
</div>

### DirectQuery Mode

Queries are sent to Snowflake in real-time.

```mermaid
graph LR
    A(Report View) -->|Query| B(Snowflake)
    B -->|Results| A
    style B fill:#9cf,stroke:#333
```

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### When to Use DirectQuery
- Large datasets (> 1 GB)
- Real-time data required
- Security rules in Snowflake
- SSO with user identity
- Compliance requirements
</div>
<div class="cons-box" markdown>
#### DirectQuery Limitations
- Slower than Import
- DAX limitations
- Requires running warehouse
- No offline access
- Query costs to Snowflake
</div>
</div>

### Hybrid (Composite Models)

Combine Import and DirectQuery for optimal performance.

```sql
-- Example: Import dimensions, DirectQuery facts
-- Dimension tables: Imported (fast lookups)
-- Fact tables: DirectQuery (real-time, large)
```

---

## Performance Optimization

### Snowflake Best Practices

```sql
-- Create dedicated warehouse for Power BI
CREATE WAREHOUSE powerbi_wh
    WAREHOUSE_SIZE = 'MEDIUM'
    AUTO_SUSPEND = 120
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE;

-- Enable result caching
ALTER SESSION SET USE_CACHED_RESULT = TRUE;

-- Create aggregation tables for common queries
CREATE TABLE monthly_sales_agg AS
SELECT 
    DATE_TRUNC('month', sale_date) as month,
    SUM(amount) as total_sales,
    COUNT(*) as transaction_count
FROM sales
GROUP BY 1;
```

### Power BI Best Practices

1. **Limit Columns and Rows**
   - Select only needed columns
   - Apply filters at source

2. **Use Query Folding**
   - Ensure transformations fold to Snowflake
   - Check query folding indicators

3. **Optimize DAX**
   - Prefer measures over calculated columns
   - Use variables for complex calculations

4. **DirectQuery Optimization**
   - Limit visuals per page
   - Use aggregations
   - Enable query reduction

---

## Gateway Configuration

For on-premises data gateway (if needed):

!!! info "Gateway Not Required for Direct Cloud Connection"
    Power BI Service can connect directly to Snowflake without a gateway for most scenarios.

### When Gateway is Needed

- Private Link connections
- Network restrictions
- Hybrid data sources
- Custom proxy requirements

### Gateway Setup

1. Install **On-premises data gateway**
2. Configure Snowflake connection
3. Add to Power BI Service workspace
4. Map data source to gateway

---

## Row-Level Security

### Snowflake RLS with Power BI SSO

When using SSO, Snowflake's native security applies:

```sql
-- Create secure view with RLS
CREATE SECURE VIEW sales_rls AS
SELECT *
FROM sales
WHERE region = (
    SELECT region 
    FROM user_regions 
    WHERE user_email = CURRENT_USER()
);

-- Grant access to view
GRANT SELECT ON sales_rls TO ROLE powerbi_users;
```

### Power BI RLS

Alternatively, implement RLS in Power BI:

1. Create roles in Power BI Desktop
2. Define DAX filters
3. Assign users to roles in Service

```dax
// DAX filter for Sales Manager role
[Region] = USERPRINCIPALNAME()
```

---

## Troubleshooting

??? question "Error: Cannot connect to Snowflake"
    **Solutions:**
    
    1. Verify account URL format
    2. Check network connectivity
    3. Test credentials in Snowflake web UI
    4. Ensure warehouse is not suspended
    5. Verify firewall allows outbound 443

??? question "DirectQuery is slow"
    **Solutions:**
    
    1. Scale up Snowflake warehouse
    2. Add clustering keys to tables
    3. Reduce visuals per page
    4. Use aggregation tables
    5. Enable query reduction in Power BI

??? question "Scheduled refresh fails"
    **Solutions:**
    
    1. Check credentials haven't expired
    2. For MFA accounts, use OAuth
    3. Verify gateway connectivity (if used)
    4. Check data source configuration
    5. Review error in refresh history

??? question "SSO not passing user identity"
    **Solutions:**
    
    1. Verify Azure AD OAuth setup in Snowflake
    2. Check user mapping configuration
    3. Ensure user exists in both systems
    4. Use DirectQuery mode (required for SSO)
    5. Check tenant settings in Power BI Admin

---

## Quick Reference

### Connection Parameters

| Parameter | Value |
|-----------|-------|
| Server | `account.region.snowflakecomputing.com` |
| Warehouse | Your Snowflake warehouse |
| Database | Your database (optional) |
| Role | Your role (via Advanced Options) |

### Required Snowflake Permissions

```sql
-- Minimum permissions for Power BI users
GRANT USAGE ON WAREHOUSE powerbi_wh TO ROLE powerbi_role;
GRANT USAGE ON DATABASE analytics TO ROLE powerbi_role;
GRANT USAGE ON SCHEMA analytics.public TO ROLE powerbi_role;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics.public TO ROLE powerbi_role;
```

---

## Next Steps

- **[Excel Guide](excel.md)** — Connect Excel to Snowflake
- **[Security Best Practices](../best-practices/security.md)** — Security recommendations
- **[macOS Guide](../platforms/macos.md)** — More Mac-specific options

