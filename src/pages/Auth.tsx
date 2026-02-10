import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Auth page — stubbed. Immediately redirects to dashboard.
 */
const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ 
           background: 'linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%)',
         }}>
      <p className="text-muted-foreground" style={{ fontFamily: 'Georgia, serif' }}>
        Redirecting...
      </p>
    </div>
  );
};

export default Auth;
