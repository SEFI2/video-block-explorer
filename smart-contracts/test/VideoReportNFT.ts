import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("VideoReportNFT", function () {
  let videoReportNFT: any;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    const VideoReportNFT = await ethers.getContractFactory("VideoReportNFT");
    videoReportNFT = await VideoReportNFT.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await videoReportNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await videoReportNFT.name()).to.equal("VideoReportNFT");
      expect(await videoReportNFT.symbol()).to.equal("VRNFT");
    });
  });

  describe("Minting", function () {
    it("Should mint a new token and emit event", async function () {
      const videoURI = "ipfs://QmExample";
      
      await expect(videoReportNFT.mintVideoToken(addr1.address, videoURI))
        .to.emit(videoReportNFT, "VideoTokenMinted")
        .withArgs(addr1.address, 0, videoURI);
      
      expect(await videoReportNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await videoReportNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should store video data correctly", async function () {
      const videoURI = "ipfs://QmExample";
      
      await videoReportNFT.mintVideoToken(addr1.address, videoURI);
      
      const videoData = await videoReportNFT.getVideoData(0);
      expect(videoData.videoURI).to.equal(videoURI);
      expect(videoData.timestamp).to.be.greaterThan(0);
    });
  });

  describe("ETH handling", function () {
    it("Should receive ETH during minting", async function () {
      const mintValue = ethers.parseEther("0.1");
      const videoURI = "ipfs://QmExample";
      
      await videoReportNFT.mintVideoToken(addr1.address, videoURI, { value: mintValue });
      
      expect(await ethers.provider.getBalance(await videoReportNFT.getAddress())).to.equal(mintValue);
    });

    it("Should allow owner to withdraw ETH", async function () {
      const mintValue = ethers.parseEther("0.1");
      const videoURI = "ipfs://QmExample";
      
      await videoReportNFT.mintVideoToken(addr1.address, videoURI, { value: mintValue });
      
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      await videoReportNFT.withdraw();
      
      // Owner should have received the ETH (ignoring gas costs)
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
      
      // Contract balance should be 0
      expect(await ethers.provider.getBalance(await videoReportNFT.getAddress())).to.equal(0);
    });

    it("Should not allow non-owners to withdraw", async function () {
      const mintValue = ethers.parseEther("0.1");
      const videoURI = "ipfs://QmExample";
      
      await videoReportNFT.mintVideoToken(addr1.address, videoURI, { value: mintValue });
      
      await expect(videoReportNFT.connect(addr1).withdraw()).to.be.revertedWithCustomError(
        videoReportNFT,
        "OwnableUnauthorizedAccount"
      );
    });
  });
}); 