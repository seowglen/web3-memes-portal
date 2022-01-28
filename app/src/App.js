import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import ClipLoader from "react-spinners/ClipLoader";
import './App.css';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [waves, setWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [text, setText] = useState("");
  const contractAddress = "0x6923fc03833D3471dFc377c412a9be2225C35085";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No authorized account found");
      }
      getAllWaves();
    } catch (err) {
      console.log(err);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  }

  const wave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waveTxn = await wavePortalContract.wave(text);
      await waveTxn.wait();
      let allWaves = await wavePortalContract.getAllWaves();
      setAllWaves(allWaves);
      setWaves(allWaves.length);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();
      setAllWaves(waves);
      setWaves(waves.length);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>
        <div className="bio">
          Wave at me!
        </div>
        {!currentAccount ? (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="waves">
              {loading ? <ClipLoader color={"#808080"} loading={loading} size={20} /> : waves}
            </div>
            <textarea
              name="wave-textbox"
              placeholder="Enter a message..."
              rows="2"
              cols="50"
              onChange={e => setText(e.target.value)}
            >
            </textarea>
            <button className="waveButton" onClick={wave} disabled={loading ? true : false}>
              Wave at Me
            </button>
            {allWaves.map(wave => 
              <div>
                {wave.waver}
                {wave.message}
                {new Date(wave.timestamp * 1000).toString()}
              </div>
            ).reverse()}
          </>
        )}
      </div>
    </div>
  );
}
