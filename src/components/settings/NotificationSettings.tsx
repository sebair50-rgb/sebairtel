
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/store/AppContext';

const NotificationSettings = () => {
    const { settings, setSettings } = useAppContext();

    const handleToggle = (key: keyof typeof settings.notifications, value: boolean) => {
        setSettings(s => ({
            ...s,
            notifications: {
                ...s.notifications,
                [key]: value,
            }
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <SettingToggle
                        id="all"
                        label="Enable All Notifications"
                        description="Master switch to enable or disable all alerts."
                        checked={settings.notifications.all}
                        onCheckedChange={(checked) => handleToggle('all', checked)}
                    />
                    <SettingToggle
                        id="messages"
                        label="Message Notifications"
                        description="Receive notifications when new messages arrive."
                        checked={settings.notifications.messages}
                        onCheckedChange={(checked) => handleToggle('messages', checked)}
                        disabled={!settings.notifications.all}
                    />
                    <SettingToggle
                        id="mentions"
                        label="Mentions"
                        description="Receive notifications when someone mentions you."
                        checked={settings.notifications.mentions}
                        onCheckedChange={(checked) => handleToggle('mentions', checked)}
                        disabled={!settings.notifications.all}
                    />
                     <SettingToggle
                        id="calls"
                        label="Missed Calls"
                        description="Receive a notification for any missed calls."
                        checked={settings.notifications.calls}
                        onCheckedChange={(checked) => handleToggle('calls', checked)}
                        disabled={!settings.notifications.all}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

const SettingToggle = ({ id, label, description, checked, onCheckedChange, disabled = false }: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}) => (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
        <div className="space-y-1">
            <Label htmlFor={id} className="text-base font-medium">{label}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
            id={id}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
        />
    </div>
);

export default NotificationSettings;
