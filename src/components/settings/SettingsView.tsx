
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Lock, Palette, Languages, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/button';

interface SettingsViewProps {
    onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
    const { settings, setSettings, darkMode, toggleDarkMode } = useAppContext();

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell /> الإشعارات</CardTitle>
                        <CardDescription>إدارة تفضيلات الإشعارات.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notifications">تفعيل الإشعارات</Label>
                            <Switch
                                id="notifications"
                                checked={settings.notifications}
                                onCheckedChange={(checked) => setSettings(s => ({ ...s, notifications: checked }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lock /> الخصوصية</CardTitle>
                        <CardDescription>تحكم في خصوصية حسابك.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="privacy">تفعيل وضع الخصوصية</Label>
                            <Switch
                                id="privacy"
                                checked={settings.privacy}
                                onCheckedChange={(checked) => setSettings(s => ({ ...s, privacy: checked }))}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette /> المظهر</CardTitle>
                        <CardDescription>تخصيص شكل التطبيق.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode">الوضع الداكن</Label>
                            <Switch
                                id="dark-mode"
                                checked={darkMode}
                                onCheckedChange={toggleDarkMode}
                            />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Languages /> اللغة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">اللغة العربية هي اللغة المحددة حاليًا.</p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><HelpCircle /> المساعدة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">للمساعدة، تواصل مع فريق الدعم.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LogOut /> تسجيل الخروج</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" className="w-full" onClick={onLogout}>
                            تسجيل الخروج
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SettingsView;
