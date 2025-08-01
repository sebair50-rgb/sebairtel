
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

const LanguageSettings = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('system');
    const { toast } = useToast();

    const handleSave = () => {
        let languageName = 'Device Language';
        if (selectedLanguage === 'en') {
            languageName = 'English';
        } else if (selectedLanguage === 'ar') {
            languageName = 'Arabic';
        }
        
        // In a real app, you would save this to the user's settings and
        // use an i18n library to change the language.
        toast({
            title: "Settings Saved",
            description: `Language has been set to ${languageName}. (Demonstration only)`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Language Settings</CardTitle>
                <CardDescription>Choose the display language for the application interface.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup 
                    value={selectedLanguage} 
                    onValueChange={setSelectedLanguage}
                    className="space-y-4"
                >
                     <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="system" id="lang-system" />
                        <Label htmlFor="lang-system" className="text-base font-medium w-full">
                            Device Language
                            <p className="text-sm font-normal text-muted-foreground">Automatically use your device's language.</p>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="en" id="lang-en" />
                        <Label htmlFor="lang-en" className="text-base font-medium w-full">
                            English
                            <p className="text-sm font-normal text-muted-foreground">United States</p>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="ar" id="lang-ar" />
                        <Label htmlFor="lang-ar" className="text-base font-medium w-full">
                            العربية
                            <p className="text-sm font-normal text-muted-foreground">Arabic</p>
                        </Label>
                    </div>
                </RadioGroup>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LanguageSettings;
