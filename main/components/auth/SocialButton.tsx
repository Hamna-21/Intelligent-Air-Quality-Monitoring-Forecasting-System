import React from 'react';

interface SocialButtonProps {
    provider: 'Google';
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.8C34.661 8.354 29.615 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.8C34.661 8.354 29.615 6 24 6C16.318 6 9.656 10.036 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 46c5.615 0 10.661-2.354 14.804-6.8l-6.571-4.819C29.655 38.892 25.349 42 24 42c-4.952 0-9.097-3.033-10.82-7.386l-6.571 4.819C9.656 41.964 16.318 46 24 46z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.571 4.819c3.93-3.637 6.231-8.91 6.231-15.392 0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);


const SocialButton: React.FC<SocialButtonProps> = ({ provider }) => {
    return (
        <button
            type="button"
            className="w-full flex items-center justify-center font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-300 bg-white text-secondary hover:bg-slate-50 border border-slate-300"
        >
            <span className="mr-3"><GoogleIcon /></span>
            Sign up with Google
        </button>
    );
};

export default SocialButton;