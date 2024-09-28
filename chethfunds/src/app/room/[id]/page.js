"use client";
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { ChitFundInterface } from '@/app/blockchain/chitfund_interface';
import { ViemClient } from '@/app/blockchain/viemc';
import { useWallet } from '@/app/Context/wallet';
import ConnectButton from '../../../../components/connectButton';

const room = () => {
    const params = useParams()
    const router = useRouter()
    const [roomId, setRoomId] = useState(null)
    const [roomData, setRoomData] = useState()
    const [chitfund, setChitFund] = useState()
    const [remainingMonths, setRemainingMonths] = useState()
    const [paidMembersList, setPaidMembersList] = useState()
    const [balance, setBalance] = useState()
    const [chitValue, setChitValue] = useState()
    const [chitAmount, setChitAmount] = useState()
    const [client, setClient] = useState()
    const { wallet } = useWallet();

    const copyToClipBoard = () => {
        const link = `http://localhost:3000/join?id=${params.id}`;
        navigator.clipboard.writeText(link)
    }
    // const _createViemClient = (privateKey) => new ViemClient({
    //     walletClient: createWalletClient({
    //         account: window.ethereum(),
    //         chain: ganache,
    //         transport: http(API_URL)
    //     })
    // },);
    const fetchdetails = async () => {
        const { data, error } = await supabase.from('Room').select().eq('id', params.id)
        console.log(data, error)
        setRoomData(data[0])
        console.log(roomData)

    }
    const depositChit = async () => {
        const client = await ChitFundInterface.createMetaMaskClient({ wallet })
        console.log(chitfund)
        await ChitFundInterface.depositChitAmount({ chitfund, client, chitAmount })
    }
    const getBlockchainData = async () => {
        // const client = await ChitFundInterface.createMetaMaskClient()
        // setClient(client)

        const ctfund = await ChitFundInterface.getChitFundFromContractAddress({ contractAddress: roomData.contract_address })
        setChitFund(ctfund)
        console.log(ctfund)
        const rm = await ChitFundInterface.getRemainingMonths({ chitfund: ctfund })
        console.log(rm)
        setRemainingMonths(rm)
        const bal = await ChitFundInterface.getChitBalance({ chitfund: ctfund })
        console.log(bal)
        setBalance(bal)
        const chitval = await ChitFundInterface.getChitValue({ chitfund: ctfund })
        setChitValue(chitval)
        const chitAmt = await ChitFundInterface.getChitAmount({ chitfund: ctfund })
        setChitAmount(chitAmt)

        // const pdm = await ChitFundInterface.getPaidMembersList({chitfund:ctfund})
        // setPaidMembersList(pdm)

    }
    useEffect(() => {
        //   setRoomId(params.id)
        fetchdetails()
        // getBlockchainData()
    }, [])
    useEffect(() => {
        if (roomData) getBlockchainData()

    }, [roomData])
    return (
        <div className='flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-background to-black'>
            <h1 className='text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>Room {roomData?.id}</h1>
            <ConnectButton />
            <div className='container flex flex-col gap-y-4 px-24'>
                <button className="w-fit flex items-center justify-center p-0.5 text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800" onClick={copyToClipBoard()}>
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Share room link
                    </span>
                </button>
                <div className='flex flex-row gap-6'>
                    <span>Members:</span>
                    <div>
                        {roomData?.members.map((m) => {
                            return (
                                <div className='w-72 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800'>
                                    <h2>{m.slice(0, 7) + '...' + m.slice(32, 42)}</h2></div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <p className='w-fit text-transparent bg-clip-text font-semibold bg-gradient-to-r from-purple-600 to-blue-600'>Chit Fund Details:</p>
                    <h2>Remaining Months: {remainingMonths}</h2>
                    <h2>Paid members:</h2>
                    <div>
                        {paidMembersList?.map((m) => {
                            return (
                                <div className='w-72 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800'>
                                    <h2>{m.slice(0, 7) + '...' + m.slice(32, 42)}</h2></div>
                            )
                        })}
                    </div>
                    <h2>Balance: {balance}</h2>
                    <h2>Chit Value: {chitValue}</h2>
                    <h2>Chit Amount: {chitAmount}</h2>


                </div>
                <div className='flex flex-row'>
                    <button className="relative inline-flex w-fit items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800" onClick={() => depositChit()}>
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            Deposit
                        </span>
                    </button>
                    <button class="relative inline-flex w-fit items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800" onClick={() => {
                        router.push(`/auction/${params.id}`)
                    }}>
                        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            Go to auction room
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )

}

export default room