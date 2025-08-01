
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const AccountSettings = () => {
    const { authUser } = useAuth();
    const { toast } = useToast();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account & Security</CardTitle>
                <CardDescription>Manage your account settings and secure it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-2">
                    <Label htmlFor="current-email">Current Email</Label>
                    <Input id="current-email" type="email" disabled value={authUser?.email || ''} />
                </div>

                <Separator />

                <div className="space-y-4">
                     <h3 className="font-semibold text-lg">Change Password</h3>
                     <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={() => toast({ description: "This feature will be activated soon." })}>Update Password</Button>
                    </div>
                </div>
                 <Separator />

                 <div className="space-y-4">
                     <h3 className="font-semibold text-lg text-destructive">Danger Zone</h3>
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                        <div>
                            <p className="font-bold">Delete Account</p>
                            <p className="text-sm text-muted-foreground">Your account and all your data will be permanently deleted. This action cannot be undone.</p>
                        </div>
                        <Button variant="destructive" className="mt-2 md:mt-0" onClick={() => toast({ description: "This feature will be activated soon." })}>Delete My Account</Button>
                     </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountSettings;
