import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ParticipantsPage from './pages/ParticipantsPage'
import HostCompaniesPage from './pages/HostCompaniesPage'
import AccommodationPage from './pages/AccommodationPage'
import TravelDetailsPage from './pages/TravelDetailsPage'
import TransferPage from './pages/TransferPage'
import SendingOrgsPage from './pages/SendingOrgsPage'
import FinancialInfoPage from './pages/FinancialInfoPage'
import MobilityProvidersPage from './pages/MobilityProvidersPage'
import InsurancePage from './pages/InsurancePage'
import LanguageCourseProviderPage from './pages/LanguageCourseProviderPage'
import './styles/main.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={session ? <Layout session={session} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="incoming/individuals" element={<ParticipantsPage typology="Incoming" />} />
          <Route path="incoming/travel" element={<TravelDetailsPage typology="Incoming" />} />
          <Route path="incoming/transfer" element={<TransferPage />} />
          <Route path="incoming/sending-orgs" element={<SendingOrgsPage />} />
          <Route path="incoming/accommodation" element={<AccommodationPage />} />
          <Route path="incoming/financial" element={<FinancialInfoPage typology="Incoming" />} />
          <Route path="incoming/mobility-providers" element={<MobilityProvidersPage />} />
          <Route path="incoming/groups" element={<ParticipantsPage typology="Incoming" groupView />} />
          <Route path="incoming/host-companies" element={<HostCompaniesPage />} />
          <Route path="incoming/insurance" element={<InsurancePage />} />
          <Route path="incoming/language-course-providers" element={<LanguageCourseProviderPage />} />
          <Route path="outgoing/individuals" element={<ParticipantsPage typology="Outgoing" />} />
          <Route path="outgoing/travel" element={<TravelDetailsPage typology="Outgoing" />} />
          <Route path="outgoing/transfer" element={<TransferPage />} />
          <Route path="outgoing/sending-orgs" element={<SendingOrgsPage />} />
          <Route path="outgoing/accommodation" element={<AccommodationPage />} />
          <Route path="outgoing/financial" element={<FinancialInfoPage typology="Outgoing" />} />
          <Route path="outgoing/mobility-providers" element={<MobilityProvidersPage />} />
          <Route path="outgoing/groups" element={<ParticipantsPage typology="Outgoing" groupView />} />
          <Route path="outgoing/host-companies" element={<HostCompaniesPage />} />
          <Route path="outgoing/insurance" element={<InsurancePage />} />
          <Route path="outgoing/language-course-providers" element={<LanguageCourseProviderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
