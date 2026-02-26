import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toast } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ClientGuard from './components/ClientGuard';
import RequireStaff from './components/RequireStaff';
import { BackgroundAnimator } from './components/BackgroundAnimator';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/common/PageTransition';
import { DebugProvider } from './context/DebugProvider';
import { ThemeProvider } from './context/ThemeContext';

/* ═══════════════════════════════════════════════════
   Lazy-loaded Pages — Two Portals Only
   ═══════════════════════════════════════════════════ */

// Client Portal
const ClientShell = React.lazy(() => import('./components/layout/ClientShell'));
const C_Home = React.lazy(() => import('./pages/client/c_home'));
const C_TrackRepair = React.lazy(() => import('./pages/client/c_track_repair'));
const C_TicketDetail = React.lazy(() => import('./pages/client/c_ticket_detail'));
const C_TicketMessages = React.lazy(() => import('./pages/client/c_ticket_messages'));
const C_Success = React.lazy(() => import('./pages/client/c_success'));

// Staff Portal
const StaffShell = React.lazy(() => import('./components/layout/StaffShell'));
const S_Login = React.lazy(() => import('./pages/staff/s_login'));
const S_Board = React.lazy(() => import('./pages/staff/s_board'));
const S_TicketDetail = React.lazy(() => import('./pages/staff/s_ticket_detail'));
const S_Inspection = React.lazy(() => import('./pages/staff/s_ticket_inspection'));
const S_Estimate = React.lazy(() => import('./pages/staff/s_ticket_estimate'));
const S_Success = React.lazy(() => import('./pages/staff/s_success'));
const S_Appointments = React.lazy(() => import('./pages/staff/s_appointments'));
const S_Settings = React.lazy(() => import('./pages/ThemeSettings'));
const S_Messages = React.lazy(() => import('./pages/MessagingScreen'));

/* ═══════════════════════════════════════════════════
   Loading Fallback (Skeleton)
   ═══════════════════════════════════════════════════ */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="size-10 border border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600">Loading Staff Portal</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto shadow-2xl relative border-x border-white/10 overflow-x-hidden">
      <BackgroundAnimator />
      <Toast />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              {/* ═══════ CLIENT PORTAL (/c/*) ═══════ */}
              <Route path="/c" element={<ClientShell />}>
                <Route path="home" element={<PageTransition><C_Home /></PageTransition>} />
                <Route path="track" element={<PageTransition><C_TrackRepair /></PageTransition>} />
                {/* Protected: requires clientAuth via Track Repair lookup */}
                <Route element={<ClientGuard />}>
                  <Route path="ticket/:ticketId" element={<PageTransition><C_TicketDetail /></PageTransition>} />
                  <Route path="ticket/:ticketId/messages" element={<PageTransition><C_TicketMessages /></PageTransition>} />
                  <Route path="success/:type" element={<PageTransition><C_Success /></PageTransition>} />
                </Route>
                <Route index element={<Navigate to="home" replace />} />
              </Route>

              {/* ═══════ STAFF PORTAL (/s/*) ═══════ */}
              <Route path="/s/login" element={<PageTransition><S_Login /></PageTransition>} />
              <Route element={<RequireStaff />}>
                <Route path="/s" element={<StaffShell />}>
                  <Route path="board" element={<PageTransition><S_Board /></PageTransition>} />
                  <Route path="appointments" element={<PageTransition><S_Appointments /></PageTransition>} />
                  <Route path="ticket/:ticketId" element={<PageTransition><S_TicketDetail /></PageTransition>} />
                  <Route path="ticket/:ticketId/inspection" element={<PageTransition><S_Inspection /></PageTransition>} />
                  <Route path="ticket/:ticketId/estimate" element={<PageTransition><S_Estimate /></PageTransition>} />
                  <Route path="messages" element={<PageTransition><S_Messages /></PageTransition>} />
                  <Route path="settings" element={<PageTransition><S_Settings /></PageTransition>} />
                  <Route path="success/:type" element={<PageTransition><S_Success /></PageTransition>} />
                  <Route index element={<Navigate to="board" replace />} />
                </Route>
              </Route>

              {/* ═══════ CATCH-ALL → Staff Login ═══════ */}
              <Route path="*" element={<Navigate to="/s/login" replace />} />

            </Routes>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <DebugProvider>
            <AppLayout />
          </DebugProvider>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
