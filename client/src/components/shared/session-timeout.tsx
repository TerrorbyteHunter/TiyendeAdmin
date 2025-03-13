
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function SessionTimeout() {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds warning
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30); // Default 30 minutes
  
  useEffect(() => {
    // Try to get configured timeout from localStorage
    const configuredTimeout = localStorage.getItem('sessionTimeout');
    if (configuredTimeout) {
      setSessionTimeoutMinutes(parseInt(configuredTimeout, 10));
    }
    
    let inactivityTimer: number;
    let warningTimer: number;
    let countdownInterval: number;
    
    const resetTimer = () => {
      // Clear any existing timers
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      if (warningTimer) window.clearTimeout(warningTimer);
      
      // Set timeout for showing warning dialog
      warningTimer = window.setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(60);
        
        // Start countdown
        countdownInterval = window.setInterval(() => {
          setTimeLeft(prevTime => {
            if (prevTime <= 1) {
              clearInterval(countdownInterval);
              logout();
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }, (sessionTimeoutMinutes * 60 * 1000) - 60000); // Show warning 1 minute before timeout
      
      // Set timeout for actual logout
      inactivityTimer = window.setTimeout(() => {
        logout();
      }, sessionTimeoutMinutes * 60 * 1000);
    };
    
    // Reset timer on page load
    resetTimer();
    
    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      if (!showWarning) { // Only reset timer if warning isn't showing
        resetTimer();
      }
    };
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Clean up event listeners and timers
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      if (warningTimer) window.clearTimeout(warningTimer);
      if (countdownInterval) window.clearInterval(countdownInterval);
    };
  }, [logout, showWarning, sessionTimeoutMinutes]);
  
  const handleStayLoggedIn = () => {
    setShowWarning(false);
    // Reset all timers by triggering a user activity
    const event = new MouseEvent('mousedown', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  };
  
  const handleLogout = () => {
    setShowWarning(false);
    logout();
  };
  
  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session will expire in {timeLeft} seconds due to inactivity.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="mt-2 sm:mt-0"
          >
            Logout
          </Button>
          <Button
            onClick={handleStayLoggedIn}
            className="mt-2 sm:mt-0"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
