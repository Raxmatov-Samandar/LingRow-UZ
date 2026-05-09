import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';

export function NotFound() {
  return (
    <>
      <Cosmos />
      <div className="h-screen grid place-items-center text-center px-6">
        <div>
          <p className="text-7xl font-extrabold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">404</p>
          <p className="mt-3 text-slate-300">This page wandered off into the cosmos.</p>
          <Link to="/home" className="btn-primary mt-6 inline-flex">Take me home</Link>
        </div>
      </div>
    </>
  );
}
