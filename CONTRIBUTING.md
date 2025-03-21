# Contributing to Map App

## How to Contribute

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally:
     ```bash
     git clone https://github.com/YOUR_USERNAME/map-app.git
     cd map-app
     ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

3. **Make Your Changes**
   - Write your code
   - Add tests if applicable
   - Ensure all tests pass: `npm test`
   - Build the project: `npm run build`

4. **Commit Your Changes**
   We use [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages should follow this format:
   ```
   type(scope): description

   [optional body]

   [optional footer]
   ```
   Types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc)
   - `refactor`: Code changes that neither fix bugs nor add features
   - `test`: Adding or modifying tests
   - `chore`: Changes to build process or auxiliary tools

   Examples:
   ```bash
   git commit -m "feat(search): add autocomplete to location search"
   git commit -m "fix(map): correct marker position calculation"
   git commit -m "docs: update installation instructions"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch and submit the PR
   - Fill in the PR template
   - Wait for the checks to pass

## Pull Request Process

1. Ensure your PR includes:
   - Clear description of changes
   - Any updates to documentation
   - Test coverage for new features
   - No unnecessary changes or commits

2. The PR will be reviewed by maintainers who may:
   - Request changes
   - Approve the PR
   - Provide feedback

3. Once approved:
   - Your PR will be merged
   - The changes will be included in the next release
   - A new version will be automatically published

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Release Process

Releases are handled automatically by semantic-release based on conventional commit messages:

- Patch Release (1.0.1): `fix` commits
- Minor Release (1.1.0): `feat` commits
- Major Release (2.0.0): commits with `BREAKING CHANGE` in body or footer

Contributors don't need to worry about releases - they are handled automatically when changes are merged to main. 