"use client";

import { useClientOCR } from "@/features/ocr-client/context/ClientOCRProvider";
import { OcrSettingsButton } from "@/features/ocr-settings/ui/OcrSettingsButton";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function SettingsPage() {
  const { showAlert } = useClientOCR();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Offline AI Models</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage offline AI models used by the app. Download, cancel, or
              check status.
            </p>
            <Button onClick={showAlert}>Open Settings</Button>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
