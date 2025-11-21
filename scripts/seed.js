const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedData() {
  try {
    console.log('🌱 Starting seed process...')

    // Create a test user (this would normally be done through Supabase Auth)
    // For demo purposes, we'll use a mock user ID
    const testUserId = '00000000-0000-0000-0000-000000000000'

    // 1. Create sample clients
    console.log('Creating sample clients...')
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert([
        {
          user_id: testUserId,
          name: 'Acme Corporation',
          email: 'billing@acme.com',
          phone: '+1 (555) 123-4567',
          billing_address: {
            street: '123 Business Ave',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          },
          default_payment_terms: 30
        },
        {
          user_id: testUserId,
          name: 'Beta LLC',
          email: 'finance@betallc.com',
          phone: '+1 (555) 987-6543',
          billing_address: {
            street: '456 Startup St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'USA'
          },
          default_payment_terms: 15
        },
        {
          user_id: testUserId,
          name: 'SoloDev Agency',
          email: 'hello@solodev.com',
          phone: '+1 (555) 456-7890',
          billing_address: {
            street: '789 Freelance Blvd',
            city: 'Austin',
            state: 'TX',
            zip: '73301',
            country: 'USA'
          },
          default_payment_terms: 45
        }
      ])
      .select()

    if (clientsError) throw clientsError
    console.log(`✅ Created ${clients.length} clients`)

    // 2. Create sample projects
    console.log('Creating sample projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .insert([
        {
          user_id: testUserId,
          client_id: clients[0].id,
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with React and Node.js',
          tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
          repo_url: 'https://github.com/example/ecommerce-platform',
          status: 'active'
        },
        {
          user_id: testUserId,
          client_id: clients[0].id,
          name: 'Mobile App Development',
          description: 'Cross-platform mobile app using React Native',
          tech_stack: ['React Native', 'TypeScript', 'Firebase'],
          repo_url: 'https://github.com/example/mobile-app',
          status: 'active'
        },
        {
          user_id: testUserId,
          client_id: clients[1].id,
          name: 'API Integration',
          description: 'Third-party API integration and data synchronization',
          tech_stack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
          repo_url: 'https://github.com/example/api-integration',
          status: 'completed'
        },
        {
          user_id: testUserId,
          client_id: clients[2].id,
          name: 'Website Redesign',
          description: 'Complete website redesign with modern UI/UX',
          tech_stack: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
          repo_url: 'https://github.com/example/website-redesign',
          status: 'active'
        }
      ])
      .select()

    if (projectsError) throw projectsError
    console.log(`✅ Created ${projects.length} projects`)

    // 3. Create sample tasks
    console.log('Creating sample tasks...')
    const tasks = []
    
    // Tasks for E-commerce Platform
    tasks.push(
      {
        project_id: projects[0].id,
        user_id: testUserId,
        title: 'Setup project structure',
        description: 'Initialize Next.js project with TypeScript and Tailwind',
        status: 'done',
        order_index: 0,
        estimate_hours: 4
      },
      {
        project_id: projects[0].id,
        user_id: testUserId,
        title: 'Design database schema',
        description: 'Create PostgreSQL schema for products, users, and orders',
        status: 'done',
        order_index: 1,
        estimate_hours: 6
      },
      {
        project_id: projects[0].id,
        user_id: testUserId,
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication with Supabase',
        status: 'in_progress',
        order_index: 2,
        estimate_hours: 8
      },
      {
        project_id: projects[0].id,
        user_id: testUserId,
        title: 'Build product catalog',
        description: 'Create product listing and detail pages',
        status: 'todo',
        order_index: 3,
        estimate_hours: 12
      },
      {
        project_id: projects[0].id,
        user_id: testUserId,
        title: 'Integrate payment processing',
        description: 'Add Stripe payment integration',
        status: 'backlog',
        order_index: 4,
        estimate_hours: 10
      }
    )

    // Tasks for Mobile App
    tasks.push(
      {
        project_id: projects[1].id,
        user_id: testUserId,
        title: 'Setup React Native project',
        description: 'Initialize React Native with TypeScript',
        status: 'done',
        order_index: 0,
        estimate_hours: 3
      },
      {
        project_id: projects[1].id,
        user_id: testUserId,
        title: 'Design app navigation',
        description: 'Implement bottom tab navigation',
        status: 'in_progress',
        order_index: 1,
        estimate_hours: 5
      },
      {
        project_id: projects[1].id,
        user_id: testUserId,
        title: 'Implement user profiles',
        description: 'Create user profile screens and functionality',
        status: 'todo',
        order_index: 2,
        estimate_hours: 8
      }
    )

    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)

    if (tasksError) throw tasksError
    console.log(`✅ Created ${tasks.length} tasks`)

    // 4. Create sample invoices
    console.log('Creating sample invoices...')
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .insert([
        {
          user_id: testUserId,
          client_id: clients[0].id,
          project_id: projects[0].id,
          invoice_number: 'DP-202412-0001',
          issue_date: '2024-12-01',
          due_date: '2024-12-31',
          currency: 'USD',
          status: 'paid',
          subtotal: 2400.00,
          tax: 192.00,
          discount: 0.00,
          total: 2592.00,
          metadata: { notes: 'E-commerce platform development - Phase 1' }
        },
        {
          user_id: testUserId,
          client_id: clients[1].id,
          project_id: projects[2].id,
          invoice_number: 'DP-202412-0002',
          issue_date: '2024-12-15',
          due_date: '2025-01-15',
          currency: 'USD',
          status: 'sent',
          subtotal: 1200.00,
          tax: 96.00,
          discount: 100.00,
          total: 1196.00,
          metadata: { notes: 'API integration project' }
        }
      ])
      .select()

    if (invoicesError) throw invoicesError
    console.log(`✅ Created ${invoices.length} invoices`)

    // 5. Create invoice items
    console.log('Creating invoice items...')
    const invoiceItems = [
      {
        invoice_id: invoices[0].id,
        description: 'Project setup and database design',
        qty: 10,
        rate: 100.00
      },
      {
        invoice_id: invoices[0].id,
        description: 'User authentication implementation',
        qty: 8,
        rate: 100.00
      },
      {
        invoice_id: invoices[0].id,
        description: 'Product catalog development',
        qty: 6,
        rate: 100.00
      },
      {
        invoice_id: invoices[1].id,
        description: 'API integration and testing',
        qty: 12,
        rate: 100.00
      }
    ]

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) throw itemsError
    console.log(`✅ Created ${invoiceItems.length} invoice items`)

    // 6. Create company settings
    console.log('Creating company settings...')
    const { error: settingsError } = await supabase
      .from('company_settings')
      .insert({
        user_id: testUserId,
        company_name: 'DevPilot Solutions',
        company_logo: 'https://via.placeholder.com/200x100/3B82F6/FFFFFF?text=DevPilot',
        default_hourly_rate: 100.00,
        invoice_footer: 'Thank you for your business! For questions, contact us at support@devpilot.com'
      })

    if (settingsError) throw settingsError
    console.log('✅ Created company settings')

    console.log('🎉 Seed completed successfully!')
    console.log('\nSample data created:')
    console.log(`- ${clients.length} clients`)
    console.log(`- ${projects.length} projects`)
    console.log(`- ${tasks.length} tasks`)
    console.log(`- ${invoices.length} invoices`)
    console.log(`- ${invoiceItems.length} invoice items`)
    console.log('- 1 company settings record')

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
