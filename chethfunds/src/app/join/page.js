"use client";
import React, { useEffect, useState } from 'react'
import ConnectButton from '../../../components/connectButton';
import { useWallet } from '../Context/wallet';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useSearchParams } from 'next/navigation'
import { ChitFundInterface } from '../blockchain/chitfund_interface';

const join = () => {
    const [roomId, setRoomId] = useState('')
    const { wallet } = useWallet();
    const router = useRouter();
    const searchParams = useSearchParams()

    useEffect(() => {
        console.log(wallet)

        const id = searchParams.get('id')
        setRoomId(id)
    }, [])


    const joinRoom = async (e) => {
        e.preventDefault();
        if (!roomId) {
            alert("Please enter room ID");
            return;
        } if (!wallet) {
            alert("Connect your wallet!!")
            return;
        }
        const { data, error } = await supabase.from('Room').select().eq('id', roomId)
        // roomd = data[0]
        const room_mem = data[0].members
        if (room_mem.includes(wallet)) {
            alert('Already a member')
            return;
        }
        if (room_mem.length == data[0].member_size - 1) {
            //deploy contract
            const chitFund = await ChitFundInterface.createChitFund({ chitAmountInEth: String(data[0].chit_amount), memberSize: data[0].member_size })
            console.log(chitFund.contractAddress)
            await supabase.from('Room').update({ contract_address: chitFund.contractAddress }).eq('id', roomId)
        }
        if (room_mem.length == data[0].member_size) {
            alert('Room is full')
            return
        }
        console.log(room_mem)
        room_mem.push(wallet)
        await supabase.from('Room').update({ 'members': room_mem }).eq('id', roomId)
        router.push('/room/' + roomId)
        // await supabase.from('Room').update({members: })
    }

    return (
        <>
            <ConnectButton />
            <div className='min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-transparent'>
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">JOIN CHIT FUND</h1>
                </div>
                <button className='text-accent px-4 py-1 rounded-lg absolute top-20 left-20 underline' onClick={() => router.back()}>&lt; Go back</button>
                <div className='flex justify-center items-center h-[400px] rounded-lg bg-gray-950 my-6 border borde'>
                    <form className='flex flex-col gap-5 m-10 w-max justify-center items-center rounded-xl p-5 min-h-[220px]'>
                        <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder='Room ID' className='bg-transparent px-4 py-1 active:border-0 border-b-2 border-purple-600 w-fit' />
                        <input type="text" value={wallet && wallet?.slice(0, 7) + '.....' + wallet?.slice(-6)} placeholder='Connect Wallet!!' disabled className='bg-transparent px-4 py-1 active:border-0 border-b-2 border-purple-600 cursor-not-allowed w-min' />
                        {/* <button type="submit" onClick={(e) => joinRoom(e)} className='w-max px-4 py-1 border-2 border-purple-600 rounded-lg bg-primary/10 mt-2'>Join</button> */}
                        <button type='submit' onClick={(e) => joinRoom(e)} className="flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600">
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md text-white z-50">
                                Join
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default join