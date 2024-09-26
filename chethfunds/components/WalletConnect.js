// import { useAccount, useConnect, useDisconnect } from 'wagmi';
// import { InjectedConnector } from 'wagmi/connectors/injected';

// export function WalletConnect() {
//   const { address, isConnected } = useAccount();
//   const { connect } = useConnect({
//     connector: new InjectedConnector(),
//   });
//   const { disconnect } = useDisconnect();

//   if (isConnected) {
//     return (
//       <div>
//         <p>Connected to {address}</p>
//         <button onClick={() => disconnect()}>Disconnect</button>
//       </div>
//     );
//   }

//   return <button onClick={() => connect()}>Connect Wallet</button>;
// }