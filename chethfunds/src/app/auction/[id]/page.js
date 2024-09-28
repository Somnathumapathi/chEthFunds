"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { ethers } from 'ethers'
import { useWallet } from '@/app/Context/wallet';
import ConnectButton from '../../../../components/connectButton';
import { ChitFundInterface } from '@/app/blockchain/chitfund_interface';

const Auction = () => {
  const params = useParams();
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState()
  const [bidAmount, setBidAmount] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [seconds, setSeconds] = useState(20);
  // const [auctionStarted, setAuctionStarted] = useState(false);
  const [winner, setWinner] = useState([]);
  const [isManager, setIsManager] = useState(false)
  const [currentWinner, setCurrentWinner] = useState(null)
  const [user, setUser] = useState()
  const [chitfund, setChitFund] = useState()
  const { wallet } = useWallet();

  let timerId;

  useEffect(() => {
    setRoomId(params.id);
  }, [params]);

  // Function to handle bidding
  const placeBid = async () => {
    // if (!auctionStarted) return alert('Auction not started yet!');

    const { data, err } = await supabase.from('Room').select().eq(`id`, params.id);
    if (data[0].auction_active === false) return alert('Auction not started yet!');
    if (myBid <= roomData.bid_amount) return alert('Bid must be higher than current bid.');
    console.log(myBid)
    // Update the bid in the database
    console.log(wallet);


    setCurrentWinner(wallet)
    // setBidAmount(myBid)
    resetTimer()
    const { error } = await supabase
      .from('Room')
      .update({ bid_amount: myBid, currentWinner: wallet, prev_winning_bid: myBid })
      .eq('id', roomId);

    if (error) {
      console.error('Error placing bid:', error);
    }
  };
  const init = async () => {
    const { data, error } = await supabase.from('Room').select().eq('id', params.id)
    console.log(data[0])
    setRoomData(data[0])

    await getFactory({ contractAddress: data[0].contract_address })
    // if (data[0].contract_manager == wallet) { //useWallet
    //   setIsManager(true)
    // }

  }

  // Increment or decrement bid logic
  const handleIncrement = (type) => {
    if (type === 'increase') {
      setMyBid(myBid + 1);
    } else if (type === 'decrease' && myBid > 0) {
      setMyBid(myBid - 1);
    }
  };

  const handleStartAuction = async () => {
    // setAuctionStarted(true)
    // console.log('auction started')
    const { error } = await supabase.from("Room").update({ auction_active: true }).eq('id', params.id)
    // setAuctionStarted(true)
    startTimer()
    // const { data, error } = await supabase
    // .from('Room')
    // .update({ auction_started: true })
  }

  const finishBid = async () => {
    // setBidAmount(0) //set current bid = 0 in db
    console.log(currentWinner);
    // console.log(bidAmount);
    const { data, error } = await supabase.from('Room').select().eq('id', roomId)
    // const rd = data[0]
    let winners = data[0].winners
    if (winners) {
      winners.push(currentWinner)
    } else {
      winners = [currentWinner]
    }
    // winners.push(currentWinner)
    const monthsRem = data[0].months - 1;
    const client = await ChitFundInterface.createMetaMaskClient({ wallet })
    console.log(chitfund)
    await ChitFundInterface.finalizeBidAndDistributeFunds({ chitfund, client, bidAmount: String(data[0].bid_amount) })
    await supabase.from('Room').update({ winners: winners, bid_amount: 0, bid_time: 0, currentWinner: null, months: monthsRem }).eq('id', params.id)
    // setAuctionStarted(false)
    setMyBid(0)
  }
  const getFactory = async ({ contractAddress }) => {
    const ctfund = await ChitFundInterface.getChitFundFromContractAddress({ contractAddress })
    setChitFund(ctfund)
  }
  const startTimer = async () => {
    clearInterval(timerId); // Clear any existing timers
    setSeconds(20);
    timerId = setInterval(async () => {
      setSeconds((prevSeconds) => {
        if (prevSeconds < 1) {
          clearInterval(timerId);
          finishBid()
          return prevSeconds;
        }
        return prevSeconds - 1;
      });

    }, 1000);
  };
  const timer = async () => {
    await supabase.from('Room').update({ bid_time: seconds }).eq('id', params.id)
    // setSeconds()
    // console.log(data)
  }
  useEffect(() => {
    timer()
  }, [seconds])

  const resetTimer = () => {
    clearInterval(timerId); // Clear the current timer
    setSeconds(20);
  };

  // useEffect(() => {
  //   loadBlockchain()
  //     }, [account])

  useEffect(() => {
    // const { data, error } = await supabase.from('User').select().eq('wallet_address', accAddress)
    init()
  }, [])
  useEffect(() => {
    const subscription = supabase
      .channel(`public:Room:id=eq.${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Room', filter: `id=eq.${params.id}` }, (payload) => {
        // Handle updates
        //  console.log("shanda",(payload))
        //  console.log("shanada")
        const updatedRoom = payload.new;
        // if (updatedRoom.contractManager == wallet) {
        //   setIsManager(true)
        // }
        setSeconds(updatedRoom.bid_time)
        setRoomData(updatedRoom);
        // setBidAmount(roomData.bid_amount)
        // if (roomData.bid_amount) {
        // setBidAmount(roomData.bid_amount);
        // }
        // if (updatedRoom.auction_active) {
        // setAuctionStarted(updatedRoom.auction_active);
        // }
        // if (updatedRoom.currentWinner) {

        //   setCurrentWinner(updatedRoom.currentWinner);
        //   console.log(currentWinner)
        // }
        // if (updatedRoom.winners) {
        //   setWinner(updatedRoom.winners);
        // }
      })
      .subscribe();
    // console.log("shanada")

    // console.log(subscription)

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  return (
    <>
      <ConnectButton />
      <div className='min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-transparent z-40 flex flex-col justify-center items-center'>
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">AUCTION</h1>
        </div>
        <div className="flex flex-col justify-center items-center w-full m-10 p-10 bg-black/20 z-40 rounded-xl">
          {currentWinner === wallet && <span className='absolute top-20 left-[85%] bg-green-600 w-2 h-2 rounded-full'></span>}
          {/* <span className='absolute top-20 left-[85%] bg-green-500 w-2 h-2 rounded-full'></span> */}
          <div className="flex flex-col justify-center items-center text-teal-500">
            <p className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>Current Bid: <span className='text-white font-thin'>{roomData?.bid_amount ?? 0} ETH</span></p> <br />
            <p className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>Time Remaining: <span className='text-white font-thin'>{seconds}s</span></p> <br />
            <p className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>My Bid:<span className='text-white font-thin'> {myBid} ETH</span></p><br />
            <div className='flex flex-row justify-center items-center'>
              <button
                className="w-max flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600"
                onClick={() => placeBid()}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md text-white z-50">
                  Place Bid
                </span>
              </button>
              <button
                className="flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600"
                onClick={() => handleIncrement('increase')}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md text-white z-50">
                  Increase
                </span>
              </button>
              <button
                className="flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600"
                onClick={() => handleIncrement('decrease')}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md text-white z-50">
                  Decrease
                </span>
              </button>
            </div>
          </div>
        </div>
        {roomData?.contract_manager === wallet ? <button onClick={handleStartAuction} className="relative inline-flex w-fit items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-blue-800 group-hover:from-pink-500 group-hover:to-blue-800 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Start Auction
          </span>
        </button> : <></>}
        {/* {winner && <p>Winner: {currentWinner}</p>} */}
      </div>
    </>
  );
};

export default Auction;
