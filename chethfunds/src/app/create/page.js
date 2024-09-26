// contractManager = msg.sender;
//         memberSize = _memberSize;
//         chitAmount = _chitAmount;
//         // chitValue = _chitValue;
//         chitValue = chitAmount * memberSize;
//         remainingMonths = memberSize;

"use client";
import React, { useEffect, useState } from 'react'

const create = () => {
    const [memberSize, setMemberSize] = useState()
    const [chitAmount, setChitAmount] = useState()
    const [wallet, setWallet] = useState()

    const connectWallet = async () => {
        const { ethereum } = window
        if (!ethereum) return alert("Please install MetaMask!")
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const chainId = await ethereum.request({ method: 'eth_chainId' })
        console.log(chainId)
        const account = accounts[0]
        setWallet(account)
    }
    useEffect(() => {
        connectWallet()
    }, [])

    const createRoom = (e) => {
        e.preventDefault();
        if (!memberSize || !chitAmount) {
            alert("Enter all data!")
            return;
        } if (!wallet) {
            return alert("Connect wallet!!")
        }
        // TODO: Handle creation of new Chit Fund
    }

    return (
        <div className='min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-background to-black'>
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-3xl font-semibold bg-clip-text bg-gradient-to-r from-primary to-accent text-transparent w-fit">CREATE CHIT FUND</h1>
            </div>
            {!wallet &&
                <button className='bg-accent px-4 py-1 rounded-lg absolute top-20 right-20'>Connect Wallet</button>
            }
            <div className='flex justify-center items-center h-[400px] rounded-lg bg-primary/5 my-6'>
                <form className='flex flex-col gap-6 m-10 w-max justify-center items-center'>
                    <input type="text" value={memberSize} onChange={(e) => setMemberSize(e.target.value)} placeholder='Member Size' className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-accent rounded-lg w-fit' />
                    <input type="text" value={chitAmount} onChange={(e) => setChitAmount(e.target.value)} placeholder='Chit Amount' className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-accent rounded-lg w-fit' />
                    <input type="text" value={`${wallet}`} placeholder='Connect Wallet!!' disabled className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-accent rounded-lg cursor-not-allowed w-min' />
                    <button type="submit" onClick={(e) => createRoom(e)} className='w-max px-4 py-1 border-2 border-accent rounded-lg bg-primary/10 mt-2'>Create</button>
                </form>
            </div>
        </div>
    )
}

export default create