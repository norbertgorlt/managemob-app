import { Outlet } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import { supabase } from '../lib/supabase'

interface LayoutProps {
  session: Session
}

export default function Layout({ session }: LayoutProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const userEmail = session.user.email || ''
  const userName = userEmail.split('@')[0]

  return (
    <div className="app-layout">
      <Sidebar userName={userName} userEmail={userEmail} onLogout={handleLogout} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
