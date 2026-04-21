import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Mail, User, Activity, ArrowRight, ShieldCheck, GraduationCap, Briefcase, UserCircle, Eye, EyeOff } from 'lucide-react';

const Register = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        gender: 'Male'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, role, gender } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, role, gender });
            sessionStorage.setItem('token', res.data.token);
            setAuth(true);
            navigate('/');
        } catch (err) {
            console.error("REGISTRATION CATCH BLOCK ERROR:", err);
            let errMsg = 'Registration failed. Please try again.';
            if (err.response && err.response.data && err.response.data.msg) {
                errMsg = err.response.data.msg;
            } else if (err.message) {
                errMsg = `Registration failed: ${err.message}`;
            }
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-4 pt-24 pb-12">
            <div className="max-w-xl w-full animate-in fade-in zoom-in duration-500">

                {/* Brand Header */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div className="inline-flex p-4 bg-gradient-to-br from-[#4F8CFF] to-[#8A6CFF] rounded-2xl shadow-xl shadow-[#4F8CFF]/20 mb-6 items-center justify-center">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        Create Your <span className="gradient-text">Twin</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">
                        Start your journey to a balanced life.
                    </p>
                </div>

                <div className="glass-card p-10 sm:p-12 border-none animate-fade-in-up [animation-delay:0.1s]">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={onSubmit}>
                        {/* Core Identity Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute top-1/2 -translate-y-1/2 left-[15px] w-5 h-5 text-slate-400/50 group-focus-within:text-[#4F8CFF] transition-colors" />
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="input-modern"
                                            placeholder="Your Name"
                                            value={name}
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>
                                <div className="group">
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
                                <div className="group">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
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

                            {/* Behavioral Configuration Side */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'Student' ? 'border-[#4F8CFF] bg-[#4F8CFF]/10 text-[#4F8CFF] shadow-sm transform scale-105' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                                            <input type="radio" name="role" value="Student" checked={role === 'Student'} onChange={onChange} className="sr-only" />
                                            <GraduationCap className="w-6 h-6" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Student</span>
                                        </label>
                                        <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'Professional' ? 'border-[#4F8CFF] bg-[#4F8CFF]/10 text-[#4F8CFF] shadow-sm transform scale-105' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                                            <input type="radio" name="role" value="Professional" checked={role === 'Professional'} onChange={onChange} className="sr-only" />
                                            <Briefcase className="w-6 h-6" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Professional</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Gender</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`cursor-pointer border-b-4 p-3 flex items-center justify-center gap-2 transition-all rounded-xl ${gender === 'Male' ? 'border-[#4F8CFF] bg-slate-50 dark:bg-slate-800 text-[#4F8CFF] font-bold' : 'border-transparent text-slate-400'}`}>
                                            <input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={onChange} className="sr-only" />
                                            <UserCircle className="w-4 h-4" /> Male
                                        </label>
                                        <label className={`cursor-pointer border-b-4 p-3 flex items-center justify-center gap-2 transition-all rounded-xl ${gender === 'Female' ? 'border-[#4F8CFF] bg-slate-50 dark:bg-slate-800 text-[#4F8CFF] font-bold' : 'border-transparent text-slate-400'}`}>
                                            <input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={onChange} className="sr-only" />
                                            <UserCircle className="w-4 h-4" /> Female
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-5 text-base flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating Your Reflection...' : (
                                <>Initialize Reflective Twin <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center border-t border-slate-100 dark:border-slate-800 pt-8">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] opacity-40">
                    Subject verification required upon initialization
                </p>
            </div>
        </div>
    );
};

export default Register;
