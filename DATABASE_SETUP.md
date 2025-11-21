# Database Setup Guide

If you're seeing the error: **"Could not find the table 'public.projects' in the schema cache"**, it means the database tables haven't been created yet in your Supabase project.

## Quick Setup Steps

### 1. Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### 2. Run the Schema

1. Open the file `supabase-schema.sql` in this repository
2. Copy **ALL** the contents (from line 1 to the end)
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press `Cmd/Ctrl + Enter`)

### 3. Verify Tables Were Created

After running the schema, you should see these tables in the **Table Editor**:
- ✅ `clients`
- ✅ `projects`
- ✅ `tasks`
- ✅ `invoices`
- ✅ `invoice_items`
- ✅ `company_settings`

### 4. Check Row Level Security (RLS)

The schema automatically enables RLS and creates policies. To verify:
1. Go to **Authentication** > **Policies** in Supabase
2. You should see policies for each table

### 5. Test Your Connection

After setting up the database, refresh your app. The error should be resolved.

## Troubleshooting

### Error: "relation already exists"
- Some tables might already exist. You can either:
  - Drop existing tables and re-run the schema, OR
  - Run only the parts of the schema that are missing

### Error: "permission denied"
- Make sure you're running the SQL as a database admin
- Check that you have the correct permissions in your Supabase project

### Tables exist but still getting errors
1. Check your environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
2. Verify the Supabase project is active
3. Check the browser console for more detailed error messages

## Manual Table Creation (Alternative)

If you prefer to create tables one by one, here's the minimal setup:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table (most important)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  repo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);
```

Then continue with the rest of the schema from `supabase-schema.sql`.

## Need Help?

If you're still having issues:
1. Check the Supabase logs in the Dashboard
2. Verify your environment variables are set correctly
3. Make sure you're authenticated (logged in) when testing

