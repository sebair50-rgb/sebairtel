
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/store/AppContext';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const PrivacySettings = () => {
    const { settings, setSettings } = useAppContext();
    
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
                <CardTitle>الخصوصية</CardTitle>
                <CardDescription>تحكم في كيفية ظهور معلوماتك ومن يمكنه التفاعل معك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <SettingOption title="حالة الظهور (متصل / آخر ظهور)">
                    <RadioGroup 
                        value={settings.privacy.lastSeen} 
                        onValueChange={(value) => handleSettingChange('lastSeen', value as any)}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="everyone" id="lastseen-everyone" />
                            <Label htmlFor="lastseen-everyone">الكل</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="friends" id="lastseen-friends" />
                            <Label htmlFor="lastseen-friends">الأصدقاء فقط</Label>
                        </div>
                         <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="nobody" id="lastseen-nobody" />
                            <Label htmlFor="lastseen-nobody">لا أحد</Label>
                        </div>
                    </RadioGroup>
                </SettingOption>

                 <SettingOption title="الصورة الشخصية">
                    <RadioGroup 
                        value={settings.privacy.profilePhoto} 
                        onValueChange={(value) => handleSettingChange('profilePhoto', value as any)}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="everyone" id="photo-everyone" />
                            <Label htmlFor="photo-everyone">الكل</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="friends" id="photo-friends" />
                            <Label htmlFor="photo-friends">الأصدقاء فقط</Label>
                        </div>
                    </RadioGroup>
                </SettingOption>
                
                 <SettingOption title="من يمكنه إضافتي كصديق؟">
                    <RadioGroup 
                        value={settings.privacy.friendRequests} 
                        onValueChange={(value) => handleSettingChange('friendRequests', value as any)}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="everyone" id="requests-everyone" />
                            <Label htmlFor="requests-everyone">الكل</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="friends_of_friends" id="requests-fof" />
                            <Label htmlFor="requests-fof">أصدقاء الأصدقاء</Label>
                        </div>
                    </RadioGroup>
                </SettingOption>
                 <div className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                        <Label className="text-base font-medium">جهات الاتصال المحظورة</Label>
                         <p className="text-sm text-muted-foreground">إدارة المستخدمين الذين قمت بحظرهم.</p>
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
