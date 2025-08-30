# Overview

This is a coding competition platform (similar to LeetCode/HackerRank) that allows organizers to create programming contests and participants to solve algorithmic problems. The platform features real-time leaderboards, AI-powered question generation, code execution with automated testing, and comprehensive event management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with TypeScript using ES modules
- **Framework**: Express.js with custom middleware for request logging and error handling
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Code Execution**: Custom sandboxed code execution service supporting Python, JavaScript, and Java
- **API Design**: RESTful endpoints with role-based access control (organizer vs participant)

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL as the target database
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Management**: Type-safe schema definitions with Drizzle Kit for migrations
- **Connection**: Connection pooling through @neondatabase/serverless

## Key Data Models
- **Users**: Authentication and role management (organizer/participant)
- **Events**: Competition containers with time-based activation
- **Questions**: AI-generated or manual coding problems with test cases
- **Submissions**: Code submissions with execution results and scoring
- **Event Participants**: Many-to-many relationship for event participation

## AI Integration
- **Question Generation**: OpenAI API integration for creating algorithmic problems
- **Code Evaluation**: AI-powered feedback system for code quality assessment
- **Content Customization**: Dynamic problem generation based on difficulty and topic requirements

## Authentication & Authorization
- **JWT Tokens**: Stateless authentication with 7-day expiration
- **Role-based Access**: Middleware-enforced permissions for organizer/participant actions
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Token Management**: Client-side token storage with automatic header injection

## Development Workflow
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Path Aliases**: Configured import aliases for clean code organization
- **Development Server**: Hot module replacement with Vite middleware integration

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives
- **express**: Backend web framework
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing and comparison

## AI & Code Execution
- **OpenAI API**: GPT integration for question generation and code feedback
- **Node.js child_process**: Sandboxed code execution environment
- **File system operations**: Temporary file management for code execution

## Development & Build Tools
- **vite**: Frontend build tool and development server
- **esbuild**: Backend bundling and compilation
- **tsx**: TypeScript execution for development
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database schema management and migrations

## Validation & Forms
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Integration between react-hook-form and zod

## UI & Styling
- **tailwindcss**: CSS framework with custom design system
- **class-variance-authority**: Type-safe CSS class composition
- **clsx**: Conditional CSS class utility
- **lucide-react**: Icon library