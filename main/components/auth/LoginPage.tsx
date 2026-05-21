import React, { useState } from 'react';

const LoginPage: React.FC<{ onLoginSuccess: (name: string, avatar: string | null) => void; }> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(isSignUp && fullName ? fullName : 'Dr. Jane Doe', null);
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden">
      
      {/* Left Side - Brand & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        {/* Animated Background for Left Side */}
        <div className="absolute inset-0 z-0 opacity-30">
             <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 p-12 text-white max-w-lg">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                    </svg>
                </div>
                <span className="text-2xl font-bold tracking-tight">AQ System</span>
            </div>
            
            <blockquote className="text-3xl font-medium leading-tight mb-6">
                "The air we breathe is the essence of life. Monitor it, understand it, and protect your future."
            </blockquote>
            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=1" alt="User" />
                    <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=2" alt="User" />
                    <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=3" alt="User" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Trusted by 10,000+ Health Professionals</p>
            </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md animate-fade-in">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-slate-500">
                    {isSignUp ? 'Start your journey to better respiratory health.' : 'Please enter your details to sign in.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">Full Name</label>
                        <input 
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 transition-all placeholder:text-slate-400" 
                            id="fullName" 
                            type="text" 
                            placeholder="e.g. Sarah Connor" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            required 
                        />
                  </div>
                )}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
                    <input 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 transition-all placeholder:text-slate-400" 
                        id="email" 
                        type="email" 
                        placeholder="name@company.com" 
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                        {!isSignUp && <a href="#" className="text-sm font-semibold text-primary hover:text-primary-dark">Forgot password?</a>}
                    </div>
                    <input 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 transition-all placeholder:text-slate-400" 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        required
                    />
                </div>
                
                <button 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-slate-900/10 transform transition-all duration-200 active:scale-[0.98] mt-2" 
                    type="submit"
                >
                    {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-primary hover:text-primary-dark ml-1 transition-colors">
                        {isSignUp ? 'Log in' : 'Sign up'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;