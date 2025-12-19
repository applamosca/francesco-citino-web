import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminNew from "./pages/AdminNew";
import AdminPanel from "./pages/AdminPanel";
import AdminGallery from "./pages/AdminGallery";
import AdminFacebook from "./pages/AdminFacebook";
import AdminTopics from "./pages/AdminTopics";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Booking App Pages
import BookingHome from "./pages/booking/BookingHome";
import BookingServices from "./pages/booking/BookingServices";
import BookingCalendarPage from "./pages/booking/BookingCalendarPage";
import BookingDashboard from "./pages/booking/BookingDashboard";
import BookingLogin from "./pages/booking/BookingLogin";
import BookingAdmin from "./pages/booking/BookingAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Main Site */}
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/messages" element={<AdminNew />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/facebook" element={<AdminFacebook />} />
          <Route path="/admin/topics" element={<AdminTopics />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Booking App */}
          <Route path="/booking" element={<BookingHome />} />
          <Route path="/booking/services" element={<BookingServices />} />
          <Route path="/booking/calendar" element={<BookingCalendarPage />} />
          <Route path="/booking/dashboard" element={<BookingDashboard />} />
          <Route path="/booking/login" element={<BookingLogin />} />
          <Route path="/booking/admin" element={<BookingAdmin />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;