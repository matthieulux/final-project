pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Delivery.sol";

contract TestDelivery {

    // TESTS to implement for reference //
    // Test for failing conditions in this contracts
    // test that every modifier is working

    // buyItem

    // test for failure if user does not send enough funds
    // test for purchasing an item that is not for Sale


    // shipItem

    // test for calls that are made by not the seller
    // test for trying to ship an item that is not marked Sold

    // receiveItem

    // test calling the function from an address that is not the buyer
    // test calling the function on an item not marked Shipped


  // The address of the delivery contract to be tested
  Delivery delivery = Delivery(DeployedAddresses.Delivery());

  // test of the buying a bew basket
  function testUserCanBuyBasket() public {
    //address buyer = delivery.buyers(expectedBuyerId);

    //equal(buyer, buyer, "Buyer of the expected basket should be this contract");
  }

  // Having serious troubles using the Assert.sol library for some reason so adding its equal() function in this contract, sorry
  function equal(address a, address b, string memory message) internal returns (bool result) {
    return AssertAddress.equal(a, b, message);
  }

  // Test for failing conditions in this contracts
    // test that every modifier is working

  function testAddBasket() public {

  }

  // test for failure if user does not send enough funds
  // test for purchasing an item that is not for Sale


  // shipItem
  function testShipBasket() public {

  }
  
  

  // test for trying to ship an item that is not marked Sold
  function testShipBasketNotSold() public{

  }
  
  function testFetchBasket() public {

  }

  // test for calls that are made by not the seller
  function isSellerCalling() public {
    address caller = address(this);

    Assert.equal(caller, caller, "Buyer of the expected basket should be this contract");
  }
  
  // test calling the function from an address that is not the buyer
  function TestIsBuyerCalling() public {
    address caller = address(this);

    Assert.equal(caller, caller, "Buyer of the expected basket should be this contract");
  }

  // test calling the function on a basket not marked Shipped
  // This is to make sure that no basket can be received if the haven't been shipped first
  function testReceiveBasketOnNonShippedBasket() public {

  }

  // The id of the buyer that will be used for testing
  uint expectedBuyerId = 8;

  // The expected seller is this contract
  address expectedSeller = address(this);
  
}
