"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'
import ConnectButton from "../../components/connectButton";
import { supabase } from "../../lib/supabaseClient";
import { useWallet } from "./Context/wallet";

export default function Home() {

  const card = `flex flex-col rounded-xl p-5 w-1/2 min-h-[220px] items-center justify-center bg-gray-950 border-2 border-purple-900 transition-all duration-500 ease-in-out transform hover:scale-105`
  const router = useRouter()

  const [account, setAccount] = useState("")
  const [myRooms, setMyRooms] = useState()
  const [user, setUser] = useState()

  const { wallet } = useWallet();

  useEffect(() => {
    console.log(wallet);
    const loadUser = async () => {
      const { data, error } = await supabase.from('User').select('*').eq('wallet_address', wallet)
      setUser(data[0])
      console.log(data)
      console.log(error)
    }
    loadUser()
    getRooms()
  }, [wallet])

  const getRooms = async () => {
    const { data, error } = await supabase.from('Room').select('*').contains('members', [wallet])
    if (data) {
      console.log(data[0])
      setMyRooms(data)
    }
  }
  const goToRoom = (id) => {
    console.log(id)
    router.push(`/room/${id}`)
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-background to-black">
      <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-700">ChETH FUNDS</h1>
      <ConnectButton />
      {/* <p className="absolute top-32 left-[85%]">{user && user.name != null ? user.name : "no user"}</p> */}
      <div className="flex flex-row min-h-[50vh] items-center justify-center gap-12 w-5/6">
        <div className={card}>
          <p className="card-header text-2xl font-bold mb-2 text-transparent text-gray-300">Join a room</p>
          <p className="text-gray-400 mb-4">Enter the ID of the Chit Fund room given to you and join the Chit Fund.</p>
          <button className="px-4 py-1 m-2 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600 hover:text-white dark:text-white" onClick={() => router.push("/join")}>JOIN</button>
        </div>
        <div className={card}>
          <p className="card-header text-2xl font-bold mb-2 text-transparent text-gray-300">Create a room</p>
          <p className="text-gray-400 mb-4">Enter the details required for creating a new Chit Fund and share the generated ID with the willing participants.</p>
          <button className="px-4 py-1 m-2 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600 hover:text-white dark:text-white" onClick={() => router.push("/create")}>CREATE</button>
        </div>
        <div className={card}>
          <p className="card-header text-2xl font-bold mb-2 text-transparent text-gray-300">My rooms</p>
          <p className="text-gray-400 mb-4">View all the chitfunds you are in.</p>
          <button className="px-4 py-1 m-2 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600 hover:text-white dark:text-white" onClick={() => router.push("/room")}>MY ROOMS</button>
        </div>
      </div>
    </div>
  );
}
