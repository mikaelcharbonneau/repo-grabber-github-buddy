import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Auth: React.FC = () => {
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);

  const { signIn, signInWithSSO } = useAuth();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For demo purposes, using username as email
      await signIn(username, 'password123'); // You might want to handle this differently
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateSignIn = async () => {
    setCertificateLoading(true);
    try {
      await signInWithSSO();
    } finally {
      setCertificateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with HPE Logo */}
      <header className="px-8 py-6">
        <div className="flex items-center">
          <svg
            width="90"
            height="32"
            viewBox="0 0 90 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-8"
          >
            <path
              d="M0 5.33333V26.6667H6.22222V18.6667H17.7778V26.6667H24V5.33333H17.7778V13.3333H6.22222V5.33333H0Z"
              fill="#01a982"
            />
            <path
              d="M28.4444 5.33333V26.6667H34.6667V18.6667H42.2222C47.0889 18.6667 50.6667 15.0889 50.6667 10.2222V10.2222C50.6667 5.35556 47.0889 1.77778 42.2222 1.77778H28.4444V5.33333ZM34.6667 13.3333V7.11111H41.3333C42.8 7.11111 44 8.31111 44 9.77778V9.77778C44 11.2444 42.8 12.4444 41.3333 12.4444H34.6667V13.3333Z"
              fill="#425563"
            />
            <path
              d="M56 5.33333V26.6667H74.6667V21.3333H62.2222V18.6667H73.7778V13.3333H62.2222V10.6667H74.6667V5.33333H56Z"
              fill="#425563"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Sign In Form */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-normal text-gray-800 mb-12">Sign In</h1>
            
            <form onSubmit={handleNext} className="space-y-6">
              {/* Username Field */}
              <div className="text-left">
                <Label 
                  htmlFor="username" 
                  className="block text-sm font-normal text-gray-700 mb-2"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-teal-400 rounded-none focus:border-teal-500 focus:ring-0 text-base"
                  required
                />
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-2 text-left">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-400"
                />
                <Label 
                  htmlFor="remember-me" 
                  className="text-sm font-normal text-gray-700 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>

              {/* Next Button */}
              <Button
                type="submit"
                disabled={loading || !username}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-full text-base font-medium transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Next
              </Button>

              {/* OR divider */}
              <div className="my-8">
                <div className="text-center text-gray-500 text-sm font-normal">
                  OR
                </div>
              </div>

              {/* Certificate Sign In Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleCertificateSignIn}
                disabled={certificateLoading}
                className="w-full border-2 border-gray-400 text-gray-700 py-3 px-6 rounded-full text-base font-medium hover:bg-gray-50 transition-colors"
              >
                {certificateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Sign in with Partner Certificate
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
          <div>
            © Copyright 2025 Hewlett Packard Enterprise Development LP
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="#" className="hover:text-gray-700 transition-colors">
              Privacy
            </Link>
            <span>|</span>
            <Link to="#" className="hover:text-gray-700 transition-colors">
              Terms of Use
            </Link>
            <span>|</span>
            <Link to="#" className="hover:text-gray-700 transition-colors">
              Ad Choices & Cookies
            </Link>
            <span>|</span>
            <Link to="#" className="hover:text-gray-700 transition-colors">
              Do Not Sell or Share My Personal Information
            </Link>
            <span>|</span>
            <Link to="#" className="hover:text-gray-700 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;