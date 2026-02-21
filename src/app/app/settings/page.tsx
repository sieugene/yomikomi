"use client";

import { OcrSettingsButton } from "@/features/ocr-settings/ui/OcrSettingsButton";
import { TranslationSettingsButton } from "@/features/translation/ui/TranslationSettingsButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Ocr settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Advanced ocr settings
            </p>
            <OcrSettingsButton text="Open Settings" type="button" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translation Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <TranslationSettingsButton text="Open Settings" type="button" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
