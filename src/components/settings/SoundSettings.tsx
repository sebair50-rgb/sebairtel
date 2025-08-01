
"use client";

import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/store/AppContext';
import { Music, Bell, Phone, FolderUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentSoundKey = useRef<SoundKey | null>(null);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentSoundKey.current) return;

        if (!file.type.startsWith('audio/')) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an audio file.' });
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
            toast({ title: 'Success', description: `Custom tone set for: ${getLabelForKey(key)}` });
        };
        reader.readAsDataURL(file);
    };
    
    const getLabelForKey = (key: SoundKey) => {
        if (key === 'messageTone') return "Messages";
        if (key === 'notificationTone') return "Notifications";
        if (key === 'callRingtone') return "Calls";
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
                <CardTitle>Tones & Sounds</CardTitle>
                <CardDescription>Customize alert sounds for messages, calls, and other notifications.</CardDescription>
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
                    label="Message Tone"
                    value={getDisplayValue(settings.sounds.messageTone)}
                    onValueChange={(value) => handleSoundChange('messageTone', value)}
                />
                 <SoundOption
                    icon={Bell}
                    label="General Notification Tone"
                    value={getDisplayValue(settings.sounds.notificationTone)}
                    onValueChange={(value) => handleSoundChange('notificationTone', value)}
                />
                 <SoundOption
                    icon={Phone}
                    label="Call Ringtone"
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
}) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-background">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <Label className="text-base font-medium">{label}</Label>
        </div>
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a tone" />
            </SelectTrigger>
            <SelectContent>
                {soundOptions.map(option => (
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

export default SoundSettings;
