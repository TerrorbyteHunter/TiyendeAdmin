
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Users() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to management page with users tab selected
    setLocation("/management?tab=users");
  }, [setLocation]);

  return <div>Redirecting to users management...</div>;
}
