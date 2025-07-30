
"use client";

import React, { useState } from 'react';
import { LogOut, User, Palette, Bell, Shield, Languages, HelpCircle } from 'lucide-react';
import useIsMobile from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../ui/button';
import ProfileSettings from './ProfileSettings';
import AppearanceSettings from './AppearanceSettings';
import NotificationSettings from './NotificationSettings';
import AccountSettings from './AccountSettings';

interface SettingsViewProps {
    onLogout: () => void;
}

type SettingsSection = 'profile' | 'appearance' | 'notifications' | 'account' | 'language' | 'help';

const settingsSections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'appearance', label: 'المظهر', icon: Palette },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'account', label: 'الحساب والأمان', icon: Shield },
    { id: 'language', label: 'اللغة', icon: Languages },
    { id: 'help', label: 'المساعدة', icon: HelpCircle },
];

const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
    const isMobile = useIsMobile();
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSettings />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'account':
                return <AccountSettings />;
            // Add other sections here when implemented
            default:
                return <div className="p-6 bg-card rounded-lg"><h3 className="text-xl font-semibold">{settingsSections.find(s => s.id === activeSection)?.label}</h3><p className="mt-4 text-muted-foreground">هذه الميزة سيتم تفعيلها قريبًا.</p></div>;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-100 dark:bg-black">
            <header className="p-4 md:p-6 border-b bg-background z-10">
                <h1 className="text-2xl md:text-3xl font-bold">الإعدادات</h1>
            </header>

            <div className="flex-1 overflow-hidden md:grid md:grid-cols-[240px_1fr] md:gap-8 md:p-6">
                {/* Mobile Navigation */}
                {isMobile && (
                    <div className="p-4">
                        <Select value={activeSection} onValueChange={(value) => setActiveSection(value as SettingsSection)}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر قسمًا..." />
                            </SelectTrigger>
                            <SelectContent>
                                {settingsSections.map(section => (
                                    <SelectItem key={section.id} value={section.id}>{section.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col gap-2">
                    <nav className="flex flex-col gap-1">
                        {settingsSections.map(section => (
                            <Button
                                key={section.id}
                                variant="ghost"
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "justify-start gap-3 px-4 py-2 text-base",
                                    activeSection === section.id && "bg-primary/10 text-primary font-bold"
                                )}
                            >
                                <section.icon className="w-5 h-5" />
                                {section.label}
                            </Button>
                        ))}
                    </nav>
                     <Button variant="ghost" onClick={onLogout} className="justify-start gap-3 px-4 py-2 text-base mt-auto">
                        <LogOut className="w-5 h-5" />
                        تسجيل الخروج
                    </Button>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 pt-0 md:p-0">
                    {renderSection()}
                     {isMobile && (
                        <div className="mt-6 px-4">
                             <Button variant="destructive" className="w-full" onClick={onLogout}>
                                <LogOut className="ml-2" />
                                تسجيل الخروج
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsView;
