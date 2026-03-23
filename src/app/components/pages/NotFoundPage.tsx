import { Link } from "react-router";
import { HeartPulse, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-[Montserrat]">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <HeartPulse className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-6xl font-extrabold text-green-700 mb-3">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
