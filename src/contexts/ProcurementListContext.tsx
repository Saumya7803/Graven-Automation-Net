import { createContext, useContext, ReactNode } from "react";
import { useProcurementList } from "@/hooks/useProcurementList";

interface ProcurementListContextType {
  items: string[];
  count: number;
  loading: boolean;
  addToList: (productId: string) => Promise<boolean>;
  removeFromList: (productId: string) => Promise<boolean>;
  toggleItem: (productId: string) => Promise<boolean>;
  isInList: (productId: string) => boolean;
  clearList: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

const ProcurementListContext = createContext<ProcurementListContextType | undefined>(undefined);

export const ProcurementListProvider = ({ children }: { children: ReactNode }) => {
  const procurementList = useProcurementList();

  return (
    <ProcurementListContext.Provider value={procurementList}>
      {children}
    </ProcurementListContext.Provider>
  );
};

export const useProcurementListContext = () => {
  const context = useContext(ProcurementListContext);
  if (context === undefined) {
    throw new Error("useProcurementListContext must be used within a ProcurementListProvider");
  }
  return context;
};
