import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { FloatingTutor } from '@/components/ui/FloatingTutor';
import { useUi } from '@/store/ui';

interface Props { children: ReactNode }

export function AppShell({ children }: Props) {
  const collapsed = useUi(s => s.sidebarCollapsed);

  return (
    <motion.div
      className="h-screen p-[18px] grid gap-[18px]"
      animate={{ gridTemplateColumns: collapsed ? '76px 1fr' : '260px 1fr' }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      style={{ gridTemplateColumns: collapsed ? '76px 1fr' : '260px 1fr' }}
    >
      <Sidebar />
      <main className="relative flex flex-col gap-5 min-w-0 overflow-hidden">{children}</main>
      <FloatingTutor />
    </motion.div>
  );
}
