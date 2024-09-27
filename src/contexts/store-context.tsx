import React, { createContext, useContext, useEffect, useState } from "react";
import { Store } from "@tauri-apps/plugin-store";

const StoreContext = createContext<Store | null>(null);

export const useStore = () => useContext(StoreContext);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const initStore = async () => {
      const initializedStore = new Store(".settings.store");
      setStore(initializedStore);
    };

    initStore();
  }, []);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
