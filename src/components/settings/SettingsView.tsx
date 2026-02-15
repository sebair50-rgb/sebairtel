"use client";

import React, { useState } from 'react';
import { LogOut, User, Palette, Bell, Shield, Languages, HelpCircle, Lock, Music, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
import AppHeader from '../layout/AppHeader';
import LanguageSettings from './LanguageSettings';

interface SettingsViewProps {
    onLogout: () => void;
}

type SettingsSection = 'profile' | 'appearance' | 'notifications' | 'sounds' | 'privacy' | 'account' | 'interface' | 'language' | 'help';

const settingsSections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'interface', label: 'Customize Interface', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sounds', label: 'Tones & Sounds', icon: Music },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'account', label: 'Account & Security', icon: Shield },
    { id: 'language', label: 'Language', icon: Languages },
    { id: 'help', label: 'Help', icon: HelpCircle },
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
            case 'language':
                return <LanguageSettings />;
            default:
                return <div className="p-6 bg-card rounded-lg shadow-sm"><h3 className="text-xl font-semibold">{settingsSections.find(s => s.id === activeSection)?.label}</h3><p className="mt-4 text-muted-foreground">This feature will be activated soon.</p></div>;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-black/90">
            <AppHeader title="Settings" icon={SettingsIcon} />

            <div className="flex-1 md:grid md:grid-cols-[280px_1fr] md:gap-8 md:p-6 overflow-hidden">
                
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col gap-2 bg-amber-100 dark:bg-stone-900 p-4 rounded-xl border">
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
                        Sign Out
                    </Button>
                </aside>

                 {/* Mobile Navigation & Content Area */}
                <div className="flex flex-col h-full overflow-hidden">
                     {isMobile && (
                        <div className="p-2">
                             <div className="relative">
                                 <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-amber-100 dark:bg-stone-900">
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
                                 <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 dark:from-black/90"></div>
                             </div>
                        </div>
                    )}
                    <ScrollArea className="h-full">
                        <div className="p-4 md:p-0">
                            {renderSection()}
                        </div>
                         {isMobile && (
                            <div className="mt-6 px-4 pb-4">
                                 <Button variant="destructive" className="w-full" onClick={onLogout}>
                                    <LogOut className="mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
