// src/features/dashboard/api/dashboardService.ts
import api from "@/service/api";
import type { DashboardDetails, Subsection, Subject, Page } from "@/types/dashboard";

export const getMyDashboard = async (): Promise<DashboardDetails> => {
    const { data } = await api.get<DashboardDetails>('/v1/dashboards');
    // console.log('[DashboardService] Page/Dashboard payload:', data);
    return data;
};

export const getSubsections = async (dashboardId: string, pageId: string): Promise<Subsection[]> => {
    const { data } = await api.get<Subsection[]>(`/v1/dashboards/${dashboardId}/pages/${pageId}/subsections`);
   // console.log('[DashboardService] Subsections payload:', data);
    return data;
};

export const getSubsectionSubjects = async (dashboardId: string, pageId: string, subsectionId: string): Promise<Subject[]> => {
    const { data } = await api.get<Subject[]>(`/v1/dashboards/${dashboardId}/pages/${pageId}/subsections/${subsectionId}/subjects`);
    // console.log(`[DashboardService] Subjects payload for subsection ${subsectionId}:`, data);
    return data;
};

export const getPageSubjects = async (dashboardId: string, pageId: string): Promise<Subject[]> => {
    // 1) Fetch subsections
    const subsections = await getSubsections(dashboardId, pageId);
    
    // 2) Fetch subjects for each subsection
    const subjectsPromises = subsections.map(sub => getSubsectionSubjects(dashboardId, pageId, sub.id));
    const subjectsNested = await Promise.all(subjectsPromises);
    
    return subjectsNested.flat();
};

export const updatePage = async (dashboardId: string, pageId: string, pageData: Partial<Page>): Promise<Page> => {
    const { data } = await api.put<Page>(`/v1/dashboards/${dashboardId}/pages/${pageId}`, pageData);
    return data;
};
