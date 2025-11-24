# Aegis AI

**Aegis AI** is an intelligent AI routing and data classification system that enables organizations to securely manage AI interactions based on data sensitivity levels. Built with Next.js, the platform provides enterprise-grade controls for routing queries to appropriate AI models based on classification levels (Public, Internal, Confidential, or Restricted).

## Features

### 🔐 Intelligent Query Classification
- Automatic sensitivity classification of user queries
- Four-tier classification system: Public, Internal, Confidential, Restricted
- Customizable classification AI model selection
- Real-time classification with detailed audit trails

### 🎯 Rule-Based AI Routing
- Create rules to route queries to specific AI models based on classification level
- Priority-based rule execution
- Support for multiple AI providers (OpenAI, Anthropic, Google Gemini, Perplexity, Custom)
- Activate/deactivate rules on demand

### 🏢 Multi-Tenant Organization Management
- Organization creation with unique join codes
- Role-based access control (Admin/User)
- Group management for user organization
- Per-organization AI model configurations

### 📊 Comprehensive Admin Dashboard
- Real-time statistics and analytics
- Event logging with detailed query/response tracking
- User and group management
- Data source (AI model) management with API key storage
- Search and filter capabilities across all logs

### 🔒 Security & Privacy
- Data source isolation per organization
- Encrypted API key storage
- Row-level security with Supabase
- Audit trail for all AI interactions
- Classification-based access controls

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Generative AI (extensible to other providers)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

This project uses Supabase for database management. Run the following SQL migrations in your Supabase SQL Editor:

1. **Initial Schema**: Run `setup_complete_schema.sql` to create the `data_sources` and `rules` tables
2. **Organizations**: Run `add_join_code_to_organizations.sql` to add join code support
3. **Classification Model**: Run `add_classification_model_to_organizations.sql` to enable custom classification model selection
4. **Fixes**: If you encounter any issues, run the fix scripts as needed:
   - `check_and_fix_rules_table.sql`
   - `fix_rules_ai_model_column.sql`

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI (for default classification model)
GOOGLE_API_KEY=your_google_ai_api_key
```

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin dashboard pages
│   │   ├── data-sources/   # AI model management
│   │   ├── events/         # Event logs & analytics
│   │   ├── groups/         # Group management
│   │   ├── rules/          # Classification routing rules
│   │   └── users/          # User management
│   ├── api/             # API routes
│   │   ├── admin/          # Admin-only endpoints
│   │   └── chat/           # Chat & classification logic
│   └── chat/            # User chat interface
├── components/          # Reusable React components
└── lib/                # Utilities & configurations
```

## How It Works

1. **User Sends Query**: User submits a query through the chat interface
2. **Classification**: The selected classification AI model analyzes the query and determines its sensitivity level
3. **Rule Matching**: System checks active rules for the determined classification level
4. **AI Routing**: Query is routed to the appropriate AI model based on matching rules
5. **Response & Logging**: AI response is returned to user and logged for audit purposes

## Admin Features

- **Data Sources**: Add and manage AI models with API keys for your organization
- **Rules**: Configure which AI model handles which classification level
- **Classification Model**: Choose which AI performs the sensitivity classification
- **Users & Groups**: Manage organization members and their groups
- **Events**: View detailed logs of all queries, classifications, and responses

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
