"use client";
import { useContext, createContext, useState, useEffect } from "react";


const WalletContext = createContext({
    wallet: null,
    setWallet: () => ''
})

export const WalletProvider = ({ children }) => {
    const [wallet, setWallet] = useState()

    return (
        <WalletContext.Provider value={{ wallet, setWallet }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext);