"use client";

import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/store/AppContext';
import { Music, Bell, Phone, FolderUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/store/LanguageContext';

type SoundKey = 'messageTone' | 'notificationTone' | 'callRingtone';

const soundOptions = [
    { value: 'default', label: 'Default', freq: 440 },
    { value: 'chime', label: 'Chime', freq: 523.25 },
    { value: 'signal', label: 'Signal', freq: 659.25 },
    { value: 'alert', label: 'Alert', freq: 783.99 },
    { value: 'vibrate', label: 'Vibrate Only', freq: 0 },
    { value: 'custom', label: 'Choose from device', icon: FolderUp },
];

const playSound = (soundValue: string) => {
    if (soundValue.startsWith('data:audio')) {
        const audio = new Audio(soundValue);
        audio.play().catch(e => console.error("Error playing custom sound:", e));
        return;
    }

    const sound = soundOptions.find(s => s.value === soundValue);
    if (!sound || sound.freq === 0) return; // Don't play for vibrate or custom placeholder

    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(sound.freq ?? 440, audioContext.currentTime); 
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch(e) {
        console.error("Could not play sound:", e)
    }
};


const SoundSettings = () => {
    const { settings, setSettings } = useAppContext();
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentSoundKey = useRef<SoundKey | null>(null);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentSoundKey.current) return;

        if (!file.type.startsWith('audio/')) {
            toast({ variant: 'destructive', title: t('settings.invalidFile'), description: t('settings.invalidFileDesc') });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const key = currentSoundKey.current!;
            setSettings(s => ({
                ...s,
                sounds: { ...s.sounds, [key]: dataUrl }
            }));
            playSound(dataUrl);
            toast({ title: t('settings.updateSuccess'), description: t('settings.customToneSet', { label: getLabelForKey(key) }) });
        };
        reader.readAsDataURL(file);
    };
    
    const getLabelForKey = (key: SoundKey) => {
        if (key === 'messageTone') return t('settings.messageTone');
        if (key === 'notificationTone') return t('settings.notifTone');
        if (key === 'callRingtone') return t('settings.callRingtone');
        return "";
    }

    const handleSoundChange = (key: SoundKey, value: string) => {
        if (value === 'custom') {
            currentSoundKey.current = key;
            fileInputRef.current?.click();
        } else {
            setSettings(s => ({
                ...s,
                sounds: { ...s.sounds, [key]: value }
            }));
            playSound(value);
        }
    };
    
    const getDisplayValue = (value: string) => {
        if (value.startsWith('data:audio')) return 'custom';
        return value;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.sounds')}</CardTitle>
                <CardDescription>{t('settings.soundsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="audio/*"
                />
                <SoundOption
                    icon={Music}
                    label={t('settings.messageTone')}
                    value={getDisplayValue(settings.sounds.messageTone)}
                    onValueChange={(value) => handleSoundChange('messageTone', value)}
                />
                 <SoundOption
                    icon={Bell}
                    label={t('settings.notifTone')}
                    value={getDisplayValue(settings.sounds.notificationTone)}
                    onValueChange={(value) => handleSoundChange('notificationTone', value)}
                />
                 <SoundOption
                    icon={Phone}
                    label={t('settings.callRingtone')}
                    value={getDisplayValue(settings.sounds.callRingtone)}
                    onValueChange={(value) => handleSoundChange('callRingtone', value)}
                />
            </CardContent>
        </Card>
    );
};

const SoundOption = ({ icon: Icon, label, value, onValueChange }: {
    icon: React.ElementType;
    label: string;
    value: string;
    onValueChange: (value: string) => void;
}) => {
    const { t } = useTranslation();
    
    const translatedSoundOptions = [
        { value: 'default', label: t('settings.defaultTone'), freq: 440 },
        { value: 'chime', label: t('settings.chimeTone'), freq: 523.25 },
        { value: 'signal', label: t('settings.signalTone'), freq: 659.25 },
        { value: 'alert', label: t('settings.alertTone'), freq: 783.99 },
        { value: 'vibrate', label: t('settings.vibrate'), freq: 0 },
        { value: 'custom', label: t('settings.chooseFile'), icon: FolderUp },
    ];
    
    return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-background">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <Label className="text-base font-medium">{label}</Label>
            </div>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('settings.selectTone')} />
                </SelectTrigger>
                <SelectContent>
                    {translatedSoundOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                {option.icon && <option.icon className="w-4 h-4" />}
                                {option.label}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SoundSettings;
