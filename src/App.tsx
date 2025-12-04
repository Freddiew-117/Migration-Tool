import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Web3Provider } from "@/contexts/Web3Context";
import ProtectedRoute from "@/components/ProtectedRoute";
import MigrationPortal from "./pages/MigrationPortal";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Web3Provider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MigrationPortal />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              {/* Redirect all other routes to migration portal */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </Web3Provider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
