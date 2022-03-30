//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Faucet is Ownable {
  event WithDrawEvent(address indexed receiver, uint256 amount);
  event ReceiveEvent(address indexed from, uint256 amount);
  event FallbackEvent(address indexed from, uint256 amount);

  function withDraw(address payable receiver, uint256 amount) public onlyOwner {
    console.log("transfer", amount, "to", receiver);
    require(address(this).balance >= amount, "Insufficient balance");
    receiver.transfer(amount);
    emit WithDrawEvent(receiver, amount);
  }

  function getBalance() public view returns (uint256) {
    console.log("getBalance", address(this).balance);
    uint256 faucetBalance = address(this).balance;
    return faucetBalance;
  }

  receive() external payable {
    console.log("receive", msg.value, "from", msg.sender);
    emit ReceiveEvent(msg.sender, msg.value);
  }

  // Fallback function is called when msg.data is not empty
  fallback() external payable {
    console.log("fallback", msg.value, "from", msg.sender);
    // TODO: 如何解析msg.data(abi decode calldata)
    // console.log(msg.data);
    emit FallbackEvent(msg.sender, msg.value);
  }

  function destory() public onlyOwner {
    selfdestruct(payable(owner()));
  }
}
