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
                <>
                    <div>My rooms</div>
                    {myRooms?.map((mr) => {
                        return (
                            <div onClick={() => router.push(`/room/${mr.id}`)}>{mr.id}</div>
                        )
                    })}
                </>}
        </div>
    )
}

export default room