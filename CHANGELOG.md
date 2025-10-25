# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Added Dev Dependencies

- `eslint`: ^9.17.0
- `@eslint/js`: ^9.17.0
- `eslint-config-prettier`: ^9.1.0
- `globals`: ^15.14.0
- `prettier`: ^3.4.2
- `typescript`: ^5.7.2
