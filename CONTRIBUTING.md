# Contributing to Transact Flow

First of all, thank you for your time and interest in contributing. You are certainly helping yourself and others who are looking to learn from this material. Furthermore, all contributions are welcome.

## Code of Conduct

By participating in this project, you agree to be respectful and constructive in all interactions.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- A SQL Server instance or connection string for development

### Local Development Setup

1. Fork the repository and clone your fork:
```bash
git clone https://github.com/your-username/transact-flow.git
cd transact-flow
```

2. Add the original repository as upstream:
```bash
git remote add upstream https://github.com/VictorLCosta/transact-flow.git
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env.local` file for development (see `.env.example` for reference):
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

5. Set up the database:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

## Development Workflow

### Creating a Branch

Create a feature branch from the latest development version:
```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/` - For new features
- `fix/` - For bug fixes
- `refactor/` - For code refactoring
- `docs/` - For documentation updates
- `chore/` - For maintenance tasks

### Code Style

This project follows consistent code standards:

1. **TypeScript**
   - Use strict mode
   - Avoid `any` types; use explicit types
   - Keep functions small and focused
   - Use meaningful variable and function names

2. **Naming Conventions**
   - PascalCase for classes and types
   - camelCase for variables and functions
   - UPPER_SNAKE_CASE for constants
   - Descriptive names (avoid abbreviations)

3. **File Structure**
   - Controllers handle request/response logic
   - Services contain business logic
   - Middlewares handle cross-cutting concerns
   - Utils contain helper functions
   - Validations contain schema definitions

### Running Quality Checks

Before committing, ensure your code passes all checks:

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Committing Changes

Follow conventional commit format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - A new feature
- `fix` - A bug fix
- `refactor` - Code refactoring
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `test` - Adding or updating tests
- `chore` - Build process, dependencies, or tooling changes
- `perf` - Performance improvements

**Examples:**
```
feat(auth): add password reset functionality
fix(cache): prevent stale cache after user update
refactor(controllers): simplify error handling
docs(readme): update setup instructions
```

Keep commits atomic and focused on a single change.

## Making Changes

### Database Schema Changes

When modifying the Prisma schema:

1. Edit `prisma/schema.prisma`
2. Create a migration:
```bash
npx prisma migrate dev --name descriptive_migration_name
```
3. Review the generated migration file in `prisma/migrations/`
4. Commit both the schema and migration files

### Adding New Features

1. Create a feature branch
2. Implement your feature with proper TypeScript typing
3. Add or update validation schemas if needed
4. Update relevant services and controllers
5. Add API documentation in comments
6. Test thoroughly

### Example: Adding a New Endpoint

1. **Create a validation schema** in `src/validations/`:
```typescript
import Joi from 'joi';

export const createFeatureSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    // ... other fields
  }),
};
```

2. **Create a service** in `src/services/` or extend an existing one:
```typescript
export const createFeature = async (data: CreateFeatureInput) => {
  // Business logic here
};
```

3. **Add a controller** in `src/controllers/`:
```typescript
export const create = catchAsync(async (req, res) => {
  const feature = await featureService.createFeature(req.body);
  res.status(httpStatus.CREATED).send(feature);
});
```

4. **Add a route** in `src/routes/`:
```typescript
router.post('/features', validate(createFeatureSchema), featureController.create);
```

5. **Add documentation** in `src/docs/components.yml` for Swagger

## Submitting Changes

### Pull Request Process

1. Ensure your code follows the style guide by running:
```bash
npm run lint:fix
```

2. Keep your branch up to date with main:
```bash
git fetch upstream
git rebase upstream/main
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

4. Create a pull request on GitHub

### Pull Request Guidelines

- Use a clear, descriptive title
- Reference any related issues (e.g., "Fixes #123")
- Provide a detailed description of changes
- Explain the motivation and context
- Include any breaking changes
- Keep the PR focused on a single concern

**Example PR description:**
```markdown
## Description
Adds password reset functionality to the authentication system.

## Changes
- New `POST /api/auth/forgot-password` endpoint
- New `POST /api/auth/reset-password` endpoint
- Password reset token generation and validation
- Email notification service integration

## Type of Change
- [x] New feature
- [ ] Bug fix
- [ ] Breaking change

## Testing
- [x] Tested locally
- [x] No new warnings generated
- [x] Code linting passes

## Related Issues
Fixes #42
```

## Reporting Issues

### Reporting Bugs

Before creating a bug report, check existing issues to avoid duplicates.

When reporting a bug, include:
- Clear, descriptive title
- Exact steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, Node.js version, etc.)
- Relevant logs or error messages

### Suggesting Enhancements

- Use a clear, descriptive title
- Provide detailed description of the enhancement
- Explain the use case and benefits
- List any alternative approaches you've considered

## Testing

Currently, the project has no test suite implemented. Contributors are encouraged to work on adding tests. When tests are available, all new features must include corresponding tests.

## Documentation

- Update README.md if adding new features or changing behavior
- Add TSDoc comments to functions and complex logic
- Update API documentation in `src/docs/components.yml` for Swagger
- Keep comments clear and concise

## Performance Considerations

- Minimize database queries using relationships and eager loading
- Leverage caching appropriately
- Avoid N+1 query problems
- Monitor response times
- Profile code when dealing with large datasets

## Security Considerations

- Never commit sensitive data (keys, passwords, credentials)
- Use environment variables for configuration
- Validate and sanitize all inputs
- Follow OWASP guidelines
- Report security vulnerabilities via email to the maintainers (privately)

## Questions?

- Check existing documentation
- Review similar code in the project
- Open an issue with the question tag
- Contact the maintainers

## Recognition

Contributors will be recognized and appreciated for their contributions. Thank you for helping improve Transact Flow!

---

**Happy coding!** 🚀
