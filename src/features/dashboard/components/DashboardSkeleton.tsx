import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const PageSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Title & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Skeleton width={250} height={32} />
                    <Skeleton width={180} height={20} className="mt-2" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Skeleton width={150} height={36} borderRadius={8} />
                </div>
            </div>

            {/* Text Section Skeleton */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <Skeleton count={3} />
            </div>

            {/* Grid Skeleton */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64">
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton width={120} height={18} />
                                <Skeleton circle width={20} height={20} />
                            </div>
                            <div className="mt-4 flex flex-col justify-center h-40">
                                <Skeleton height="100%" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header Skeleton */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center">
                                {/* Logo Skeleton */}
                                <Skeleton width={120} height={40} className="mr-4" />
                                <div className="ml-4 pl-4 border-l border-gray-300 h-10 flex items-center">
                                    <Skeleton width={150} height={20} />
                                </div>
                            </div>

                            <div className="hidden lg:flex items-center space-x-6">
                                <div className="flex items-center">
                                    <Skeleton circle width={24} height={24} className="mr-2" />
                                    <Skeleton width={80} height={16} />
                                </div>
                                <Skeleton width={40} height={16} />
                            </div>
                        </div>
                    </div>

                    {/* Tabs Skeleton */}
                    <nav className="hidden lg:block bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 shadow-sm">
                        <div className="flex space-x-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="py-3 px-1 border-b-2 border-transparent">
                                    <Skeleton width={80} height={20} />
                                </div>
                            ))}
                        </div>
                    </nav>
                </header>

                {/* Main Content Skeleton */}
                <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-7xl mx-auto">
                        <PageSkeleton />
                    </div>
                </main>

                {/* Footer Skeleton */}
                <footer className="bg-white border-t border-gray-200 py-6">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                        <Skeleton width={200} height={16} />
                    </div>
                </footer>
            </div>
        </SkeletonTheme>
    );
};
