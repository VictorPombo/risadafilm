import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xqblqnlqlfvupupprcgy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYmxxbmxxbGZ2dXB1cHByY2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTI2MjMsImV4cCI6MjA5NTQyODYyM30.n6uhEusX2sMKApZBYbSvzZqGxvsH201PHLt1qflnUHc'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    console.log(`Failed for ${password}: ${error.message}`)
  } else {
    console.log(`SUCCESS for ${password}`)
  }
}

async function main() {
  await testLogin('admin@risadafilm.com.br', 'risada123')
  await testLogin('admin@risadafilm.com.br', 'admin123')
  await testLogin('admin@risadafilm.com.br', '123456')
}

main()
