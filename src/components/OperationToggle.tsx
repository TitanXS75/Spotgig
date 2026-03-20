import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';

const OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'home' as const, label: 'Home' },
  { value: 'shop' as const, label: 'Shop' },
];

const OperationToggle = () => {
  const { operationTypeFilter, setOperationTypeFilter } = useAppStore();

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-xl">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setOperationTypeFilter(value)}
          className={`relative flex-1 px-1 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            operationTypeFilter === value ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {operationTypeFilter === value && (
            <motion.div
              layoutId="operation-toggle"
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

export default OperationToggle;
