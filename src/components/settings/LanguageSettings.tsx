
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { useAppContext } from '@/store/AppContext';
import { useTranslation } from '@/store/LanguageContext';

const LanguageSettings = () => {
    const { settings, setSettings } = useAppContext();
    const { t, setLanguage, language } = useTranslation();
    const { toast } = useToast();

    const handleSave = () => {
        // The language is already changed on selection, so this button just confirms it.
        let languageName = t('settings.deviceLang');
        if (settings.language === 'en') {
            languageName = t('settings.english');
        } else if (settings.language === 'ar') {
            languageName = t('settings.arabic');
        }
        
        toast({
            title: t('settings.langSaved'),
            description: t('settings.langSavedDesc', { lang: languageName }),
        });
    };

    const handleLanguageChange = (lang: 'en' | 'ar' | 'system') => {
        setLanguage(lang);
        setSettings(s => ({...s, language: lang }));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.language')}</CardTitle>
                <CardDescription>{t('settings.languageDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup 
                    value={settings.language} 
                    onValueChange={(value) => handleLanguageChange(value as any)}
                    className="space-y-4"
                >
                     <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="system" id="lang-system" />
                        <Label htmlFor="lang-system" className="text-base font-medium w-full">
                            {t('settings.deviceLang')}
                            <p className="text-sm font-normal text-muted-foreground">{t('settings.deviceLangDesc')}</p>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="en" id="lang-en" />
                        <Label htmlFor="lang-en" className="text-base font-medium w-full">
                            {t('settings.english')}
                            <p className="text-sm font-normal text-muted-foreground">{t('settings.englishDesc')}</p>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="ar" id="lang-ar" />
                        <Label htmlFor="lang-ar" className="text-base font-medium w-full">
                            {t('settings.arabic')}
                             <p className="text-sm font-normal text-muted-foreground" dir="ltr">{t('settings.arabicDesc')}</p>
                        </Label>
                    </div>
                </RadioGroup>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>{t('settings.saveChanges')}</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LanguageSettings;
