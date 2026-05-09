import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <Cosmos />
      <div className="h-screen grid place-items-center text-center px-6">
        <div>
          <p className="text-7xl font-extrabold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">404</p>
          <p className="mt-3 text-slate-300">{t('notFound.msg')}</p>
          <Link to="/home" className="btn-primary mt-6 inline-flex">{t('notFound.home')}</Link>
        </div>
      </div>
    </>
  );
}
