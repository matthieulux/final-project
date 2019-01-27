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
        var balance = web3.fromWei(data[i].price, 'ether');
        basketTemplate.find('.basket-ethprice').text(balance);
        basketTemplate.find('.basket-price').text(data[i].price);
        basketTemplate.find('.btn-buy').attr('data-id', data[i].id);
        basketTemplate.find('.btn-ship').attr('data-id', data[i].id);
        basketTemplate.find('.btn-receive').attr('data-id', data[i].id);

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

    $.getJSON('Delivery.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var DeliveryArtifact = data;
      App.contracts.Delivery = TruffleContract(DeliveryArtifact);
    
      // Set the provider for our contract
      App.contracts.Delivery.setProvider(App.web3Provider);

      var deliveryInstance;
      App.contracts.Delivery.deployed().then(function(instance) {
        deliveryInstance = instance;
        console.log(deliveryInstance);

        // create baskets in the smart contract
        //App.handleAdd();

        // sets the proof of provenance
        //deliveryInstance.notarize(i);

      }).catch(function(err) {
        console.log(err.message);
      });
    
      // Use our contract to retrieve and mark the baskets sold
      return App.markSold();

      

    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-sell', App.handleSell);
    $(document).on('click', '.btn-view', App.handleView);
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('click', '.btn-ship', App.handleShip);
    $(document).on('click', '.btn-receive', App.handleReceive);
    $(document).on('click', '.btn-certify', App.handleCertify);
  },

  markSold: function(buyers, account) {
    var deliveryInstance;
    
    App.contracts.Delivery.deployed().then(function(instance) {
      deliveryInstance = instance;

      return deliveryInstance.getBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          
          // Marking the basket as sold
          $('.panel-basket').find("button[id='btn-buy']").eq(i).text('Sold').attr('disabled', true);
          
          // Updating the status of the pointer
          $("span[id='FOR_SALE']").eq(i).removeClass("fa fa-circle");
          $("span[id='FOR_SALE']").eq(i).addClass("fa fa-circle-o");
          $("span[id='SOLD']").eq(i).addClass("fa fa-circle");

         
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  markShipped: function(buyers, account) {
    var deliveryInstance;
    
    App.contracts.Delivery.deployed().then(function(instance) {
      deliveryInstance = instance;

      return deliveryInstance.getBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          
          // Marking the basket as sold
          $('.panel-status').find("button[id='btn-ship']").eq(i).text('Shipped').attr('disabled', true);
          
          // Updating the status of the pointer
          $("span[id='SOLD']").eq(i).removeClass("fa fa-circle");
          $("span[id='SOLD']").eq(i).addClass("fa fa-circle-o");
          $("span[id='SHIPPED']").eq(i).addClass("fa fa-circle");
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  markReceived: function(buyers, account) {
    var deliveryInstance;

    var basketId;
    
    App.contracts.Delivery.deployed().then(function(instance) {
      deliveryInstance = instance;

      return deliveryInstance.getBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          
          // Marking the basket as received
          basketId = i;
          $('.panel-status').find("button[id='btn-receive']").eq(i).text('Received').attr('disabled', true);
          
          // Updating the status of the pointer
          $("span[id='SHIPPED']").eq(i).removeClass("fa fa-circle");
          $("span[id='SHIPPED']").eq(i).addClass("fa fa-circle-o");
          $("span[id='RECEIVED']").eq(i).addClass("fa fa-circle");
        }
      }
    }).then(function() {
      // check the provenance
      console.log("check the provenance now");
      //$('.basket-proof').eq(i).text('valid');
      return deliveryInstance.checkProvenance(basketId);
    }).then(function(result) {
      // update the provenance
      console.log("update the provenance status");
      if (result == true) {
        $('.basket-proof').eq(basketId).text('valid');  
      } else {
        $('.basket-proof').eq(basketId).text('invalid');
      }
      return;
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  /*
  markCertified: function(buyers, account) {
    var deliveryInstance;
    
    App.contracts.Delivery.deployed().then(function(instance) {
      deliveryInstance = instance;

      return deliveryInstance.getBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          
          // Marking the provenance of the basket as certified
          $('.panel-basket').find("button[id='btn-certify']").eq(i).text('Certified').attr('disabled', true);
          
          // Updating the status of the pointer
          $("i[id='proof']").eq(i).addClass("fa fa-check-square-o");
          
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },*/

  handleView: function(event) {
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
        console.log("View the basket");
        console.log(basketId);
        for (i = 0; i < 4; i++) {
        var basketContent = $('.panel-title').eq(i).text();
          console.log(basketContent);
        }

        return deliveryInstance.fetchBasket(0, {from: account});
      }).then(function(result) {
        return console.log(result);
      }).then(function(result) {
        return deliveryInstance.fetchBasket(1, {from: account});
      }).then(function(result) {
        return console.log(result);
      }).then(function(result) {
        return deliveryInstance.fetchBasket(2, {from: account});
      }).then(function(result) {
        return console.log(result);
      }).then(function(result) {
        return deliveryInstance.fetchBasket(3, {from: account});
      }).then(function(result) {
        return console.log(result);
      }).then(function(result) {
        return deliveryInstance.fetchBasket(4, {from: account});
      }).then(function(result) {
        return console.log(result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleSell: function(event) {
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
        
        console.log("Basket I add:");
        var name = $('.panel-title').eq(basketId).text();
        var price = parseInt($('.basket-price').eq(basketId).text());
        console.log(name);
        console.log(price);
        
        deliveryInstance.addBasket(name, price, {from: account});
      }).then(function(result) {
        return;
      }).catch(function(err) {
        console.log(err.message);
      });
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
        console.log(basketId);
        console.log(deliveryInstance);
        console.log(deliveryInstance.fetchBasket(basketId, {from: account}));

        //var basketPrice = deliveryInstance.getBasketPrice(basketId);
        var basketPrice = $('.basket-price').eq(basketId).text();
        var basketContent = $('.panel-title').eq(basketId).text();
        console.log("Price before I buy");
        console.log(basketPrice);
        console.log(basketContent);

        // Execute purchase as a transaction by sending account
        return deliveryInstance.buy(basketId, {from: account, value: basketPrice});
      }).then(function(result) {
        return App.markSold();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleShip: function(event) {
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
        console.log(basketId);
        // Execute purchase as a transaction by sending account
        return deliveryInstance.shipBasket(basketId, {from: account});
      }).then(function(result) {
        return App.markShipped();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleAdd: function() {
    
    var deliveryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Delivery.deployed().then(function(instance) {
        deliveryInstance = instance;

        // Load baskets.
      $.getJSON('../baskets.json', function(data) {
        var basketsRow = $('#basketsRow');
        var basketTemplate = $('#basketTemplate');

          // add each basket to the list
          for (i = 0; i < data.length; i ++) {
            var name = data[i].name;
            var price = parseInt(data[i].price);
            console.log(name);
            console.log(price);
            
            deliveryInstance.addBasket(name, price, {from: account});
          }
          
        })
      }).then(function(result) {
        return App.markSold();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleReceive: function(event) {
    event.preventDefault();

    var deliveryInstance;
    

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var basketId = parseInt($(event.target).data('id'));

      App.contracts.Delivery.deployed().then(function(instance) {
        deliveryInstance = instance;
        console.log(basketId);

        // Buyer receives the basket and verifies the proof of provenance
        return deliveryInstance.receiveBasket(basketId, {from: account});

      }).then(function(result) {
        return App.markReceived();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleCertify: function(event) {
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
        console.log(basketId);

        // Buyer receives the basket and verifies the proof of provenance
        return deliveryInstance.notarize(basketId, {from: account});
      }).then(function(result) {
        console.log("change the button");
        // Marking the provenance of the basket as certified
        $('.panel-basket').eq(basketId).find("button[id='btn-certify']").text('Certified').attr('disabled', true);
          
        console.log("add the mark");
        // Updating the status of the pointer
        $("i[id='proof']").eq(basketId).addClass("fa fa-check-square-o");
        //return App.markCertified();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
  
  /*
  updateStatus: function(event) {
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
  */

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
