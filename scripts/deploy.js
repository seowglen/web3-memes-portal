const main = async () => {
  const memeContractFactory = await hre.ethers.getContractFactory("MemePortal");
  const memeContract = await memeContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.001"),
  });

  await memeContract.deployed();

  console.log("MemePortal address: ", memeContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();