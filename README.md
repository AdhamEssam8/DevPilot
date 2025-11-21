# DevPilot - AI Developer Command Center

A comprehensive web application for managing development projects, clients, and invoices with AI-powered project planning and automated billing.

## 🚀 Features

- **Authentication**: Secure login with Supabase Auth (magic link)
- **Project Management**: Create, organize, and track development projects
- **Client Management**: Store client information and billing details
- **AI Project Planner**: Generate structured project plans using GPT-4 via OpenRouter
- **Kanban Board**: Drag-and-drop task management with real-time updates
- **Invoice System**: Create, manage, and send professional invoices
- **PDF Generation**: Generate branded PDF invoices
- **Stripe Integration**: Accept payments with Stripe Checkout
- **Company Settings**: Customize branding and billing preferences

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenRouter (GPT-4)
- **Payments**: Stripe
- **PDF**: React PDF
- **State Management**: React Context + Zustand
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key
- Stripe account

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd devpilot
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema in your Supabase SQL editor:

```bash
# Copy and paste the contents of supabase-schema.sql into Supabase SQL editor
cat supabase-schema.sql
```

3. Create a storage bucket for PDFs:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `invoices`
   - Set it to public

### 4. Seed Sample Data

```bash
npm run seed
```

This will create sample clients, projects, tasks, and invoices for testing.

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
devpilot/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── ai/            # AI planning endpoints
│   │   │   ├── invoices/      # Invoice management
│   │   │   └── stripe/        # Payment processing
│   │   ├── auth/              # Authentication pages
│   │   ├── clients/           # Client management
│   │   ├── invoices/          # Invoice pages
│   │   ├── projects/          # Project management
│   │   └── settings/          # Company settings
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── auth/             # Authentication components
│   │   ├── kanban/           # Kanban board
│   │   ├── ai/               # AI planner
│   │   └── invoices/         # Invoice components
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utility libraries
│   └── types/                # TypeScript definitions
├── scripts/                  # Database seeding
├── supabase-schema.sql      # Database schema
└── .env.example             # Environment template
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable Row Level Security (RLS) is already configured in the schema
3. Set up authentication providers in Supabase Auth settings
4. Create the `invoices` storage bucket

### Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhooks:
   - Endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`

### OpenRouter Setup

1. Get an API key from [OpenRouter](https://openrouter.ai)
2. Add it to your environment variables as `OPENROUTER_API_KEY`
3. The AI planner will use GPT-4 by default (via OpenRouter)

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` (set to `https://dev-pilot-topaz.vercel.app`)

## 📖 Usage

### Getting Started

1. **Sign Up**: Use magic link authentication to create an account
2. **Add Clients**: Go to Clients page and add your first client
3. **Create Projects**: Set up projects and link them to clients
4. **Use AI Planner**: Generate project plans with the AI assistant
5. **Manage Tasks**: Use the Kanban board to track progress
6. **Create Invoices**: Generate professional invoices for your work
7. **Accept Payments**: Use Stripe integration for seamless payments

### AI Project Planner

The AI planner uses GPT-4 via OpenRouter to generate structured project plans:

1. Go to any project page
2. Click "AI Project Planner"
3. Describe your project idea
4. Get a detailed plan with phases, tasks, and time estimates
5. Generate a Kanban board from the plan

### Invoice Management

1. Create invoices with line items
2. Generate professional PDFs
3. Send payment links via Stripe
4. Track payment status automatically

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User data is isolated by user_id
- API keys are server-side only
- Stripe webhooks are verified with signatures

## 🧪 Testing

The application includes sample data for testing:

- 3 sample clients
- 4 sample projects with tasks
- 2 sample invoices
- Company settings

Run `npm run seed` to populate your database with test data.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔄 Changelog

### v1.0.0
- Initial release
- Authentication with Supabase
- Project and client management
- AI-powered project planning
- Kanban task management
- Invoice creation and PDF generation
- Stripe payment integration
- Company settings and branding

---

Built with ❤️ using Next.js, Supabase, and OpenRouter