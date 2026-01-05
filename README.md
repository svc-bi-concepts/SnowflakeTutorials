# Snowflake BI Tools Connection Guide

A comprehensive MkDocs Material documentation site for connecting BI tools (Tableau, Power BI, Excel) to Snowflake on Windows and macOS.

## Quick Start

### Prerequisites

- Python 3.9+
- pip or uv

### Installation

```bash
# Clone/navigate to the repository
cd SnowflakeTutorials

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Development Server

```bash
# Start the development server
mkdocs serve

# Open http://localhost:8000 in your browser
```

### Build for Production

```bash
# Build static site
mkdocs build

# Output will be in the 'site' directory
```

## Documentation Structure

```
docs/
├── index.md                    # Home page
├── getting-started/
│   ├── overview.md             # Introduction and concepts
│   └── prerequisites.md        # Requirements checklist
├── authentication/
│   ├── overview.md             # Auth methods comparison
│   ├── quick-reference.md      # Quick decision guide
│   ├── username-password.md    # Basic authentication
│   ├── oauth-sso.md            # OAuth and SSO setup
│   └── key-pair.md             # Key-pair authentication
├── bi-tools/
│   ├── tableau.md              # Tableau connection guide
│   ├── power-bi.md             # Power BI connection guide
│   └── excel.md                # Excel ODBC connection guide
├── platforms/
│   ├── windows.md              # Windows-specific setup
│   └── macos.md                # macOS-specific setup
├── best-practices/
│   ├── security.md             # Security recommendations
│   └── performance.md          # Performance optimization
└── troubleshooting.md          # Common issues and solutions
```

## Features

- **Modern UI** - Built with MkDocs Material theme
- **Dark/Light Mode** - Automatic theme switching
- **Search** - Full-text search across all documentation
- **Code Highlighting** - Syntax highlighting for SQL, Python, Bash
- **Tabbed Content** - Platform-specific instructions
- **Admonitions** - Tips, warnings, and info boxes
- **Diagrams** - Mermaid diagrams for flows

## Topics Covered

### Authentication Methods

Comprehensive coverage of all authentication methods with detailed pros/cons, platform-specific instructions, and best practices based on industry research.

| Method | Security | Complexity | Best For | Platform Support |
|--------|----------|------------|----------|------------------|
| Username & Password | Basic | Easy | Testing, Development | Windows ✅ macOS ✅ |
| OAuth / SSO | High | Medium | Enterprise Users | Windows ✅ macOS ✅ |
| Key-Pair | Very High | Complex | Automation, Service Accounts | Windows ✅ macOS ✅ |

**Key Features:**
- Detailed pros and cons for each method
- Platform-specific setup instructions (Windows & macOS)
- BI tool compatibility matrix
- Security best practices
- Troubleshooting guides
- Quick reference decision guide

### BI Tools

- **Tableau** - Full support on Windows and macOS
- **Power BI** - Windows only (alternatives for Mac)
- **Excel** - ODBC connections on both platforms

### Platform Guides

- Windows setup and configuration
- macOS setup and alternatives
- Network and proxy configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

