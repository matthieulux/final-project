Design patterns implemented:

In this application, I have used a circuit breaker which gives the ability for the admin of the Delivery contract to toggle between a safe mode initialized by default and an emergency mode which should block deposit and withdrawal (in the case of this applicaiton buying or selling baskets).

There is a unit test of the toggle in TestDelivery.sol