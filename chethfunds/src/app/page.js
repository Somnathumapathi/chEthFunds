"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import {ethers} from 'ethers'
import ConnectButton from "../../components/connectButton";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {

  const card = `flex flex-col rounded-xl p-5 w-1/2 h-[220px] items-center justify-center bg-primary/5`
  const router = useRouter()

  const [account, setAccount] = useState("")
  const [user, setUser] = useState()
  

  const loadBlockchain = async () => {
    // const accounts  = await window.ethereum.request({method: 'eth_requestAccounts'})
    // const accAddress = ethers.getAddress(accounts[0])
    // console.log(accAddress)
    // setAccount(accAddress)
    const { data, error } = await supabase.from('User').select().eq('wallet_address', account)
    setUser(data[0])
    console.log(data)
    console.log(error)
    const provider = new ethers.BrowserProvider(window.ethereum)
    const network = await provider.getNetwork()

    
    window.ethereum.on('accountsChanged', async () => {
      console.log('hi')
      const accounts  = await window.ethereum.request({method: 'eth_requestAccounts'})
    const accAddress = ethers.getAddress(accounts[0])
    console.log(accAddress)
    setAccount(accAddress)
    const { data, error } = await supabase.from('User').select().eq('wallet_address', accAddress)
    setUser(data[0])
    console.log(data[0])
    console.log(error)
    console.log('hello')
    })
  }

  useEffect(() => {
    loadBlockchain()
      }, [account])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <h1 className="text-3xl font-semibold bg-clip-text bg-gradient-to-r from-primary to-accent text-transparent">ChETH FUNDS</h1>
      <ConnectButton account={account} setAccount={setAccount}/>
      <p>{user && user.name != null ? user.name : "no user"}</p>
      <div className="flex flex-row items-center justify-center gap-12 w-2/3">
        <div className={card}>
          <p className="card-header font-semibold text-xl pb-2 text-accent">Join a room</p>
          <p className="text-center">Enter the ID of the Chit Fund room given to you and join the Chit Fund.</p>
          <button className="rounded-lg bg-accent px-4 py-1 mt-3" onClick={()=>router.push("/join")}>JOIN</button>
        </div>
        <div className={card}>
          <p className="card-header font-semibold text-xl pb-2 text-accent">Create a room</p>
          <p className="text-center">Enter the details required for creating a new Chit Fund and share the generated ID with the willing participants.</p>
          <button className="rounded-lg bg-accent px-4 py-1 mt-3" onClick={()=>router.push("/create")}>CREATE</button>
        </div>
      </div>
    </div>
  );
}
