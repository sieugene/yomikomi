import { SqlJsProvider } from "@/features/AnkiParser/context/SqlJsProvider";
import { StoreCollectionProvider } from "@/features/Collection/context/StoreCollectionContext";

type Props = {
  children: React.ReactNode;
};
export const ApplicationContext: React.FC<Props> = ({ children }) => {
  return (
    <SqlJsProvider>
      <StoreCollectionProvider>{children}</StoreCollectionProvider>
    </SqlJsProvider>
  );
};