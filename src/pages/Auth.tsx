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
  const {
    signIn,
    signInWithSSO
  } = useAuth();
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
  return <div className="min-h-screen bg-white flex flex-col">
      {/* Header with HPE Logo */}
      <header className="px-8 py-6">
        <div className="flex items-center">
          <img src="/lovable-uploads/8fa9c8bc-6cf8-4cdb-a2ca-8b12c4b39afb.png" alt="HPE" className="h-8" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 bg-zinc-50">
        <div className="w-full max-w-md bg-white rounded-sm px-[20px] py-[20px]">
          {/* Sign In Form */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-normal text-gray-800 mb-12 text-left">Sign In</h1>
            
            <form onSubmit={handleNext} className="space-y-6">
              {/* Username Field */}
              <div className="text-left">
                <Label htmlFor="username" className="block text-sm font-normal text-gray-700 mb-2">
                  Username
                </Label>
                <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-3 border-2 border-black-400 rounded-none focus:border-black-500 focus:ring-0 text-base" />
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-2 text-left">
                <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked as boolean)} className="border-gray-400" />
                <Label htmlFor="remember-me" className="text-sm font-normal text-gray-700 cursor-pointer">
                  Remember me
                </Label>
              </div>

              {/* Next Button */}
              <Button type="submit" disabled={loading || !username} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-full text-base font-medium transition-colors">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Next
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
    </div>;
};
export default Auth;