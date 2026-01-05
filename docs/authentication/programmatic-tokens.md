# Programmatic Access Tokens (PATs)

<span class="security-badge security-high">High Security</span>

Programmatic Access Tokens (PATs) are long-lived tokens that act as password replacements for service accounts. They provide a secure, non-interactive authentication method for BI tools like Power BI and Tableau.

## Overview

``` mermaid
sequenceDiagram
    participant Admin as Admin
    participant Snowflake as Snowflake
    participant BI as BI Tool
    
    Admin->>Snowflake: Create SERVICE user
    Admin->>Snowflake: Generate PAT for user
    Snowflake-->>Admin: Return token
    Admin->>BI: Configure connection with token as password
    BI->>Snowflake: Connect using username + token
    Snowflake-->>BI: Authorized session
```

## Pros and Cons

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
### :material-check-circle: Advantages

- **Works where OAuth isn't feasible** — Simpler setup than full OAuth
- **Avoids storing real passwords** — Tokens can be rotated independently
- **Non-interactive authentication** — No MFA prompts
- **Works with all BI tools** — Power BI, Tableau, Excel
- **Configurable expiration** — Set appropriate token lifetime
</div>
<div class="cons-box" markdown>
### :material-close-circle: Disadvantages

- **Tokens need secure storage** — Use a secrets manager
- **Manual rotation required** — Plan for token refresh before expiry
- **Not as seamless as OAuth** — No automatic token refresh
- **Expiration management** — Must monitor and rotate before expiry
</div>
</div>

---

## Setup Guide

### Step 1: Create a Service User

Create a dedicated `TYPE=SERVICE` user for your BI tool:

```sql
-- Create a service user for Power BI
CREATE USER powerbi_service
  TYPE = SERVICE
  DEFAULT_ROLE = BI_READER_ROLE
  DEFAULT_WAREHOUSE = BI_WAREHOUSE
  COMMENT = 'Service account for Power BI scheduled refreshes';

-- Grant necessary role
GRANT ROLE BI_READER_ROLE TO USER powerbi_service;
```

!!! info "TYPE=SERVICE Users"
    `TYPE=SERVICE` users are specifically designed for programmatic access. They cannot log in interactively and are ideal for automated BI connections.

### Step 2: Generate a Programmatic Access Token

Generate a PAT for the service user:

```sql
-- Generate a token with 90-day expiration
ALTER USER powerbi_service 
  SET PROGRAMMATIC_ACCESS_TOKEN = TRUE;

-- Create the token (run as ACCOUNTADMIN or SECURITYADMIN)
SELECT SYSTEM$GENERATE_PROGRAMMATIC_ACCESS_TOKEN(
  'powerbi_service',
  90  -- Days until expiration
) AS token;
```

!!! warning "Save the Token Securely"
    The token is only displayed once. Copy it immediately and store it in a secure secrets manager (Azure Key Vault, HashiCorp Vault, AWS Secrets Manager).

### Step 3: Configure Your BI Tool

Use the token as the **password** in your BI tool connection:

=== "Power BI"

    1. Open Power BI Desktop
    2. **Get Data** → **Snowflake**
    3. Enter connection details:
        - **Server**: `your-account.snowflakecomputing.com`
        - **Warehouse**: `BI_WAREHOUSE`
    4. Choose **Database** authentication
    5. Enter credentials:
        - **Username**: `powerbi_service`
        - **Password**: *paste the PAT token*
    6. Click **Connect**

=== "Tableau"

    1. Open Tableau Desktop
    2. **Connect** → **Snowflake**
    3. Enter connection details:
        - **Server**: `your-account.snowflakecomputing.com`
        - **Role**: `BI_READER_ROLE`
        - **Warehouse**: `BI_WAREHOUSE`
    4. Select **Username and Password** authentication
    5. Enter credentials:
        - **Username**: `powerbi_service`
        - **Password**: *paste the PAT token*
    6. Click **Sign In**

=== "Excel (ODBC)"

    1. Open **ODBC Data Source Administrator**
    2. Select your Snowflake DSN → **Configure**
    3. Enter connection details:
        - **User**: `powerbi_service`
        - **Password**: *paste the PAT token*
    4. Click **Test** to verify
    5. Use the DSN in Excel's **Get Data** → **From ODBC**

---

## Token Management

### Check Token Status

```sql
-- View token expiration for a user
DESCRIBE USER powerbi_service;

-- Check programmatic access settings
SHOW PARAMETERS LIKE 'PROGRAMMATIC_ACCESS%' IN USER powerbi_service;
```

### Rotate Tokens

Rotate tokens before they expire to avoid service interruptions:

```sql
-- Generate a new token (invalidates the old one)
SELECT SYSTEM$GENERATE_PROGRAMMATIC_ACCESS_TOKEN(
  'powerbi_service',
  90  -- New 90-day expiration
) AS new_token;
```

!!! tip "Rotation Best Practices"
    - Set calendar reminders for token expiration
    - Rotate tokens at least 1 week before expiry
    - Update BI tool configurations immediately after rotation
    - Test connections after updating tokens

### Revoke Tokens

If a token is compromised:

```sql
-- Revoke all tokens for a user
ALTER USER powerbi_service 
  SET PROGRAMMATIC_ACCESS_TOKEN = FALSE;

-- Re-enable and generate new token
ALTER USER powerbi_service 
  SET PROGRAMMATIC_ACCESS_TOKEN = TRUE;

SELECT SYSTEM$GENERATE_PROGRAMMATIC_ACCESS_TOKEN(
  'powerbi_service',
  90
) AS new_token;
```

---

## BI Tool Compatibility

| BI Tool | PAT Support | Notes |
|---------|:-----------:|-------|
| **Power BI Desktop** | ✅ | Use as password in Database auth |
| **Power BI Service** | ✅ | Configure in gateway/data source settings |
| **Tableau Desktop** | ✅ | Use as password |
| **Tableau Server/Cloud** | ✅ | Store in embedded credentials |
| **Excel (ODBC)** | ✅ | Configure in DSN settings |

---

## Security Best Practices

!!! danger "Critical Security Requirements"
    
    1. **Never store tokens in code or config files** — Use secrets managers
    2. **Use dedicated service accounts** — One per application/purpose
    3. **Set appropriate expiration** — Balance security vs. operational overhead
    4. **Monitor token usage** — Review access logs regularly
    5. **Rotate promptly** — Change tokens if any suspicion of compromise

### Secure Storage Options

| Platform | Secrets Manager | Integration |
|----------|-----------------|-------------|
| **Azure** | Azure Key Vault | Power BI Service, Azure Data Factory |
| **AWS** | AWS Secrets Manager | Native integration |
| **GCP** | Secret Manager | Native integration |
| **On-Premises** | HashiCorp Vault | API-based retrieval |

---

## Troubleshooting

??? question "Token authentication failed"
    
    **Possible causes:**
    
    1. **Token expired** — Check expiration and generate a new token
    2. **Copy/paste error** — Ensure no extra spaces or line breaks
    3. **Wrong user** — Verify username matches the token's user
    4. **Token revoked** — Check if programmatic access is still enabled
    
    ```sql
    -- Verify user settings
    DESCRIBE USER powerbi_service;
    ```

??? question "Connection works in Desktop but fails in Service"
    
    **For Power BI Service:**
    
    1. Ensure the on-premises data gateway is configured
    2. Update data source credentials in Power BI Service
    3. Verify network connectivity from gateway to Snowflake
    
    **For Tableau Server:**
    
    1. Re-embed credentials in the published workbook
    2. Check Tableau Server's connectivity to Snowflake

??? question "How often should I rotate tokens?"
    
    **Recommended rotation schedule:**
    
    - **Production systems**: Every 90 days
    - **Development/test**: Every 180 days
    - **After any security incident**: Immediately
    
    Set token expiration slightly longer than your rotation cycle to allow for delays.

---

## Next Steps

- [OAuth with Service Principal](oauth-sso.md) — Best practice for enterprise
- [Key-Pair Authentication](key-pair.md) — For Tableau automation
- [Security Best Practices](../best-practices/security.md) — Comprehensive security guide

