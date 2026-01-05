# Prerequisites

Before connecting your BI tool to Snowflake, ensure you have the following requirements in place.

## Snowflake Requirements

### Account Access

- [ ] Active Snowflake account
- [ ] Valid username and credentials
- [ ] Appropriate role with data access permissions
- [ ] Network access to Snowflake (firewall/VPN configured)

### Connection Information

You'll need these details from your Snowflake administrator:

| Parameter | Example | Description |
|-----------|---------|-------------|
| **Account Identifier** | `xy12345.us-east-1` | Your unique Snowflake account |
| **Username** | `john.doe@company.com` | Your login username |
| **Warehouse** | `COMPUTE_WH` | Virtual warehouse for queries |
| **Database** | `ANALYTICS` | Default database (optional) |
| **Schema** | `PUBLIC` | Default schema (optional) |
| **Role** | `ANALYST_ROLE` | Your assigned role (optional) |

!!! tip "Finding Your Account Identifier"
    Your account identifier is visible in your Snowflake URL:
    ```
    https://xy12345.us-east-1.snowflakecomputing.com
           └─────────────────┘
           Account Identifier
    ```

---

## Driver Requirements

### Snowflake ODBC Driver

Required for **Excel** and some **Tableau** configurations.

=== "Windows"

    1. Download from [Snowflake ODBC Driver Downloads](https://developers.snowflake.com/odbc/)
    2. Run the installer (`snowflake_odbc_win64.msi`)
    3. Follow the installation wizard
    4. Configure DSN via ODBC Data Source Administrator

=== "macOS"

    1. Download the `.pkg` installer from Snowflake
    2. Open the package and follow prompts
    3. The driver installs to `/opt/snowflake/snowflakeodbc/`
    4. Configure via `odbc.ini` and `odbcinst.ini`

    ```bash
    # Check installation
    ls /opt/snowflake/snowflakeodbc/
    ```

### Snowflake JDBC Driver

Required for some advanced configurations.

Download from: [Snowflake JDBC Driver](https://developers.snowflake.com/jdbc/)

---

## BI Tool Requirements

### :material-chart-areaspline: Tableau

| Platform | Version | Native Connector |
|----------|---------|------------------|
| Windows | 2019.1+ | :white_check_mark: Built-in |
| macOS | 2019.1+ | :white_check_mark: Built-in |

!!! note "Tableau Versions"
    Tableau has a built-in Snowflake connector. No additional driver installation needed for basic connectivity.

### :material-chart-box: Power BI

| Component | Platform | Requirement |
|-----------|----------|-------------|
| Power BI Desktop | Windows | Windows 10/11 |
| Power BI Desktop | macOS | :x: Not available |
| Power BI Service | Any | Web browser |

!!! warning "macOS Users"
    Power BI Desktop is **Windows-only**. Mac users can:
    
    - Use Power BI Service (web) for viewing and basic editing
    - Run Windows in a virtual machine (Parallels, VMware)
    - Use Azure Virtual Desktop

### :material-table: Excel

| Platform | Version | ODBC Support |
|----------|---------|--------------|
| Windows | Excel 2016+ | :white_check_mark: Full |
| macOS | Excel 2019+ | :warning: Limited |

---

## Network Requirements

### Firewall Configuration

Ensure outbound access to:

| Service | Port | Protocol |
|---------|------|----------|
| Snowflake | 443 | HTTPS |
| Authentication (if OAuth) | 443 | HTTPS |

### Proxy Settings

If using a corporate proxy:

1. Configure proxy in your OS network settings
2. Some BI tools have their own proxy settings
3. Ensure Snowflake domains are whitelisted

---

## Authentication-Specific Prerequisites

### For OAuth / SSO

- [ ] Identity Provider (IdP) configured (Okta, Azure AD, etc.)
- [ ] Snowflake OAuth security integration created
- [ ] User mapped in IdP to Snowflake user

### For Key-Pair Authentication

- [ ] OpenSSL installed for key generation
- [ ] Secure storage for private key
- [ ] Public key registered in Snowflake

```bash
# Check OpenSSL installation
openssl version
```

---

## Verification Checklist

Before proceeding, verify:

- [x] Snowflake account accessible via web browser
- [x] Can login with your credentials
- [x] Warehouse is available and running
- [x] Required drivers installed (if needed)
- [x] Network connectivity to Snowflake confirmed

!!! success "Ready to Connect"
    Once all prerequisites are met, proceed to [Authentication Methods](../authentication/overview.md) to choose your connection method.

