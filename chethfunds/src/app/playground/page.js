"use client";
import React, { useEffect, useState } from 'react'
import { chitfund_e2e } from '../blockchain/viemtest';

const room = () => {
    return (
        <div>
            <h1>Playground</h1>
            <button className="rounded-lg bg-accent px-4 py-1 mt-3" onClick={() => chitfund_e2e({ chitAmount: '2' })}>RUN END2END TEST</button>
        </div>
    )
}

export default room