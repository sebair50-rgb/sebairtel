
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/store/AppContext';
import { Music, Bell, Phone } from 'lucide-react';

type SoundKey = 'messageTone' | 'notificationTone' | 'callRingtone';

const soundOptions = [
    { value: 'default', label: 'افتراضي', freq: 440 },
    { value: 'chime', label: 'رنين', freq: 523.25 },
    { value: 'signal', label: 'إشارة', freq: 659.25 },
    { value: 'alert', label: 'تنبيه', freq: 783.99 },
    { value: 'vibrate', label: 'اهتزاز فقط', freq: 0 },
];

const playSound = (soundValue: string) => {
    const sound = soundOptions.find(s => s.value === soundValue);
    if (!sound || sound.freq === 0) return; // Don't play for vibrate

    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime); 
        
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

    const handleSoundChange = (key: SoundKey, value: string) => {
        setSettings(s => ({
            ...s,
            sounds: {
                ...s.sounds,
                [key]: value,
            }
        }));
        playSound(value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>النغمات والأصوات</CardTitle>
                <CardDescription>خصص أصوات التنبيهات للرسائل والمكالمات والإشعارات الأخرى.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <SoundOption
                    icon={Music}
                    label="نغمة الرسائل"
                    value={settings.sounds.messageTone}
                    onValueChange={(value) => handleSoundChange('messageTone', value)}
                />
                 <SoundOption
                    icon={Bell}
                    label="نغمة الإشعارات العامة"
                    value={settings.sounds.notificationTone}
                    onValueChange={(value) => handleSoundChange('notificationTone', value)}
                />
                 <SoundOption
                    icon={Phone}
                    label="نغمة رنين المكالمات"
                    value={settings.sounds.callRingtone}
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
}) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-background">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <Label className="text-base font-medium">{label}</Label>
        </div>
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اختر نغمة" />
            </SelectTrigger>
            <SelectContent>
                {soundOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

export default SoundSettings;
