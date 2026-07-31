'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl" style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg">
          <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Skeleton className="h-[200px] rounded-xl" />
      <Skeleton className="h-[200px] rounded-xl" />
    </div>

    <div className="p-6 rounded-xl" style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-[250px] w-full mt-4" />
    </div>

    <div className="p-6 rounded-xl" style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminDashboardSkeleton;
