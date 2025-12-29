// src/types/dashboard.ts

export type LayoutType = 'text_with_feed' | 'widgets_only' | 'text_widgets';

export interface Page {
    id: string;
    dashboardId: string;
    layout: LayoutType;
    title: string;
    text?: string | null;
    order: number;
    feedId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Dashboard {
    id: string;
    tenantId: string;
    name: string;
    domain?: string;
    logo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardDetails extends Dashboard {
    pages: Page[];
}
