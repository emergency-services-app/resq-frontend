# Contributing to ResQ Frontend (पहिलो उद्धार)

We welcome contributions from everyone! Please follow these guidelines when contributing to the project.

## Branch Naming Convention

All branches should follow this naming pattern:

```bash
<type>/<description>
```

Types:

- `feat/`: New features
- `fix/`: Bug fixes
- `chore/`: Maintenance tasks
- `docs/`: Documentation updates
- `test/`: Adding or modifying tests
- `refactor/`: Code refactoring
- `style/`: Code style changes

Examples:

```bash
feat/live-location-tracking
fix/socket-connection-error
chore/update-dependencies
docs/update-readme
test/add-unit-tests
refactor/cleanup-code
style/fix-linting
```

## Pull Request Process

1. **Create a Branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes**

   - Follow the code style guidelines
   - Write or update tests
   - Update documentation if needed

3. **Commit Changes**

   ```bash
   git commit -m "feat: add new feature"
   ```

4. **Push Changes**

   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create Pull Request**
   - Fill out the PR template
   - Link related issues
   - Request reviews from team members

## Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

## Testing Requirements

- Write unit tests for new features
- Update existing tests if needed
- Ensure all tests pass before submitting PR
- Add integration tests for critical features

## Documentation

- Update README.md for significant changes
- Add comments for complex code
- Document API changes
- Update TypeScript types

## Review Process

1. Code review by at least one team member
2. Address all review comments
3. Ensure CI checks pass
4. Get final approval before merging

## Additional Requirements

1. **Security**

   - Report security vulnerabilities privately
   - Follow secure coding practices
   - Don't commit sensitive information

2. **Accessibility**

   - Follow WCAG guidelines
   - Test with screen readers
   - Ensure color contrast meets standards

3. **Performance**

   - Optimize images and assets
   - Minimize API calls
   - Use efficient algorithms

4. **Dependencies**

   - Keep dependencies up to date
   - Document major version changes
   - Use secure versions of packages

5. **Deployment**
   - Follow deployment checklist
   - Test in staging environment
   - Document deployment process
