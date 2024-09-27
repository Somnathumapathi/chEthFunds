"use client";
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

const room = () => {
    const params = useParams()
    const router = useRouter()
    const [roomId, setRoomId] = useState(null)
    const [roomData, setRoomData] = useState()

    const copyToClipBoard = () => {
        const link = `http://localhost:3000/join?id=${params.id}`;
        navigator.clipboard.writeText(link)
    }

    const fetchdetails = async () => {
        const { data, error } = await supabase.from('Room').select().eq('id', params.id)
        console.log(data, error)
        setRoomData(data[0])

    }
    useEffect(() => {
      setRoomId(params.id)
      fetchdetails()
    }, [params])
    
    return (
        <div>
            <h1>Room {roomData?.id}</h1>
            <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800" onClick={copyToClipBoard()}>
<span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
Share room link
</span>
</button>
<h1>Members:</h1>
{roomData?.members.map((m) => {
    return (
        <div className='w-72 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800'>
        <h2>{m.slice(0, 7) + '...' + m.slice(32, 42)}</h2></div>
    )
})}
   <button class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800" onClick={()=> {
    router.push(`/auction/${params.id}`)
   }}>
<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
Go to auction room
</span>
</button>

        </div>
    )

}

export default room