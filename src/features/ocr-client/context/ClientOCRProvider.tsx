"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";
import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

import { OCR_ENGINE, OCR_ENGINES } from "../constants/ocr.engines";

type ScriptStatus = "pending" | "loading" | "ready" | "failed";
type Prefers = "skip" | "ask" | "allow";

interface OCRContextProps {
  tesseractWorker: Tesseract.Worker | null;
  gutenyeOCR: GutenyeOCR | null;
  ocrReady: boolean;
  setConsent: Dispatch<SetStateAction<Prefers>>;
}

const OCRContext = createContext<OCRContextProps>({
  tesseractWorker: null,
  gutenyeOCR: null,
  ocrReady: false,
  setConsent: () => {},
});

export const useClientOCR = () => useContext(OCRContext);

export function ClientOCRProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Prefers>("ask");
  const [showDialog, setShowDialog] = useState(false);

  const [statuses, setStatuses] = useState<Record<string, ScriptStatus>>({
    TESSERACT: "pending",
    GUTENYE: "pending",
  });

  const { data: tesseractWorker } = useSWR(
    consent === "allow" && statuses.TESSERACT === "ready"
      ? "tesseractWorker"
      : null,
    async () => await createTesseractWorker()
  );

  const { data: gutenyeOCR } = useSWR(
    consent === "allow" && statuses.GUTENYE === "ready" ? "gutenyeOCR" : null,
    async () => await createGutenyeOCR()
  );

  const createTesseractWorker = async (lang: string = "jpn") => {
    try {
      console.log("Tesseract worker creation started");
      const worker = await window.Tesseract.createWorker(lang, 1, {
        logger: (m) => console.log("Tesseract:", m),
      });
      console.log("Tesseract worker created successfully");
      return worker;
    } catch (error) {
      console.error("Error creating Tesseract worker:", error);
      return null;
    }
  };

  const createGutenyeOCR = async () => {
    try {
      console.log("Gutenye OCR instance creation started");
      const ocr = await window.GutenyeOCR.default.create(
        OCR_ENGINES.GUTENYE.options
      );
      console.log("Gutenye OCR instance created successfully");
      return ocr;
    } catch (error) {
      console.error("Error creating Gutenye OCR instance:", error);
      return null;
    }
  };

  const ocrReady = useMemo(() => {
    return !!tesseractWorker && !!gutenyeOCR;
  }, [tesseractWorker, gutenyeOCR]);

  const loadScript = (name: keyof typeof OCR_ENGINES) => {
    return new Promise<void>((resolve, reject) => {
      setStatuses((s) => ({ ...s, [name]: "loading" }));
      const script = document.createElement("script");
      script.src = OCR_ENGINES[name].cdn;
      script.async = true;
      script.onload = () => {
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
        tesseractWorker: tesseractWorker || null,
        gutenyeOCR: gutenyeOCR || null,
        ocrReady,
        setConsent,
      }}
    >
      {consent === "ask" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md">
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
