"use client";
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';

const auction = () => {
    const params = useParams()
    const [roomId, setRoomId] = useState(null)
    useEffect(() => {
      setRoomId(params.id)
    }, [params])
    
    return (
        <div>
            <h1>Auction {roomId}</h1>
        </div>
    )
}

export default auction