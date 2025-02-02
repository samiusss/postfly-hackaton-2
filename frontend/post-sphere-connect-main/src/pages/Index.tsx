import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col items-center justify-center">
      {!isSignedIn ? (
        <div className="w-full max-w-3xl mx-auto px-4">
          <div className="text-center space-y-8 mb-8">
            <h1 className="text-5xl font-bold text-gray-900 animate-fade-in">
              Post to All Your Social Media in One Place
            </h1>
            
            <p className="text-xl text-gray-600">
              Schedule posts, manage multiple accounts, and analyze your social media presence all from a single dashboard.
            </p>

            <div className="space-x-4">
              <Button
                onClick={() => navigate("/sign-in")}
                className="bg-primary hover:bg-primary/90"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/sign-up")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-primary hover:bg-primary/90"
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl mx-auto px-4">
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Multiple Platforms</h3>
          <p className="text-gray-600">Post to Twitter, Instagram, and Facebook simultaneously</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Media Upload</h3>
          <p className="text-gray-600">Share photos and videos across all your social accounts</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
          <p className="text-gray-600">Schedule your posts for the perfect time</p>
        </div>
      </div>
    </div>
  );
}