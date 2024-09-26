import { ethers } from 'ethers'
import chethFund from '../../utils/ChethFund.json'
import { getSigner } from '@/app/utils/wallet'
import { NextResponse } from 'next/server'

export default async function handler(req, res) {
    if (req.method != 'POST') return NextResponse.json({
        message : 'Invalid Method'
    }, {
        status: 400
    })
    try {
        const { roomId, memberSize, chitAmount } = req.body
        const signer = await getSigner(req)

        const ChethFundFactory = ethers.ContractFactory(ChethFund.abi, ChethFund.bytecode, signer)
        const chitAmountInWei = ethers.parseUnits(chitAmount.toString(), "ether")
        const chethFund = await ChethFundFactory.deploy(memberSize, chitAmountInWei)
        const tx = await chethFund.deployTransaction.wait()
        return NextResponse.json({
            message: 'ChethFund Contract Deployed Successfully',
            contractAddress : chethFund.target,
            contractManager: signer.target
        })

    } catch (error) {
        return NextResponse.json({
            message : err
        }, {
            status: 500
        })
    }
}