import { SqlJsProvider } from "./SqlJsProvider";
import { StoreCollectionProvider } from "./StoreCollectionContext";

type Props = {
  children: React.ReactNode;
};
export const CoreParserContext: React.FC<Props> = ({ children }) => {
  return (
    <SqlJsProvider>
      <StoreCollectionProvider>{children}</StoreCollectionProvider>
    </SqlJsProvider>
  );
};
