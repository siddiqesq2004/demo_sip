import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-200/80 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg ${className}`} />
);

export const SkeletonDashboard = () => (
  <div className="min-h-screen bg-[#F9FAFB] p-4 pt-12 space-y-4">
    {/* Dark Header Skeleton */}
    <div className="bg-[#062E23] p-5 rounded-3xl space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32 bg-white/20" />
        <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
      </div>
      <Skeleton className="h-28 w-full rounded-2xl bg-white/10" />
    </div>
    {/* Card Skeleton */}
    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-40" />
    </div>
    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-full rounded-full" />
    </div>
  </div>
);

export const SkeletonList = () => (
  <div className="p-4 space-y-3">
    {[1, 2, 3, 4].map(n => (
      <div key={n} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);
