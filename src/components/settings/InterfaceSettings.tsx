"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext, defaultSettings } from '@/store/AppContext';
import { Home, Brain, AppWindow, RotateCcw, Phone } from 'lucide-react';
import { Button } from '../ui/button';

const InterfaceSettings = () => {
    const { settings, setSettings } = useAppContext();

    const handleToggle = (key: keyof typeof settings.interface, value: boolean) => {
        setSettings(s => ({
            ...s,
            interface: {
                ...s.interface,
                [key]: value,
            }
        }));
    };
    
    const handleReset = () => {
        setSettings(s => ({
            ...s,
            interface: defaultSettings.interface,
        }));
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>تخصيص الواجهة</CardTitle>
                        <CardDescription>تحكم في الأقسام التي تظهر في شريط التنقل.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="ml-2 h-4 w-4" />
                        إعادة تعيين
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <SettingToggle
                    id="contactTab"
                    label="إظهار تبويب تواصل"
                    description="عرض المحادثات، الأصدقاء، والمكالمات."
                    icon={Phone}
                    checked={settings.interface.showContactTab}
                    onCheckedChange={(checked) => handleToggle('showContactTab', checked)}
                />
                <SettingToggle
                    id="socialTab"
                    label="إظهار تبويب المجتمع"
                    description="عرض المنشورات العامة والأخبار والبث المباشر."
                    icon={Home}
                    checked={settings.interface.showSocialTab}
                    onCheckedChange={(checked) => handleToggle('showSocialTab', checked)}
                />
                <SettingToggle
                    id="aiTab"
                    label="إظهار تبويب الذكاء الاصطناعي"
                    description="الوصول إلى أدوات الذكاء الاصطناعي الإبداعية."
                    icon={Brain}
                    checked={settings.interface.showAiTab}
                    onCheckedChange={(checked) => handleToggle('showAiTab', checked)}
                />
                <SettingToggle
                    id="appsTab"
                    label="إظهار تبويب التطبيقات"
                    description="عرض قائمة التطبيقات والخدمات المصغرة."
                    icon={AppWindow}
                    checked={settings.interface.showAppsTab}
                    onCheckedChange={(checked) => handleToggle('showAppsTab', checked)}
                />
            </CardContent>
        </Card>
    );
};

const SettingToggle = ({ id, label, description, icon: Icon, checked, onCheckedChange }: {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) => (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
        <div className="flex items-start gap-4">
             <Icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div className="space-y-1">
                <Label htmlFor={id} className="text-base font-medium">{label}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
        <Switch
            id={id}
            checked={checked}
            onCheckedChange={onCheckedChange}
        />
    </div>
);

export default InterfaceSettings;
