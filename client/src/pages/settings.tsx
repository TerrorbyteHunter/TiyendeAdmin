import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "@/components/settings/system-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Placeholder for BackupManager component
const BackupManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Manager</CardTitle>
        <CardDescription>Manage database backups</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Placeholder for backup management UI */}
        <p>Backup functionality not yet implemented.</p>
      </CardContent>
    </Card>
  );
};


export default function Settings() {
  const { toast } = useToast();
  const [automaticBackups, setAutomaticBackups] = useState(true);
  const [activityLogging, setActivityLogging] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const toggleFeature = (feature: string, enabled: boolean) => {
    toast({
      title: `${feature} ${enabled ? 'enabled' : 'disabled'}`,
      description: `${feature} has been ${enabled ? 'enabled' : 'disabled'} successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">System Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Configure system-wide settings and preferences.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security features and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require admins to use 2FA when logging in
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={false}
                  onCheckedChange={(checked) => 
                    toast({
                      title: "Feature not available",
                      description: "Two-factor authentication setup is not available in this version.",
                      variant: "destructive",
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="activity-logging">Activity Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all admin actions for auditing purposes
                  </p>
                </div>
                <Switch
                  id="activity-logging"
                  checked={activityLogging}
                  onCheckedChange={(checked) => {
                    setActivityLogging(checked);
                    toggleFeature("Activity logging", checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out inactive users
                  </p>
                </div>
                <div className="w-20">
                  <input 
                    type="number" 
                    id="session-timeout" 
                    min="5" 
                    max="120" 
                    defaultValue="30"
                    className="w-full p-2 border rounded-md" 
                    onChange={() => 
                      toast({
                        title: "Session timeout updated",
                        description: "New session timeout has been set successfully.",
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure system maintenance and advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="backups">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Schedule automatic database backups
                  </p>
                </div>
                <Switch
                  id="backups"
                  checked={automaticBackups}
                  onCheckedChange={(checked) => {
                    setAutomaticBackups(checked);
                    toggleFeature("Automatic backups", checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important system events
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    toggleFeature("Email notifications", checked);
                  }}
                />
              </div>

              <div className="pt-4">
                <button 
                  className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                  onClick={() => 
                    toast({
                      title: "Maintenance mode not available",
                      description: "This feature is not available in the current version.",
                      variant: "destructive",
                    })
                  }
                >
                  Enter System Maintenance Mode
                </button>
              </div>
            </CardContent>
          </Card>
          <BackupManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}