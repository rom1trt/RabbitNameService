import React, { useEffect, useState } from "react";
import './styles/App.css';
import githubLogo from './assets/github-logo.png';
import { ethers } from "ethers";
import contractAbi from './utils/contractABI.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

// Constants
const GITHUB_HANDLE = 'IA-Symbolique';
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;
// Add the domain you will be minting
const tld = '.rabbit';
const CONTRACT_ADDRESS = '0x53Dee0748DF7dDDf3205e5D62ea42B75C12523c5';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [network, setNetwork] = useState('');
  const [editing, setEditing] = useState(false);
  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [mints, setMints] = useState([]);
  const [loading, setLoading] = useState(false);

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Polygon Amoy Testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        console.log("ERROR: ", error);
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13882',
                  chainName: 'Polygon Amoy Testnet',
                  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                  nativeCurrency: {
                    name: "MATIC",
                    symbol: "MATIC",
                    decimals: 18
                  },
                  blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have MetaMask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setNetwork(networks[chainId]);

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
    } else {
      console.log('No authorized account found');
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setNetwork(networks[chainId]);

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setCurrentAccount(accounts[0]);
    } else {
      setCurrentAccount('');
    }
  };

  const mintDomain = async () => {
    if (!domain) {
      return;
    }

    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long');
      return;
    }

    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
    console.log('Minting domain', domain, 'with price', price);
    setLoading(true);

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);

        console.log('Going to pop wallet now to pay gas...');
        let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          console.log('Domain minted! https://mumbai.polygonscan.com/tx/' + tx.hash);

          tx = await contract.setRecord(domain, record);
          await tx.wait();

          console.log('Record set! https://mumbai.polygonscan.com/tx/' + tx.hash);

          setTimeout(() => {
            fetchMints();
          }, 2000);

          setRecord('');
          setDomain('');
        } else {
          alert('Transaction failed! Please try again');
        }
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const updateDomain = async () => {
    if (!record || !domain) {
      return;
    }
    setLoading(true);
    console.log('Updating domain', domain, 'with record', record);

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);

        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log('Record set https://mumbai.polygonscan.com/tx/' + tx.hash);

        fetchMints();
        setRecord('');
        setDomain('');
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchMints = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);

        const names = await contract.getAllNames();

        const mintRecords = await Promise.all(
          names.map(async (name) => {
            const mintRecord = await contract.records(name);
            const owner = await contract.domains(name);
            return {
              id: names.indexOf(name),
              name: name,
              record: mintRecord,
              owner: owner,
            };
          })
        );

        setMints(mintRecords);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img src="https://i.imgur.com/3sovVwj.gif" alt="Rabbit gif" />
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    </div>
  );

  const renderInputForm = () => {
    if (network !== 'Polygon Amoy Testnet') {
      return (
        <div className="connect-wallet-container">
          <h2>Please connect to the Polygon Amoy Testnet</h2>
          <button className="cta-button mint-button" onClick={switchNetwork}>
            Click here to switch
          </button>
        </div>
      );
    }

    return (
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder='domain'
            onChange={(e) => setDomain(e.target.value)}
          />
          <p className='tld'>{tld}</p>
        </div>

        <input
          type="text"
          value={record}
          placeholder='whats ur rabbit power?'
          onChange={(e) => setRecord(e.target.value)}
        />
        {editing ? (
          <div className="button-container">
            <button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
              Set record
            </button>
            <button className='cta-button mint-button' onClick={() => { setEditing(false) }}>
              Cancel
            </button>
          </div>
        ) : (
          <button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
            Mint
          </button>
        )}
      </div>
    );
  };

  const renderMints = () => {
    if (mints.length > 0) {
      return (
        <div className="mint-container">
          <p className="subtitle">Recently minted domains!</p>
          <div className="mint-list">
            {mints.map((mint, index) => {
              return (
                <div className="mint-item" key={index}>
                  <div className='mint-row'>
                    <a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
                      <p className="underlined">{' '}{mint.name}{tld}{' '}</p>
                    </a>
                    {mint.owner.toLowerCase() === currentAccount.toLowerCase() ? (
                      <button className="edit-button" onClick={() => editRecord(mint.name)}>
                        <img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
                      </button>
                    ) : null}
                  </div>
                  <p>{mint.record}</p>
                </div>
              )
            })}
          </div>
        </div>);
    }
  };

  const editRecord = (name) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (network === 'Polygon Amoy Testnet') {
      fetchMints();
    }
  }, [currentAccount, network]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">🐰 Rabbit Name Service</p>
              <p className="subtitle">Your API on the blockchain!</p>
            </div>
            <div className="right">
              <img alt="Network logo" className="logo" src={network === 'Polygon Amoy Testnet' ? polygonLogo : ethLogo} />
              {currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
            </div>
          </header>
        </div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}
        {mints && renderMints()}

        <div className="footer-container">
          <img alt="Github Logo" className="github-logo" src={githubLogo} width="40" height="40" />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${GITHUB_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;