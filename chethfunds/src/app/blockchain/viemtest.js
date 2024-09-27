import { createPublicClient, createWalletClient, formatEther, http, parseEther, publicActions, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts"
import { ganache } from "./ganache";
import { ViemClient, ViemContract } from "./viemc";
import ChitFundJSON from "./contracts/ChitFund.json";
// import StorageJSON from "./contracts/Storage.json";

const PRIVATE_KEY = '0xff2b5b94122182537f302af22d17ab060f975ba8a48f0b18c72daaafc2c9440a';
// const API_URL = 'https://eth-sepolia.g.alchemy.com/v2/ThmK5GMa8cPgR5Sw9eLn4GhoFI5_51tM';
const API_URL = 'https://f596-14-195-8-78.ngrok-free.app';


export async function chitfund_e2e({ chitAmount }) {

    // --------------------- Account Setup ---------------------------
    const members = {
        manas: '0x2c3f4e3858c1bade5edbfd770f9cb9fe121ffcaafe7b237d1c9d754ad4204949',
        koushik: '0x6d9348b9dd52bf89c0cc3df21173c01bf448c860f9a217cf19773563d47a64a0',
        somnath: '0x51e0f369ab507c1f4fb48fb9dd3146326fd36019b1b402af1e0b9932c9f82660',
        platform: '0xff2b5b94122182537f302af22d17ab060f975ba8a48f0b18c72daaafc2c9440a', //BLANKPOINT's PVK
    }
    const _createViemClient = (privateKey) => new ViemClient({
        walletClient: createWalletClient({
            account: privateKeyToAccount(privateKey),
            chain: ganache,
            transport: http(API_URL)
        })
    },);
    const memberClients = {
        manas: _createViemClient(members.manas),
        koushik: _createViemClient(members.koushik),
        somnath: _createViemClient(members.somnath),
        platform: _createViemClient(members.platform),
    }
    // --------------------- Account Setup ---------------------------  

    //--------------------Deploy the Contract-------------------------
    const factory = ViemContract.fromCompiledContract({ compiledContract: ChitFundJSON });
    factory.connect({ client: memberClients.platform });
    const { hash: deploymentHash, contract } = await factory.deploy({
        params: [3n, parseEther(chitAmount)],
    });
    contract.connect({ client: memberClients.platform });

    console.log('DEPLOYED_CONTRACT_HASH', deploymentHash);
    console.log('DEPLOYED_CONTRACT_ADDRESS', contract.contractAddress)
    const cfbal = await contract.read({ method: 'getBalance' });
    console.log('INITIAL_CONTRACT_BALANCE', formatEther(cfbal))
    console.log('Contract Deployment Successful!');
    //--------------------Deploy the Contract-------------------------

    //-------------------Start Event Listeners-------------------------
    contract.startListeningToEvents({
        eventSignatures: [
            'event DividendDistributed(uint dividendAmount, uint remainingMonths)',
            'event ChitDeposited(address indexed member, uint amount)',
            'event Withdraw(address indexed currentBeneficiary, uint amount)',
            'event ContractClosed()',
        ],
        callback: (e, data) => {
            console.info(`========(EVENT: ${e})==========`)
            console.info(data);
            console.info(`===================================`)
        }
    });
    //-------------------Start Event Listeners-------------------------

    const simulateMonth = async (month) => {
        console.log(`\n\nSIMULATING MONTH ${month + 1}`)

        //--------------------Fetch their Initial Balance-------------------------
        const balanceM = await memberClients.manas.getBalance({ mode: 'ether' });
        const balanceK = await memberClients.koushik.getBalance({ mode: 'ether' });
        const balanceS = await memberClients.somnath.getBalance({ mode: 'ether' });
        console.log('ORIGINAL_BALANCE(MSK):', [balanceM, balanceK, balanceS]);
        //--------------------Fetch their Initial Balance-------------------------

        //--------------------One by One Send their ChitAmount-------------------
        contract.connect({ client: memberClients.manas });
        await contract.write({
            method: 'depositChit',
            valueInEth: chitAmount,
        });
        console.log('DEPOSIT_COMPLETE: MANAS');
        contract.connect({ client: memberClients.koushik });
        await contract.write({
            method: 'depositChit',
            valueInEth: chitAmount,
        });
        console.log('DEPOSIT_COMPLETE: KOUSHIK');
        contract.connect({ client: memberClients.somnath });
        await contract.write({
            method: 'depositChit',
            valueInEth: chitAmount,
        });
        console.log('DEPOSIT_COMPLETE: SOMNATH');
        contract.connect({ client: memberClients.platform }); //re-connect to platform
        //----------------------------------------------------------------------

        //--------------------Fetch their Balances again-------------------------
        const balanceM2 = await memberClients.manas.getBalance({ mode: 'ether' });
        const balanceK2 = await memberClients.koushik.getBalance({ mode: 'ether' });
        const balanceS2 = await memberClients.somnath.getBalance({ mode: 'ether' });
        console.log('POST_DEPOSTI_BALANCES(MSK):', [balanceM2, balanceK2, balanceS2]);
        //--------------------Fetch their Balances again-------------------------

        let contractbal = await contract.read({ method: 'getBalance' });
        console.log('POST_DEPOSIT_CONTRACT_BALANCE:', formatEther(contractbal));

        //----------------------Simulate Auction------------------------
        const hb = (['manas', 'koushik', 'somnath'][month])
        const highestBidder = memberClients[hb];
        const highestBid = parseEther(String(Math.random() * Number(chitAmount) * 0.9))
        contract.connect({ client: highestBidder });
        console.log('HIGHEST_BIDDER', hb, 'WITH', formatEther(highestBid), 'ETH');
        await contract.write({ method: 'bid', params: [highestBid] }); //SERVER_CALL
        contract.connect({ client: memberClients.platform }); //re-connect to platform
        //----------------------Simulate Auction------------------------

        //----------------------Distribute Funds (SERVER_CALL) ------------------------
        await contract.write({ method: 'distributeFunds' }); //SERVER_CALL
        //--------------------------------------------------------------

        //--------------------Fetch their Balances again-------------------------
        const balanceM3 = await memberClients.manas.getBalance({ mode: 'ether' });
        const balanceK3 = await memberClients.koushik.getBalance({ mode: 'ether' });
        const balanceS3 = await memberClients.somnath.getBalance({ mode: 'ether' });
        console.log('POST_DISTRIBUTE_BALANCES(MSK):', [balanceM3, balanceK3, balanceS3]);
        //--------------------Fetch their Balances again-------------------------


        //Perform the Explanatory Mathematics

        const commission = (contractbal * BigInt(2)) / 100n //2% commission
        contractbal = contractbal - commission;

        const toBeneficiary = (contractbal - highestBid);
        const amtSplit2All = parseEther(String(Number(formatEther(highestBid)) / 3));

        console.log('INTERNAL_CALCULATIONS', {
            commission: formatEther(commission),
            amountSentToBidWinner: formatEther(toBeneficiary),
            amtSplit2All: formatEther(amtSplit2All),
        })


        const _performBalAdd = (ob, amt) => Number(formatEther(parseEther(String(ob + Number(formatEther(amt))))));

        if (month === 0) {
            console.log('MANAS', balanceM2, '+', Number(formatEther(toBeneficiary)), '=', _performBalAdd(_performBalAdd(balanceM2, toBeneficiary), amtSplit2All), '>>>>', balanceM3)
            console.log('KOUSHIK', balanceK2, '+', Number(formatEther(amtSplit2All)), '=', _performBalAdd(balanceK2, amtSplit2All), '>>>>', balanceK3)
            console.log('SOMNATH', balanceS2, '+', Number(formatEther(amtSplit2All)), '=', _performBalAdd(balanceS2, amtSplit2All), '>>>>', balanceS3)
        } else if (month === 1) {
            console.log('MANAS', balanceM2, '+', Number(formatEther(amtSplit2All)), '=', _performBalAdd(balanceM2, amtSplit2All), '>>>>', balanceM3)
            console.log('KOUSHIK', balanceK2, '+', Number(formatEther(toBeneficiary)), '=', _performBalAdd(_performBalAdd(balanceK2, toBeneficiary), amtSplit2All), '>>>>', balanceK3)
            console.log('SOMNATH', balanceS2, '+', Number(formatEther(amtSplit2All)), '=', _performBalAdd(balanceS2, amtSplit2All), '>>>>', balanceS3)
        } else if (month === 2) {
            console.log('MANAS', balanceM2, '+', Number(formatEther(amtSplit2All)), '=', _performBalAdd(balanceM2, amtSplit2All), '>>>>', balanceM3)
            console.log('KOUSHIK', balanceK2, '+', Number(formatEther(amtSplit2All)), '=', _performBalAdd(balanceK2, amtSplit2All), '>>>>', balanceK3)
            console.log('SOMNATH', balanceS2, '+', Number(formatEther(toBeneficiary)), '=', _performBalAdd(_performBalAdd(balanceS2, toBeneficiary), amtSplit2All), '>>>>', balanceS3)
        }
    }

    await simulateMonth(0);
    await simulateMonth(1);
    await simulateMonth(2);

    contract.stopListeningToEvents();
}

// export async function viemtest() {
//     const account = privateKeyToAccount(PRIVATE_KEY);

//     let wc = createWalletClient({
//         account,
//         chain: ganache,
//         transport: http(API_URL)
//     })

//     const viemClient = new ViemClient({
//         walletClient: wc,
//     });

//     const addr = await viemClient.getClientAddress();
//     console.log('Address', addr);


//     const bal = await viemClient.getBalance({ mode: 'ether' });
//     console.log(`\nBalance: = ${bal}ETH`);

//     const factory = ViemContract.fromCompiledContract({
//         compiledContract: ChitFundJSON,
//     });
//     factory.connect({ client: viemClient });

//     const { hash: deploymentHash, contract: chitFundVC } = await factory.deploy({
//         params: [3n, parseEther('0.0001')],
//     });
//     console.log('DEPLOYED_CONTRACT_HASH', deploymentHash);
//     console.log('DEPLOYED_CONTRACT_ADDRESS', chitFundVC.contractAddress)

//     //connect the newly created contract
//     chitFundVC.connect({ client: viemClient });

//     //get initial balance (READ)
//     const cfbal = await chitFundVC.read({ method: 'getBalance' });
//     console.log('CHIT_BALANCE', formatEther(cfbal));

//     const txhash = await chitFundVC.write({
//         method: 'depositChit',
//         valueInEth: '0.0001',
//     });
//     console.log('TXHASH', txhash);

//     const cfbal2 = await chitFundVC.read({ method: 'getBalance' });
//     console.log('CHIT_BALANCE', formatEther(cfbal2));

//     //read
//     // const chitAmount = await chitFundVC.read({ method: 'chitAmount' });
//     // console.log('CHIT_AMOUNT', formatEther(chitAmount));


// }

