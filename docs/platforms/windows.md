# Windows Platform Guide

<div class="hero-section" markdown>
## :fontawesome-brands:windows: Snowflake on Windows

Complete guide for connecting BI tools to Snowflake from Windows
</div>

## Overview

Windows provides the most comprehensive support for all BI tools connecting to Snowflake, with full feature parity across Tableau, Power BI, and Excel.

### Tool Support Matrix

| Tool | Installation | Native Connector | All Auth Methods |
|------|:------------:|:----------------:|:----------------:|
| **Tableau Desktop** | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Power BI Desktop** | :white_check_mark: | :white_check_mark: | :white_check_mark: (except Key-Pair) |
| **Excel** | :white_check_mark: | :white_check_mark: Via ODBC | :white_check_mark: |

---

## Driver Installation

### Snowflake ODBC Driver

Required for Excel and optional for advanced Tableau configurations.

**Step 1: Download Driver**

1. Go to [Snowflake ODBC Downloads](https://developers.snowflake.com/odbc/)
2. Download **Windows 64-bit** installer

**Step 2: Install**

1. Run `snowflake_odbc_win64.msi`
2. Accept license agreement
3. Complete installation wizard
4. Restart applications if needed

**Step 3: Verify Installation**

1. Press `Win + R`, type `odbcad32.exe`, press Enter
2. Go to **Drivers** tab
3. Confirm **SnowflakeDSIIDriver** is listed

### Snowflake JDBC Driver

For applications requiring JDBC:

1. Download from [Snowflake JDBC Downloads](https://developers.snowflake.com/jdbc/)
2. Place `.jar` file in application's lib directory
3. Configure classpath as needed

---

## Configuring ODBC Data Sources

### User DSN vs System DSN

| Type | Scope | Use Case |
|------|-------|----------|
| **User DSN** | Current user only | Personal workstation |
| **System DSN** | All users on machine | Shared computers, servers |

### Create Data Source

1. Open **ODBC Data Source Administrator** (64-bit)
   - Press `Win + R` → `odbcad32.exe`

2. Choose **User DSN** or **System DSN** tab

3. Click **Add** → Select **SnowflakeDSIIDriver** → **Finish**

4. Configure connection:

| Field | Example Value |
|-------|---------------|
| Data Source | `Snowflake_Analytics` |
| Server | `xy12345.us-east-1.snowflakecomputing.com` |
| Database | `ANALYTICS` |
| Schema | `PUBLIC` |
| Warehouse | `COMPUTE_WH` |
| Role | `ANALYST_ROLE` |

5. Click **Test** → Enter credentials → Verify connection

6. Click **OK** to save

---

## Authentication Setup

### Username & Password

No additional configuration needed. Enter credentials when connecting.

### OAuth / SSO

#### For Power BI

1. Sign in with Microsoft account in Power BI
2. Select **OAuth2** when connecting to Snowflake
3. Complete Azure AD authentication

#### For Tableau

1. Select **Sign in using OAuth** in connection dialog
2. Browser opens to IdP
3. Complete authentication

### Key-Pair Authentication

**Step 1: Generate Keys**

Open **PowerShell** or **Git Bash**:

```powershell
# Create directory
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.snowflake\keys"
Set-Location "$env:USERPROFILE\.snowflake\keys"

# Generate encrypted private key
openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 -out rsa_key.p8

# Generate public key
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
```

!!! note "OpenSSL Installation"
    If OpenSSL is not available:
    
    - Install via [Win64 OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)
    - Or use `choco install openssl`
    - Or use Git Bash (includes OpenSSL)

**Step 2: Register Public Key**

```sql
-- In Snowflake, assign public key to user
ALTER USER your_username SET RSA_PUBLIC_KEY = 'MIIBIj...';
```

**Step 3: Configure in Tools**

=== "Tableau"

    Select **Sign in using Private Key**:
    
    - Private Key File: `C:\Users\YourName\.snowflake\keys\rsa_key.p8`
    - Password: Your passphrase

=== "Excel ODBC"

    Configure DSN with:
    
    - Authenticator: `SNOWFLAKE_JWT`
    - Private Key File: Full path to `.p8` file
    - Private Key Password: Your passphrase

---

## Network Configuration

### Firewall Rules

Ensure outbound access on port **443** (HTTPS) to:

- `*.snowflakecomputing.com`
- Your identity provider (for OAuth)

**Windows Firewall:**

```powershell
# Check if outbound 443 is allowed
Get-NetFirewallRule -Direction Outbound | Where-Object {$_.LocalPort -eq 443}
```

### Proxy Configuration

If using corporate proxy:

**System-wide:**

1. **Settings** → **Network & Internet** → **Proxy**
2. Configure manual or automatic proxy

**ODBC Driver:**

Add to DSN configuration:

```
PROXY=http://proxy.company.com:8080
```

---

## File Locations

| Item | Path |
|------|------|
| ODBC Driver | `C:\Program Files\Snowflake ODBC Driver\` |
| Private Keys | `C:\Users\<username>\.snowflake\keys\` |
| Tableau Logs | `C:\Users\<username>\Documents\My Tableau Repository\Logs\` |
| Power BI Cache | `C:\Users\<username>\Microsoft\Power BI Desktop Store App\` |

---

## Performance Optimization

### Windows-Specific Tips

1. **Use 64-bit Applications**
   - Ensure Excel, Tableau, Power BI are 64-bit
   - Match ODBC driver architecture

2. **Memory Allocation**
   - Close unnecessary applications
   - Increase virtual memory if needed

3. **Network Optimization**
   - Use wired connection for large datasets
   - Disable VPN if not required

### Registry Tweaks (Advanced)

For large ODBC transfers:

```reg
[HKEY_LOCAL_MACHINE\SOFTWARE\ODBC\ODBC.INI\Snowflake]
"MaxChunkDownloadThreads"=dword:00000008
```

---

## Troubleshooting

??? question "ODBC driver not showing in list"
    **Solutions:**
    
    1. Run **64-bit** ODBC Administrator (`odbcad32.exe` from `System32`)
    2. Reinstall driver with admin privileges
    3. Check Windows Event Viewer for errors
    4. Reboot after installation

??? question "Connection timeout errors"
    **Solutions:**
    
    1. Check firewall settings
    2. Verify proxy configuration
    3. Test network connectivity:
    ```powershell
    Test-NetConnection account.snowflakecomputing.com -Port 443
    ```
    4. Try different network (mobile hotspot test)

??? question "Private key file not found"
    **Solutions:**
    
    1. Use full absolute path
    2. Check file permissions
    3. Ensure path uses forward slashes or escaped backslashes
    4. Verify file exists

??? question "Excel/Power BI crashes when loading data"
    **Solutions:**
    
    1. Reduce data volume with filters
    2. Increase system memory
    3. Use DirectQuery instead of Import
    4. Update to latest tool version

---

## Quick Reference

### Connection String Template

```
Driver={SnowflakeDSIIDriver};
Server=account.region.snowflakecomputing.com;
Database=YOUR_DATABASE;
Schema=YOUR_SCHEMA;
Warehouse=YOUR_WAREHOUSE;
Role=YOUR_ROLE;
UID=your_username;
PWD=your_password;
```

### Common Paths

```powershell
# ODBC Administrator
%windir%\System32\odbcad32.exe

# User profile
%USERPROFILE%

# Snowflake keys
%USERPROFILE%\.snowflake\keys\
```

---

## Next Steps

- **[Tableau Guide](../bi-tools/tableau.md)** — Detailed Tableau setup
- **[Power BI Guide](../bi-tools/power-bi.md)** — Power BI configuration
- **[Excel Guide](../bi-tools/excel.md)** — Excel ODBC setup

