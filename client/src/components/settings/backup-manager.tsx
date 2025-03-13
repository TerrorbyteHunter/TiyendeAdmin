
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Database, Download, RefreshCw } from "lucide-react";
import axios from "axios";

export function BackupManager() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/backups');
      setBackups(response.data);
    } catch (error) {
      toast({
        title: "Failed to fetch backups",
        description: "Could not retrieve the list of backups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await axios.post('/api/backups');
      toast({
        title: "Backup created",
        description: "Database backup has been created successfully.",
      });
      // Refresh the list
      fetchBackups();
    } catch (error) {
      toast({
        title: "Backup failed",
        description: "Could not create database backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // Format the backup filename for display
  const formatBackupName = (filename: string) => {
    // Extract timestamp from backup-YYYY-MM-DDTHH-MM-SS-SSSZ.sql
    const match = filename.match(/backup-(.+)\.sql/);
    if (match && match[1]) {
      const timestamp = match[1].replace(/-/g, ':').replace('T', ' ');
      return timestamp;
    }
    return filename;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Backups</CardTitle>
        <CardDescription>Manage your database backups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={createBackup} 
            disabled={creating}
            variant="default"
          >
            {creating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Backup
              </>
            )}
          </Button>
          
          <Button 
            onClick={fetchBackups} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {backups.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No backups found. Create your first backup to get started.
          </p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 text-sm font-medium">Date & Time</th>
                  <th className="text-right p-2 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                    <td className="p-2 text-sm">{formatBackupName(backup)}</td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
