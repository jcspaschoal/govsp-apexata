// src/features/dashboard/api/dashboardService.ts
import api from "@/service/api";
import type { DashboardDetails } from "@/types/dashboard";

export const getMyDashboard = async (): Promise<DashboardDetails> => {
    const { data } = await api.get<DashboardDetails>('/v1/dashboards');
    return data;
};

export const getPageSubjects = async (dashboardId: string, pageId: string): Promise<unknown[]> => {
    const { data } = await api.get<unknown[]>(`/v1/dashboards/${dashboardId}/pages/${pageId}/subjects`);
    return data;
};

export const updatePage = async (dashboardId: string, pageId: string, pageData: unknown): Promise<unknown> => {
    const { data } = await api.put<unknown>(`/v1/dashboards/${dashboardId}/pages/${pageId}`, pageData);
    return data;
};
