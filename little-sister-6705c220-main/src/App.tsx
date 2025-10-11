import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TellMe from "./pages/TellMe";
import ProveIt from "./pages/ProveIt";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import MakeIt from "./pages/MakeIt";
import ChatWithMe from "./pages/ChatWithMe";
import Ekko from "./pages/Ekko";
import History from "./pages/History";
import FamilyTree from "./pages/FamilyTree";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/make-it" element={<MakeIt />} />
          <Route path="/tell-me" element={<TellMe />} />
          <Route path="/history" element={<History />} />
          <Route path="/chat" element={<ChatWithMe />} />
          <Route path="/prove-it" element={<ProveIt />} />
          <Route path="/ekko" element={<Ekko />} />
          <Route path="/family-tree" element={<FamilyTree />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
