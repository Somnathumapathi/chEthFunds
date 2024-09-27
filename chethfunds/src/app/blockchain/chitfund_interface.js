import ChitFundJSON from "./contracts/ChitFund.json";
const API_URL = 'https://f596-14-195-8-78.ngrok-free.app';
import { ganache } from "./ganache";
import { ViemClient, ViemContract } from "./viemc";
import { createWalletClient, formatEther, http, parseEther, publicActions, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts"

//ChETHFund's own private client
const platformClient = new ViemClient({
    walletClient: createWalletClient({
        account: privateKeyToAccount('0xff2b5b94122182537f302af22d17ab060f975ba8a48f0b18c72daaafc2c9440a'),
        chain: ganache,
        transport: http(API_URL)
    })
},);

export class ChitFundInterface {

    static getChitBalance = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const cfbal = await chitfund.read({ method: 'getBalance' });
        return Number(formatEther(cfbal))
    }

    static getRemainingMonths = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const cfbal = await chitfund.read({ method: 'getBalance' });
        return Number(formatEther(cfbal))
    }

    static getChitValue = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const cv = await chitfund.read({ method: 'chitValue' });
        return Number(formatEther(cv))
    }

    static isContractActive = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const isActive = await chitfund.read({ method: 'contractActive' });
        return isActive
    }

    static getPaidMembersList = async ({ chitfund }) => {
        chitfund.connect({ client: platformClient });
        const paidMembersList = await chitfund.read({ method: 'paidMembersList' });
        return paidMembersList;
    }

    static getInternalCalculations = ({ contractBalance, highestBidInEth }) => {
        const highestBid = Number(highestBidInEth);
        const commission = (parseEther(contractBalance) * BigInt(2)) / 100n //2% commission
        contractBalance = parseEther(contractBalance) - commission;
        const toBeneficiary = (Number(contractBalance) - highestBid);
        const amtSplit2All = parseEther(String(highestBid / 3));
        return {
            commission: Number(formatEther(commission)),
            amountSentToBidWinner: Number(formatEther(toBeneficiary)),
            commonSplit: Number(formatEther(amtSplit2All)),
        }
    }

    static createChitFund = async ({ chitAmountInEth, memberSize }) => {
        const factory = ViemContract.fromCompiledContract({ compiledContract: ChitFundJSON });
        factory.connect({ client: platformClient });
        const { hash: deploymentHash, contract } = await factory.deploy({
            params: [BigInt(memberSize), parseEther(chitAmountInEth)],
        });
        contract.connect({ client: platformClient })
        console.log('DEPLOYED_CONTRACT_HASH', deploymentHash);
        // console.log('DEPLOYED_CONTRACT_ADDRESS', contract.contractAddress)
        return contract;
    }

    static depositChitAmount = async ({ chitfund, client, chitAmount }) => {
        chitfund.connect({ client }); //connect the current client to the provided contract
        await chitfund.write({
            method: 'depositChit',
            valueInEth: chitAmount,
        });
        chitfund.connect({ client: platformClient });
    }

    static finalizeBidAndDistributeFunds = async ({ chitfund, client, bidAmount }) => {
        chitfund.connect({ client }); //connect the current client to the provided contract
        await chitfund.write({ method: 'bid', params: [bidAmount] });
        chitfund.connect({ client: platformClient });
        await chitfund.write({ method: 'distributeFunds' });
    }
}