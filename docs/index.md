# Snowflake BI Tools Connection Guide

<div class="hero-section" markdown>
## Connect Your BI Tools to Snowflake :snowflake:

A comprehensive guide for authenticating Tableau, Power BI, and Excel with Snowflake on Windows and macOS.
</div>

## Quick Navigation

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } __[Getting Started](getting-started/overview.md)__

    Prerequisites, account setup, and initial configuration

-   :material-key:{ .lg .middle } __[Authentication Methods](authentication/overview.md)__

    Compare OAuth, SSO, Key-Pair, and Username/Password options

-   :material-compass:{ .lg .middle } __[Quick Reference](authentication/quick-reference.md)__

    Decision guide to choose the right authentication method

-   :material-chart-areaspline:{ .lg .middle } __[Tableau](bi-tools/tableau.md)__

    Connect Tableau Desktop and Server to Snowflake

-   :material-chart-box:{ .lg .middle } __[Power BI](bi-tools/power-bi.md)__

    Configure Power BI Desktop and Service connections

-   :material-table:{ .lg .middle } __[Excel](bi-tools/excel.md)__

    Set up ODBC connections for Excel data access

-   :material-shield-check:{ .lg .middle } __[Best Practices](best-practices/security.md)__

    Security recommendations and performance optimization

</div>

---

## Authentication Methods at a Glance

| Method | Security Level | Complexity | Best For |
|--------|---------------|------------|----------|
| **Username & Password** | :material-shield-outline: Basic | :material-star: Easy | ⚠️ Test/development only - MFA required |
| **OAuth / SSO** | :material-shield-check: High | :material-star::material-star: Medium | Enterprise environments |
| **Key-Pair Authentication** | :material-shield-lock: Very High | :material-star::material-star::material-star: Complex | Service accounts, automation |

---

## Platform & Tool Compatibility

| Feature | Tableau | Power BI | Excel |
|---------|---------|----------|-------|
| **Windows Support** | :white_check_mark: Full | :white_check_mark: Full | :white_check_mark: Full |
| **macOS Support** | :white_check_mark: Full | :warning: Web Only | :white_check_mark: Limited |
| **OAuth/SSO** | :white_check_mark: Yes | :white_check_mark: Yes | :x: No |
| **Key-Pair Auth** | :white_check_mark: Yes | :x: No | :white_check_mark: Via ODBC |
| **Live Queries** | :white_check_mark: Yes | :white_check_mark: Yes | :white_check_mark: Yes |

---

## What You'll Learn

1. **Authentication Options** — Understand all available methods for secure access
2. **Step-by-Step Setup** — Detailed instructions for each BI tool and platform
3. **Security Best Practices** — Protect your data with proper configuration
4. **Performance Optimization** — Get the best query performance
5. **Troubleshooting** — Common issues and their solutions

---

!!! danger "Important: Username & Password Not for Production"
    **Snowflake is requiring MFA (Multi-Factor Authentication) for all accounts.** Username and password authentication is **not suitable for production environments** because MFA will break automated connections and scheduled refreshes. Use **OAuth/SSO** or **Key-Pair Authentication** for production.

---

## Need Help?

- :material-book-open: Check our [Troubleshooting Guide](troubleshooting.md)
- :material-file-document: View [Snowflake Official Documentation](https://docs.snowflake.com/)
- :material-help-circle: Contact your Snowflake administrator

