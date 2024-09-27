"use client";
import React, { useEffect, useState } from 'react'
import ConnectButton from '../../../components/connectButton';
import { useWallet } from '../Context/wallet';
import { useRouter } from 'next/navigation';

const join = () => {
    const [roomId, setRoomId] = useState('')
    const {wallet} = useWallet();
    const router = useRouter();

    useEffect(() => {
        console.log(wallet)
    }, [])


    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId) {
            alert("Please enter room ID");
            return;
        } if (!wallet) {
            alert("Connect your wallet!!")
            return;
        }
        // TODO: Handle join
    }

    return (
        <div className='min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-background to-black'>
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-3xl font-semibold bg-clip-text bg-gradient-to-r from-primary to-accent text-transparent text-center">JOIN CHIT FUND</h1>
            </div>
            <button className='text-accent px-4 py-1 rounded-lg absolute top-20 left-20 underline' onClick={()=>router.back()}>&lt; Go back</button>
            <ConnectButton />
            <div className='flex justify-center items-center h-[400px] rounded-lg bg-primary/5 my-6'>
                <form className='flex flex-col gap-5 m-10 w-max justify-center items-center'>
                    <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder='Room ID' className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-accent rounded-lg w-fit' />
                    <input type="text" value={wallet && wallet?.slice(0,7)+'.....'+wallet?.slice(-6)} placeholder='Connect Wallet!!' disabled className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-accent rounded-lg cursor-not-allowed w-min' />
                    <button type="submit" onClick={(e) => joinRoom(e)} className='w-max px-4 py-1 border-2 border-accent rounded-lg bg-primary/10 mt-2'>Join</button>
                </form>
            </div>
        </div>
    )
}

export default join