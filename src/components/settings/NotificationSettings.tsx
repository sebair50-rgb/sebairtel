
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
                <CardTitle>الإشعارات</CardTitle>
                <CardDescription>اختر كيف تريد أن يتم إعلامك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <SettingToggle
                        id="all"
                        label="تفعيل كل الإشعارات"
                        description="الخيار الرئيسي لتفعيل أو تعطيل جميع التنبيهات."
                        checked={settings.notifications.all}
                        onCheckedChange={(checked) => handleToggle('all', checked)}
                    />
                    <SettingToggle
                        id="messages"
                        label="إشعارات الرسائل"
                        description="تلقي إشعارات عند وصول رسائل جديدة."
                        checked={settings.notifications.messages}
                        onCheckedChange={(checked) => handleToggle('messages', checked)}
                        disabled={!settings.notifications.all}
                    />
                    <SettingToggle
                        id="mentions"
                        label="الإشارات (Mentions)"
                        description="تلقي إشعارات عندما يذكرك شخص ما."
                        checked={settings.notifications.mentions}
                        onCheckedChange={(checked) => handleToggle('mentions', checked)}
                        disabled={!settings.notifications.all}
                    />
                     <SettingToggle
                        id="calls"
                        label="المكالمات الفائتة"
                        description="تلقي إشعار عند وجود مكالمة فائتة."
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
