import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import { Landing }   from '@/pages/Landing';
import { Login }     from '@/pages/Login';
import { Register }  from '@/pages/Register';
import { Onboarding } from '@/pages/Onboarding';

import { Dashboard }  from '@/pages/Dashboard';
import { Lesson }     from '@/pages/Lesson';
import { Listening }  from '@/pages/Listening';
import { Reading }    from '@/pages/Reading';
import { Speaking }   from '@/pages/Speaking';
import { Writing }    from '@/pages/Writing';
import { Stats }      from '@/pages/Stats';
import { Vocabulary } from '@/pages/Vocabulary';
import { MemoryLab }  from '@/pages/MemoryLab';
import { Profile }    from '@/pages/Profile';
import { AiTutor }    from '@/pages/AiTutor';
import { Library }    from '@/pages/Library';
import { ArticleDetail } from '@/pages/ArticleDetail';
import { ArticleEditor } from '@/pages/ArticleEditor';

import { ParentDashboard } from '@/pages/parent/ParentDashboard';
import { ChildProfile }    from '@/pages/parent/ChildProfile';
import { Reports }         from '@/pages/parent/Reports';
import { ParentSettings }  from '@/pages/parent/ParentSettings';
import { Billing }         from '@/pages/parent/Billing';

import { DevPanel } from '@/pages/dev/DevPanel';

import GlassSignInDemo  from '@/pages/GlassSignInDemo';

import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/demo/sign-in" element={<GlassSignInDemo />} />

      {/* Authenticated (any role) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/profile"    element={<Profile />} />
      </Route>

      {/* Student / Adult routes */}
      <Route element={<ProtectedRoute roles={['student', 'adult']} />}>
        <Route path="/home"        element={<Dashboard />} />
        <Route path="/lesson"      element={<Lesson />} />
        <Route path="/lesson/:id"  element={<Lesson />} />
        <Route path="/listening"   element={<Listening />} />
        <Route path="/reading"     element={<Reading />} />
        <Route path="/speaking"    element={<Speaking />} />
        <Route path="/writing"     element={<Writing />} />
        <Route path="/vocabulary"      element={<Vocabulary />} />
        <Route path="/vocabulary/lab"  element={<MemoryLab />} />
        <Route path="/library"          element={<Library />} />
        <Route path="/library/new"      element={<ArticleEditor />} />
        <Route path="/library/edit/:id" element={<ArticleEditor />} />
        <Route path="/library/:id"      element={<ArticleDetail />} />
        <Route path="/stats"       element={<Stats />} />
        <Route path="/tutor"       element={<AiTutor />} />
      </Route>

      {/* Parent routes */}
      <Route element={<ProtectedRoute roles={['parent']} />}>
        <Route path="/parent"            element={<ParentDashboard />} />
        <Route path="/parent/child/:id"  element={<ChildProfile />} />
        <Route path="/parent/reports"    element={<Reports />} />
        <Route path="/parent/settings"   element={<ParentSettings />} />
        <Route path="/parent/billing"    element={<Billing />} />
      </Route>

      {/* Dev route — gating happens inside DevPanel via isDevUser(email).
          The route is registered for ANY authenticated user so the
          friendly redirect inside DevPanel runs instead of a 404. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dev" element={<DevPanel />} />
      </Route>

      {/* Convenience redirect */}
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
