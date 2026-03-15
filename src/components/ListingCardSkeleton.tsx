const ListingCardSkeleton = () => (
  <div className="flex flex-col bg-card rounded-2xl shadow-card overflow-hidden">
    <div className="aspect-square bg-muted relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent animate-shimmer" />
    </div>
    <div className="p-3 flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="h-4 w-14 bg-muted rounded" />
        <div className="h-4 w-10 bg-muted rounded" />
      </div>
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-3 w-1/2 bg-muted rounded" />
      <div className="h-3 w-full bg-muted rounded" />
      <div className="flex gap-1.5 mt-1">
        <div className="h-4 w-12 bg-muted rounded" />
        <div className="h-4 w-14 bg-muted rounded" />
      </div>
    </div>
  </div>
);

export default ListingCardSkeleton;
