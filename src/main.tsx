// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import { store } from "@/store";
import { Login } from "@/features/auth/routes/Login";
import { TenantProvider } from "@/context/TenantProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { DashboardPage } from "@/features/dashboard/routes/DashboardPage";
import { TextEditorPage } from "@/features/dashboard/routes/TextEditorPage";
import { ProfilePage } from "@/features/auth/routes/ProfilePage";

console.log("App initializing...");

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardLayout />,
                children: [
                    {
                        path: ":dashboardId/page/:pageId",
                        element: <DashboardPage />,
                    },
                    {
                        path: ":dashboardId/page/:pageId/edit-text",
                        element: <TextEditorPage />,
                    },
                    {
                        path: "profile",
                        element: <ProfilePage />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <TenantProvider>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                    <ToastContainer position="bottom-right" autoClose={4000} />
                </QueryClientProvider>
            </Provider>
        </TenantProvider>
    </React.StrictMode>
);