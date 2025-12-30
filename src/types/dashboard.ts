/* eslint-disable */
// @ts-nocheck
import type {SubjectResult, WidgetType} from "@/widget_types";

export type LayoutType = 'text_with_feed' | 'widgets_only' | 'text_widgets';

export interface Page {
    id: string;
    dashboardId: string;
    layout: LayoutType;
    title: string;
    subtitle?: string | null;
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

export interface Subsection {
    id: string;
    pageId: string;
    title: string;
    description?: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Subject {
    id: string;
    subsectionId: string;
    widget: WidgetType;
    size: string;
    title: string;
    order: number;
    result: SubjectResult;
    createdAt: string;
    updatedAt: string;
}
