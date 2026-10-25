import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import AdminPage from "./pages/AdminPage";
import {
  AboutPage,
  ArchivePage,
  CompetitionsPage,
  ContactPage,
  CmsPage,
  HistoryPage,
  NotFoundPage,
  PlayersPage,
  RankingPage,
  TeamsPage,
} from "./pages/PublicPages";
import { SiteShell } from "./components/site/SiteShell";

function PublicRouter() {
  return (
    <SiteShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sobre" component={AboutPage} />
        <Route path="/historia" component={HistoryPage} />
        <Route path="/ranking" component={RankingPage} />
        <Route path="/times" component={TeamsPage} />
        <Route path="/jogadores" component={PlayersPage} />
        <Route path="/copas" component={CompetitionsPage} />
        <Route path="/arquivo" component={ArchivePage} />
        <Route path="/contato" component={ContactPage} />
        <Route path="/:slug" component={CmsPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </SiteShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminPage} />
      <Route component={PublicRouter} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
