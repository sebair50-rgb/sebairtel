"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/store/AppContext';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useTranslation } from '@/store/LanguageContext';

const PrivacySettings = () => {
    const { settings, setSettings } = useAppContext();
    const { t } = useTranslation();
    
    type PrivacyKey = keyof typeof settings.privacy;
    type PrivacyValue<K extends PrivacyKey> = typeof settings.privacy[K];

    const handleSettingChange = <K extends PrivacyKey>(key: K, value: PrivacyValue<K>) => {
        setSettings(s => ({
            ...s,
            privacy: {
                ...s.privacy,
                [key]: value,
            }
        }));
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.privacy')}</CardTitle>
                <CardDescription>{t('settings.privacyDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <SettingOption title={t('settings.presence')}>
                    <RadioGroup 
                        value={settings.privacy.lastSeen} 
                        onValueChange={(value) => handleSettingChange('lastSeen', value as any)}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="everyone" id="lastseen-everyone" />
                            <Label htmlFor="lastseen-everyone">{t('settings.everyone')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="friends" id="lastseen-friends" />
                            <Label htmlFor="lastseen-friends">{t('settings.friendsOnly')}</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nobody" id="lastseen-nobody" />
                            <Label htmlFor="lastseen-nobody">{t('settings.nobody')}</Label>
                        </div>
                    </RadioGroup>
                </SettingOption>

                 <SettingOption title={t('settings.profilePhoto')}>
                    <RadioGroup 
                        value={settings.privacy.profilePhoto} 
                        onValueChange={(value) => handleSettingChange('profilePhoto', value as any)}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="everyone" id="photo-everyone" />
                            <Label htmlFor="photo-everyone">{t('settings.everyone')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="friends" id="photo-friends" />
                            <Label htmlFor="photo-friends">{t('settings.friendsOnly')}</Label>
                        </div>
                    </RadioGroup>
                </SettingOption>
                
                 <SettingOption title={t('settings.whoCanAdd')}>
                    <RadioGroup 
                        value={settings.privacy.friendRequests} 
                        onValueChange={(value) => handleSettingChange('friendRequests', value as any)}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="everyone" id="requests-everyone" />
                            <Label htmlFor="requests-everyone">{t('settings.everyone')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="friends_of_friends" id="requests-fof" />
                            <Label htmlFor="requests-fof">{t('settings.friendsOfFriends')}</Label>
                        </div>
                    </RadioGroup>
                </SettingOption>
                 <div className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                        <Label className="text-base font-medium">{t('settings.blockedContacts')}</Label>
                         <p className="text-sm text-muted-foreground">{t('settings.blockedContactsDesc')}</p>
                    </div>
                     <p className="text-muted-foreground"> (0) </p>
                </div>
            </CardContent>
        </Card>
    );
};

const SettingOption = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4 p-4 rounded-lg border bg-background">
        <h4 className="font-semibold">{title}</h4>
        {children}
    </div>
);

export default PrivacySettings;
