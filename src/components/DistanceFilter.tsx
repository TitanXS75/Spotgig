// Distance filter slider: 0 = Anywhere, else 1, 2, 5, 10, 20 km
import { useAppStore } from '@/store/app-store';

const STEPS = [0, 1, 2, 5, 10, 20]; // 0 = Anywhere

const DistanceFilter = () => {
  const { distanceFilter, setDistanceFilter } = useAppStore();

  const currentIdx = STEPS.indexOf(distanceFilter) === -1 ? 0 : STEPS.indexOf(distanceFilter);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Distance</span>
        <span className="font-semibold text-foreground">
          {distanceFilter === 0 ? 'Anywhere' : `Within ${distanceFilter} km`}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS.length - 1}
        value={currentIdx}
        onChange={(e) => setDistanceFilter(STEPS[Number(e.target.value)])}
        className="w-full h-1.5 rounded-full accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {STEPS.map((s) => (
          <span key={s} className={distanceFilter === s ? 'text-primary font-semibold' : ''}>
            {s === 0 ? 'Any' : `${s}km`}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DistanceFilter;
