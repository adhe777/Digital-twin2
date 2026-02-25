import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Mail, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
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
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-4 items-center justify-center">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Welcome <span className="gradient-text">Back</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Log in to synchronize with your Digital Twin.
                    </p>
                </div>

                <div className="glass-card p-8 sm:p-10 border-t-4 border-indigo-500">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Terminal</label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="input-modern px-12"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                                    <Link to="#" className="text-[10px] font-black text-indigo-500 uppercase hover:underline">Lost access?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="input-modern px-12"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isLoading ? 'Decrypting...' : (
                                <>Access Twin <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            New to the future?{' '}
                            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                Register Identity
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
