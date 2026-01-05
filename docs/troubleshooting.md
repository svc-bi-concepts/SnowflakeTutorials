# Troubleshooting Guide

<div class="hero-section" markdown>
## :material-wrench: Fix Common Issues

Solutions to frequent problems when connecting BI tools to Snowflake
</div>

## Quick Diagnostics

Before diving into specific issues, run through this checklist:

- [ ] Can you log into Snowflake web UI?
- [ ] Is your warehouse running (not suspended)?
- [ ] Are network/firewall rules allowing connection?
- [ ] Are you using the correct account identifier?
- [ ] Do you have the required permissions?

---

## Connection Issues

### Cannot Connect to Snowflake

??? question "Error: Connection timed out / Host not found"
    
    **Possible Causes:**
    
    - Incorrect account identifier
    - Network/firewall blocking connection
    - VPN issues
    - DNS resolution problems
    
    **Solutions:**
    
    1. **Verify account URL format:**
       ```
       Correct: xy12345.us-east-1.snowflakecomputing.com
       Wrong:   xy12345.snowflakecomputing.com (missing region)
       Wrong:   https://xy12345.us-east-1.snowflakecomputing.com (no protocol needed)
       ```
    
    2. **Test network connectivity:**
       ```bash
       # macOS/Linux
       nc -zv account.region.snowflakecomputing.com 443
       
       # Windows PowerShell
       Test-NetConnection account.region.snowflakecomputing.com -Port 443
       ```
    
    3. **Check firewall rules:**
       - Ensure outbound port 443 is allowed
       - Whitelist `*.snowflakecomputing.com`
    
    4. **Try different network:**
       - Test with mobile hotspot
       - Disable VPN temporarily

??? question "Error: Invalid username or password"
    
    **Possible Causes:**
    
    - Wrong credentials
    - Account locked
    - Case sensitivity
    - Password expired
    
    **Solutions:**
    
    1. **Verify credentials in Snowflake web UI first**
    
    2. **Check account lock status:**
       ```sql
       -- Admin only
       DESC USER your_username;
       -- Check DISABLED and LOCKED_UNTIL fields
       ```
    
    3. **Reset password if needed:**
       ```sql
       ALTER USER your_username SET PASSWORD = 'NewPassword123!';
       ```
    
    4. **Check username format:**
       - Username is case-insensitive for login
       - Email format if using SSO

??? question "Error: Role not authorized / insufficient privileges"
    
    **Possible Causes:**
    
    - User not granted required role
    - Default role not set
    - Role doesn't have warehouse access
    
    **Solutions:**
    
    1. **Check user's roles:**
       ```sql
       SHOW GRANTS TO USER your_username;
       ```
    
    2. **Verify role has required access:**
       ```sql
       -- Check warehouse access
       SHOW GRANTS ON WAREHOUSE your_warehouse;
       
       -- Check database access
       SHOW GRANTS ON DATABASE your_database;
       ```
    
    3. **Set default role:**
       ```sql
       ALTER USER your_username SET DEFAULT_ROLE = your_role;
       ```

---

## Authentication Issues

### OAuth / SSO Problems

??? question "Error: OAuth token is invalid or expired"
    
    **Solutions:**
    
    1. **Clear cached credentials:**
       - Tableau: Sign out and reconnect
       - Power BI: Clear saved credentials in data source settings
    
    2. **Re-authenticate:**
       - Complete OAuth flow again
       - Check if MFA completed successfully
    
    3. **Verify token settings:**
       ```sql
       DESC SECURITY INTEGRATION your_oauth;
       -- Check OAUTH_REFRESH_TOKEN_VALIDITY
       ```
    
    4. **Extend token validity (if appropriate):**
       ```sql
       ALTER SECURITY INTEGRATION your_oauth
           SET OAUTH_REFRESH_TOKEN_VALIDITY = 7776000; -- 90 days
       ```

??? question "Error: SAML assertion failed"
    
    **Solutions:**
    
    1. **Check certificate expiry:**
       - Verify IdP certificate hasn't expired
       - Update certificate in Snowflake if needed
    
    2. **Verify clock synchronization:**
       - SAML is time-sensitive
       - Check system clock accuracy
    
    3. **Validate attribute mappings:**
       ```sql
       DESC SECURITY INTEGRATION your_saml;
       ```
    
    4. **Review IdP logs for details**

??? question "SSO works in browser but not in BI tool"
    
    **Solutions:**
    
    1. **Use OAuth instead of browser-based SSO:**
       - Configure OAuth security integration
       - Some tools don't support browser popup
    
    2. **Check BI tool version:**
       - Update to latest version
       - Verify Snowflake connector version
    
    3. **Enable external browser auth:**
       - Set `AUTHENTICATOR=externalbrowser` for ODBC
       - This opens default browser for auth

### Key-Pair Authentication

??? question "Error: JWT token is invalid"
    
    **Solutions:**
    
    1. **Verify public key is registered:**
       ```sql
       DESC USER your_username;
       -- Check RSA_PUBLIC_KEY field
       ```
    
    2. **Check key format:**
       ```bash
       # Should show: -----BEGIN ENCRYPTED PRIVATE KEY-----
       # or: -----BEGIN PRIVATE KEY-----
       head -1 rsa_key.p8
       ```
    
    3. **Regenerate keys:**
       ```bash
       openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 -out rsa_key.p8
       openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
       ```
    
    4. **Ensure keys match:**
       - Public key must be derived from the private key you're using

??? question "Error: Private key file not found"
    
    **Solutions:**
    
    1. **Use absolute path:**
       - macOS: `/Users/yourname/.snowflake/keys/rsa_key.p8`
       - Windows: `C:\Users\yourname\.snowflake\keys\rsa_key.p8`
    
    2. **Check file permissions:**
       ```bash
       # macOS/Linux
       ls -la ~/.snowflake/keys/rsa_key.p8
       chmod 600 ~/.snowflake/keys/rsa_key.p8
       ```
    
    3. **Verify file exists and is readable by application**

??? question "Passphrase error / cannot decrypt private key"
    
    **Solutions:**
    
    1. **Verify passphrase is correct**
    
    2. **For automation, use unencrypted key:**
       ```bash
       openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out rsa_key.p8
       ```
       :warning: Store unencrypted keys with extra security!
    
    3. **Regenerate with new passphrase if forgotten**

---

## BI Tool-Specific Issues

### Tableau

??? question "Tableau extract refresh fails"
    
    **Solutions:**
    
    1. **Check embedded credentials:**
       - Re-embed password or reconfigure OAuth
    
    2. **Verify warehouse is running:**
       - Check auto-resume is enabled
    
    3. **Test connection manually:**
       - Try connecting from Tableau Desktop
    
    4. **Check Tableau Server logs:**
       - Location: `C:\ProgramData\Tableau\Tableau Server\data\tabsvc\logs\`

??? question "Tableau is slow with live connection"
    
    **Solutions:**
    
    1. **Consider using Extracts**
    
    2. **Optimize Snowflake:**
       - Scale up warehouse
       - Add clustering keys
       - Use materialized views
    
    3. **Reduce dashboard complexity:**
       - Fewer visuals per view
       - Limit quick filters
       - Pre-aggregate data
    
    4. **Check Initial SQL settings:**
       ```sql
       ALTER SESSION SET STATEMENT_TIMEOUT_IN_SECONDS = 3600;
       ```

### Power BI

??? question "DirectQuery times out"
    
    **Solutions:**
    
    1. **Increase timeout in Power BI:**
       - File → Options → DirectQuery → Timeout
    
    2. **Optimize query:**
       - Reduce visuals on page
       - Pre-aggregate in Snowflake
       - Use aggregation tables
    
    3. **Scale warehouse:**
       ```sql
       ALTER WAREHOUSE powerbi_wh SET WAREHOUSE_SIZE = 'LARGE';
       ```

??? question "Scheduled refresh fails in Power BI Service"
    
    **Solutions:**
    
    1. **Check credentials:**
       - Go to dataset settings
       - Re-enter data source credentials
    
    2. **For MFA accounts:**
       - MFA blocks scheduled refresh
       - Use OAuth with service principal
       - Or disable MFA for service account
    
    3. **Check gateway (if used):**
       - Verify gateway is online
       - Test connection through gateway

??? question "Power BI SSO not passing user identity"
    
    **Solutions:**
    
    1. **Verify configuration:**
       - Azure AD OAuth must be configured in Snowflake
       - User identities must match
    
    2. **Use DirectQuery mode:**
       - SSO only works with DirectQuery, not Import
    
    3. **Check tenant settings:**
       - Enable Snowflake SSO in Power BI Admin portal

### Excel

??? question "ODBC driver not appearing in list"
    
    **Solutions:**
    
    1. **Run correct ODBC Administrator:**
       - 64-bit Excel → 64-bit ODBC Admin
       - Path: `C:\Windows\System32\odbcad32.exe`
    
    2. **Reinstall driver:**
       - Download matching architecture (32/64-bit)
       - Run installer as Administrator
    
    3. **Restart Excel after installation**

??? question "Excel freezes when loading data"
    
    **Solutions:**
    
    1. **Reduce data volume:**
       ```sql
       SELECT * FROM table WHERE date > '2024-01-01' LIMIT 100000
       ```
    
    2. **Use Power Query with incremental load**
    
    3. **Increase system memory allocation**
    
    4. **Consider Tableau or Power BI for large datasets**

---

## ODBC Issues

??? question "ODBC test connection fails"
    
    **Solutions:**
    
    1. **Verify all required fields:**
       - Server (account URL)
       - Username
       - Database (optional but recommended)
       - Warehouse (required for queries)
    
    2. **Test with minimal configuration:**
       - Just Server and credentials first
    
    3. **Check driver version:**
       - Update to latest Snowflake ODBC driver

??? question "macOS ODBC configuration not working"
    
    **Solutions:**
    
    1. **Verify files exist:**
       ```bash
       cat ~/.odbc.ini
       cat ~/.odbcinst.ini
       ```
    
    2. **Check driver path:**
       ```bash
       ls /opt/snowflake/snowflakeodbc/lib/libSnowflake.dylib
       ```
    
    3. **Install iODBC:**
       ```bash
       brew install libiodbc
       ```
    
    4. **Test with isql:**
       ```bash
       isql -v Snowflake your_username your_password
       ```

---

## Network and Proxy Issues

??? question "Connection works from home but not office"
    
    **Solutions:**
    
    1. **Check corporate firewall:**
       - Request whitelisting for `*.snowflakecomputing.com`
       - Port 443 outbound
    
    2. **Configure proxy:**
       - Add proxy settings to ODBC DSN
       - Configure in BI tool settings
    
    3. **Use VPN if required**

??? question "SSL certificate errors"
    
    **Solutions:**
    
    1. **Update system certificates**
    
    2. **Check system date/time:**
       - Incorrect time causes certificate validation failures
    
    3. **Update Snowflake driver:**
       - Older drivers may have outdated certificates
    
    4. **macOS specific:**
       ```bash
       # Update Python certificates
       /Applications/Python\ 3.x/Install\ Certificates.command
       ```

---

## Performance Issues

??? question "Queries run slowly"
    
    **Solutions:**
    
    1. **Scale up warehouse:**
       ```sql
       ALTER WAREHOUSE your_wh SET WAREHOUSE_SIZE = 'LARGE';
       ```
    
    2. **Check warehouse is not suspended:**
       ```sql
       ALTER WAREHOUSE your_wh RESUME;
       ```
    
    3. **Analyze query:**
       ```sql
       -- Use query profile in Snowflake UI
       -- or
       SELECT * FROM TABLE(GET_QUERY_OPERATOR_STATS(LAST_QUERY_ID()));
       ```
    
    4. **Add clustering:**
       ```sql
       ALTER TABLE your_table CLUSTER BY (common_filter_column);
       ```

??? question "BI tool query timeout"
    
    **Solutions:**
    
    1. **Increase statement timeout:**
       ```sql
       ALTER SESSION SET STATEMENT_TIMEOUT_IN_SECONDS = 3600;
       ```
    
    2. **Increase timeout in BI tool settings**
    
    3. **Optimize query to run faster**
    
    4. **Use extracts instead of live connection**

---

## Getting Help

### Collect Diagnostic Information

When contacting support, gather:

1. **Error message** — Full text, not paraphrased
2. **Query ID** — From Snowflake query history
3. **Tool versions** — BI tool, driver, Snowflake
4. **Steps to reproduce** — What you did before error
5. **Screenshots** — If applicable

### Useful Diagnostic Queries

```sql
-- Check user permissions
SHOW GRANTS TO USER current_user();

-- Check role permissions
SHOW GRANTS TO ROLE your_role;

-- View recent query errors
SELECT 
    QUERY_ID,
    ERROR_CODE,
    ERROR_MESSAGE,
    QUERY_TEXT
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE USER_NAME = CURRENT_USER()
    AND EXECUTION_STATUS = 'FAIL'
ORDER BY START_TIME DESC
LIMIT 10;

-- Check login failures
SELECT *
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE USER_NAME = 'your_username'
    AND IS_SUCCESS = 'NO'
ORDER BY EVENT_TIMESTAMP DESC
LIMIT 10;
```

### Support Resources

| Resource | Description |
|----------|-------------|
| [Snowflake Documentation](https://docs.snowflake.com/) | Official documentation |
| [Snowflake Community](https://community.snowflake.com/) | User forum |
| [Tableau Help](https://help.tableau.com/) | Tableau documentation |
| [Power BI Community](https://community.powerbi.com/) | Power BI forum |
| Snowflake Support | Submit a ticket via Snowflake UI |

---

## Quick Reference

### Common Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `390100` | Invalid username/password | Verify credentials |
| `390201` | Role not authorized | Check role grants |
| `390318` | IP not allowed | Check network policy |
| `250001` | Warehouse not running | Resume warehouse |
| `100183` | Query timeout | Increase timeout or optimize |

### Diagnostic Commands

```sql
-- Current session info
SELECT 
    CURRENT_USER() as user,
    CURRENT_ROLE() as role,
    CURRENT_WAREHOUSE() as warehouse,
    CURRENT_DATABASE() as database;

-- Warehouse status
SHOW WAREHOUSES;

-- Recent queries
SELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())
ORDER BY START_TIME DESC LIMIT 20;
```

