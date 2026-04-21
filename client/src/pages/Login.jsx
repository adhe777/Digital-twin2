import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Mail, Activity, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            sessionStorage.setItem('token', res.data.token);
            setAuth(true);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-4 pt-20">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">

                {/* Brand Header */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div className="inline-flex p-4 bg-gradient-to-br from-[#4F8CFF] to-[#8A6CFF] rounded-2xl shadow-xl shadow-[#4F8CFF]/20 mb-6 items-center justify-center">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        Welcome <span className="gradient-text">Back</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">
                        Reconnect with your Digital Reflection.
                    </p>
                </div>

                <div className="glass-card p-10 sm:p-12 border-none animate-fade-in-up [animation-delay:0.1s]">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 -translate-y-1/2 left-[15px] w-5 h-5 text-slate-400/50 group-focus-within:text-[#4F8CFF] transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="input-modern"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 left-[15px] w-5 h-5 text-slate-400/50 group-focus-within:text-[#4F8CFF] transition-colors" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="input-modern pr-12"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={onChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 hover:text-[#4F8CFF] transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Processing...' : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            New to the future?{' '}
                            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Insight */}
                <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-[0.2em] opacity-50">
                    Precision Habit Analysis &trade;
                </p>
            </div>
        </div>
    );
};

export default Login;
