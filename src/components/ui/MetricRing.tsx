import { cn } from '@/lib/cn';

interface Props {
  value: number;          // 0–100
  label: string;
  color?: 'blue' | 'green' | 'gold';
}

export function MetricRing({ value, label, color = 'blue' }: Props) {
  const stroke = color === 'green' ? '#7ef7d3' : color === 'gold' ? '#F59E0B' : '#5aa9ff';
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[70px]">
      <div className="relative w-14 h-14 grid place-items-center"
           style={{
             borderRadius: '50%',
             background: `radial-gradient(circle, rgba(20,30,60,0.6) 60%, transparent 60%),
                          conic-gradient(${stroke} ${value}%, rgba(255,255,255,0.10) 0)`,
           }}>
        <div className="absolute inset-1.5 rounded-full bg-[rgba(15,20,40,0.7)]" />
        <span className={cn('relative z-10 text-[13px] font-bold', 'text-white')}>{value}%</span>
      </div>
      <label className="text-[11px] text-slate-300/80">{label}</label>
    </div>
  );
}
