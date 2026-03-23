import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://emxgzyagctsygoqzvmuu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVteGd6eWFnY3RzeWdvcXp2bXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzU1MzUsImV4cCI6MjA4OTUxMTUzNX0.LM-DjuDk0haKLadjg6RNmqo67H-WM60jK1MSMmA6Oio'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
