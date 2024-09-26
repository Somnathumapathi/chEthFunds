'use client'
import React from 'react'
import { useAccount } from 'wagmi'

const createRoom = () => {
  // const { address } = useAccount()

  const startChit = async () => {
    const memberSize = 5
    const chitAmount = 0.01

    // try {
    //   const res = await fetch('/api/startchit', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         memberSize,
    //         chitAmount,
    //       })
          
    //   })
    //   const data = await res.json()
    //   console.log(data)
    // } catch (error) {
    //   console.error("Error creating room:", error);
    // }
  }
  return (
    <div>
         <button onClick={startChit}>
        Create ChitFund Room
      </button>
    </div>
  )
}

export default createRoom