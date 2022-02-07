// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MemePortal {
    using SafeMath for uint256;

    uint256 id;

    event NewMeme(uint256 id, address indexed from, uint256 timestamp, string message);
    event ApprovedMemes(uint256[] memesApproved);
    event TipsWithdrawn(uint256 balance);

    struct Meme {
        address creator;
        string message;
        uint256 timestamp;
        uint256 id;
    }

    Meme[] memes;

    mapping(address => uint256[]) public approvedMemes;
    mapping(address => uint256) public balances;

    constructor() payable {}

    function createMeme(string memory _message) public {
        memes.push(Meme(msg.sender, _message, block.timestamp, id.add(1)));
        emit NewMeme(id.add(1), msg.sender, block.timestamp, _message);
        id = id.add(1);
    }

    function approveMeme(uint256 memeId, address memeCreator) external payable {
        require(msg.value == 0.0001 ether, "Not exact deposit");
        require(msg.sender.balance >= 0.0001 ether, "Approver has not enough ether.");
        // TODO: use SafeMath for storage variable
        balances[memeCreator] += msg.value;       
        approvedMemes[msg.sender].push(memeId);
        emit ApprovedMemes(approvedMemes[msg.sender]);
    }

    function withdrawTips() external payable {
        require(
            balances[msg.sender] <= address(this).balance,
            "Trying to withdraw more money than the contract has."
        );
        (bool success, ) = (msg.sender).call{value: balances[msg.sender]}("");
        require(
            success, 
            "Failed to withdraw money from contract."
        );
        balances[msg.sender] = 0;
        emit TipsWithdrawn(balances[msg.sender]);
    }

    function getAllMemes() public view returns (Meme[] memory) {
        return memes;
    }

    function viewBalance() public view returns(uint256) {
        return balances[msg.sender];
    }

    function viewApprovedMemes() public view returns(uint256[] memory) {
        return approvedMemes[msg.sender];
    }

    function viewContractBalance() public view returns(uint) {
        return address(this).balance;
    }
}
