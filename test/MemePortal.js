const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MemePortal contract", () => {
  let memeContract;
  let currTimestamp;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const memeContractFactory = await ethers.getContractFactory("MemePortal");
    memeContract = await memeContractFactory.deploy({
      value: ethers.utils.parseEther("0.1"),
    });

    // Mocking the next block mining timestamp with random offset for testing.
    currTimestamp = Date.now() + 1234;
    await ethers.provider.send("evm_mine", [currTimestamp]);
  });

  describe("deployment", () => {
    it("should deploy successfully", async () => {
      await memeContract.deployed();
    });
  });

  describe("create and save meme logic", () => {
    it("should send and save memes successfully", async () => {
      await memeContract.deployed();
      
      let allMemes = await memeContract.getAllMemes();
      expect(allMemes).to.deep.equal([]);

      await memeContract.createMeme("test1");
      allMemes = await memeContract.getAllMemes();
      
      expect(allMemes.length).to.equal(1);
      expect(allMemes[0].id).to.equal(1);
      expect(allMemes[0].creator).to.equal(owner.address);
      expect(allMemes[0].message).to.equal("test1");
      // Assume timestamp difference will have delta of +/- 100 ms
      expect(Math.floor(allMemes[0].timestamp / 100)).to.equal(Math.floor(currTimestamp / 100));

      currTimestamp = Date.now() + 1234;
      await ethers.provider.send("evm_mine", [currTimestamp]);

      await memeContract.createMeme("test2");
      allMemes = await memeContract.getAllMemes();
      
      expect(allMemes.length).to.equal(2);
      expect(allMemes[1].id).to.equal(2);
      expect(allMemes[1].creator).to.equal(owner.address);
      expect(allMemes[1].message).to.equal("test2");
      // Assume timestamp difference will have delta of +/- 100 ms
      expect(Math.floor(allMemes[1].timestamp / 100)).to.equal(Math.floor(currTimestamp / 100));
    });

    it("should emit NewMeme successfully", async () => {
      await memeContract.deployed();

      const tx = await memeContract.createMeme("test2");
      const receipt = await tx.wait();
      expect(receipt.events.length).to.equal(1);
      expect(receipt.events[0].event).to.equal("NewMeme");

      const eventArgs = receipt.events[0].args;
      expect(eventArgs["0"]).to.equal(1);
      expect(eventArgs["1"]).to.equal(owner.address);
      // Assume timestamp difference will have delta of +/- 100 ms
      expect(Math.floor(eventArgs["2"] / 100)).to.equal(Math.floor(currTimestamp / 100));
      expect(eventArgs["3"]).to.equal("test2");
    });
  });

  describe("approve meme and withdraw funds logic", () => {
    it("should complete happy path successfully", async () => {
      await memeContract.deployed();
      
      await memeContract.createMeme("test1");
      let contractBalance = await memeContract.viewContractBalance();
      expect(ethers.utils.formatEther(contractBalance)).to.equal("0.1");

      await memeContract.connect(addr1).approveMeme(1, owner.address, {value: ethers.utils.parseEther('0.0001')});
      
      contractBalance = await memeContract.viewContractBalance();
      expect(ethers.utils.formatEther(contractBalance)).to.equal("0.1001");

      let balance = await memeContract.viewBalance();
      expect(ethers.utils.formatEther(balance)).to.equal("0.0001");

      let approvedMemes = await memeContract.connect(addr1).viewApprovedMemes();
      expect(approvedMemes.length).to.equal(1);
      expect(approvedMemes[0]).to.equal(1);

      let addrBalanceBefore = await ethers.provider.getBalance(owner.address);
      await memeContract.withdrawTips();
      balance = await memeContract.viewBalance();
      expect(ethers.utils.formatEther(balance)).to.equal("0.0");
      let addrBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(parseInt(addrBalanceAfter)).to.greaterThan(parseInt(addrBalanceBefore));
    });

    it("should emit ApprovedMemes successfully", async () => {
      await memeContract.deployed();

      await memeContract.createMeme("test2");
      const tx = await memeContract.connect(addr1).approveMeme(1, owner.address, {value: ethers.utils.parseEther('0.0001')});
      const receipt = await tx.wait();
      expect(receipt.events.length).to.equal(1);
      expect(receipt.events[0].event).to.equal("ApprovedMemes");

      const eventArgs = receipt.events[0].args;
      expect(eventArgs["0"].length).to.equal(1);
      expect(eventArgs["0"][0]).to.equal(1);
    });

    it("should emit TipsWithdrawn successfully", async () => {
      await memeContract.deployed();

      await memeContract.createMeme("test2");
      await memeContract.connect(addr1).approveMeme(1, owner.address, {value: ethers.utils.parseEther('0.0001')});
      
      const tx = await memeContract.withdrawTips();
      const receipt = await tx.wait();
      expect(receipt.events.length).to.equal(1);
      expect(receipt.events[0].event).to.equal("TipsWithdrawn");

      const eventArgs = receipt.events[0].args;
      expect(eventArgs["0"]).to.equal(0);
    });
  });
});
