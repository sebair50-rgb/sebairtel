
"use client";

import React, { useState } from 'react';
import { LogOut, User, Palette, Bell, Shield, Languages, HelpCircle, Lock, Music, LayoutDashboard } from 'lucide-react';
import useIsMobile from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import ProfileSettings from './ProfileSettings';
import AppearanceSettings from './AppearanceSettings';
import NotificationSettings from './NotificationSettings';
import AccountSettings from './AccountSettings';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import PrivacySettings from './PrivacySettings';
import SoundSettings from './SoundSettings';
import InterfaceSettings from './InterfaceSettings';

interface SettingsViewProps {
    onLogout: () => void;
}

type SettingsSection = 'profile' | 'appearance' | 'notifications' | 'sounds' | 'privacy' | 'account' | 'interface' | 'language' | 'help';

const settingsSections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'appearance', label: 'المظهر', icon: Palette },
    { id: 'interface', label: 'تخصيص الواجهة', icon: LayoutDashboard },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'sounds', label: 'النغمات والأصوات', icon: Music },
    { id: 'privacy', label: 'الخصوصية', icon: Lock },
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
            case 'privacy':
                return <PrivacySettings />;
            case 'sounds':
                return <SoundSettings />;
            case 'interface':
                return <InterfaceSettings />;
            default:
                return <div className="p-6 bg-card rounded-lg shadow-sm"><h3 className="text-xl font-semibold">{settingsSections.find(s => s.id === activeSection)?.label}</h3><p className="mt-4 text-muted-foreground">هذه الميزة سيتم تفعيلها قريبًا.</p></div>;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-black/90">
            <header className="p-4 md:p-6 border-b bg-background z-10 sticky top-0">
                <h1 className="text-2xl md:text-3xl font-bold">الإعدادات</h1>
            </header>

            <div className="flex-1 overflow-hidden md:grid md:grid-cols-[280px_1fr] md:gap-8 md:p-6">
                
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col gap-2 bg-background p-4 rounded-xl border">
                    <nav className="flex flex-col gap-1">
                        {settingsSections.map(section => (
                            <Button
                                key={section.id}
                                variant="ghost"
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "justify-start gap-3 px-4 py-3 text-base rounded-lg",
                                    activeSection === section.id && "bg-primary/10 text-primary font-bold"
                                )}
                            >
                                <section.icon className="w-5 h-5" />
                                {section.label}
                            </Button>
                        ))}
                    </nav>
                     <Button variant="ghost" onClick={onLogout} className="justify-start gap-3 px-4 py-3 text-base mt-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg">
                        <LogOut className="w-5 h-5" />
                        تسجيل الخروج
                    </Button>
                </aside>

                 {/* Mobile Navigation & Content Area */}
                <main className="flex-1 overflow-y-auto">
                     {isMobile && (
                        <div className="p-2">
                             <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex w-max space-x-2 p-2">
                                    {settingsSections.map(section => (
                                         <Button
                                            key={section.id}
                                            variant={activeSection === section.id ? 'secondary' : 'ghost'}
                                            onClick={() => setActiveSection(section.id)}
                                            className="justify-start gap-2 px-4 py-2 text-sm h-auto rounded-full"
                                        >
                                            <section.icon className="w-4 h-4" />
                                            {section.label}
                                        </Button>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    )}
                    <div className="p-4 md:p-0">
                        {renderSection()}
                    </div>
                     {isMobile && (
                        <div className="mt-6 px-4 pb-4">
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
