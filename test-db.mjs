import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://xqblqnlqlfvupupprcgy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYmxxbmxxbGZ2dXB1cHByY2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTI2MjMsImV4cCI6MjA5NTQyODYyM30.n6uhEusX2sMKApZBYbSvzZqGxvsH201PHLt1qflnUHc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('orcamentos').select('*')
  console.log('Data:', data)
  console.log('Error:', error)
}
test()
