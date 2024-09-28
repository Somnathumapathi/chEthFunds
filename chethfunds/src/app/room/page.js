"use client"
import React, { useEffect, useState } from 'react'
import { useWallet } from '../Context/wallet'
import { supabase } from '../../../lib/supabaseClient'
import ConnectButton from '../../../components/connectButton'
import { useRouter } from 'next/navigation'

const room = () => {
    const { wallet } = useWallet()
    const [myRooms, setMyRooms] = useState([])
    const router = useRouter()

    useEffect(() => {
        if (wallet) {
            getRooms()
        }
    }, [wallet])

    const getRooms = async () => {
        const { data, error } = await supabase.from('Room').select('*').contains('members', [wallet])
        if (data) {
            console.log(data)
            setMyRooms(data)
        }
    }
    return (
        <div className='flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-background to-black'>
            <h1 className='text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>MY ROOMS</h1>
            <ConnectButton />
            {myRooms &&
                <div className='flex flex-col gap-y-4'>
                    {myRooms?.map((mr) => {
                        return (
                            <div className='cursor-pointer w-96 min-h-[100px] bg-black/15 rounded-lg flex flex-col justify-center items-start p-4' onClick={() => router.push(`/room/${mr.id}`)}>
                                <div><span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>Room ID:</span>&nbsp;<span>{mr.id}</span></div>
                                <div><span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>Contract address:</span>&nbsp;<span>{mr.contract_address.slice(0,7) + '....' + mr.contract_address.slice(-7)}</span></div>
                                <div><span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>Contract manager:</span>&nbsp;<span>{mr.contract_manager.slice(0,7) + '....' + mr.contract_manager.slice(-7)}</span></div>
                                <div><span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>Chit amount:</span>&nbsp;<span>{mr.chit_amount}</span></div>
                            </div>
                        )
                    })}
                </div>}
        </div>
    )
}

export default room