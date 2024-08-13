const asyncHandler = require('express-async-handler');
const tradeleadModel = require('../models/tradeleadModel');



exports.getAllRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const tradeleads = await tradeleadModel.find({});

  let requests = [];
  for (let tradelead of tradeleads) {
      if (tradelead.userId.toString() !== userId.toString()) {
          for (let request of tradelead.requests) {
              requests.push(request);
          }
      }
  }

  requests.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.status(200).json({ success: true, requests });
});




exports.getUserRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    const tradelead = await tradeleadModel.findOne({ userId });

    let requests = [];
    if(tradelead)
      requests = tradelead.requests;

    requests.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({ success: true, requests});
});



exports.getRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user._id;
  
    const tradelead = await tradeleadModel.findOne({ userId });
    if (!tradelead) {
      res.status(404);
      throw new Error('Tradelead not found');
    }

    const request = tradelead.requests.id(requestId);
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }
  
    res.status(200).json({ success: true, request });
});



exports.postRequest = asyncHandler(async (req, res) => {
  const { title, description, category, budget, duration, expiryDate } = req.body;
  const userId = req.user._id;

  let tradelead = await tradeleadModel.findOne({ userId });

  if (!tradelead) {
    tradelead = new tradeleadModel({ userId, requests: [] });
  }

  const newRequest = {
    title,
    description,
    category,
    budget,
    duration,
    expiryDate
  };

  tradelead.requests.push(newRequest);
  await tradelead.save();

  res.status(201).json({ success: true, message: 'Request posted successfully', request: newRequest });
});



exports.editRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { title, description, category, budget, duration, expiryDate } = req.body;
    const userId = req.user._id;
  
    const tradelead = await tradeleadModel.findOne({ userId });
    if (!tradelead) {
      res.status(404);
      throw new Error('Tradelead not found');
    }
  
    const request = tradelead.requests.id(requestId);
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }
  
    request.title = title || request.title;
    request.description = description || request.description;
    request.category = category || request.category;
    request.budget = budget || request.budget;
    request.duration = duration || request.duration;
    request.expiryDate = expiryDate || request.expiryDate;
  
    await tradelead.save();
    res.status(200).json({ success: true, message: 'Request updated successfully' });
});



exports.deleteRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user._id;

    const tradelead = await tradeleadModel.findOne({ userId });
    if (!tradelead) {
        res.status(404);
        throw new Error('Tradelead not found');
    }

    const requestIndex = tradelead.requests.findIndex(req => req._id.toString() === requestId);
    if (requestIndex === -1) {
        res.status(404);
        throw new Error('Request not found');
    }

    tradelead.requests.splice(requestIndex, 1);
    await tradelead.save();
    res.status(200).json({ success: true, message: 'Request deleted successfully' });
});




exports.getRequestOffers = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const tradelead = await tradeleadModel.findOne({ userId }).populate('requests.offers.sellerId'); 

  if (!tradelead) {
      res.status(404);
      throw new Error('Tradelead not found');
  }

  const request = tradelead.requests.id(requestId);
  if (!request) {
      res.status(404);
      throw new Error('Request not found');
  }

  const offers = request.offers.filter(offer => offer.sellerId._id.toString() !== userId.toString());

  res.status(200).json({ success: true, offers: offers.reverse() });
});



exports.postOffer = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { coverLetter, price, duration } = req.body;
    const userId = req.user._id;
  
    const tradeleads = await tradeleadModel.find();
    let targetRequest = null;
    for (let tradelead of tradeleads) {
      const request = tradelead.requests.id(requestId);
      if (request) {
        targetRequest = request;
        break;
      }
    }
  
    if (!targetRequest) {
      res.status(404);
      throw new Error('Request not found');
    }
  
    const existingOffer = targetRequest.offers.find(offer => offer.sellerId.toString() === userId.toString());
    if (existingOffer) {
      res.status(400);
      throw new Error('You have already made an offer for this request');
    }
  
    const newOffer = {
      sellerId: userId,
      coverLetter,
      price,
      duration
    };
  
    targetRequest.offers.push(newOffer);
    await targetRequest.parent().save();
  
    res.status(201).json({ success: true, message: 'Offer posted successfully', offer: newOffer });
});



exports.editOffer = asyncHandler(async (req, res) => {
    const { requestId, offerId } = req.params;
    const { coverLetter, price, duration } = req.body;
    const userId = req.user._id;
  
    const tradeleads = await tradeleadModel.find();
    let targetRequest = null;
    let targetOffer = null;
    for (let tradelead of tradeleads) {
      const request = tradelead.requests.id(requestId);
      if (request) {
        targetRequest = request;
        targetOffer = request.offers.id(offerId);
        break;
      }
    }
  
    if (!targetRequest || !targetOffer) {
      res.status(404);
      throw new Error('Request or offer not found');
    }
  
    if (targetOffer.sellerId.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('You are not authorized to edit this offer');
    }
  
    targetOffer.coverLetter = coverLetter || targetOffer.coverLetter;
    targetOffer.price = price || targetOffer.price;
    targetOffer.duration = price || targetOffer.duration;
  
    await targetRequest.parent().save();
    res.status(200).json({ success: true, message: 'Offer updated successfully' });
});



exports.deleteOffer = asyncHandler(async (req, res) => {
  const { requestId, offerId } = req.params;
  const userId = req.user._id;

  const tradelead = await tradeleadModel.findOne({
      "requests._id": requestId,
      "requests.offers._id": offerId
  });

  if (!tradelead) {
      res.status(404);
      throw new Error('Request or offer not found');
  }

  const targetRequest = tradelead.requests.id(requestId);
  const targetOffer = targetRequest.offers.id(offerId);

  if (targetOffer.sellerId.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('You are not authorized to delete this offer');
  }

  targetRequest.offers.pull(offerId);
  await tradelead.save();

  res.status(200).json({ success: true, message: 'Offer deleted successfully' });
});




exports.getSellerOffers = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const tradeleads = await tradeleadModel.find();
    const offers = [];
    for (let tradelead of tradeleads) {
        for (let request of tradelead.requests) {
            for (let offer of request.offers) {
                if (offer.sellerId.toString() === userId.toString()) {
                    offers.push({
                        requestId: request._id,
                        ...offer.toObject()
                    });
                }
            }
        }
    }
    
    res.status(200).json({ success: true, offers: offers.reverse() });
});