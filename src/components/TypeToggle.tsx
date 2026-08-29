import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';

const OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'project' as const, label: 'Projects' },
  { value: 'freelancer' as const, label: 'Freelancers' },
];

const TypeToggle = () => {
  const { typeFilter, setTypeFilter } = useAppStore();

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-xl">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setTypeFilter(value)}
          className={`relative flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            typeFilter === value ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {typeFilter === value && (
            <motion.div
              layoutId="type-toggle"
              className="absolute inset-0 bg-background rounded-lg shadow-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default TypeToggle;
