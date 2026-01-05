# macOS Platform Guide

<div class="hero-section" markdown>
## :material-apple: Snowflake on macOS

Complete guide for connecting BI tools to Snowflake from Mac
</div>

## Overview

macOS provides excellent support for Tableau and limited support for Power BI. Understanding the options helps you choose the best approach.

### Tool Support Matrix

| Tool | macOS Support | Limitations |
|------|:-------------:|-------------|
| **Tableau Desktop** | :white_check_mark: Full | None |
| **Power BI Desktop** | :x: None | Windows only |
| **Power BI Service** | :white_check_mark: Web | Limited authoring |
| **Excel** | :warning: Partial | Limited Power Query |

---

## Tableau on macOS

### Installation

1. Download Tableau Desktop from [tableau.com](https://www.tableau.com/products/desktop/download)
2. Open the `.dmg` file
3. Drag Tableau to Applications folder
4. Launch and sign in

### Snowflake Connection

Tableau on Mac has **full parity** with Windows:

- :white_check_mark: All authentication methods
- :white_check_mark: Live connections and extracts
- :white_check_mark: All data source features

**Connect:**

1. Open Tableau
2. **Connect** → **To a Server** → **Snowflake**
3. Enter connection details
4. Choose authentication method

### Key-Pair Authentication on Mac

**Step 1: Generate Keys**

```bash
# Create directory
mkdir -p ~/.snowflake/keys
cd ~/.snowflake/keys

# Generate encrypted private key
openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 \
    -inform PEM -out rsa_key.p8

# Generate public key
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub

# Set permissions
chmod 600 rsa_key.p8
chmod 644 rsa_key.pub
```

**Step 2: Configure in Tableau**

| Field | Value |
|-------|-------|
| Authentication | **Sign in using Private Key** |
| Private Key File | `/Users/yourname/.snowflake/keys/rsa_key.p8` |
| Password | Your passphrase |

---

## Power BI Alternatives

Power BI Desktop is **not available** on macOS. Here are your options:

### Option 1: Power BI Service (Web)

:white_check_mark: **Best for: Viewing reports and light editing**

**Access:**

1. Go to [app.powerbi.com](https://app.powerbi.com)
2. Sign in with organizational account
3. View and interact with reports

**Capabilities:**

| Feature | Available |
|---------|:---------:|
| View reports | :white_check_mark: |
| Create visuals | :white_check_mark: |
| Edit published reports | :white_check_mark: |
| Create data models | :x: |
| Power Query | :x: |
| Custom visuals development | :x: |

### Option 2: Virtual Machine

:white_check_mark: **Best for: Full Power BI functionality**

**Option A: Parallels Desktop** ($99/year)

1. Install Parallels Desktop
2. Download Windows 11 (Parallels can do this automatically)
3. Install Power BI Desktop in Windows
4. Connect to Snowflake normally

**Option B: VMware Fusion** (~$199 one-time)

1. Install VMware Fusion
2. Install Windows 11
3. Install Power BI Desktop

**Option C: UTM** (Free, Apple Silicon native)

1. Download UTM from [mac.getutm.app](https://mac.getutm.app)
2. Download Windows 11 ARM
3. Install and configure Windows
4. Install Power BI Desktop

!!! tip "Performance Tip"
    Allocate at least 8GB RAM and 4 CPU cores to the VM for smooth Power BI performance.

### Option 3: Azure Virtual Desktop

:white_check_mark: **Best for: Enterprise environments**

1. Set up Azure Virtual Desktop in Azure
2. Connect via web browser or Remote Desktop app
3. Full Windows desktop in cloud
4. Power BI Desktop runs on Azure

**Benefits:**

- No local VM overhead
- Enterprise managed
- Data stays in cloud
- Access from any device

### Option 4: Use Tableau Instead

:white_check_mark: **Best for: Users who can switch tools**

Tableau Desktop has full macOS support with no compromises. See [Tableau Guide](../bi-tools/tableau.md).

---

## Excel on macOS

### Capabilities

| Feature | Mac Excel | Windows Excel |
|---------|:---------:|:-------------:|
| ODBC Connection | :white_check_mark: | :white_check_mark: |
| Power Query | :warning: Basic | :white_check_mark: Full |
| PivotTables | :white_check_mark: | :white_check_mark: |
| Automatic Refresh | :warning: Limited | :white_check_mark: |

### ODBC Setup

**Step 1: Install Snowflake ODBC Driver**

1. Download from [Snowflake ODBC Downloads](https://developers.snowflake.com/odbc/)
2. Open the `.pkg` installer
3. Follow installation prompts
4. Driver installs to `/opt/snowflake/snowflakeodbc/`

**Step 2: Install iODBC Driver Manager**

```bash
# Via Homebrew
brew install libiodbc
```

**Step 3: Configure ODBC**

Create `~/.odbc.ini`:

```ini
[Snowflake]
Description = Snowflake Analytics
Driver = /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
Server = account.snowflakecomputing.com
Database = ANALYTICS
Schema = PUBLIC
Warehouse = COMPUTE_WH
Role = ANALYST_ROLE
```

Create `~/.odbcinst.ini`:

```ini
[Snowflake]
Description = Snowflake ODBC Driver
Driver = /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
```

**Step 4: Connect from Excel**

1. Open Excel
2. **Data** → **Get Data (Power Query)** → **From Database** → **From ODBC**
3. Enter connection string: `DSN=Snowflake;UID=user;PWD=pass`
4. Select data and load

### Key-Pair with ODBC on Mac

Configure `~/.odbc.ini`:

```ini
[Snowflake_KeyPair]
Description = Snowflake with Key-Pair Auth
Driver = /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
Server = account.snowflakecomputing.com
Database = ANALYTICS
Warehouse = COMPUTE_WH
UID = your_username
AUTHENTICATOR = SNOWFLAKE_JWT
PRIV_KEY_FILE = /Users/yourname/.snowflake/keys/rsa_key.p8
PRIV_KEY_FILE_PWD = your_passphrase
```

---

## Network Configuration

### Firewall

macOS firewall typically allows outbound connections. If issues occur:

1. **System Preferences** → **Security & Privacy** → **Firewall**
2. Click **Firewall Options**
3. Ensure your BI tools are not blocked

### Proxy

Configure in:

1. **System Preferences** → **Network** → **Advanced** → **Proxies**
2. Or set environment variables:

```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

---

## File Locations

| Item | Path |
|------|------|
| ODBC Driver | `/opt/snowflake/snowflakeodbc/` |
| ODBC Config | `~/.odbc.ini`, `~/.odbcinst.ini` |
| Private Keys | `~/.snowflake/keys/` |
| Tableau Logs | `~/Documents/My Tableau Repository/Logs/` |
| Tableau Preferences | `~/Library/Preferences/com.tableau.* ` |

---

## Terminal Commands

### Verify Driver Installation

```bash
# Check ODBC driver
ls -la /opt/snowflake/snowflakeodbc/lib/

# Test ODBC connection
isql -v Snowflake your_username your_password
```

### Generate Keys

```bash
# Create secure key pair
cd ~/.snowflake/keys
openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 -out rsa_key.p8
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub

# Get public key for Snowflake (one line, no headers)
grep -v "^-" rsa_key.pub | tr -d '\n' && echo
```

### Check Connectivity

```bash
# Test network connection
nc -zv account.snowflakecomputing.com 443

# DNS resolution
nslookup account.snowflakecomputing.com

# Curl test
curl -I https://account.snowflakecomputing.com
```

---

## Troubleshooting

??? question "ODBC driver not found"
    **Solutions:**
    
    1. Verify installation:
    ```bash
    ls /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
    ```
    2. Check `~/.odbcinst.ini` driver path
    3. Ensure iODBC is installed: `brew install libiodbc`
    4. Reinstall driver package

??? question "Tableau can't find private key"
    **Solutions:**
    
    1. Use absolute path: `/Users/yourname/.snowflake/keys/rsa_key.p8`
    2. Check file permissions: `chmod 600 rsa_key.p8`
    3. Verify file format is PKCS#8
    4. Test passphrase with openssl

??? question "Excel ODBC connection fails"
    **Solutions:**
    
    1. Verify DSN configuration in `~/.odbc.ini`
    2. Test with `isql` command
    3. Check Excel has permission to access files
    4. Try DSN-less connection string

??? question "SSL certificate errors"
    **Solutions:**
    
    1. Update system certificates:
    ```bash
    /Applications/Python\ 3.x/Install\ Certificates.command
    ```
    2. Check system date/time is correct
    3. Update Snowflake driver to latest version

---

## Comparison Summary

| Need | Recommended Solution |
|------|---------------------|
| Data visualization | **Tableau** (native macOS) |
| Power BI reports | **Power BI Service** (web) |
| Full Power BI features | **VM** (Parallels/VMware) |
| Excel analysis | **Excel for Mac** with ODBC |
| Enterprise Power BI | **Azure Virtual Desktop** |

---

## Next Steps

- **[Tableau Guide](../bi-tools/tableau.md)** — Full Tableau setup
- **[Power BI Guide](../bi-tools/power-bi.md)** — Power BI options
- **[Excel Guide](../bi-tools/excel.md)** — Excel ODBC setup

