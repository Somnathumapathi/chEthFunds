"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import {ethers} from 'ethers'

const Auction = () => {
  const params = useParams();
  const [roomId, setRoomId] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [seconds, setSeconds] = useState(20);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isManager, setIsManager] = useState(false)
  const [account, setAccount] = useState("")
  const [user, setUser] = useState()
  let timerId;

  useEffect(() => {
    setRoomId(params.id);
  }, [params]);

  // Function to handle bidding
  const handleAmount = async (bid) => {
    if (!auctionStarted) return alert('Auction not started yet!');
    if (bid <= bidAmount) return alert('Bid must be higher than current bid.');

    // Update the bid in the database
    
    const { error } = await supabase
      .from('Room')
      .update({ bid_amount: bid })
      .eq('id', roomId);
      resetTimer()
    if (error) {
      console.error('Error placing bid:', error);
    }
  };
  const init = async () => {
    const { data, error } = await supabase.from('Room').select().eq('id', params.id)
    console.log(data[0])
    if(data[0].contract_manager == account) {
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
 
  const  handleStartAuction = async () => {
    setAuctionStarted(true)
    console.log('auction started')
    startTimer()
    // const { data, error } = await supabase
    // .from('Room')
    // .update({ auction_started: true })
  }

  const finishBid = async () => {
    await supabase.from('Room').update({winners: [winner]}).eq('id', params.id)
  
  }

  const loadBlockchain = async () => {
    const accounts  = await window.ethereum.request({method: 'eth_requestAccounts'})
    const accAddress = ethers.getAddress(accounts[0])
    console.log(accAddress)
    setAccount(accAddress)
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
    // await supabase.from('Room').update({bid_time: seconds}).eq('id', params.id)
};
const timer = async () => {
  await supabase.from('Room').update({bid_time: seconds}).eq('id', params.id)
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

  useEffect(() => {
    loadBlockchain()
      }, [account])
 
      useEffect(() => {
        // const { data, error } = await supabase.from('User').select().eq('wallet_address', accAddress)
        init()
      })
  useEffect(() => {
    const subscription = supabase
  .channel(`public:Room:id=eq.${params.id}`)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Room', filter: `id=eq.${params.id}` }, (payload) => {
    // Handle updates
  //  console.log("shanda",(payload))
  //  console.log("shanada")
    const updatedRoom = payload.new;
    if(updatedRoom.contractManager == account) {
      setIsManager(true)
    }
    setSeconds(updatedRoom.bid_time)
    if (updatedRoom.bid_amount) {
      setBidAmount(updatedRoom.bid_amount);
    }
    if (updatedRoom.auction_started) {
      setAuctionStarted(updatedRoom.auction_started);
    }
    
    if (updatedRoom.winner) {
      setWinner(updatedRoom.winner);
    }
  })
  .subscribe();
  // console.log("shanada")

  // console.log(subscription)

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  return (
    <div>
      <div className="border w-1/4 p-5 rounded-2xl">
      {isManager ? <div onClick={handleStartAuction}>Start auction</div> : <div>No</div>}
      
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
          {winner && <p>Winner: {winner}</p>}
        </div>
      </div>
    </div>
  );
};

export default Auction;
