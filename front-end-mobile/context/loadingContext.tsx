import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

interface loadingContextProps {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

export const LoadingContext = createContext<loadingContextProps>({
    loading: false,
    setLoading: () => { },
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {

    const [loading, setLoading] = useState<boolean>(false);

    return (
        <LoadingContext.Provider
            value={{
                loading,
                setLoading
            }}
        >
            {children}
        </LoadingContext.Provider>
    )
}

export function useLoadingContext(){
    return useContext(LoadingContext);
}