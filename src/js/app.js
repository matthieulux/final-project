App = {
  web3Provider: null,
  contracts: {},

  init: async function() {

    // Load baskets.
    $.getJSON('../baskets.json', function(data) {
      var basketsRow = $('#basketsRow');
      var basketTemplate = $('#basketTemplate');

      for (i = 0; i < data.length; i ++) {
        basketTemplate.find('.panel-title').text(data[i].name);
        basketTemplate.find('img').attr('src', data[i].picture);
        basketTemplate.find('.basket-content').text(data[i].content);
        basketTemplate.find('.basket-provenance').text(data[i].provenance);
        basketTemplate.find('.basket-price').text(data[i].price);
        basketTemplate.find('.btn-buy').attr('data-id', data[i].id);

        basketsRow.append(basketTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    
    /*
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markSold();
    });
    */

    $.getJSON('Delivery.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var DeliveryArtifact = data;
      App.contracts.Delivery = TruffleContract(DeliveryArtifact);
    
      // Set the provider for our contract
      App.contracts.Delivery.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the baskets sold
      return App.markSold();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
  },

  markSold: function(buyers, account) {
    var deliveryInstance;
    console.log(window.web3.currentProvider);
    console.log(App.contracts.Delivery);
    console.log(App.contracts.Delivery.deployed());
    
    App.contracts.Delivery.deployed().then(function(instance) {
      deliveryInstance = instance;
      console.log(deliveryInstance);

      return deliveryInstance.getBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-basket').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  handleBuy: function(event) {
    event.preventDefault();

    var basketId = parseInt($(event.target).data('id'));

    var deliveryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Delivery.deployed().then(function(instance) {
        deliveryInstance = instance;

        // Execute purchase as a transaction by sending account
        return deliveryInstance.buy(basketId, {from: account});
      }).then(function(result) {
        return App.markSold();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
