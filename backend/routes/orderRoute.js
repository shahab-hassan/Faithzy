const express = require("express");
const upload = require("../config/multer");
const cron = require('node-cron');
const asyncHandler = require("express-async-handler");

const {
  createProductOrder,
  createServiceOrder,
  
  getBuyerProductOrders,
  getBuyerProductOrder,
  getBuyerServiceOrders,
  getBuyerServiceOrder,
  
  getSellerProductOrders,
  getSellerProductOrder,
  getSellerServiceOrders,
  getSellerServiceOrder,
  
  updateProductOrderStatus,
  cancelProductOrder,

  saveServiceOrderAnswers,

  sendExtensionRequest,
  respondToExtensionRequest,

  sendDelivery,
  respondToDelivery,

  sendCancellationRequest,
  respondToCancellation,
  
  getAllOrders

} = require("../controllers/orderCtrl");
const { authorized, authorizedRoles, authorizeAdmin } = require("../middlewares/authorization");

const router = express.Router();

router.post("/product/order", authorized, createProductOrder);
router.post("/service/order", authorized, createServiceOrder);

router.get("/admin/all", authorizeAdmin, getAllOrders);

router.get("/buyer/product/all", authorized, getBuyerProductOrders);
router.get("/buyer/product/:id", authorized, getBuyerProductOrder);
router.get("/buyer/service/all", authorized, getBuyerServiceOrders);
router.get("/buyer/service/:id", authorized, getBuyerServiceOrder);

router.get("/seller/product/all", authorized, getSellerProductOrders);
router.get("/seller/product/:id", authorized, getSellerProductOrder);
router.get("/seller/service/all", authorized, getSellerServiceOrders);
router.get("/seller/service/:id", authorized, getSellerServiceOrder);

router.put("/product/status", authorized, authorizedRoles("seller"), updateProductOrderStatus);
router.put("/product/cancel", authorized, cancelProductOrder);

router.put("/buyer/service/answers/:orderId/", authorized, saveServiceOrderAnswers);

router.put("/seller/service/extension/request/:id", authorized, sendExtensionRequest);
router.put('/buyer/service/extension/response/:id/:historyId', authorized, respondToExtensionRequest);

router.put("/seller/service/delivery/send/:id", authorized, (req, res, next) => {
  upload.array('images', 5)(req, res, function (err) {
    if (err)
      return next(err);
    sendDelivery(req, res, next);
  });
});
router.put('/buyer/service/delivery/response/:id/:historyId', authorized, respondToDelivery);

router.put("/seller/service/cancel/request/:id", authorized, sendCancellationRequest);
router.put('/buyer/service/cancel/response/:id/:historyId', authorized, respondToCancellation);

cron.schedule('* * * * *', asyncHandler(async () => {
  const now = new Date();
  const orders = await serviceOrderModel.find({ 'service.status.name': 'Active' });
  
  for (const order of orders) {
    const dueDate = new Date(order.createdAt);
    dueDate.setDate(dueDate.getDate() + order.service.pkg.deliveryDays);

    if (now > dueDate) {
      if(order.service.status[order.service.status.length - 1].name !== "Past Due"){
        order.service.status.push({ name: 'Past Due', createdAt: now });
        await order.save();
      }
    }
  }
}));

module.exports = router;