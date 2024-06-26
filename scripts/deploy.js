const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("rabbit");
    await domainContract.deployed();
  
    console.log("Contract deployed to:", domainContract.address);
  
      let txn = await domainContract.register("romain",  {value: hre.ethers.utils.parseEther('0.1')});
      await txn.wait();
    console.log("Minted domain romain.rabbit");
  
    txn = await domainContract.setRecord("romain", "alexandremichel11@gmail.com");
    await txn.wait();
    console.log("Set record for romain.rabbit");
  
    const address = await domainContract.getRecord("romain");
    console.log("Owner of domain romain:", address);
  
    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
  }
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();