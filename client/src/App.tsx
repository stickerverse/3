import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import FontTools from "@/pages/font-tools";

function Router() {
  return (
    <>
      <nav className="bg-primary/10 p-4">
        <div className="container mx-auto flex items-center space-x-4">
          <Link href="/" className="font-medium hover:underline">Home</Link>
          <Link href="/font-tools" className="font-medium hover:underline">Font Tools</Link>
        </div>
      </nav>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/font-tools" component={FontTools} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
