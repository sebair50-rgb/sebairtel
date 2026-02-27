
"use client";

import React, { useState } from 'react';
import { LogOut, User, Palette, Bell, Shield, Languages, HelpCircle, Lock, Music, LayoutDashboard, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
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
import AppHeader from '../layout/AppHeader';
import LanguageSettings from './LanguageSettings';
import { useTranslation } from '@/store/LanguageContext';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card } from '../ui/card';

interface SettingsViewProps {
    onLogout: () => void;
}

type SettingsSection = 'profile' | 'appearance' | 'notifications' | 'sounds' | 'privacy' | 'account' | 'interface' | 'language' | 'help';

const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

    const settingsSections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
        { id: 'profile', label: t('settings.settingsTab.profile'), icon: User },
        { id: 'appearance', label: t('settings.settingsTab.appearance'), icon: Palette },
        { id: 'interface', label: t('settings.settingsTab.customizeUi'), icon: LayoutDashboard },
        { id: 'notifications', label: t('settings.settingsTab.notifications'), icon: Bell },
        { id: 'sounds', label: t('settings.settingsTab.sounds'), icon: Music },
        { id: 'privacy', label: t('settings.settingsTab.privacy'), icon: Lock },
        { id: 'account', label: t('settings.settingsTab.account'), icon: Shield },
        { id: 'language', label: t('settings.settingsTab.language'), icon: Languages },
        { id: 'help', label: t('settings.settingsTab.help'), icon: HelpCircle },
    ];

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
                return (
                    <Card className="p-12 text-center border-dashed">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            {React.createElement(settingsSections.find(s => s.id === activeSection)?.icon || HelpCircle, { size: 32 })}
                        </div>
                        <h3 className="text-xl font-semibold">{settingsSections.find(s => s.id === activeSection)?.label}</h3>
                        <p className="mt-2 text-muted-foreground">{t('settings.featureSoon')}</p>
                    </Card>
                );
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950">
            <AppHeader title={t('settings.title')} icon={SettingsIcon} />

            <div className="flex-1 md:grid md:grid-cols-[300px_1fr] md:gap-0 overflow-hidden">
                
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col bg-background border-r p-6 overflow-y-auto">
                    {currentUser && (
                        <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                            <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                <AvatarFallback>{currentUser.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm truncate">{currentUser.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                            </div>
                        </div>
                    )}

                    <nav className="flex flex-col gap-1.5 flex-1">
                        {settingsSections.map(section => (
                            <Button
                                key={section.id}
                                variant="ghost"
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "justify-between px-4 py-6 text-base rounded-xl transition-all duration-200 group",
                                    activeSection === section.id 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90" 
                                        : "hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon className={cn("w-5 h-5", activeSection === section.id ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                                    <span className="font-medium">{section.label}</span>
                                </div>
                                {activeSection === section.id && <ChevronRight className="w-4 h-4" />}
                            </Button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-6 border-t">
                        <Button 
                            variant="ghost" 
                            onClick={onLogout} 
                            className="w-full justify-start gap-3 px-4 py-6 text-base text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('sidebar.signOut')}
                        </Button>
                    </div>
                </aside>

                 {/* Mobile Navigation & Content Area */}
                <div className="flex flex-col h-full overflow-hidden">
                     {isMobile && (
                        <div className="px-4 py-3 bg-background border-b shadow-sm sticky top-0 z-20">
                             <div className="relative">
                                 <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex space-x-2 pb-1">
                                        {settingsSections.map(section => (
                                             <Button
                                                key={section.id}
                                                variant={activeSection === section.id ? 'default' : 'secondary'}
                                                onClick={() => setActiveSection(section.id)}
                                                className={cn(
                                                    "justify-start gap-2 px-5 py-2.5 text-sm h-auto rounded-full transition-all duration-300",
                                                    activeSection === section.id && "shadow-md shadow-primary/20"
                                                )}
                                            >
                                                <section.icon className="w-4 h-4" />
                                                {section.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" className="hidden" />
                                </ScrollArea>
                             </div>
                        </div>
                    )}
                    <ScrollArea className="h-full">
                        <main className="p-4 md:p-10 max-w-5xl mx-auto">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {renderSection()}
                            </div>
                        </main>
                         {isMobile && (
                            <div className="mt-6 px-4 pb-8">
                                 <Button variant="destructive" className="w-full h-14 rounded-xl font-bold shadow-lg shadow-destructive/10" onClick={onLogout}>
                                    <LogOut className="mr-2 h-5 w-5" />
                                    {t('sidebar.signOut')}
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
