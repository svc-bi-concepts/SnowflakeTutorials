# Authentication Methods Overview

Snowflake supports multiple authentication methods, each designed for different use cases and security requirements. This guide helps you choose the right method for your needs.

!!! info "Interactive vs. Service Account Authentication"
    **Interactive users** (humans) typically use OAuth/SSO with MFA.  
    **Service accounts** (automated BI refreshes) need non-interactive methods like OAuth with Service Principal, Programmatic Access Tokens, or Key-Pair authentication.

## Authentication Methods Comparison

<div class="auth-method-card" markdown>

### :material-shield-lock: OAuth2 with Service Principal

<span class="security-badge security-high">Best Practice</span>

Machine-to-machine authentication using your organization's identity provider (Azure AD, Okta). No interactive MFA required.

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### :material-check-circle: Pros
- Centralized identity control
- Token expiry and rotation
- No password storage
- No interactive MFA prompts
- Audit trail via IdP
</div>
<div class="cons-box" markdown>
#### :material-close-circle: Cons
- Requires IdP setup (Azure AD/Okta)
- Snowflake security integration config
- IT coordination needed
- Initial complexity
</div>
</div>

**Best for:** Production BI deployments, scheduled refreshes, service accounts

[Learn More :material-arrow-right:](oauth-sso.md){ .md-button }
</div>

---

<div class="auth-method-card" markdown>

### :material-ticket-confirmation: Programmatic Access Tokens (PATs)

<span class="security-badge security-high">High Security</span>

Long-lived tokens that replace passwords for service accounts. Use with `TYPE=SERVICE` users.

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### :material-check-circle: Pros
- Works where OAuth isn't feasible
- Avoids storing real passwords
- Non-interactive authentication
- Simple to implement
- Works with all BI tools
</div>
<div class="cons-box" markdown>
#### :material-close-circle: Cons
- Tokens need secure storage
- Manual rotation required
- Not as seamless as OAuth
- Expiration management needed
</div>
</div>

**Best for:** Service accounts when OAuth isn't available, legacy integrations

[Learn More :material-arrow-right:](programmatic-tokens.md){ .md-button }
</div>

---

<div class="auth-method-card" markdown>

### :material-key-chain: Key-Pair Authentication

<span class="security-badge security-high">Very High Security</span>

Cryptographic authentication using RSA public/private key pairs. **Tableau only** — not supported by Power BI.

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### :material-check-circle: Pros
- No passwords to manage
- Strongest security option
- Ideal for Tableau automation
- No MFA interruptions
- Non-interactive auth
</div>
<div class="cons-box" markdown>
#### :material-close-circle: Cons
- **Not supported by Power BI**
- Complex initial setup
- Key management overhead
- Requires technical knowledge
</div>
</div>

**Best for:** Tableau service accounts, automated Tableau extracts

[Learn More :material-arrow-right:](key-pair.md){ .md-button }
</div>

---

<div class="auth-method-card" markdown>

### :material-shield-lock-outline: OAuth / SSO (Interactive)

<span class="security-badge security-high">High Security</span>

Interactive authentication through your IdP for human users with MFA support.

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### :material-check-circle: Pros
- Enterprise-grade security
- Supports MFA natively
- Centralized user management
- Session-based access
- Audit trail via IdP
</div>
<div class="cons-box" markdown>
#### :material-close-circle: Cons
- Interactive MFA prompts
- Token expiration (re-auth)
- Requires IdP configuration
- Not suitable for automation
</div>
</div>

**Best for:** Interactive users in enterprise environments

[Learn More :material-arrow-right:](oauth-sso.md){ .md-button }
</div>

---

<div class="auth-method-card" markdown>

### :material-account-key: Username & Password

<span class="security-badge security-low">⚠️ Being Deprecated</span>

The simplest authentication method using Snowflake credentials directly.

!!! warning "Deprecation Notice"
    Snowflake is **sunsetting hardcoded username/password** for service accounts. Plan migration to OAuth, PATs, or Key-Pair authentication.

<div class="pros-cons-grid" markdown>
<div class="pros-box" markdown>
#### :material-check-circle: Pros
- Simple and quick setup
- No additional configuration
- Works with all BI tools
- Familiar to most users
</div>
<div class="cons-box" markdown>
#### :material-close-circle: Cons
- **Being deprecated**
- Credentials stored locally
- No token expiration
- Higher security risk
- MFA breaks automation
</div>
</div>

**Best for:** Quick testing, development only — **not recommended for production**

[Learn More :material-arrow-right:](username-password.md){ .md-button }
</div>

---

## Practical Recommendations

| Method | Power BI | Tableau | MFA Required | Recommended |
|--------|:--------:|:-------:|:------------:|:-----------:|
| **OAuth2 with Service Principal** | ✅ | ✅ | No | ✅ **Best overall** |
| **Programmatic Access Tokens** | ✅ | ✅ | No | ✅ Good fallback |
| **Key-Pair Auth** | ❌ | ✅ | No | ✅ For Tableau |
| **Username/Password** | ✅ | ✅ | No (if disabled) | ⚠️ Not future-proof |

---

## Decision Matrix

Use this matrix to choose the right authentication method:

| Requirement | OAuth Service Principal | PATs | Key-Pair | Username/Password |
|-------------|:-----------------------:|:----:|:--------:|:-----------------:|
| Quick setup | :x: | :white_check_mark: | :x: | :white_check_mark: |
| Enterprise security | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| Automated/scheduled refresh | :white_check_mark: | :white_check_mark: | :white_check_mark: | :warning: |
| Service accounts | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| Power BI support | :white_check_mark: | :white_check_mark: | :x: | :white_check_mark: |
| Tableau support | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Excel support | :x: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Centralized management | :white_check_mark: | :warning: | :warning: | :x: |
| Token/credential rotation | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| Future-proof | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |

:white_check_mark: = Full Support | :warning: = Partial/Limited | :x: = Not Supported

---

## BI Tool Support Matrix

| Authentication | Tableau Desktop | Tableau Server | Power BI Desktop | Power BI Service | Excel |
|----------------|:---------------:|:--------------:|:----------------:|:----------------:|:-----:|
| OAuth Service Principal | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| Programmatic Access Tokens | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Key-Pair | :white_check_mark: | :white_check_mark: | :x: | :x: | :white_check_mark: |
| OAuth Interactive (SSO) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| Username/Password | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |

:white_check_mark: = Full Support | :x: = Not Supported

---

## Security & Operational Best Practices

!!! tip "Security Recommendations"
    - **Least Privilege RBAC** — Grant only necessary permissions to service accounts
    - **Credential Rotation** — Rotate tokens and keys regularly (quarterly recommended)
    - **Secure Storage** — Store secrets in Azure Key Vault, HashiCorp Vault, or similar
    - **Token Expiration** — Test token refresh logic to avoid scheduled refresh failures
    - **Network Policies** — Restrict access by IP when possible
    - **Audit Logging** — Monitor access via IdP and Snowflake audit logs

!!! danger "Avoid in Production"
    **Username and Password** authentication should be avoided in production:
    
    - Snowflake is sunsetting this for service accounts
    - Credentials stored in connection files/workbooks
    - No centralized password management
    - MFA breaks automated processes

---

## Next Steps

Choose your authentication method and follow the detailed setup guide:

<div class="quick-links" markdown>

<a href="../oauth-sso/" class="quick-link-card">
<h3>:material-shield-lock: OAuth / Service Principal</h3>
<p>Best practice for production</p>
</a>

<a href="../programmatic-tokens/" class="quick-link-card">
<h3>:material-ticket-confirmation: Programmatic Tokens</h3>
<p>Good fallback option</p>
</a>

<a href="../key-pair/" class="quick-link-card">
<h3>:material-key-chain: Key-Pair (Tableau)</h3>
<p>For Tableau automation</p>
</a>

<a href="../username-password/" class="quick-link-card">
<h3>:material-account-key: Username & Password</h3>
<p>Development/testing only</p>
</a>

</div>
