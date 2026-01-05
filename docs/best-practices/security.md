# Security Best Practices

<div class="hero-section" markdown>
## :material-shield-check: Secure Your Snowflake Connections

Essential security practices for BI tool authentication
</div>

## Security Principles

### Defense in Depth

Apply multiple layers of security:

```
┌─────────────────────────────────────────────────┐
│                  Network Layer                   │
│  • Firewall rules  • VPN  • Private Link         │
├─────────────────────────────────────────────────┤
│               Authentication Layer               │
│  • OAuth/SSO  • MFA  • Key-Pair                 │
├─────────────────────────────────────────────────┤
│               Authorization Layer                │
│  • RBAC  • Row-Level Security  • Masking        │
├─────────────────────────────────────────────────┤
│                  Data Layer                      │
│  • Encryption  • Audit Logging  • Classification│
└─────────────────────────────────────────────────┘
```

### Principle of Least Privilege

Grant only the minimum permissions required:

```sql
-- Create specific role for BI users
CREATE ROLE bi_analyst_role;

-- Grant only necessary permissions
GRANT USAGE ON WAREHOUSE bi_wh TO ROLE bi_analyst_role;
GRANT USAGE ON DATABASE analytics TO ROLE bi_analyst_role;
GRANT USAGE ON SCHEMA analytics.reporting TO ROLE bi_analyst_role;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics.reporting TO ROLE bi_analyst_role;

-- Assign to users
GRANT ROLE bi_analyst_role TO USER john_doe;
```

---

## Authentication Recommendations

### Authentication Method Selection

| Environment | Recommended Method | Why |
|-------------|-------------------|-----|
| **Development** | Username/Password | Simplicity for testing |
| **Production - Users** | OAuth/SSO | Enterprise security, MFA |
| **Production - Service** | Key-Pair | Automation, no passwords |
| **Highly Regulated** | Key-Pair + Network Policy | Maximum security |

### OAuth/SSO Configuration

<span class="security-badge security-high">Recommended for Enterprise</span>

**Best Practices:**

1. **Enforce MFA** at the identity provider level
2. **Set reasonable token expiry** (7-30 days)
3. **Implement conditional access** policies
4. **Regular access reviews**

```sql
-- Configure OAuth with appropriate token lifetime
CREATE OR REPLACE SECURITY INTEGRATION corporate_sso
    TYPE = EXTERNAL_OAUTH
    ENABLED = TRUE
    EXTERNAL_OAUTH_TYPE = OKTA
    -- ... other settings ...
    EXTERNAL_OAUTH_TOKEN_USER_MAPPING_CLAIM = 'sub';

-- View current settings
DESCRIBE SECURITY INTEGRATION corporate_sso;
```

### Key-Pair Authentication

<span class="security-badge security-high">Recommended for Automation</span>

**Key Management Best Practices:**

| Practice | Implementation |
|----------|----------------|
| **Encrypt private keys** | Use passphrase-protected PKCS#8 |
| **Restrict file permissions** | `chmod 600` on Unix systems |
| **Rotate keys regularly** | Every 90-180 days |
| **Use secrets management** | HashiCorp Vault, AWS Secrets Manager |
| **Separate keys per service** | One key pair per application |

```sql
-- Support key rotation with two keys
ALTER USER service_account SET RSA_PUBLIC_KEY = 'current_key...';
ALTER USER service_account SET RSA_PUBLIC_KEY_2 = 'new_key...';

-- After migration, remove old key
ALTER USER service_account UNSET RSA_PUBLIC_KEY_2;
```

### Password Policy (If Required)

```sql
-- Configure strong password policy
ALTER ACCOUNT SET 
    PASSWORD_MIN_LENGTH = 14,
    PASSWORD_MAX_AGE_DAYS = 90,
    PASSWORD_HISTORY = 5,
    PASSWORD_LOCK_AFTER_NUM_TRIES = 5,
    PASSWORD_UNLOCK_AFTER_MIN = 30;
```

---

## Network Security

### Network Policies

Restrict access to known IP ranges:

```sql
-- Create network policy for office locations
CREATE NETWORK POLICY corporate_network
    ALLOWED_IP_LIST = (
        '203.0.113.0/24',     -- Main office
        '198.51.100.0/24',    -- Branch office
        '192.0.2.0/24'        -- VPN range
    );

-- Apply globally or per user
ALTER ACCOUNT SET NETWORK_POLICY = corporate_network;
-- Or
ALTER USER analyst_user SET NETWORK_POLICY = corporate_network;
```

### Private Link / Private Connectivity

For maximum security, use private endpoints:

| Cloud | Service |
|-------|---------|
| **AWS** | AWS PrivateLink |
| **Azure** | Azure Private Link |
| **GCP** | Private Service Connect |

Benefits:

- Traffic stays on private network
- No internet exposure
- Additional compliance capabilities

---

## Role-Based Access Control (RBAC)

### Role Hierarchy Design

```sql
-- Create role hierarchy
CREATE ROLE bi_admin;
CREATE ROLE bi_analyst;
CREATE ROLE bi_viewer;

-- Set up hierarchy
GRANT ROLE bi_viewer TO ROLE bi_analyst;
GRANT ROLE bi_analyst TO ROLE bi_admin;

-- Assign permissions
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO ROLE bi_viewer;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA reporting TO ROLE bi_analyst;
GRANT ALL ON SCHEMA reporting TO ROLE bi_admin;
```

### Functional Roles Example

```sql
-- Sales team roles
CREATE ROLE sales_viewer;
CREATE ROLE sales_analyst;

-- Marketing team roles  
CREATE ROLE marketing_viewer;
CREATE ROLE marketing_analyst;

-- Grant warehouse access
GRANT USAGE ON WAREHOUSE bi_wh TO ROLE sales_viewer;
GRANT USAGE ON WAREHOUSE bi_wh TO ROLE marketing_viewer;

-- Grant data access based on function
GRANT SELECT ON TABLE sales_data TO ROLE sales_viewer;
GRANT SELECT ON TABLE marketing_campaigns TO ROLE marketing_viewer;
```

---

## Data Protection

### Row-Level Security

Control data access at row level:

```sql
-- Create mapping table
CREATE TABLE user_region_access (
    user_email VARCHAR,
    allowed_region VARCHAR
);

-- Create secure view with RLS
CREATE SECURE VIEW sales_by_region AS
SELECT *
FROM sales
WHERE region IN (
    SELECT allowed_region 
    FROM user_region_access 
    WHERE user_email = CURRENT_USER()
);

-- Grant access to view, not base table
GRANT SELECT ON sales_by_region TO ROLE sales_analyst;
```

### Dynamic Data Masking

Protect sensitive data:

```sql
-- Create masking policy
CREATE MASKING POLICY email_mask AS (val STRING) 
RETURNS STRING ->
    CASE
        WHEN CURRENT_ROLE() IN ('ADMIN', 'DATA_STEWARD') THEN val
        ELSE REGEXP_REPLACE(val, '.+@', '****@')
    END;

-- Apply to column
ALTER TABLE customers MODIFY COLUMN email 
    SET MASKING POLICY email_mask;
```

---

## Audit and Monitoring

### Enable Access Logging

Monitor who accesses what:

```sql
-- Query login history
SELECT 
    EVENT_TIMESTAMP,
    USER_NAME,
    CLIENT_IP,
    FIRST_AUTHENTICATION_FACTOR,
    SECOND_AUTHENTICATION_FACTOR,
    IS_SUCCESS,
    ERROR_MESSAGE
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE EVENT_TIMESTAMP > DATEADD(day, -7, CURRENT_TIMESTAMP())
ORDER BY EVENT_TIMESTAMP DESC;
```

### Track Query Activity

```sql
-- Monitor query activity
SELECT 
    QUERY_ID,
    USER_NAME,
    ROLE_NAME,
    DATABASE_NAME,
    QUERY_TYPE,
    EXECUTION_STATUS,
    TOTAL_ELAPSED_TIME
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE START_TIME > DATEADD(day, -1, CURRENT_TIMESTAMP())
    AND QUERY_TYPE = 'SELECT'
ORDER BY START_TIME DESC
LIMIT 100;
```

### Create Monitoring Views

```sql
-- Failed login attempts
CREATE VIEW security_failed_logins AS
SELECT 
    EVENT_TIMESTAMP,
    USER_NAME,
    CLIENT_IP,
    ERROR_MESSAGE
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE IS_SUCCESS = 'NO'
    AND EVENT_TIMESTAMP > DATEADD(hour, -24, CURRENT_TIMESTAMP());

-- OAuth token usage
CREATE VIEW security_oauth_activity AS
SELECT 
    EVENT_TIMESTAMP,
    USER_NAME,
    FIRST_AUTHENTICATION_FACTOR,
    CLIENT_IP
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE FIRST_AUTHENTICATION_FACTOR = 'OAUTH_ACCESS_TOKEN'
    AND EVENT_TIMESTAMP > DATEADD(day, -7, CURRENT_TIMESTAMP());
```

---

## BI Tool-Specific Security

### Tableau

| Setting | Recommendation |
|---------|----------------|
| **Embedded Credentials** | Avoid in production |
| **OAuth** | Enable for Tableau Server |
| **Extract Security** | Encrypt extracts |
| **Row-Level Security** | Implement in Snowflake |

### Power BI

| Setting | Recommendation |
|---------|----------------|
| **SSO** | Enable Azure AD SSO |
| **DirectQuery** | Use for RLS enforcement |
| **Data Gateway** | Secure configuration |
| **Tenant Settings** | Review admin portal |

### Excel

| Setting | Recommendation |
|---------|----------------|
| **Credentials** | Don't save in file |
| **Key-Pair** | Use for service accounts |
| **Workbook Protection** | Enable for shared files |
| **Connection Files** | Secure `.odc` files |

---

## Security Checklist

### Initial Setup

- [ ] Choose appropriate authentication method
- [ ] Configure network policy
- [ ] Create role hierarchy
- [ ] Set up audit logging
- [ ] Document access policies

### Ongoing Operations

- [ ] Regular access reviews (quarterly)
- [ ] Key rotation (every 90-180 days)
- [ ] Monitor failed logins
- [ ] Review query patterns
- [ ] Update network policies as needed

### Incident Response

- [ ] Disable compromised accounts immediately
- [ ] Rotate exposed keys
- [ ] Review audit logs
- [ ] Update network policies
- [ ] Document and remediate

---

## Common Security Mistakes

!!! danger "Avoid These Practices"
    
    1. **Sharing service account credentials** — Use individual accounts
    2. **Storing passwords in code** — Use environment variables or secrets managers
    3. **Overly permissive roles** — Follow least privilege
    4. **Ignoring audit logs** — Set up regular monitoring
    5. **No network restrictions** — Implement network policies
    6. **Infrequent key rotation** — Rotate every 90-180 days
    7. **Using ACCOUNTADMIN for BI** — Create appropriate roles

---

## Quick Reference

### Security Integration Commands

```sql
-- List all security integrations
SHOW SECURITY INTEGRATIONS;

-- Describe specific integration
DESCRIBE SECURITY INTEGRATION my_oauth;

-- Alter integration
ALTER SECURITY INTEGRATION my_oauth SET ENABLED = FALSE;

-- Drop integration
DROP SECURITY INTEGRATION my_oauth;
```

### User Management Commands

```sql
-- Create user with best practices
CREATE USER new_user
    PASSWORD = 'InitialPassword123!'
    MUST_CHANGE_PASSWORD = TRUE
    DEFAULT_ROLE = analyst_role
    DEFAULT_WAREHOUSE = bi_wh;

-- Disable user
ALTER USER compromised_user SET DISABLED = TRUE;

-- Force password change
ALTER USER user_name SET MUST_CHANGE_PASSWORD = TRUE;
```

---

## Next Steps

- **[Performance Best Practices](performance.md)** — Optimize queries
- **[Troubleshooting](../troubleshooting.md)** — Common issues
- **[Authentication Overview](../authentication/overview.md)** — Method comparison

