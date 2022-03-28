import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Faucet", function () {
  let owner: SignerWithAddress, addr1: SignerWithAddress;
  let faucet: Contract;
  const faucetInitBalance = ethers.utils.parseEther("1");

  // runs once before the first test in this block
  before(async () => {
    [owner, addr1] = await ethers.getSigners();
    const Faucet = await ethers.getContractFactory("Faucet");
    faucet = await Faucet.deploy();
    await faucet.deployed();
    await owner.sendTransaction({
      to: faucet.address,
      value: faucetInitBalance,
    });
  });

  it("Should accept and getBalance", async function () {
    expect(await ethers.provider.getBalance(faucet.address)).to.be.eq(
      faucetInitBalance
    );
    expect(await faucet.getBalance()).to.be.eq(faucetInitBalance);
  });

  it("Should fail if Insufficient balance", async function () {
    // 这里注意await是在expect前面的，否则会报错
    await expect(
      faucet.withDraw(addr1.address, ethers.utils.parseEther("2"))
    ).to.be.revertedWith("Insufficient balance");
  });

  it("Should fail when withDraw is not owner", async function () {
    // 这里注意await是在expect前面的，否则会报错
    await expect(
      faucet
        .connect(addr1)
        .withDraw(owner.address, ethers.utils.parseEther("0.1"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should emit WithDrawEvent", async function () {
    // 这里注意await是在expect前面的，否则会报错
    await expect(
      faucet.withDraw(addr1.address, ethers.utils.parseEther("0.1"))
    ).to.emit(faucet, "WithDrawEvent");
  });

  it("Should change balance", async function () {
    expect(
      await faucet.withDraw(addr1.address, ethers.utils.parseEther("0.1"))
    ).to.changeEtherBalances(
      [faucet, addr1.address],
      [-ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.1")]
    );
  });

  it("Should emit ReceiveEvent", async function () {
    await expect(
      owner.sendTransaction({
        to: faucet.address,
        value: faucetInitBalance,
      })
    ).to.emit(faucet, "ReceiveEvent");
  });

  it("Should emit FallbackEvent", async function () {
    await expect(
      owner.sendTransaction({
        to: faucet.address,
        value: faucetInitBalance,
        data: ethers.utils.formatBytes32String("hello world"),
      })
    ).to.emit(faucet, "FallbackEvent");
  });

  it("Should fail it destory is not owner", async function () {
    await expect(faucet.connect(addr1).destory()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Should send eth back to owner when destory", async function () {
    const remainBalance = await ethers.provider.getBalance(faucet.address);
    expect(await faucet.destory()).to.changeEtherBalances(
      [faucet, owner.address],
      [-remainBalance, remainBalance]
    );
  });
});
