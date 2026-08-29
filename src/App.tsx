import { lazy, Suspense, type ComponentType } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { canShowPayments } from '@/lib/platform';

// Eager — these sit on the first-paint path. Anyone opening the app lands on one
// of them, so splitting them would only add a round trip before anything shows.
import { Landing }   from '@/pages/Landing';
import { Login }     from '@/pages/Login';
import { Register }  from '@/pages/Register';
import { NotFound }  from '@/pages/NotFound';

/**
 * Everything else loads on demand. Without this, opening the login screen also
 * downloaded the PDF parser, the Dev Panel, the DTM track and the parent
 * dashboard — one 2.1 MB chunk for a page that needs none of it.
 *
 * `lazy` expects a default export, so named ones are unwrapped here.
 */
const named = <K extends string, M extends Record<K, ComponentType>>(
  load: () => Promise<M>,
  key: K,
) => lazy(() => load().then((m) => ({ default: m[key] })));

const Onboarding = named(() => import('@/pages/Onboarding'), 'Onboarding');
const Dashboard  = named(() => import('@/pages/Dashboard'), 'Dashboard');
const Lesson     = named(() => import('@/pages/Lesson'), 'Lesson');
const Listening  = named(() => import('@/pages/Listening'), 'Listening');
const Reading    = named(() => import('@/pages/Reading'), 'Reading');
const Speaking   = named(() => import('@/pages/Speaking'), 'Speaking');
const Writing    = named(() => import('@/pages/Writing'), 'Writing');
const Stats      = named(() => import('@/pages/Stats'), 'Stats');
const Vocabulary  = named(() => import('@/pages/Vocabulary'), 'Vocabulary');
const VocabReview = named(() => import('@/pages/VocabReview'), 'VocabReview');
const MemoryLab   = named(() => import('@/pages/MemoryLab'), 'MemoryLab');
const ErrorDNA        = named(() => import('@/pages/ErrorDNA'), 'ErrorDNA');
const ErrorDiagnostic = named(() => import('@/pages/ErrorDiagnostic'), 'ErrorDiagnostic');
const Profile    = named(() => import('@/pages/Profile'), 'Profile');
const AiTutor    = named(() => import('@/pages/AiTutor'), 'AiTutor');
const Library       = named(() => import('@/pages/Library'), 'Library');
const ArticleDetail = named(() => import('@/pages/ArticleDetail'), 'ArticleDetail');
const ArticleEditor = named(() => import('@/pages/ArticleEditor'), 'ArticleEditor');

const ParentDashboard = named(() => import('@/pages/parent/ParentDashboard'), 'ParentDashboard');
const ChildProfile    = named(() => import('@/pages/parent/ChildProfile'), 'ChildProfile');
const Reports         = named(() => import('@/pages/parent/Reports'), 'Reports');
const ParentSettings  = named(() => import('@/pages/parent/ParentSettings'), 'ParentSettings');
const Billing         = named(() => import('@/pages/parent/Billing'), 'Billing');

// The Dev Panel drags in pdfjs-dist; keeping it out of the main chunk is the
// single biggest win here.
const DevPanel = named(() => import('@/pages/dev/DevPanel'), 'DevPanel');
const MobileConceptIOS = lazy(() => import('@/pages/dev/MobileConceptIOS'));

const Privacy = named(() => import('@/pages/Legal'), 'Privacy');
const Terms   = named(() => import('@/pages/Legal'), 'Terms');

const DtmHome       = named(() => import('@/pages/dtm/DtmHome'), 'DtmHome');
const DtmMath       = named(() => import('@/pages/dtm/DtmSubjects'), 'DtmMath');
const DtmEnglish    = named(() => import('@/pages/dtm/DtmSubjects'), 'DtmEnglish');
const DtmNative     = named(() => import('@/pages/dtm/DtmSubjects'), 'DtmNative');
const DtmMock       = named(() => import('@/pages/dtm/DtmSubjects'), 'DtmMock');
const DtmPastPapers = named(() => import('@/pages/dtm/DtmSubjects'), 'DtmPastPapers');
const DtmStats      = named(() => import('@/pages/dtm/DtmSubjects'), 'DtmStats');

const GlassSignInDemo = lazy(() => import('@/pages/GlassSignInDemo'));

/**
 * Deliberately plain. A chunk usually arrives in well under a frame on a warm
 * connection, and a spinner that appears and vanishes that fast reads as a
 * flicker — worse than a brief empty panel.
 */
function RouteFallback() {
  return <div className="min-h-[100dvh]" aria-busy="true" aria-live="polite" />;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/demo/sign-in" element={<GlassSignInDemo />} />
        <Route path="/concept"   element={<MobileConceptIOS />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms"   element={<Terms />} />

        {/* Authenticated (any role) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile"    element={<Profile />} />
        </Route>

        {/* Student / Adult routes */}
        <Route element={<ProtectedRoute roles={['student', 'adult', 'dtm']} />}>
          <Route path="/home"        element={<Dashboard />} />
          <Route path="/lesson"      element={<Lesson />} />
          <Route path="/lesson/:id"  element={<Lesson />} />
          <Route path="/listening"   element={<Listening />} />
          <Route path="/reading"     element={<Reading />} />
          <Route path="/speaking"    element={<Speaking />} />
          <Route path="/writing"     element={<Writing />} />
          <Route path="/vocabulary"      element={<Vocabulary />} />
          <Route path="/vocabulary/lab"    element={<MemoryLab />} />
          <Route path="/vocabulary/review" element={<VocabReview />} />
          <Route path="/dna"             element={<ErrorDNA />} />
          <Route path="/dna/diagnostic"  element={<ErrorDiagnostic />} />
          <Route path="/library"          element={<Library />} />
          <Route path="/library/new"      element={<ArticleEditor />} />
          <Route path="/library/edit/:id" element={<ArticleEditor />} />
          <Route path="/library/:id"      element={<ArticleDetail />} />
          <Route path="/stats"       element={<Stats />} />
          <Route path="/tutor"       element={<AiTutor />} />
        </Route>

        {/* DTM routes — separate landing for the Uzbekistan university entrance exam track */}
        <Route element={<ProtectedRoute roles={['dtm']} />}>
          <Route path="/dtm/home"        element={<DtmHome />} />
          <Route path="/dtm/math"        element={<DtmMath />} />
          <Route path="/dtm/english"     element={<DtmEnglish />} />
          <Route path="/dtm/native"      element={<DtmNative />} />
          <Route path="/dtm/mock"        element={<DtmMock />} />
          <Route path="/dtm/past-papers" element={<DtmPastPapers />} />
          <Route path="/dtm/stats"       element={<DtmStats />} />
        </Route>

        {/* Parent routes */}
        <Route element={<ProtectedRoute roles={['parent']} />}>
          <Route path="/parent"            element={<ParentDashboard />} />
          <Route path="/parent/child/:id"  element={<ChildProfile />} />
          <Route path="/parent/reports"    element={<Reports />} />
          <Route path="/parent/settings"   element={<ParentSettings />} />
          {/* Billing is web-only. Google Play requires digital subscriptions to
              use Play Billing, so the Payme/Click checkout must not be reachable
              inside the native app — not even by typing the URL. */}
          <Route
            path="/parent/billing"
            element={canShowPayments() ? <Billing /> : <Navigate to="/parent" replace />}
          />
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
    </Suspense>
  );
}
