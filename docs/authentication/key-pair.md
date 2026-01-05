# Key-Pair Authentication

<span class="security-badge security-high">Very High Security</span>

Key-pair authentication uses RSA public/private key cryptography for password-less authentication. This is the most secure method, ideal for service accounts and automated processes.

## Overview

```mermaid
sequenceDiagram
    participant Client as BI Tool / Script
    participant Snowflake
    
    Note over Client: Private Key stored securely
    Note over Snowflake: Public Key registered
    
    Client->>Snowflake: Connect with private key
    Snowflake->>Snowflake: Verify against public key
    Snowflake-->>Client: Authenticated Session
```

---

## Pros and Cons

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### :material-check-circle: Advantages

- **No Password** — Eliminates password management and rotation
- **Highest Security** — Cryptographic RSA authentication (2048-bit recommended)
- **Non-Interactive** — Perfect for automation, scheduled jobs, and ETL
- **No MFA Interference** — Bypasses MFA prompts completely
- **Rotation Capable** — Keys can be rotated independently with zero downtime
- **Audit Trail** — Key usage is logged in Snowflake audit logs
- **Service Account Ready** — Designed specifically for automation and service accounts
- **No Token Expiration** — Keys don't expire (unlike OAuth tokens)
- **Platform Agnostic** — Works on Windows, macOS, and Linux
- **Dual Key Support** — Snowflake supports two keys for seamless rotation
- **No IdP Dependency** — Works independently of identity providers
- **Scheduled Refresh Friendly** — Ideal for Tableau Server and Power BI scheduled refreshes
- **Compliance Ready** — Meets security requirements for automated processes
</div>
<div class="cons-box" markdown>
#### :material-close-circle: Disadvantages

- **Complex Setup** — Requires key generation, registration, and management
- **Key Security** — Private key must be protected (equivalent to password)
- **Limited Tool Support** — Not all BI tools support it (Power BI doesn't)
- **No Power BI** — Power BI Desktop and Service don't support key-pair authentication
- **User Training** — Technical knowledge required for setup and rotation
- **Key Rotation** — Requires coordinated updates across all systems using the key
- **Key Storage** — Must securely store private keys (HSM, secrets manager, etc.)
- **Initial Learning Curve** — Users need to understand PKCS#8 format and OpenSSL
- **File Management** — Private keys must be stored securely on each client
- **Not for Interactive Users** — Better suited for automation than daily user access
- **Key Recovery** — Lost private key requires regeneration and re-registration
- **Platform-Specific Paths** — Different file paths on Windows vs macOS/Linux
</div>
</div>

---

## BI Tool Support

| Tool | Support Level | Notes |
|------|:-------------:|-------|
| **Tableau Desktop** | :white_check_mark: Full | Native support since 2020.3 |
| **Tableau Server** | :white_check_mark: Full | For data source connections |
| **Power BI Desktop** | :x: None | Use OAuth instead |
| **Power BI Service** | :x: None | Use OAuth instead |
| **Excel (ODBC)** | :white_check_mark: Full | Via ODBC driver configuration |
| **Python/Scripts** | :white_check_mark: Full | Native connector support |

---

## Key Generation

### Step 1: Generate RSA Key Pair

=== "macOS / Linux"

    ```bash
    # Create directory for keys
    mkdir -p ~/.snowflake/keys
    cd ~/.snowflake/keys
    
    # Generate 2048-bit RSA private key (encrypted)
    openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 \
        -inform PEM -out rsa_key.p8
    
    # You'll be prompted for a passphrase - remember this!
    
    # Generate public key from private key
    openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
    
    # Verify keys
    ls -la rsa_key.*
    ```
    
    !!! tip "Unencrypted Key (for automation)"
        For service accounts where passphrase prompts aren't possible:
        
        ```bash
        openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt \
            -inform PEM -out rsa_key_unencrypted.p8
        ```
        
        :warning: Store unencrypted keys with extra security!

=== "Windows (PowerShell)"

    ```powershell
    # Create directory for keys
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.snowflake\keys"
    Set-Location "$env:USERPROFILE\.snowflake\keys"
    
    # Generate encrypted private key
    openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 `
        -inform PEM -out rsa_key.p8
    
    # Generate public key
    openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
    ```
    
    !!! note "OpenSSL on Windows"
        Install OpenSSL via:
        
        - [Win64 OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)
        - Or via `choco install openssl`

=== "Windows (Git Bash)"

    ```bash
    # Create directory
    mkdir -p ~/.snowflake/keys
    cd ~/.snowflake/keys
    
    # Generate key pair (same as Linux)
    openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 \
        -inform PEM -out rsa_key.p8
    
    openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
    ```

### Step 2: Register Public Key in Snowflake

```sql
-- Get the public key content (without header/footer)
-- Copy content between BEGIN PUBLIC KEY and END PUBLIC KEY

-- Assign public key to user
ALTER USER your_username SET RSA_PUBLIC_KEY = 'MIIBIjANBgkqhki...';

-- Or for a second key (for rotation)
ALTER USER your_username SET RSA_PUBLIC_KEY_2 = 'MIIBIjANBgkqhki...';

-- Verify key assignment
DESC USER your_username;
```

!!! warning "Format the Key Correctly"
    Remove the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` lines.
    Remove all newlines to make it a single continuous string.
    
    ```bash
    # Get formatted key (one line)
    grep -v "^-" rsa_key.pub | tr -d '\n'
    ```

---

## BI Tool Configuration

=== "Tableau Desktop"

    ### Configure Tableau for Key-Pair Auth
    
    1. Open **Tableau Desktop**
    2. Connect to **Snowflake**
    3. Enter connection details:
    
    | Field | Value |
    |-------|-------|
    | Server | `your-account.snowflakecomputing.com` |
    | Authentication | **Sign in using Private Key** |
    | Username | Your Snowflake username |
    | Private Key File | Path to `rsa_key.p8` |
    | Private Key Password | Your passphrase (if encrypted) |
    
    4. Click **Sign In**
    
    !!! tip "File Path Example"
        - macOS: `/Users/yourname/.snowflake/keys/rsa_key.p8`
        - Windows: `C:\Users\yourname\.snowflake\keys\rsa_key.p8`
    
    ### Tableau Server Published Data Sources
    
    For server-side key-pair authentication:
    
    1. Store private key on Tableau Server
    2. Configure data source with key path
    3. Use Run As service account
    
    ```yaml
    # Tableau Server configuration
    vizqlserver.data_connections.snowflake.private_key_file: /path/to/key.p8
    vizqlserver.data_connections.snowflake.private_key_password: encrypted_password
    ```

=== "Excel (ODBC)"

    ### Configure ODBC for Key-Pair Auth
    
    **Windows:**
    
    1. Open **ODBC Data Source Administrator** (64-bit)
    2. Create/Edit your Snowflake DSN
    3. Configure authentication:
    
    | Field | Value |
    |-------|-------|
    | Authenticator | `SNOWFLAKE_JWT` |
    | Private Key File | `C:\path\to\rsa_key.p8` |
    | Private Key Password | Your passphrase |
    
    Or configure via connection string:
    
    ```
    Driver={SnowflakeDSIIDriver};
    Server=account.snowflakecomputing.com;
    Database=MYDB;
    Schema=PUBLIC;
    Warehouse=COMPUTE_WH;
    UID=myuser;
    AUTHENTICATOR=SNOWFLAKE_JWT;
    PRIV_KEY_FILE=C:\keys\rsa_key.p8;
    PRIV_KEY_FILE_PWD=mypassphrase;
    ```
    
    **macOS:**
    
    Configure `~/.odbc.ini`:
    
    ```ini
    [Snowflake_KeyPair]
    Driver = /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
    Server = account.snowflakecomputing.com
    Database = MYDB
    Schema = PUBLIC
    Warehouse = COMPUTE_WH
    UID = myuser
    AUTHENTICATOR = SNOWFLAKE_JWT
    PRIV_KEY_FILE = /Users/yourname/.snowflake/keys/rsa_key.p8
    PRIV_KEY_FILE_PWD = mypassphrase
    ```

=== "Python / Scripts"

    ### Snowflake Python Connector
    
    ```python
    import snowflake.connector
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import serialization
    
    # Load private key
    with open("/path/to/rsa_key.p8", "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=b'your_passphrase',  # or None if unencrypted
            backend=default_backend()
        )
    
    # Connect to Snowflake
    conn = snowflake.connector.connect(
        user='your_username',
        account='your_account',
        warehouse='COMPUTE_WH',
        database='MYDB',
        schema='PUBLIC',
        private_key=private_key
    )
    
    # Execute query
    cursor = conn.cursor()
    cursor.execute("SELECT CURRENT_USER(), CURRENT_ROLE()")
    print(cursor.fetchone())
    ```

---

## Key Rotation

Regular key rotation is a security best practice. Snowflake supports two simultaneous keys for seamless rotation.

### Rotation Process

```
Week 1: Generate new key pair
        │
        ▼
Week 2: Register as RSA_PUBLIC_KEY_2
        │
        ▼
Week 3: Update clients to use new key
        │
        ▼
Week 4: Move new key to RSA_PUBLIC_KEY
        Remove old RSA_PUBLIC_KEY_2
```

### Rotation Commands

```sql
-- Step 1: Add new key as secondary
ALTER USER service_user SET RSA_PUBLIC_KEY_2 = 'new_key_content...';

-- Step 2: Test new key works
-- (Connect with new private key)

-- Step 3: Promote new key to primary
ALTER USER service_user SET RSA_PUBLIC_KEY = 'new_key_content...';

-- Step 4: Remove old secondary key
ALTER USER service_user UNSET RSA_PUBLIC_KEY_2;
```

---

## Security Best Practices

!!! danger "Private Key Protection"
    The private key is equivalent to a password. Protect it accordingly!

### Key Storage Recommendations

| Environment | Recommended Storage |
|-------------|---------------------|
| Development | Encrypted file with passphrase |
| CI/CD | Secrets manager (Vault, AWS Secrets) |
| Production | Hardware Security Module (HSM) |
| Containers | Kubernetes Secrets / Vault injection |

### Access Controls

```bash
# Set restrictive permissions (Unix)
chmod 600 ~/.snowflake/keys/rsa_key.p8
chmod 644 ~/.snowflake/keys/rsa_key.pub
```

### Monitoring Key Usage

```sql
-- Monitor key-pair authentication events
SELECT 
    EVENT_TIMESTAMP,
    USER_NAME,
    CLIENT_IP,
    REPORTED_CLIENT_TYPE,
    FIRST_AUTHENTICATION_FACTOR
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE FIRST_AUTHENTICATION_FACTOR = 'RSA_KEYPAIR'
ORDER BY EVENT_TIMESTAMP DESC
LIMIT 100;
```

---

## Troubleshooting

??? question "Error: Private key is invalid"
    **Solutions:**
    
    1. Verify key format is PKCS#8:
    ```bash
    head -1 rsa_key.p8
    # Should show: -----BEGIN ENCRYPTED PRIVATE KEY-----
    # or: -----BEGIN PRIVATE KEY-----
    ```
    
    2. Regenerate key in correct format
    3. Check passphrase is correct

??? question "Error: JWT token is invalid"
    **Solutions:**
    
    1. Verify public key is registered:
    ```sql
    DESC USER your_username;
    -- Check RSA_PUBLIC_KEY field
    ```
    
    2. Ensure key formats match (public from same private key)
    3. Check system clock synchronization

??? question "Error: Could not find private key file"
    **Solutions:**
    
    1. Verify file path is absolute
    2. Check file permissions (readable by application)
    3. On Windows, use forward slashes or escaped backslashes
    4. Verify file extension is correct

??? question "Passphrase prompt keeps appearing"
    **Solutions:**
    
    1. For automation, use unencrypted key (with proper security)
    2. Store passphrase in secure credential manager
    3. Check if BI tool supports passphrase caching

---

## Use Cases

### Service Account for ETL

```sql
-- Create dedicated service account
CREATE USER etl_service_user
    TYPE = SERVICE
    DEFAULT_WAREHOUSE = 'ETL_WH'
    DEFAULT_ROLE = 'ETL_ROLE';

-- Grant minimal required permissions
GRANT ROLE ETL_ROLE TO USER etl_service_user;

-- Assign key-pair (no password)
ALTER USER etl_service_user SET RSA_PUBLIC_KEY = '...';
```

### Tableau Server Data Source

For scheduled extract refreshes without user interaction:

1. Create service account in Snowflake
2. Configure key-pair authentication
3. Store private key on Tableau Server
4. Configure data source with key credentials

---

## Next Steps

- **[Best Practices: Security](../best-practices/security.md)** — Complete security recommendations
- **[Troubleshooting](../troubleshooting.md)** — Common issues and solutions

