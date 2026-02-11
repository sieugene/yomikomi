import { CoreParserContext } from "@/features/AnkiParser/context/CoreParserContext";
import { DictionarySearchSettingsProvider } from "@/features/dictionary-search/context/DictionarySearchSettingsContext";
import { OCRAlbumProvider } from "@/features/ocr-album/context/OCRAlbumContext";
import { OCRCaptureProvider } from "@/features/ocr-capture";
import { ClientOCRProvider } from "@/features/ocr-client/context/ClientOCRProvider";
import { OCRSettingsProvider } from "@/features/ocr-settings/context/OCRSettingsContext";
import { SWRConfig } from "swr";
import { ApplicationSettingsProvider } from "../settings/providers/ApplicationSettingsContext";
import { TranslationSettingsProvider } from "@/features/translation/context/TranslationContext";

type Props = {
  children: React.ReactNode;
};
export const ApplicationContext: React.FC<Props> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      <CoreParserContext>
        <OCRSettingsProvider>
          <TranslationSettingsProvider>
            <ClientOCRProvider>
              <OCRAlbumProvider>
                <DictionarySearchSettingsProvider>
                  <OCRCaptureProvider>
                    <ApplicationSettingsProvider>
                      {children}
                    </ApplicationSettingsProvider>
                  </OCRCaptureProvider>
                </DictionarySearchSettingsProvider>
              </OCRAlbumProvider>
            </ClientOCRProvider>
          </TranslationSettingsProvider>
        </OCRSettingsProvider>
      </CoreParserContext>
    </SWRConfig>
  );
};
