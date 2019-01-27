pragma solidity ^0.5.0;

contract Delivery {

  /* Owner of the contract */
  address owner;
  
  /* Name of the farm (used for the verification of the provenance)

  Later on this ought to be replaced by a the public key of an RFID tag
  attached to the basket and compare the hash of that key registered by
  the seller against the hash of that same key retrieved by the buyer when scanning the basket.
  */
  string farmName = "Matt's Organic Delivery Baskets";

  /* List of the buyers */
  address[16] public buyers;

  /* variable to track the most recent sku # */
  uint private skuCount;

  // public mapping that maps the SKU (a number) to a basket.
  mapping (uint => Basket) public items;

  /* enum called State with 4 states
    ForSale
    Sold
    Shipped
    Received
  */
  enum State {ForSale, Sold, Shipped, Received}
  State enumState;

  /* struct named Basket.
  */
  struct Basket {
    string name; // Organic Basket basket
    uint sku; // number of the basket sold on the platform
    uint price; //price of the basked
    State state; // status of delivery
    string longitude; // coordinates of the farm
    string latitude;
    bytes32 provenance; //proof of provenance build from the longitude and latitude set by the seller
    address payable seller;
    address payable buyer; 
  }

  /* Create 4 events with the same name as each possible State (see above)
    Each event should accept one argument, the sku*/
  event ForSale(uint sku);
  event Sold(uint sku);
  event Shipped(uint sku);
  event Received(uint sku);

/* Modifers that verify the integrity of transactions */
  modifier verifySender (address _address) {require (owner == _address, "The sender is the owner"); _;}
  modifier verifyCaller (address _address) {require (msg.sender == _address, "The sender is the caller"); _;}
  modifier paidEnough(uint _price) {require(msg.value >= _price, "not paid enough"); _;}
  modifier checkValue(uint _sku) {
    //refund them after pay for item (why it is before, _ checks for logic before func)
    _;
    uint _price = items[_sku].price;
    uint amountToRefund = msg.value - _price;    
    //items[_sku].buyer.transfer(amountToRefund);
  }

  /* Modifiers called to verify different statuses of the basket */
  modifier forSale(uint _sku) {require(items[_sku].state == State.ForSale, "Basket for sale"); _;}
  modifier sold(uint _sku) {require(items[_sku].state == State.Sold, "Basket is sold"); _;}
  modifier shipped(uint _sku) {require(items[_sku].state == State.Shipped, "Basket shipped"); _;}
  modifier received(uint _sku) {require(items[_sku].state == State.Received, "Basket received"); _;}

  constructor() public {
    /* Here, set the owner as the person who instantiated the contract
       and set your skuCount to 0. */
    owner = msg.sender;
    skuCount = 0;
  }

  function getOwner() public view returns(address) {
    /* get the owner attribute */
    return owner;
  }

  function addBasket(string memory _name, uint _price) public returns(bool) {
    emit ForSale(skuCount);
    items[skuCount] = Basket( {
      name: _name,
      sku: skuCount,
      price: _price,
      state: State.ForSale,
      longitude: "0",
      latitude: "0",
      provenance: 0,
      seller: msg.sender,
      buyer: 0x0000000000000000000000000000000000000000});
    skuCount = skuCount + 1;
    return true;
  }

  /* transfer money to the seller, set the buyer as the person who called this transaction, and set the state
    to Sold. */

  function buyBasket(uint sku)
    public
    payable
    forSale(skuCount)
    paidEnough(items[sku].price)
    checkValue(sku)
  {
    items[sku].seller.transfer(items[sku].price);
    items[sku].buyer = msg.sender;
    items[sku].state = State.Sold;
    emit Sold(sku);
  }

  // Retrieving the buyers
  function getBuyers() public view returns (address[16] memory) {
    return buyers;
  }

  function buy(uint basketId) public payable returns (uint) {
    require(basketId >= 0 && basketId <= 3, "This basket does not exist");
    require(msg.value >= items[basketId].price, "Not paid enough to buy this basket");

    buyers[basketId] = msg.sender;

    // Effect the money transfer
    buyBasket(basketId);

    return basketId;
  }

  /* Add 2 modifiers to check if the item is sold already, and that the person calling this function
  is the seller. Change the state of the item to shipped. Remember to call the event associated with this function!*/
  function shipBasket(uint sku)
    public
    sold(sku)
    verifyCaller(msg.sender)
  {
    items[sku].state = State.Shipped;
    emit Shipped(sku);
  }

  /* Marks the basket as received at the end of the delivery */
  function receiveBasket(uint sku)
    public
    shipped(sku)
    verifyCaller(msg.sender)
  {
    items[sku].state = State.Received;
    emit Received(sku);
  }

  // Get the elements of a basket
  function fetchBasket(uint _sku) public view returns (
      string memory name,
      uint sku,
      uint price,
      uint state,
      string memory longitude,
      string memory latitude,
      bytes32 provenance,
      address seller,
      address buyer)
  {
    name = items[_sku].name;
    sku = items[_sku].sku;
    price = items[_sku].price;
    state = uint(items[_sku].state);
    longitude = items[_sku].longitude;
    latitude = items[_sku].latitude;
    provenance = items[_sku].provenance;
    seller = items[_sku].seller;
    buyer = items[_sku].buyer;
    return (name, sku, price, state, longitude, latitude, provenance, seller, buyer);
  }

  // Get the price of a basket
  function getBasketPrice(uint _sku) public view returns (uint price) {
    price = items[_sku].price;
    return (price);
  }

  // Proof of Provenance (PoP) section
  //mapping (bytes32 => bool) private proofs;
  
  // store a proof of provenance in the basket
  function storeProof(uint sku, bytes32 proof) public {
    items[sku].provenance = proof;
    //proofs[proof] = true;
  }
  
  // calculate and store the proof of provenance of a basket
  // NB: only the basket seller can notarize the provenance
  function notarize(uint sku)
    public
    verifyCaller(msg.sender)
  {
    bytes32 proof = proofFor(sku);
    storeProof(sku, proof);
  }
  
  // helper function to get the farm name's sha256
  // It can be recorded only by the seller but verified by the buyer
  // for a given sellet all its baskets have the same proof of provenance
  // which is a hash of the name of the farm where the basket was produced
  function proofFor(uint sku) view public returns (bytes32) {
    //return sha256(abi.encodePacked(items[sku].longitude, items[sku].latitude));
    return sha256(abi.encodePacked(farmName));
  }
  
  // check if the location of a basket has been notarized
  function checkProvenance(uint sku) view public returns (bool) {
    bytes32 proof = proofFor(sku);
    return hasProof(sku, proof);
  }

  // returns true if proof is stored
  function hasProof(uint sku, bytes32 proof) view public returns(bool) {
    return items[sku].provenance == proof;
  }

}
