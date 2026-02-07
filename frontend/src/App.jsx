
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ClerkProviderWithRoutes() {
    const navigate = useNavigate();

    return (
        <ClerkProvider
            publishableKey={clerkPubKey}
            routerPush={(to) => navigate(to)}
            routerReplace={(to) => navigate(to, { replace: true })}
        >
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <>
                            <SignedIn>
                                <Dashboard />
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    }
                />
            </Routes>
        </ClerkProvider>
    );
}

function App() {
    if (!clerkPubKey) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Missing Configuration</h1>
                <p className="text-lg text-gray-300 mb-2">
                    The <code className="bg-gray-800 px-2 py-1 rounded text-orange-400">VITE_CLERK_PUBLISHABLE_KEY</code> is missing.
                </p>
                <p className="text-gray-400 mb-6 text-center max-w-md">
                    Please add your Clerk Publishable Key to the <code className="bg-gray-800 px-2 py-1 rounded">.env</code> file in the frontend directory.
                </p>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-500 font-mono">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</p>
                </div>
                <p className="mt-8 text-sm text-yellow-500 animate-pulse">
                    ⚠️ Don't forget to restart the server after updating .env!
                </p>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <ClerkProviderWithRoutes />
        </BrowserRouter>
    );
}

export default App;
