const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CIFI Migration Contract...\n");

  // Get the CIFI V1 token address from environment or prompt
  const cifiV1Address = process.env.CIFI_V1_ADDRESS;
  
  if (!cifiV1Address) {
    throw new Error("❌ CIFI_V1_ADDRESS not set in .env file");
  }

  console.log("📋 Deployment Configuration:");
  console.log("   Network:", hre.network.name);
  console.log("   CIFI V1 Address:", cifiV1Address);
  console.log("");

  // Deploy the contract
  const CIFIMigration = await hre.ethers.getContractFactory("CIFIMigration");
  console.log("⏳ Deploying contract...");
  
  const migration = await CIFIMigration.deploy(cifiV1Address);
  await migration.waitForDeployment();

  const address = await migration.getAddress();
  console.log("✅ Contract deployed!");
  console.log("   Address:", address);
  console.log("");

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  if (hre.network.name !== "hardhat") {
    await migration.deploymentTransaction().wait(5);
  }

  // Verify contract (if on a network with explorer)
  if (hre.network.name === "xdc" || hre.network.name === "xdcTestnet") {
    console.log("\n📝 Next steps:");
    console.log("   1. Verify contract on XDC Explorer");
    console.log("   2. Add contract address to Admin Dashboard");
    console.log("   3. Test migration with small amount");
  }

  console.log("\n📋 Contract Details:");
  console.log("   Migration Contract:", address);
  console.log("   CIFI V1 Token:", cifiV1Address);
  console.log("   Owner:", await migration.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

