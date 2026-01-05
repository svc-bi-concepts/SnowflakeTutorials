# Excel Connection Guide

<div class="hero-section" markdown>
## :material-table: Connect Excel to Snowflake

Access Snowflake data directly in Excel via ODBC on Windows and macOS
</div>

## Overview

Excel connects to Snowflake through ODBC (Open Database Connectivity), allowing you to:

- Pull data directly into spreadsheets
- Create PivotTables from Snowflake data
- Build reports with live data connections
- Use Power Query for data transformation

### Platform Comparison

| Feature | Windows | macOS |
|---------|:-------:|:-----:|
| **ODBC Connection** | :white_check_mark: Full | :white_check_mark: Full |
| **Power Query** | :white_check_mark: Full | :warning: Limited |
| **Pivot Tables** | :white_check_mark: Full | :white_check_mark: Full |
| **Refresh Data** | :white_check_mark: Full | :white_check_mark: Full |
| **OAuth Support** | :white_check_mark: Via ODBC | :x: No |
| **Key-Pair Auth** | :white_check_mark: Via ODBC | :white_check_mark: Via ODBC |

!!! success "OAuth Now Supported on Windows"
    Excel on Windows supports OAuth via ODBC using Snowflake's built-in `LOCAL_APPLICATION` integration. See the [OAuth via ODBC](#oauth-via-odbc-windows) section below.

---

## Prerequisites

### Install Snowflake ODBC Driver

=== "Windows"

    1. Download from [Snowflake ODBC Downloads](https://developers.snowflake.com/odbc/)
    2. Choose **64-bit** version (matching your Excel)
    3. Run the installer (`snowflake_odbc_win64.msi`)
    4. Complete the installation wizard
    
    **Verify Installation:**
    
    1. Open **ODBC Data Source Administrator (64-bit)**
       - Press `Win + R`, type `odbcad32.exe`
    2. Go to **Drivers** tab
    3. Confirm **SnowflakeDSIIDriver** is listed

=== "macOS"

    1. Download from [Snowflake ODBC Downloads](https://developers.snowflake.com/odbc/)
    2. Choose the `.pkg` installer
    3. Open and follow installation prompts
    4. Driver installs to `/opt/snowflake/snowflakeodbc/`
    
    **Verify Installation:**
    
    ```bash
    # Check driver exists
    ls /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
    ```
    
    **Install iODBC Driver Manager:**
    
    ```bash
    # Via Homebrew
    brew install libiodbc
    ```

---

## Windows Configuration

### Method 1: Create ODBC Data Source (DSN)

**Step 1: Open ODBC Administrator**

1. Press `Win + R`
2. Type `odbcad32.exe` → Enter
3. Select **User DSN** or **System DSN** tab

**Step 2: Create New Data Source**

1. Click **Add**
2. Select **SnowflakeDSIIDriver** → **Finish**
3. Configure the connection:

| Field | Value | Required |
|-------|-------|:--------:|
| **Data Source** | `Snowflake_Analytics` | Yes |
| **Server** | `account.snowflakecomputing.com` | Yes |
| **Database** | `ANALYTICS` | Optional |
| **Schema** | `PUBLIC` | Optional |
| **Warehouse** | `COMPUTE_WH` | Optional |
| **Role** | `ANALYST_ROLE` | Optional |
| **Authenticator** | (leave blank for password) | Optional |

4. Click **Test** to verify connection
5. Click **OK** to save

**Step 3: Connect from Excel**

1. Open **Excel**
2. Go to **Data** → **Get Data** → **From Other Sources** → **From ODBC**
3. Select your DSN from dropdown
4. Click **OK**
5. Enter **Username** and **Password**
6. Select tables/views → **Load**

### Method 2: Connection String (DSN-less)

Connect without pre-configured DSN:

1. **Data** → **Get Data** → **From Other Sources** → **From ODBC**
2. Choose **Advanced options**
3. Enter connection string:

```
Driver={SnowflakeDSIIDriver};
Server=account.snowflakecomputing.com;
Database=ANALYTICS;
Schema=PUBLIC;
Warehouse=COMPUTE_WH;
UID=your_username;
PWD=your_password;
```

---

## macOS Configuration

### Step 1: Configure ODBC Files

Create or edit `~/.odbc.ini`:

```ini
[Snowflake]
Description = Snowflake Analytics Connection
Driver = /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
Server = account.snowflakecomputing.com
Database = ANALYTICS
Schema = PUBLIC
Warehouse = COMPUTE_WH
Role = ANALYST_ROLE
```

Create or edit `~/.odbcinst.ini`:

```ini
[Snowflake]
Description = Snowflake ODBC Driver
Driver = /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
```

### Step 2: Connect from Excel for Mac

1. Open **Excel**
2. Go to **Data** → **Get Data (Power Query)** → **From Database** → **From ODBC**
3. Enter connection string:

```
DSN=Snowflake;UID=your_username;PWD=your_password
```

4. Click **OK**
5. Select data and click **Load**

!!! note "macOS Excel Limitations"
    Excel for Mac has limited Power Query support compared to Windows. For complex transformations, consider:
    
    - Using Windows Excel via VM
    - Using Tableau (native Mac support)
    - Exporting data from Snowflake directly

---

## Authentication Methods

=== "OAuth via ODBC (Windows)"

    ### Snowflake OAuth with LOCAL_APPLICATION
    
    <span class="security-badge security-high">High Security</span>
    
    Use Snowflake's built-in OAuth integration for secure, browser-based authentication on Windows.
    
    !!! success "Recommended for Interactive Users"
        This method leverages Snowflake's native OAuth and opens a browser for secure sign-in. Ideal for interactive Excel users who want SSO without storing passwords.
    
    **Prerequisites:**
    
    - Snowflake ODBC Driver installed (64-bit)
    - Network access to your Snowflake account URL
    
    ---
    
    #### Step 1: Enable Snowflake Local Application OAuth
    
    Verify the built-in OAuth integration is enabled in Snowflake:
    
    ```sql
    -- Description: Confirm the built-in OAuth integration for local applications is enabled.
    DESC SECURITY INTEGRATION "SNOWFLAKE$LOCAL_APPLICATION";
    ```
    
    If `ENABLED` is not `true`, enable it:
    
    ```sql
    -- Description: Enable Snowflake's built-in OAuth integration used by ODBC local OAuth flows.
    USE ROLE SECURITYADMIN;
    
    ALTER SECURITY INTEGRATION "SNOWFLAKE$LOCAL_APPLICATION"
      SET ENABLED = TRUE;
    ```
    
    ---
    
    #### Step 2: Create Windows System DSN
    
    1. Open **ODBC Data Sources (64-bit)** from the Start Menu
    2. Go to **System DSN** → **Add** (or **Configure** existing)
    3. Choose the **Snowflake ODBC Driver**
    4. Configure the **Main** section:
    
    | Field | Value |
    |-------|-------|
    | **User** | Your Snowflake user (e.g., `your.email@company.com`) |
    | **Server** | `<your-account>.snowflakecomputing.com` |
    | **Authenticator** | `oauth_authorization_code` |
    | **Password** | *Leave empty* |
    | **Warehouse** | *(Optional)* Your warehouse name |
    | **Role** | *(Optional)* Leave empty — role is driven by scope |
    
    5. Configure the **OAuth** section:
    
    | Field | Value |
    |-------|-------|
    | **Client Id** | `LOCAL_APPLICATION` |
    | **Client Secret** | `LOCAL_APPLICATION` |
    | **Scope** | `session:role:PUBLIC` (or `session:role:<ROLE_NAME>`) |
    | **Authorization URL** | `https://<your-account>.snowflakecomputing.com/oauth/authorize` |
    | **Token Request URL** | `https://<your-account>.snowflakecomputing.com/oauth/token-request` |
    | **Redirect URI** | *Leave empty* (unless required by driver UI) |
    
    6. Click **Test...**
    7. A browser window opens → complete sign-in → DSN test succeeds
    
    ---
    
    #### Step 3: Connect from Excel
    
    1. Open **Excel**
    2. Go to **Data** → **Get Data** → **From Other Sources** → **From ODBC**
    3. Select your OAuth-configured DSN
    4. Click **OK**
    5. Browser opens for authentication → sign in
    6. Select tables/views → **Load**
    
    ---
    
    #### OAuth Scope Reference
    
    | Scope | Description |
    |-------|-------------|
    | `session:role:PUBLIC` | Use the PUBLIC role (good for initial testing) |
    | `session:role:<ROLE_NAME>` | Use a specific role (e.g., `session:role:ANALYST_ROLE`) |
    
    !!! tip "Least Privilege"
        For production, create a dedicated Snowflake role for Excel users and set the scope to `session:role:<EXCEL_ROLE>`.
    
    <div class="pros-cons-grid" markdown>
    <div class="pros-box" markdown>
    #### Pros
    - No password stored in DSN
    - Leverages Snowflake OAuth
    - Browser-based secure sign-in
    - Works with corporate SSO (if configured)
    </div>
    <div class="cons-box" markdown>
    #### Cons
    - Windows only
    - Requires browser interaction
    - Not suitable for unattended refresh
    - Initial setup complexity
    </div>
    </div>

=== "Key-Pair Authentication"

    ### Key-Pair (JWT) Authentication
    
    <span class="security-badge security-high">High Security</span>
    
    For secure, password-less connections.
    
    **Prerequisites:**
    
    - RSA key pair generated ([see guide](../authentication/key-pair.md))
    - Public key registered in Snowflake
    
    **DSN Configuration:**
    
    | Field | Value |
    |-------|-------|
    | Authenticator | `SNOWFLAKE_JWT` |
    | Private Key File | Path to `.p8` file |
    | Private Key Password | Passphrase (if encrypted) |
    
    **Connection String:**
    
    ```
    Driver={SnowflakeDSIIDriver};
    Server=account.snowflakecomputing.com;
    Database=ANALYTICS;
    UID=your_username;
    AUTHENTICATOR=SNOWFLAKE_JWT;
    PRIV_KEY_FILE=C:\path\to\rsa_key.p8;
    PRIV_KEY_FILE_PWD=your_passphrase;
    ```
    
    <div class="pros-cons-grid" markdown>
    <div class="pros-box" markdown>
    #### Pros
    - No password stored
    - Strongest security
    - Good for automation
    </div>
    <div class="cons-box" markdown>
    #### Cons
    - Complex setup
    - Key management needed
    - Technical expertise required
    </div>
    </div>

=== "SSO (Browser-Based)"

    ### External Browser SSO
    
    <span class="security-badge security-medium">Medium Security</span>
    
    Opens browser for IdP authentication.
    
    **Connection String:**
    
    ```
    Driver={SnowflakeDSIIDriver};
    Server=account.snowflakecomputing.com;
    Database=ANALYTICS;
    UID=your_username;
    AUTHENTICATOR=externalbrowser;
    ```
    
    !!! warning "Limitations"
        Browser-based auth requires user interaction and may not work well for:
        
        - Scheduled refreshes
        - Background data updates
        - Automated processes

=== "Username & Password"

    ### Basic Authentication
    
    <span class="security-badge security-low">Basic Security</span>
    
    !!! warning "For Test Accounts Only"
        This method is recommended only for test/development accounts. Use OAuth, Key-Pair, or SSO for production environments.
    
    **DSN Configuration:**
    
    Leave `Authenticator` field blank in DSN setup.
    
    **Connection String:**
    
    ```
    Driver={SnowflakeDSIIDriver};
    Server=account.snowflakecomputing.com;
    Database=ANALYTICS;
    UID=your_username;
    PWD=your_password;
    ```
    
    <div class="pros-cons-grid" markdown>
    <div class="pros-box" markdown>
    #### Pros
    - Simple setup
    - Works on all platforms
    - Familiar workflow
    </div>
    <div class="cons-box" markdown>
    #### Cons
    - Password stored in connection
    - Less secure
    - MFA not supported
    - Not recommended for production
    </div>
    </div>

---

## Power Query Integration (Windows)

Power Query provides advanced data transformation capabilities.

### Connect via Power Query

1. **Data** → **Get Data** → **From Other Sources** → **From ODBC**
2. Select your DSN
3. Click **Transform Data** (instead of Load)
4. Power Query Editor opens

### Common Transformations

```powerquery
// Example: Filter and transform Snowflake data
let
    Source = Odbc.DataSource("DSN=Snowflake", [HierarchicalNavigation=true]),
    Analytics = Source{[Name="ANALYTICS"]}[Data],
    PUBLIC = Analytics{[Name="PUBLIC"]}[Data],
    Sales = PUBLIC{[Name="SALES"]}[Data],
    
    // Filter recent data
    FilteredRows = Table.SelectRows(Sales, each [ORDER_DATE] > #date(2024, 1, 1)),
    
    // Add calculated column
    AddedColumn = Table.AddColumn(FilteredRows, "Revenue", each [QUANTITY] * [UNIT_PRICE])
in
    AddedColumn
```

### Query Folding

For best performance, ensure transformations "fold" to Snowflake:

```powerquery
// Good: Folds to Snowflake (SQL executed on server)
= Table.SelectRows(Source, each [Region] = "North America")

// Check folding: Right-click step → "View Native Query"
// If available, the step folds to Snowflake SQL
```

---

## Refreshing Data

### Manual Refresh

1. Click on the data table
2. Go to **Data** → **Refresh All** (or `Ctrl + Alt + F5`)

### Automatic Refresh

Power Query connections can be set to refresh:

1. **Data** → **Queries & Connections**
2. Right-click connection → **Properties**
3. Configure:
   - Refresh every X minutes
   - Refresh when file opens
   - Background refresh

!!! warning "Credentials and Refresh"
    Automatic refresh requires saved credentials. For Key-Pair auth, the private key path must be accessible.

---

## Performance Tips

### Optimize Snowflake Queries

```sql
-- Create views for common Excel reports
CREATE VIEW excel_sales_summary AS
SELECT 
    DATE_TRUNC('month', order_date) as month,
    region,
    SUM(amount) as total_sales
FROM sales
WHERE order_date >= DATEADD(year, -1, CURRENT_DATE())
GROUP BY 1, 2;
```

### Excel Best Practices

1. **Limit Data Volume**
   - Use filters in Power Query
   - Select only needed columns
   - Avoid `SELECT *`

2. **Use Native SQL**
   ```sql
   -- Write efficient SQL in Power Query
   = Odbc.Query("DSN=Snowflake", "SELECT * FROM sales WHERE date > '2024-01-01' LIMIT 100000")
   ```

3. **Cache Results**
   - For static data, save as Excel table
   - Refresh only when needed

---

## Common Use Cases

### PivotTable from Snowflake

1. **Insert** → **PivotTable**
2. Choose **From External Data Source**
3. Select your ODBC connection
4. Write SQL query or select table
5. Build PivotTable as usual

### Parameterized Queries

Create dynamic queries with Excel cell references:

```powerquery
// In Power Query, reference Excel named range
let
    DateParam = Excel.CurrentWorkbook(){[Name="StartDate"]}[Content]{0}[Column1],
    Source = Odbc.Query("DSN=Snowflake", 
        "SELECT * FROM sales WHERE order_date >= '" & Text.From(DateParam) & "'")
in
    Source
```

---

## Troubleshooting

??? question "Error: ODBC driver not found"
    **Solutions:**
    
    1. Verify driver installation
    2. Match Excel bit version (32/64) with driver
    3. Reinstall Snowflake ODBC driver
    4. Check ODBC Administrator for driver listing

??? question "Error: Connection failed"
    **Solutions:**
    
    1. Test DSN in ODBC Administrator
    2. Verify server URL format
    3. Check network/firewall
    4. Verify credentials work in Snowflake UI

??? question "Error: Data too large"
    **Solutions:**
    
    1. Add WHERE clause to limit data
    2. Use aggregations in SQL
    3. Create summary views in Snowflake
    4. Increase Excel memory allocation

??? question "macOS: Excel not finding driver"
    **Solutions:**
    
    1. Verify `~/.odbc.ini` exists
    2. Check driver path in odbcinst.ini
    3. Ensure iODBC is installed
    4. Verify file permissions

??? question "Refresh fails with stored credentials"
    **Solutions:**
    
    1. Re-enter credentials in Data Source Settings
    2. Check key file path for Key-Pair auth
    3. Verify Snowflake user not locked
    4. Test connection manually first

??? question "OAuth: Browser doesn't open or test fails"
    **Solutions:**
    
    1. Verify `SNOWFLAKE$LOCAL_APPLICATION` integration is enabled:
    ```sql
    DESC SECURITY INTEGRATION "SNOWFLAKE$LOCAL_APPLICATION";
    ```
    2. Check `Authenticator` is set to `oauth_authorization_code`
    3. Verify `Client Id` and `Client Secret` are both set to `LOCAL_APPLICATION`
    4. Ensure Authorization and Token URLs use your exact account identifier
    5. Check firewall allows browser to reach Snowflake

??? question "OAuth: Error 'Invalid scope' or 'Role not found'"
    **Solutions:**
    
    1. Verify the role in your scope exists in Snowflake
    2. Ensure your user has been granted the role:
    ```sql
    SHOW GRANTS TO USER your_username;
    ```
    3. Try `session:role:PUBLIC` for initial testing
    4. Check for typos in the scope string (case-sensitive role name)

---

## Quick Reference

### ODBC Connection String Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `Driver` | ODBC driver name | `{SnowflakeDSIIDriver}` |
| `Server` | Snowflake account URL | `account.snowflakecomputing.com` |
| `UID` | Username | `john_doe` |
| `PWD` | Password | `secret123` |
| `Database` | Default database | `ANALYTICS` |
| `Schema` | Default schema | `PUBLIC` |
| `Warehouse` | Compute warehouse | `COMPUTE_WH` |
| `Role` | Snowflake role | `ANALYST` |
| `Authenticator` | Auth method | `SNOWFLAKE_JWT`, `oauth_authorization_code`, `externalbrowser` |
| `PRIV_KEY_FILE` | Private key path | `C:\keys\rsa.p8` |

### OAuth DSN Parameters (Windows)

| Parameter | Value | Description |
|-----------|-------|-------------|
| `Authenticator` | `oauth_authorization_code` | Enables OAuth flow |
| `Client Id` | `LOCAL_APPLICATION` | Snowflake's built-in OAuth client |
| `Client Secret` | `LOCAL_APPLICATION` | Same as Client Id |
| `Scope` | `session:role:<ROLE>` | Role scope (e.g., `session:role:PUBLIC`) |
| `Authorization URL` | `https://<account>.snowflakecomputing.com/oauth/authorize` | OAuth authorize endpoint |
| `Token Request URL` | `https://<account>.snowflakecomputing.com/oauth/token-request` | OAuth token endpoint |

### File Locations

| Platform | ODBC Config | Driver |
|----------|-------------|--------|
| Windows | ODBC Administrator | Auto-detected |
| macOS | `~/.odbc.ini`, `~/.odbcinst.ini` | `/opt/snowflake/snowflakeodbc/` |

---

## Next Steps

- **[Tableau Guide](tableau.md)** — Advanced visualization
- **[Power BI Guide](power-bi.md)** — Interactive dashboards
- **[Key-Pair Setup](../authentication/key-pair.md)** — Secure authentication

