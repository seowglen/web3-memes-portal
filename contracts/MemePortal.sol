// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemePortal {
    event NewMeme(address indexed from, uint256 timestamp, string message);

    struct Meme {
        address waver;
        string message;
        uint256 timestamp;
    }

    Meme[] memes;

    constructor() payable {}

    function sendMeme(string memory _message) public {
        memes.push(Meme(msg.sender, _message, block.timestamp));
        emit NewMeme(msg.sender, block.timestamp, _message);
    }

    function getAllMemes() public view returns (Meme[] memory) {
        return memes;
    }
}

// uint256 prizeAmount = 0.0001 ether;
// require(
//     prizeAmount <= address(this).balance,
//     "Trying to withdraw more money than they contract has."
// );
// (bool success, ) = (msg.sender).call{value: prizeAmount}("");
// require(success, "Failed to withdraw money from contract.");