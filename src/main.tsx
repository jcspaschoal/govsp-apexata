import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './lib/highchartsSetup.ts';


import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import "dayjs/locale/pt-br";

import "./index.css";
import { store } from "@/store";
import { Login } from "@/features/auth/routes/Login";
import { TenantProvider } from "@/context/TenantProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { DashboardPage } from "@/features/dashboard/routes/DashboardPage";
import { TextEditorPage } from "@/features/dashboard/routes/TextEditorPage";
import { ProfilePage } from "@/features/auth/routes/ProfilePage";
import { NotFoundPage } from "@/components/NotFoundPage";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const theme = createTheme({
    primaryColor: 'blue',
    fontFamily: 'inherit',
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
        element: <NotFoundPage />,
    }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <TenantProvider>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <MantineProvider theme={theme}>
                        <RouterProvider router={router} />
                        <ToastContainer position="bottom-right" autoClose={4000} />
                    </MantineProvider>
                </QueryClientProvider>
            </Provider>
        </TenantProvider>
    </React.StrictMode>
);