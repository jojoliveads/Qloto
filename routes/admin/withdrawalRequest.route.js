//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const WithdrawalRequestController = require("../../controllers/admin/withdrawalRequest.controller");

//get withdrawal requests ( hosts / agency )
route.get("/retrievePayoutRequests", checkAccessWithSecretKey(), WithdrawalRequestController.retrievePayoutRequests);

//accept or decline withdrawal requests ( agency )
route.patch("/updateAgencyWithdrawalStatus", checkAccessWithSecretKey(), WithdrawalRequestController.updateAgencyWithdrawalStatus);

//accept or decline withdrawal requests ( host )
route.patch("/updateHostWithdrawalStatus", checkAccessWithSecretKey(), WithdrawalRequestController.updateHostWithdrawalStatus);

module.exports = route;

