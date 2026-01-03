/**
 * Settings Page
 *
 * Performance-optimized settings page with lazy loading and memoized components.
 * Provides system configuration options and user preferences.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Mock settings API - replace with real API when backend is ready
const settingsApi = {
  getSettings: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        general: {
          companyName: "Warehouse Co.",
          timezone: "UTC",
          language: "en",
          dateFormat: "MM/DD/YYYY"
        },
        notifications: {
          emailAlerts: true,
          lowStockAlerts: true,
          orderUpdates: false,
          systemMaintenance: true
        },
        security: {
          sessionTimeout: 30,
          passwordExpiry: 90,
          twoFactorAuth: false,
          loginAttempts: 5
        },
        performance: {
          autoRefresh: true,
          refreshInterval: 30,
          virtualScrolling: true,
          preloadData: true
        }
      }
    };
  },

  updateSettings: async (settings: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, data: settings };
  }
};

// Settings query keys
const settingsKeys = {
  all: ['settings'] as const,
  general: () => [...settingsKeys.all, 'general'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  security: () => [...settingsKeys.all, 'security'] as const,
  performance: () => [...settingsKeys.all, 'performance'] as const,
};

/**
 * General Settings Section
 * Memoized component for company and localization settings
 */
const GeneralSettings = memo(({ settings, onUpdate }: {
  settings: any;
  onUpdate: (section: string, data: any) => void;
}) => {
  const [localSettings, setLocalSettings] = useState(settings?.general || {});

  const handleChange = useCallback((field: string, value: any) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onUpdate('general', updated);
  }, [localSettings, onUpdate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          General Settings
        </CardTitle>
        <CardDescription>
          Configure basic company information and localization settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={localSettings.companyName || ""}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={localSettings.timezone} onValueChange={(value) => handleChange('timezone', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern Time</SelectItem>
                <SelectItem value="PST">Pacific Time</SelectItem>
                <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={localSettings.language} onValueChange={(value) => handleChange('language', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select value={localSettings.dateFormat} onValueChange={(value) => handleChange('dateFormat', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Notification Settings Section
 * Memoized component for notification preferences
 */
const NotificationSettings = memo(({ settings, onUpdate }: {
  settings: any;
  onUpdate: (section: string, data: any) => void;
}) => {
  const [localSettings, setLocalSettings] = useState(settings?.notifications || {});

  const handleChange = useCallback((field: string, value: boolean) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onUpdate('notifications', updated);
  }, [localSettings, onUpdate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure when and how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive important notifications via email
              </p>
            </div>
            <Switch
              checked={localSettings.emailAlerts}
              onCheckedChange={(checked) => handleChange('emailAlerts', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when products are running low
              </p>
            </div>
            <Switch
              checked={localSettings.lowStockAlerts}
              onCheckedChange={(checked) => handleChange('lowStockAlerts', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for order status changes
              </p>
            </div>
            <Switch
              checked={localSettings.orderUpdates}
              onCheckedChange={(checked) => handleChange('orderUpdates', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Alerts about system updates and maintenance
              </p>
            </div>
            <Switch
              checked={localSettings.systemMaintenance}
              onCheckedChange={(checked) => handleChange('systemMaintenance', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Performance Settings Section
 * Memoized component for performance-related settings
 */
const PerformanceSettings = memo(({ settings, onUpdate }: {
  settings: any;
  onUpdate: (section: string, data: any) => void;
}) => {
  const [localSettings, setLocalSettings] = useState(settings?.performance || {});

  const handleChange = useCallback((field: string, value: any) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onUpdate('performance', updated);
  }, [localSettings, onUpdate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Performance Settings
        </CardTitle>
        <CardDescription>
          Optimize application performance and user experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">
                Automatically refresh data in the background
              </p>
            </div>
            <Switch
              checked={localSettings.autoRefresh}
              onCheckedChange={(checked) => handleChange('autoRefresh', checked)}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
            <Select
              value={String(localSettings.refreshInterval)}
              onValueChange={(value) => handleChange('refreshInterval', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Virtual Scrolling</Label>
              <p className="text-sm text-muted-foreground">
                Use virtual scrolling for large tables (recommended)
              </p>
            </div>
            <Badge variant={localSettings.virtualScrolling ? "default" : "secondary"}>
              {localSettings.virtualScrolling ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Preloading</Label>
              <p className="text-sm text-muted-foreground">
                Preload related data for faster navigation
              </p>
            </div>
            <Switch
              checked={localSettings.preloadData}
              onCheckedChange={(checked) => handleChange('preloadData', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Main Settings Page Component
 * Performance-optimized with lazy loading and memoized sections
 */
const Settings = memo(() => {
  const queryClient = useQueryClient();

  // Fetch settings with optimized caching
  const { data: settings, isLoading } = useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsApi.getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });

  const handleSectionUpdate = useCallback((section: string, data: any) => {
    // Optimistic update for better UX
    queryClient.setQueryData(settingsKeys.all, (old: any) => ({
      ...old,
      data: {
        ...old?.data,
        [section]: data
      }
    }));
  }, [queryClient]);

  const handleSaveAll = useCallback(() => {
    if (settings?.data) {
      updateMutation.mutate(settings.data);
    }
  }, [settings?.data, updateMutation]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48 mb-2"></div>
                <div className="h-4 bg-muted rounded w-64"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: settingsKeys.all })}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={updateMutation.isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isLoading ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        <GeneralSettings
          settings={settings?.data}
          onUpdate={handleSectionUpdate}
        />
        <NotificationSettings
          settings={settings?.data}
          onUpdate={handleSectionUpdate}
        />
        <PerformanceSettings
          settings={settings?.data}
          onUpdate={handleSectionUpdate}
        />
      </div>
    </div>
  );
});

export default Settings;
