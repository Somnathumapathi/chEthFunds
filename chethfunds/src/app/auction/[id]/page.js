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

    const {data,err} = await supabase.from('Room').select().eq(`id`,params.id);
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
    
    await getFactory({contractAddress: data[0].contract_address})
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
    const {error} = await supabase.from("Room").update({auction_active: true}).eq('id', params.id)
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
    if(winners) {
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
  const getFactory = async ({contractAddress}) => {
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
    <div className='flex flex-col justify-center items-center'>
      
      <ConnectButton />
      <div className="flex flex-col justify-center items-center border w-1/4 p-5 rounded-2xl">
        {roomData?.contract_manager === wallet ? <div onClick={handleStartAuction}>Start auction</div> : <div>No</div>}
        {currentWinner === wallet && <span className='absolute top-20 left-[85%] bg-green-600 w-2 h-2 rounded-full'></span>}
        <span className='absolute top-20 left-[85%] bg-green-500 w-2 h-2 rounded-full'></span>
        <div className="flex flex-col justify-center items-center text-teal-500">
          <p>Current Bid: {roomData?.bid_amount ?? 0} ETH</p> <br />
          <p>Time Remaining: {seconds}s</p> <br />
          <p>My Bid: {myBid} ETH</p><br />
          <div>
            <button
              className="border-2 border-teal-200 p-3 rounded-xl m-1 inline-block font-bold"
              onClick={() => placeBid()}
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
