"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { ethers } from 'ethers'
import { useWallet } from '@/app/Context/wallet';
import ConnectButton from '../../../../components/connectButton';

const Auction = () => {
  const params = useParams();
  const [roomId, setRoomId] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [seconds, setSeconds] = useState(20);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [winner, setWinner] = useState([]);
  const [isManager, setIsManager] = useState(false)
  const [currentWinner, setCurrentWinner] = useState(null)
  const [user, setUser] = useState()
  const { wallet } = useWallet();
  let timerId;

  useEffect(() => {
    setRoomId(params.id);
  }, [params]);

  // Function to handle bidding
  const handleAmount = async (bid) => {
    if (!auctionStarted) return alert('Auction not started yet!');
    if (bid <= bidAmount) return alert('Bid must be higher than current bid.');
    console.log(bid)
    // Update the bid in the database
    console.log(wallet);
    const { error } = await supabase
      .from('Room')
      .update({ bid_amount: bid, currentWinner: wallet, prev_winning_bid: bid })
      .eq('id', roomId);
    setCurrentWinner(wallet)
    resetTimer()
    if (error) {
      console.error('Error placing bid:', error);
    }
  };
  const init = async () => {
    const { data, error } = await supabase.from('Room').select().eq('id', params.id)
    console.log(data[0])
    if (data[0].contract_manager == wallet) { //useWallet
      setIsManager(true)
    }

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
    setAuctionStarted(true)
    // console.log('auction started')
    startTimer()
    // const { data, error } = await supabase
    // .from('Room')
    // .update({ auction_started: true })
  }

  const finishBid = async () => {
    // setBidAmount(0) //set current bid = 0 in db
    console.log(currentWinner);
    console.log(bidAmount);
    const { data , error} = await supabase.from('Room').select().eq('id', roomId)
    // const rd = data[0]
    const winners = data[0].winners
    winners.push(currentWinner)
    const monthsRem = data[0].months - 1;
    await supabase.from('Room').update({ winners: winners, bid_amount: 0, bid_time: 0, currentWinner: null, months: monthsRem }).eq('id', params.id)
    setAuctionStarted(false)
    setBidAmount(0)
    setMyBid(0)
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
  })
  useEffect(() => {
    const subscription = supabase
      .channel(`public:Room:id=eq.${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Room', filter: `id=eq.${params.id}` }, (payload) => {
        // Handle updates
        //  console.log("shanda",(payload))
        //  console.log("shanada")
        const updatedRoom = payload.new;
        if (updatedRoom.contractManager == wallet) {
          setIsManager(true)
        }
        setSeconds(updatedRoom.bid_time)
        if (updatedRoom.bid_amount) {
          setBidAmount(updatedRoom.bid_amount);
        }
        if (updatedRoom.auction_started) {
          setAuctionStarted(updatedRoom.auction_started);
        }
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
    <div className='flex flex-col justify-center items-center'>
      <ConnectButton />
      <div className="flex flex-col justify-center items-center border w-1/4 p-5 rounded-2xl">
        {isManager ? <div onClick={handleStartAuction}>Start auction</div> : <div>No</div>}
        {currentWinner === wallet && <span className='absolute top-20 left-[85%] bg-green-600 w-2 h-2 rounded-full'></span>}
        <span className='absolute top-20 left-[85%] bg-green-500 w-2 h-2 rounded-full'></span>
        <div className="flex flex-col justify-center items-center text-teal-500">
          <p>Current Bid: {bidAmount} ETH</p> <br />
          <p>Time Remaining: {seconds}s</p> <br />
          <p>My Bid: {myBid} ETH</p><br />
          <div>
            <button
              className="border-2 border-teal-200 p-3 rounded-xl m-1 inline-block font-bold"
              onClick={() => handleAmount(myBid)}
            >
              Place Bid
            </button>
            <br />
            <button
              className="border-2 border-teal-200 p-3 rounded-xl m-1 inline-block font-bold"
              onClick={() => handleIncrement('increase')}
            >
              Increase
            </button>
            <button
              className="border-2 border-teal-200 p-3 rounded-xl m-1 inline-block font-bold"
              onClick={() => handleIncrement('decrease')}
            >
              Decrease
            </button>
          </div>
          {/* {winner && <p>Winner: {currentWinner}</p>} */}
        </div>
      </div>
    </div>
  );
};

export default Auction;
