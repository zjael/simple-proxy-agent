# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Critical:** Fixed proxy authentication for HTTPS connections
  - Added proper `Proxy-Authorization` header for CONNECT requests
  - Fixed authentication for both HTTP and HTTPS proxies
  - Should resolve issue #33 (authenticated proxy failures)
- **Important:** Fixed SNI (Server Name Indication) handling for TLS connections
  - Now correctly uses hostname without port for servername
  - Should resolve issue #24 (421 Misdirected Request errors)
- **Important:** Fixed SOCKS DNS resolution to match standard behavior
  - SOCKS4 and SOCKS5 use client-side DNS resolution
  - SOCKS4a and SOCKS5h use remote DNS resolution (proxy-side)
- Added validation for proxy CONNECT response status codes
- Added better error messages for proxy connection failures

### Added

- **Performance:** LRU cache for agent instances (max 50 cached agents)
  - Agent instances are automatically reused for identical configurations
  - Reduces overhead for repeated proxy connections

- Integration test suite for testing with real proxy servers
- Example scripts: `integration-test.js`, `simple-test.js`, `mock-proxy-server.js`
- Docker Compose setup for testing with real proxies
- Documentation for SOCKS DNS resolution behavior
- TypeScript type definitions (.d.ts files) for all modules
- JSDoc comments throughout the codebase for better IDE support
- ESLint configuration with modern JavaScript rules
- Prettier for consistent code formatting
- `.editorconfig` for editor consistency
- TypeScript support via `tsconfig.json`
- New npm scripts: `lint`, `lint:fix`, `format`, `format:check`, `type-check`
- Comprehensive README with TypeScript examples and API documentation
- GitHub Actions jobs for linting and type checking

### Changed

- Updated minimum Node.js version from 10.x to 18.x (current LTS)
- Modernized GitHub Actions workflow (actions/checkout@v4, actions/setup-node@v4)
- Updated GitHub Actions to test on Node.js 18.x, 20.x, and 22.x
- Updated all dependencies to latest versions
- Improved README with better documentation and examples
- Fixed test file issues (removed invalid `.done` calls)
- Fixed all ESLint warnings and errors
- Formatted all code with Prettier for consistency

### Updated Dependencies

- `socks`: ^2.3.2 → ^2.8.3
- `mocha`: ^9.0.2 → ^11.0.1
- `node-fetch`: ^2.6.0 → ^2.7.0
- `pem`: ^1.14.3 → ^1.14.8

### Added Dependencies

- `lru-cache`: ^11.0.2 (for agent instance caching)

### Added Dev Dependencies

- `eslint`: ^9.17.0
- `@eslint/js`: ^9.17.0
- `eslint-config-prettier`: ^9.1.0
- `globals`: ^15.14.0
- `prettier`: ^3.4.2
- `typescript`: ^5.7.2
