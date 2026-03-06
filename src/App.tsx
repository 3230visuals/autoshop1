import React, { Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers & Components
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import { DebugProvider } from './context/DebugProvider';
import { Toast } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ClientGuard from './components/ClientGuard';
import RequireStaff from './components/RequireStaff';
import { BackgroundAnimator } from './components/BackgroundAnimator';
import PageTransition from './components/common/PageTransition';
import SplashScreen from './components/SplashScreen';

/* ═══════════════════════════════════════════════════
   Lazy-loaded Pages — PORTAL ARCHITECTURE
   ═══════════════════════════════════════════════════ */

// Infrastructure
const ClientShell = React.lazy(() => import('./components/layout/ClientShell'));
const StaffShell = React.lazy(() => import('./components/layout/StaffShell'));
const WelcomeScreen = React.lazy(() => import('./pages/WelcomeScreen'));
const DownloadPage = React.lazy(() => import('./pages/DownloadPage'));
const InviteOnboardClient = React.lazy(() => import('./pages/InviteOnboardClient'));

// Client Portal Pages
const C_Home = React.lazy(() => import('./pages/client/c_home'));
const C_TrackRepair = React.lazy(() => import('./pages/client/c_track_repair'));
const C_TicketDetail = React.lazy(() => import('./pages/client/c_ticket_detail'));
const C_TicketMessages = React.lazy(() => import('./pages/client/c_ticket_messages'));
const C_Payment = React.lazy(() => import('./pages/client/c_payment'));
const C_PaymentsList = React.lazy(() => import('./pages/client/c_payments_list'));
const C_PaymentSuccess = React.lazy(() => import('./pages/client/c_payment_success'));
const C_Success = React.lazy(() => import('./pages/client/c_success'));
const C_Referrals = React.lazy(() => import('./pages/client/c_referrals'));
const C_History = React.lazy(() => import('./pages/client/c_history'));

// Staff Portal Pages
const S_Login = React.lazy(() => import('./pages/staff/s_login'));
const S_Signup = React.lazy(() => import('./pages/staff/s_signup'));
const S_Board = React.lazy(() => import('./pages/staff/s_board'));
const S_TicketDetail = React.lazy(() => import('./pages/staff/s_ticket_detail'));
const S_Inspection = React.lazy(() => import('./pages/staff/s_ticket_inspection'));
const S_Estimate = React.lazy(() => import('./pages/staff/s_ticket_estimate'));
const S_Success = React.lazy(() => import('./pages/staff/s_success'));
const S_Appointments = React.lazy(() => import('./pages/staff/s_appointments'));
const S_Settings = React.lazy(() => import('./pages/ThemeSettings'));
const S_MessageContacts = React.lazy(() => import('./pages/MessageContactsList'));
const S_MessageChat = React.lazy(() => import('./pages/MessagingScreen'));
const S_Services = React.lazy(() => import('./pages/ServicesManagement'));
const S_Parts = React.lazy(() => import('./pages/staff/s_parts'));
const S_Finance = React.lazy(() => import('./pages/staff/s_finance'));
const S_Team = React.lazy(() => import('./pages/staff/s_team'));

/* ═══════════════════════════════════════════════════
   Core Components
   ═══════════════════════════════════════════════════ */

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        {/* Branded spinner */}
        <div className="relative">
          <div className="size-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0.03) 100%)', border: '1px solid rgba(79,70,229,0.15)' }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
          </div>
          <div className="absolute -inset-1 rounded-xl border border-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        <div className="space-y-1.5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SERVICEBAY</p>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-primary/30">Loading Module…</p>
        </div>
      </div>
    </div>
  );
}

function Gateway() {
  const { staffUser, clientUser } = useAuth();

  if (staffUser) return <Navigate to="/s/board" replace />;
  if (clientUser) return <Navigate to="/c/home" replace />;

  return <Navigate to="/welcome" replace />;
}

function AppLayout() {

  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto shadow-2xl relative border-x border-white/5 bg-[#0a0a0c] overflow-hidden">
      <BackgroundAnimator />
      <Toast />
      <ErrorBoundary>
        <div className="relative z-10 min-h-screen">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Root / Gateway */}
              <Route path="/" element={<Gateway />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/download" element={<PageTransition><DownloadPage /></PageTransition>} />

              {/* ═══════ CLIENT PORTAL ═══════ */}
              <Route path="/c" element={<ClientShell />}>
                <Route path="home" element={<PageTransition><C_Home /></PageTransition>} />
                <Route path="track" element={<PageTransition><C_TrackRepair /></PageTransition>} />
                <Route path="payments" element={<PageTransition><C_PaymentsList /></PageTransition>} />
                <Route path="referrals" element={<PageTransition><C_Referrals /></PageTransition>} />
                <Route path="history" element={<PageTransition><C_History /></PageTransition>} />
                <Route element={<ClientGuard />}>
                  <Route path="ticket/:ticketId" element={<PageTransition><C_TicketDetail /></PageTransition>} />
                  <Route path="ticket/:ticketId/messages" element={<PageTransition><C_TicketMessages /></PageTransition>} />
                  <Route path="ticket/:ticketId/pay" element={<PageTransition><C_Payment /></PageTransition>} />
                  <Route path="ticket/:ticketId/pay/success" element={<PageTransition><C_PaymentSuccess /></PageTransition>} />
                  <Route path="success/:type" element={<PageTransition><C_Success /></PageTransition>} />
                </Route>
                <Route index element={<Navigate to="home" replace />} />
              </Route>

              {/* ═══════ STAFF PORTAL ═══════ */}
              <Route path="/s/login" element={<PageTransition><S_Login /></PageTransition>} />
              <Route path="/s/signup" element={<PageTransition><S_Signup /></PageTransition>} />
              <Route element={<RequireStaff />}>
                <Route path="/s" element={<StaffShell />}>
                  <Route path="board" element={<PageTransition><S_Board /></PageTransition>} />
                  <Route path="onboard" element={<PageTransition><InviteOnboardClient /></PageTransition>} />
                  <Route path="appointments" element={<PageTransition><S_Appointments /></PageTransition>} />
                  <Route path="ticket/:ticketId" element={<PageTransition><S_TicketDetail /></PageTransition>} />
                  <Route path="ticket/:ticketId/inspection" element={<PageTransition><S_Inspection /></PageTransition>} />
                  <Route path="ticket/:ticketId/invoice" element={<PageTransition><S_Estimate /></PageTransition>} />
                  <Route path="messages" element={<PageTransition><S_MessageContacts /></PageTransition>} />
                  <Route path="messages/chat" element={<PageTransition><S_MessageChat /></PageTransition>} />
                  <Route path="settings" element={<PageTransition><S_Settings /></PageTransition>} />
                  <Route path="services" element={<PageTransition><S_Services /></PageTransition>} />
                  <Route path="parts" element={<PageTransition><S_Parts /></PageTransition>} />
                  <Route path="staff" element={<PageTransition><S_Team /></PageTransition>} />
                  <Route path="payments" element={<PageTransition><S_Finance /></PageTransition>} />
                  <Route path="success/:type" element={<PageTransition><S_Success /></PageTransition>} />
                  <Route index element={<Navigate to="board" replace />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <DebugProvider>
              {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
              <AppLayout />
            </DebugProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
