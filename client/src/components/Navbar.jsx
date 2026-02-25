import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, LogOut, PlusCircle, BrainCircuit, Sun, Moon, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = ({ isAuthenticated, onLogout, darkMode, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Add Habits', path: '/input', icon: PlusCircle },
        { name: 'Twin Vision', path: '/simulation', icon: BrainCircuit },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center group">
                            <div className="p-2 bg-indigo-600 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="ml-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                                Digital <span className="text-indigo-600 dark:text-indigo-400 not-italic">Twin</span>
                            </span>
                        </Link>

                        {isAuthenticated && (
                            <div className="hidden md:flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive(link.path)
                                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <link.icon className={`w-4 h-4 mr-2 ${isActive(link.path) ? 'animate-pulse' : ''}`} />
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            aria-label="Toggle Theme"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleLogout}
                                    className="hidden sm:flex items-center px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-sm font-bold rounded-2xl transition-all duration-300 border border-rose-500/20"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                                <button
                                    className="md:hidden p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary py-2 px-6 rounded-xl text-sm">Join Now</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isAuthenticated && isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 shadow-2xl animate-in slide-in-from-top duration-300">
                    <div className="space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-4 rounded-2xl text-base font-bold transition-all ${isActive(link.path)
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-4 mt-4 text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/10 rounded-2xl"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
