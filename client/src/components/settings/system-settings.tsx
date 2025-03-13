import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SaveIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsFormProps {
  title: string;
  description: string;
  settings: {
    [key: string]: {
      name: string;
      label: string;
      value: string;
      description?: string;
      type?: "text" | "textarea" | "email" | "phone";
    };
  };
}

export function SettingsForm({ title, description, settings }: SettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [formValues, setFormValues] = useState(settings);
  
  const handleChange = (settingName: string, value: string) => {
    setFormValues({
      ...formValues,
      [settingName]: {
        ...formValues[settingName],
        value,
      },
    });
  };
  
  const handleSave = async (settingName: string) => {
    const setting = formValues[settingName];
    if (!setting) return;
    
    setIsLoading({ ...isLoading, [settingName]: true });
    
    try {
      await apiRequest("POST", `/api/settings/${setting.name}`, { value: setting.value });
      
      toast({
        title: "Setting updated",
        description: `${setting.label} has been successfully updated.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, [settingName]: false });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(formValues).map((key) => {
          const setting = formValues[key];
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{setting.label}</h3>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(key)}
                  disabled={isLoading[key]}
                >
                  {isLoading[key] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {setting.type === "textarea" ? (
                <Textarea
                  value={setting.value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={3}
                />
              ) : (
                <Input
                  type={setting.type || "text"}
                  value={setting.value}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              )}
              
              <Separator className="my-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function SystemSettings() {
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  // Convert the settings array to a more usable format
  const systemSettings = settings.reduce((acc: any, setting: any) => {
    if (setting.name.startsWith('system_')) {
      acc[setting.name] = {
        name: setting.name,
        label: setting.name.replace('system_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: setting.value || '',
        description: setting.description,
      };
    }
    return acc;
  }, {});
  
  const contactSettings = settings.reduce((acc: any, setting: any) => {
    if (setting.name.startsWith('contact_')) {
      const type = setting.name.includes('email') 
        ? 'email' 
        : setting.name.includes('phone') 
          ? 'phone' 
          : 'text';
          
      acc[setting.name] = {
        name: setting.name,
        label: setting.name.replace('contact_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: setting.value || '',
        description: setting.description,
        type,
      };
    }
    return acc;
  }, {});
  
  const notificationSettings = settings.reduce((acc: any, setting: any) => {
    if (setting.name.startsWith('notification_')) {
      acc[setting.name] = {
        name: setting.name,
        label: setting.name.replace('notification_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: setting.value || '',
        description: setting.description,
      };
    }
    return acc;
  }, {});
  
  // If no settings were found, provide defaults
  if (Object.keys(systemSettings).length === 0) {
    systemSettings.system_name = {
      name: 'system_name',
      label: 'System Name',
      value: 'Tiyende Bus Reservation',
      description: 'The name of the system as displayed to users',
    };
  }
  
  if (Object.keys(contactSettings).length === 0) {
    contactSettings.contact_email = {
      name: 'contact_email',
      label: 'Contact Email',
      value: 'support@tiyende.com',
      description: 'Primary support email address',
      type: 'email',
    };
    
    contactSettings.contact_phone = {
      name: 'contact_phone',
      label: 'Contact Phone',
      value: '+260 97 1234567',
      description: 'Primary support phone number',
      type: 'phone',
    };
  }
  
  return (
    <div className="space-y-6">
      <SettingsForm
        title="System Settings"
        description="Configure system-wide settings"
        settings={systemSettings}
      />
      
      <SettingsForm
        title="Contact Information"
        description="Manage contact details for the platform"
        settings={contactSettings}
      />
      
      {Object.keys(notificationSettings).length > 0 && (
        <SettingsForm
          title="Notification Settings"
          description="Configure how notifications are sent"
          settings={notificationSettings}
        />
      )}
    </div>
  );
}
