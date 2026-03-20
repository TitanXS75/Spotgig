import React from "react";
import { cn } from "@/lib/utils";

export interface FeatureType {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeaturesSectionWithHoverEffects({ features }: { features: FeatureType[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} total={features.length} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
  total,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  total: number;
}) => {
  // Adjust border logic for 3 columns (lg:grid-cols-3)
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index % 3 === 0) && "lg:border-l dark:border-neutral-800",
        index < (total - (total % 3 === 0 ? 3 : total % 3)) && "lg:border-b dark:border-neutral-800"
      )}
    >
      <div className="mb-4 relative z-10 px-10 text-primary dark:text-neutral-400">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
