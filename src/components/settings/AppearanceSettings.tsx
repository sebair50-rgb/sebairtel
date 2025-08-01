
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/store/AppContext';

type Theme = 'light' | 'dark' | 'system';

const AppearanceSettings = () => {
    const { settings, setSettings } = useAppContext();
    const [theme, setTheme] = useState<Theme>(settings.theme || 'system');

    useEffect(() => {
        const root = window.document.documentElement;
        
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
        
        // Persist theme choice
        setSettings(s => ({ ...s, theme }));

    }, [theme, setSettings]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app. Will be saved automatically for your current device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <ThemeButton 
                        label="Light" 
                        icon={Sun} 
                        isActive={theme === 'light'} 
                        onClick={() => setTheme('light')}
                    />
                    <ThemeButton 
                        label="Dark" 
                        icon={Moon} 
                        isActive={theme === 'dark'} 
                        onClick={() => setTheme('dark')}
                    />
                     <ThemeButton 
                        label="System" 
                        icon={Laptop} 
                        isActive={theme === 'system'} 
                        onClick={() => setTheme('system')}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

const ThemeButton = ({ label, icon: Icon, isActive, onClick }: { label: string, icon: React.ElementType, isActive: boolean, onClick: () => void }) => {
    return (
         <Button 
            variant="outline" 
            className={cn(
                "h-24 flex flex-col gap-2 transition-all",
                isActive && "ring-2 ring-primary border-primary"
            )}
            onClick={onClick}
        >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
        </Button>
    )
}

export default AppearanceSettings;
