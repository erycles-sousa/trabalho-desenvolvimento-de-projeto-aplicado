import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://skcsqynlavyvauobeisy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY3NxeW5sYXZ5dmF1b2JlaXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2Mjk2ODksImV4cCI6MjA4MDIwNTY4OX0.qyPiI5PKS936wBSST0ok7ha2JlmfGWvaFIObSv10JOA'

export const supabase = createClient(supabaseUrl, supabaseKey)