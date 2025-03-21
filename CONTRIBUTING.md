# Contributing to Map App

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `ci`: Changes to CI configuration files and scripts
- `revert`: Reverts a previous commit

### Scope

The scope should be the name of the component or module affected (e.g., search, weather, map).

### Examples

```
feat(search): add autocomplete to location search
fix(weather): correct radar layer opacity
docs(readme): update installation instructions
test(map): add unit tests for map controls
```

### Breaking Changes

Breaking changes should be indicated by adding `BREAKING CHANGE:` in the commit message body or footer:

```
feat(api): change weather API endpoint

BREAKING CHANGE: The weather API endpoint has changed from /weather to /v2/weather
```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with details of changes
3. Follow the commit message convention
4. The PR will be merged once you have the sign-off from a maintainer

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

## Release Process

Releases are handled automatically by semantic-release based on conventional commit messages:

- Patch Release (1.0.1): `fix` commits
- Minor Release (1.1.0): `feat` commits
- Major Release (2.0.0): commits with `BREAKING CHANGE` in body or footer 