# Authentication Template Project

This project is an authentication template built with **Next.js 15**, **Lucia-auth**, and **Drizzle**. The setup is designed to handle both OAuth2 (Google, GitHub) and magic link authentication (via Resend) with features similar to Vercel's authentication system.

## Features

- **Sign-up & Sign-in**: Two authentication strategies:
  1. OAuth2 (Google, GitHub)
  2. Magic links (Resend)
- **Form validation**: Robust validation for both sign-up and sign-in flows.
- **Separate flows for each strategy**: You cannot sign in without first signing up.
- **Route protection**: Guarded routes for authorized and non-authorized users.
- **Server-side get user function**: Efficiently fetches user data on the server.
- **Email templates**: Built with React-Email components for a consistent design.
- **Shadcn UI components**: Includes dark and light mode support.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Soufi-MA/next15-drizzle-postgres-lucia-auth-template
   cd next15-drizzle-postgres-lucia-auth-template
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Copy the .env.example file and rename it to .env.
   Fill in the required values for OAuth providers, magic link configuration, database URL, etc.

   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Migrations

Custom scripts are available for managing Drizzle database migrations and exploring the schema:

- Generate a new migration:

  ```bash
  npm run migration:generate
  ```

- Push the migration to the database:

  ```bash
  npm run migration:push
  ```

- Open Drizzle Studio to explore the schema:

  ```bash
  npm run studio
  ```

## Contributing

Feel free to fork this repository, open issues, or submit pull requests with improvements.

## License

This project is licensed under the MIT License.
