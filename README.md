# Transact Flow - RESTful API Boilerplate

A REST API built with Node.js, Express, Prisma and TypeScript, designed to serve as a reference project and guide for building scalable, well-structured APIs using this stack.

This repository attempts to demonstrate best practices for project structure, strong typing, environment configuration, structured caching, and clean separation of responsibilities.

Feel free to explore this codebase and use the way it best suits you.

## Project Purposes

- Provide a reference implementation for Express + TypeScript APIs
- Speed up the initial setup of new backend projects
- Help developers to understand how to integrate Express and Typescript

## Running the project

1. Clone this repo
```bash
git clone https://github.com/VictorLCosta/transact-flow.git
cd transact-flow
```

2. Install the dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following environment variables:
```env
# Database
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE_MINUTES=1440

# Redis
REDIS_URL=redis://localhost:6379

# Node Environment
NODE_ENV=development

# API Port
PORT=3000

# Application Settings
LOG_LEVEL=info
```

4. Set up the database and run migrations:
```bash
npx prisma migrate dev
```

5. (Optional) Seed the database:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production Build

To build for production:
```bash
npm run build
```

Start with PM2:
```bash
npm start
```

## Features and Tech Stack

### Core Technologies
- **Node.js & Express** - Fast and minimalist web framework
- **TypeScript** - Strongly typed JavaScript
- **Prisma** - Modern database ORM with auto-generated client
- **Socket.io** - Real-time bidirectional communication

### Key Features
- ✅ **Authentication & Authorization** - JWT-based auth with Passport.js
- ✅ **Database** - SQL Server with Prisma ORM
- ✅ **Caching** - Redis integration with custom cache invalidation layer
- ✅ **Data Validation** - Request validation using Joi and Zod
- ✅ **CSV Import** - Bulk data import with job processing
- ✅ **Real-time Updates** - WebSocket support via Socket.io
- ✅ **Structured Logging** - Winston logger with multiple transports
- ✅ **API Documentation** - Swagger/OpenAPI documentation
- ✅ **Security** - Helmet for HTTP headers, XSS protection, CORS
- ✅ **Rate Limiting** - Express rate-limit middleware
- ✅ **Error Handling** - Centralized error handling
- ✅ **Compression** - Response compression for better performance

### Included Packages
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation and verification
- **morgan** - HTTP request logger
- **helmet** - Secure HTTP headers
- **dotenv** - Environment variable management
- **ioredis** - Redis client
- **pm2** - Node.js process manager for production
- **eslint** - Code linting

## Project Structure

```
src/
├── app.ts                 # Express app initialization
├── server.ts             # Server startup logic
├── socket.ts             # Socket.io configuration
├── config/               # Configuration files (logger, redis, passport)
├── controllers/          # Request handlers
├── middlewares/          # Express middlewares (auth, error, validation)
├── routes/               # API route definitions
├── services/             # Business logic layer
├── jobs/                 # Background job processing
├── cache/                # Caching utilities
├── validations/          # Joi/Zod validation schemas
├── utils/                # Helper functions
├── types/                # TypeScript type definitions
└── generated/            # Auto-generated types (Prisma)

prisma/
├── schema.prisma         # Database schema
├── seed.ts              # Database seeding script
└── migrations/          # Database migration files

tests/                   # Test files (when added)
```

## API Documentation

API documentation is available through Swagger UI at `/api-docs` when the server is running.

### Main Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-tokens` - Refresh access token

**Users**
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Projects**
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Jobs**
- `POST /api/jobs/import` - Start CSV import job
- `GET /api/jobs/:id` - Get job status
- `GET /api/projects/:projectId/jobs` - List project jobs

## Development

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database Management
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Architecture Highlights

- **Service Layer Pattern** - Business logic separated from controllers
- **Custom Error Handling** - Standardized error responses
- **Cache Invalidation** - Automatic cache clearing on data changes
- **Type Safety** - Full TypeScript coverage
- **Modular Routes** - Easy to extend and maintain

## License

MIT

## References

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Swagger/OpenAPI](https://swagger.io/)
- [Node Express Boilerplate](https://github.com/hagopj13/node-express-boilerplate/tree/master)
- [Prisma Express Boilerplate](https://github.com/antonio-lazaro/prisma-express-typescript-boilerplate)