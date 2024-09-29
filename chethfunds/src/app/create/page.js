// contractManager = msg.sender;
//         memberSize = _memberSize;
//         chitAmount = _chitAmount;
//         // chitValue = _chitValue;
//         chitValue = chitAmount * memberSize;
//         remainingMonths = memberSize;

"use client";
import React, { useEffect, useState } from 'react'
import { useWallet } from '../Context/wallet';
import ConnectButton from '../../../components/connectButton';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

const Create = () => {
    const [memberSize, setMemberSize] = useState()
    const [chitAmount, setChitAmount] = useState()
    const { wallet } = useWallet();

    const router = useRouter();

    // const { wallet } = useWallet()

    const createRoom = async (e) => {
        e.preventDefault();
        if (!memberSize || !chitAmount) {
            alert("Enter all data!")
            return;
        } if (!wallet) {
            return alert("Connect wallet!!")
        }
        const { data, error } = await supabase.from('Room').insert({
            member_size: memberSize,
            months: memberSize,
            contract_address: '',
            contract_manager: wallet,
            chit_amount: chitAmount,
            chit_value: chitAmount * memberSize,
            members: [wallet],
            bid_amount: 0
        }).select()
        console.log(data)
        alert(`This is the room number ${data[0].id}`)
        router.push(`/room/${data[0].id}`)
        // TODO: Handle creation of new Chit Fund
    }

    return (
        <div className='min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-background to-black'>
            <ConnectButton />
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">CREATE CHIT FUND</h1>
            </div>
            <button className='text-accent px-4 py-1 rounded-lg absolute top-20 left-20 underline' onClick={() => router.back()}>&lt; Go back</button>
            <div className='flex justify-center items-center h-[400px] rounded-lg bg-primary/5 my-6'>
                <form className='flex flex-col gap-6 m-10 w-max justify-center items-center'>
                    <input type="text" value={memberSize} onChange={(e) => setMemberSize(e.target.value)} placeholder='Member Size' className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-purple-600 w-fit' />
                    <input type="text" value={chitAmount} onChange={(e) => setChitAmount(e.target.value)} placeholder='Chit Amount' className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-purple-600 w-fit' />
                    <input type="text" value={wallet && wallet?.slice(0, 7) + '.....' + wallet?.slice(-6)} placeholder='Connect Wallet!!' disabled className='bg-inherit px-4 py-1 active:border-0 border-b-2 border-purple-600 cursor-not-allowed w-min' />
                    <button type='submit' onClick={(e) => createRoom(e)} className="flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600">
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md text-white z-50">
                            Create Room
                        </span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Create