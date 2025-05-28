# Next.js Shadcn & Drizzle Template

A starter template which uses **Next.js** with **Shadcn UI** components and **Drizzle ORM**.

## Features

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Biome](https://biomejs.dev/)
- [Husky](https://typicode.github.io/husky/)

## Getting Started

### Installation

1. **Clone the Repository**

    ```sh
    git clone https://github.com/itsbrunodev/nextjs-shadcn-drizzle-template.git
    cd nextjs-shadcn-drizzle-template
    ```

2. **Install Dependencies**

    ```sh
    pnpm install
    ```

3. **Set up Your Environment**

   Create a `.env.local` file based on the provided `.env.example` to configure your environment variables such as database credentials.

## Project Structure

```plaintext
├── lib
│   └── db.ts          # Global database instance
├── schemas
│   └── index.ts       # Exports all schema files for Drizzle
├── components
│   └── ui             # Shadcn UI components
├── .env.example       # Example environment variable file
├── biome.json         # Biome configuration file
├── drizzle.config.ts  # Drizzle configuration file
└── ...                # Other project files
```

## Adding Shadcn UI components

To add Shadcn UI components to your project, simply run:

```bash
pnpm dlx shadcn-ui@latest add <component-name>
```

## Linting, Formatting, and Pre-commit Hooks

This template uses **Biome** as both a linter and formatter. **Husky** is configured to run pre-commit hooks..

### Biome

- **Format and Lint**: The following command checks and automatically fixes linting errors:

  ```bash
  pnpm format-and-lint:fix
  ```

### Husky

Every time you run `git commit`, Husky will trigger Biome to check the staged files. If any issues are found, your commit will be aborted until the issues are resolved.

If you need to bypass the hooks, though not recommended, you can use:

```bash
git commit --no-verify
```

## Running the Application

Start the development server with:

```bash
pnpm dev
```

Build the project for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Database Integration with Drizzle

- **Global Database Instance**: Import the `db` variable from [`lib/db.ts`](./lib/db.ts) wherever you need to perform database operations.
- **Schema Exports**: Ensure that all your schema files in the [`schemas/`](./schemas) directory are exported in [`schemas/index.ts`](./schemas/index.ts). This allows `drizzle.config.ts` to detect your schemas.

For example, your `schemas/index.ts` might look like:

```typescript
// schemas/index.ts

export * from "./auth";
// Export any additional schema files here
```
