"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";

import { toast } from "sonner";
import useSWR from "swr";
import { OCR_ENGINE, OCR_ENGINES } from "../constants/ocr.engines";
import { useOCRLoader } from "../hooks/useOCRLoader";
import { OCRContextProps, Prefers, ScriptStatus } from "../types";

const OCRContext = createContext<OCRContextProps>({
  tesseractWorker: null,
  gutenyeOCR: null,
  ocrReady: false,
  setConsent: () => {},
  showAlert: () => {},
});

export const useClientOCR = () => useContext(OCRContext);

const SHOW_ALERT_KEY = "show-ocr-alert";
const CONSENT_KEY = "ocr-consent";

export function ClientOCRProvider({ children }: { children: ReactNode }) {
  const { loaders, gutenyeOCR, tesseractWorker } = useOCRLoader();
  const [consent, setConsent] = useState<Prefers>("ask");
  const isAllowed = useMemo(() => consent === "allow", [consent]);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    setConsent((localStorage.getItem(CONSENT_KEY) as Prefers) || "ask");
    setShowAlert(localStorage.getItem(SHOW_ALERT_KEY) !== "false");
  }, []);

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
    try {
      await Promise.all([
        loadScript(OCR_ENGINE.GUTENYE),
        loadScript(OCR_ENGINE.TESSERACT),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      toast.success("Offline Ocr models was inited!");
    }
  };

  useSWR(isAllowed ? "ocr-init" : null, async () => {
    await startDownload();
    return true;
  });

  const onCloseAlert = () => {
    localStorage.setItem(SHOW_ALERT_KEY, "false");
    setShowAlert(false);
  };
  const onShowAlert = () => {
    localStorage.setItem(SHOW_ALERT_KEY, "true");
    setShowAlert(true);
  };

  const updateConsent = (newConsent: Prefers) => {
    localStorage.setItem(CONSENT_KEY, newConsent);
    setConsent(newConsent);
  };

  return (
    <OCRContext.Provider
      value={{
        showAlert: onShowAlert,
        tesseractWorker,
        gutenyeOCR,
        ocrReady,
        setConsent: updateConsent,
      }}
    >
      {showAlert && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Offline AI models</AlertTitle>
            {isAllowed && (
              <button
                onClick={onCloseAlert}
                className="text-gray-400 hover:text-gray-600 absolute right-2 top-2 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
            <AlertDescription className="mt-2 flex justify-between">
              {consent === "ask" && (
                <>
                  <span>Would you like to download offline AI models?</span>
                  <Button
                    className="cursor-pointer"
                    variant={"outline"}
                    size="sm"
                    onClick={onCloseAlert}
                  >
                    No
                  </Button>
                  <Button
                    className="cursor-pointer"
                    size="sm"
                    onClick={() => {
                      updateConsent("allow");
                    }}
                  >
                    Yes
                  </Button>
                </>
              )}
              {isAllowed && (
                <ul className="space-y-2 text-sm mt-2 w-full">
                  {Object.entries(statuses).map(([key, status]) => (
                    <li key={key} className="flex justify-between">
                      <span>{key}</span>
                      <span className="font-medium">{status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {children}
    </OCRContext.Provider>
  );
}
