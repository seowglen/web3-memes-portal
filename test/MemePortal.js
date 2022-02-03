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

  describe("sendMeme", () => {
    it("should send and save memes successfully", async () => {
      await memeContract.deployed();
      
      let allMemes = await memeContract.getAllMemes();
      expect(allMemes).to.deep.equal([]);

      await memeContract.sendMeme("test1");
      allMemes = await memeContract.getAllMemes();
      
      expect(allMemes.length).to.equal(1);
      expect(allMemes[0].waver).to.equal(owner.address);
      expect(allMemes[0].message).to.equal("test1");
      // Assume timestamp difference will have delta of +/- 100 ms
      expect(Math.floor(allMemes[0].timestamp / 100)).to.equal(Math.floor(currTimestamp / 100));
    });

    it("should emit NewMeme successfully", async () => {
      await memeContract.deployed();

      const tx = await memeContract.sendMeme("test2");
      const receipt = await tx.wait();

      expect(receipt.events.length).to.equal(1);
      const eventArgs = receipt.events[0].args;
      expect(eventArgs["0"]).to.equal(owner.address);
      // Assume timestamp difference will have delta of +/- 100 ms
      expect(Math.floor(eventArgs["1"] / 100)).to.equal(Math.floor(currTimestamp / 100));
      expect(eventArgs["2"]).to.equal("test2");
    });
  });
});
