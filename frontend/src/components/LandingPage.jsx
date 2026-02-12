import { motion } from 'framer-motion';
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, FileText, BookOpen } from 'lucide-react';

const LandingPage = () => {
    const { isSignedIn } = useUser();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isSignedIn) {
            navigate('/dashboard');
        } else {
            // Clerk handles the modal opening automatically via SignInButton if needed,
            // or we direct them to sign in. 
            // Here, the button itself can wrap the action.
        }
    };

    return (
        <div className="min-h-screen bg-darker text-white font-sans overflow-x-hidden selection:bg-primary selection:text-white">

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">LedgerMind</span>
                </div>
                <div className="flex items-center gap-4">
                    {isSignedIn ? (
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-sm font-semibold hover:text-primary transition-colors">
                                Dashboard
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <button className="text-sm font-semibold hover:text-primary transition-colors">
                                    Login
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-sm">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Intelligent Behavioral Analysis
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        <span className="block text-gray-200">Detect Fraud with</span>
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
                            Absolute Precision
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        LedgerMind uses advanced behavioral analysis to score transaction trust, identify outliers, and generate audit reports instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isSignedIn ? (
                            <Link
                                to="/dashboard"
                                className="group relative px-8 py-4 bg-primary text-black font-bold rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="group relative px-8 py-4 bg-primary text-black font-bold rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2">
                                    Get Started Free
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignInButton>
                        )}

                        <button className="px-8 py-4 rounded-full bg-transparent border border-white/10 hover:border-primary/50 text-white font-semibold hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all backdrop-blur-md">
                            View Demo
                        </button>
                    </div>
                </motion.div>
            </header>

            {/* Features Grid */}
            <section className="relative z-10 px-6 py-24 bg-dark/50 border-t border-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Activity className="w-6 h-6 text-primary" />}
                        title="Behavioral Analysis"
                        description="Analyzes transaction patterns over time to detect anomalies that rule-based systems miss."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="w-6 h-6 text-secondary" />}
                        title="Trust Scoring"
                        description="Assigns a dynamic trust score (0-100) to every account based on historical activity."
                    />
                    <FeatureCard
                        icon={<FileText className="w-6 h-6 text-purple-400" />}
                        title="Audit-Ready Reports"
                        description="Download detailed CSV reports ready for transparency and compliance reviews."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 text-center text-gray-500 text-sm border-t border-white/5 bg-darker">
                <p>&copy; {new Date().getFullYear()} LedgerMind. All rights reserved.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl bg-card/50 border border-white/5 hover:border-primary/20 transition-all hover:bg-card hover:shadow-2xl hover:shadow-primary/5 group">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">
            {description}
        </p>
    </div>
);

export default LandingPage;
