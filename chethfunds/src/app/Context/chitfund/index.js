"use client";
import { ethers } from "ethers";
import { useContext, createContext, useState, useEffect } from "react"

const chitfundContext = createContext({
    chitfund: null,
    setChitFund: () => {}
})

export default chitfundProvider = ({ children })