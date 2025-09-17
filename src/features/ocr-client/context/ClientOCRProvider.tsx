"use client";

import { AlertTriangle } from "lucide-react";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { OCR_ENGINE, OCR_ENGINES } from "../constants/ocr.engines";
import { useOCRLoader } from "../hooks/useOCRLoader";
import { OCRContextProps, Prefers, ScriptStatus } from "../types";

const OCRContext = createContext<OCRContextProps>({
  tesseractWorker: null,
  gutenyeOCR: null,
  ocrReady: false,
  setConsent: () => {},
});

export const useClientOCR = () => useContext(OCRContext);

export function ClientOCRProvider({ children }: { children: ReactNode }) {
  const { loaders, gutenyeOCR, tesseractWorker } = useOCRLoader();
  const [consent, setConsent] = useState<Prefers>("ask");
  const [showDialog, setShowDialog] = useState(false);

  const [statuses, setStatuses] = useState<Record<string, ScriptStatus>>({
    TESSERACT: "pending",
    GUTENYE: "pending",
  });

  const ocrReady = useMemo(() => {
    return !!tesseractWorker && !!gutenyeOCR;
  }, [tesseractWorker, gutenyeOCR]);

  const loadScript = (name: keyof typeof OCR_ENGINES) => {
    return new Promise<void>((resolve, reject) => {
      setStatuses((s) => ({ ...s, [name]: "loading" }));
      const script = document.createElement("script");
      script.src = OCR_ENGINES[name].cdn;
      script.async = true;
      script.onload = async () => {
        await loaders[name]();
        setStatuses((s) => ({ ...s, [name]: "ready" }));
        resolve();
      };
      script.onerror = () => {
        setStatuses((s) => ({ ...s, [name]: "failed" }));
        reject(new Error(`${name} failed to load`));
      };
      document.body.appendChild(script);
    });
  };

  const startDownload = async () => {
    setShowDialog(true);
    try {
      await Promise.all([
        loadScript(OCR_ENGINE.GUTENYE),
        loadScript(OCR_ENGINE.TESSERACT),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelDownload = () => {
    setConsent("ask");
    setShowDialog(false);
    setStatuses({
      TESSERACT: "pending",
      GUTENYE: "pending",
    });
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  return (
    <OCRContext.Provider
      value={{
        tesseractWorker,
        gutenyeOCR,
        ocrReady,
        setConsent,
      }}
    >
      {consent === "ask" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Offline AI models</AlertTitle>
            <AlertDescription className="mt-2 flex justify-between">
              <span>Would you like to download offline AI models?</span>
              <Button
                className="cursor-pointer"
                variant={"outline"}
                size="sm"
                onClick={() => setConsent("skip")}
              >
                No
              </Button>
              <Button
                className="cursor-pointer"
                size="sm"
                onClick={() => {
                  setConsent("allow");
                  startDownload();
                }}
              >
                Yes
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Dialog open={showDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offline models download</DialogTitle>
          </DialogHeader>

          <ul className="space-y-2 text-sm mt-2">
            {Object.entries(statuses).map(([key, status]) => (
              <li key={key} className="flex justify-between">
                <span>{key}</span>
                <span className="font-medium">{status}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-2 mt-4">
            {!ocrReady && (
              <Button variant="ghost" onClick={cancelDownload}>
                Cancel
              </Button>
            )}
            <Button onClick={closeDialog}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </OCRContext.Provider>
  );
}
