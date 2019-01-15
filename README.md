# Matt's decentralised veggie delivery

Created by Matt Lux for the *ConsenSys Academy 2018*.

This final project models a simple delivery system between a seller of organic vegetable box and buyers, with a proof of provenance for the buyer.

Payment are accepted in Ether on the platform and automatically triggered upon receipt of the veggie basket.


Personas of the DApp are:
1. Seller of organic veggie baskets
2. Buyer(s) of the baskets

User stories implemented are:
1. As a Seller, I can create a new basket so that I can sell it
2. As a Seller, I can notarise its provenance (proof of existence) so that I can be verified later on by the Buyer
3. As a Seller, I can ship a basket that's been paid by a the seller
4. As a Seller, I can accept a payment for the basket from the seller
5. As a Buyer, I can buy a basket so that I can receive it
6. As a Buyer, I can receive a basket so that I can check its provenance

Optional
6. As a Seller/Buyer, I can log in the application using my uPort profile so that I can see a differentiated landing page with resp. selling and buying options.

## Installation

Requires [Solidity 0.5.0](https://solidity.readthedocs.io/en/v0.5.0/050-breaking-changes.html) to run.

```bash
npm install truffle -g
```

## Usage

A web interface using a lite-server can be used to interact with the DApp. Follwoing steps are requires to run the DApp locally:

- [Ganache](https://truffleframework.com/ganache) must be running locally using port 7545 (default)
configured using localSTarting 
- [Metamask](https://metamask.io/) is required to interact with the contracts and connect to custom RPC 127.0.0.1:7545

Launches locally from the root of the folder using

```bash
npm run dev
```

## Evaluating
Development was test-driven and can be evaluated running the command:

```bash
truffle test
```

As a new Ethereum developer, feedback is more than welcome!

## Future Evolution
The following features were identified to reach a minimum viable product:
- Integration with uPort to manage authentication and sharing of credentials
- Linkage with asset tracking method embedded in the physical basket to connect physical assset to digital representation on the ledger e.g., using RFID tag.

## License
[MIT](https://choosealicense.com/licenses/mit/)