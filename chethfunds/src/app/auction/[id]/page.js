"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

const Auction = () => {
  const params = useParams();
  const [roomId, setRoomId] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [seconds, setSeconds] = useState(20);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [winner, setWinner] = useState(null);

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
    if (error) {
      console.error('Error placing bid:', error);
    }
  };

  // Increment or decrement bid logic
  const handleIncrement = (type) => {
    if (type === 'increase') {
      setMyBid(myBid + 1);
    } else if (type === 'decrease' && myBid > 0) {
      setMyBid(myBid - 1);
    }
  };

  // Real-time listener for auction updates
  useEffect(() => {
    const subscription = supabase
  .channel(`public:Room:id=eq.${roomId}`)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Room', filter: `id=eq.${roomId}` }, (payload) => {
    // Handle updates
    const updatedRoom = payload.new;
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

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  return (
    <div>
      <div className="border w-1/4 p-5 rounded-2xl">
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
