pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Delivery.sol";

contract TestDelivery {
  
  // The address of the delivery contract to be tested
  Delivery delivery = Delivery(DeployedAddresses.Delivery());

  // test that the first modifier is working
  function testVerifySenderMod() public {
    address owner = delivery.getOwner();
    Assert.notEqual(address(this), owner, "The sender is the owner");
  }

  // test that the second modifier is working
  function testVerifyCallerMod() public {
    Assert.notEqual(address(this), msg.sender, "The sender is the caller");
  }  

  // test for trying to ship an item that is not marked Sold
  function testBasketIsCorrectlyNotarized() public{
    uint basketID = 0;
    delivery.addBasket("test basket", 10);
    bytes32 proof = delivery.proofFor(basketID);
    bytes32 referenceProof = sha256(abi.encodePacked(delivery.farmName));

    Assert.equal(proof, referenceProof, "The basket has been notarized with an incorrect farm name");
  }

  /**
  Test Section of the circuit breaker
  */
  function testCircuitBreaker() public {
    delivery.toggleContractActive();
    bool status = delivery.deposit();

    Assert.equal(status, true, "Circuit breaker should be activated");
  }

  // The id of the buyer that will be used for testing
  uint expectedBuyerId = 8;

  // The expected seller is this contract
  address expectedSeller = address(this);
  
}

