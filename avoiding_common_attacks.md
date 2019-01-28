This document explains what measures I took to ensure that my contracts are not susceptible to common attacks.

In the function where a user buys a basket:

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

I have added modifiers to avoid the actual transfer of funds
items[sku].seller.transfer(items[sku].price);
to be executed only if all conditions are met and with the possibility of a refund uding the modifier checkValue(sku)

Other measures are that I do not accept any sort of user input, all required data is included in a JSON file to describe the content and price of the baskets.