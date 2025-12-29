// src/features/dashboard/api/dashboardService.ts
import api from "@/service/api";
import type { DashboardDetails } from "@/types/dashboard";

export const getMyDashboard = async (): Promise<DashboardDetails> => {
    const { data } = await api.get<DashboardDetails>('/v1/dashboards');
    return data;
};
