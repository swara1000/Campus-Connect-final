import PeerLearning from "../models/PeerLearning.js";

// GET ALL PEER LEARNING REQUESTS
export const getPeerLearningRequests = async (req, res) => {
  try {
    const requests = await PeerLearning.find()
      .populate(
        "requestedBy",
        "name email department year"
      )
      .populate(
        "acceptedBy",
        "name email department year"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get peer learning requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch peer learning requests",
    });
  }
};

// GET ONE REQUEST
export const getPeerLearningRequestById = async (
  req,
  res
) => {
  try {
    const request =
      await PeerLearning.findById(req.params.id)
        .populate(
          "requestedBy",
          "name email department year"
        )
        .populate(
          "acceptedBy",
          "name email department year"
        );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Peer learning request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch peer learning request",
    });
  }
};

// CREATE REQUEST - STUDENT
export const createPeerLearningRequest = async (req, res) => {
  try {
    console.log("========== PEER LEARNING CREATE ==========");
    console.log("BODY:", req.body);
    console.log("USER:", req.user?._id);
    console.log(
      "COLLECTION:",
      PeerLearning.collection.name
    );

    const {
      title,
      subject,
      description,
      skillLevel,
      preferredMode,
      preferredTime,
    } = req.body;

    if (!title || !subject) {
      return res.status(400).json({
        success: false,
        message: "Title and subject are required",
      });
    }

    const request = await PeerLearning.create({
      title,
      subject,
      description: description || "",
      skillLevel: skillLevel || "Beginner",
      preferredMode: preferredMode || "Either",
      preferredTime: preferredTime || "Flexible",
      requestedBy: req.user._id,
      status: "Open",
    });

    console.log("SAVED REQUEST:", request);
    console.log("SAVED ID:", request._id);
    console.log("==========================================");

    return res.status(201).json({
      success: true,
      message: "Peer learning request created",
      collection: PeerLearning.collection.name,
      request,
    });
  } catch (error) {
    console.error("CREATE PEER LEARNING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create peer learning request",
      error: error.message,
    });
  }
};

// ACCEPT REQUEST - STUDENT
// ACCEPT PEER LEARNING REQUEST
export const acceptPeerLearningRequest = async (req, res) => {
  try {
    console.log("========== ACCEPT PEER REQUEST ==========");
    console.log("Request ID:", req.params.id);
    console.log("Logged in user:", req.user?._id);

    const request = await PeerLearning.findById(req.params.id);

    console.log("Found request:", request);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Peer learning request not found",
      });
    }

    if (request.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    if (
      request.requestedBy.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot accept your own request",
      });
    }

    request.acceptedBy = req.user._id;
    request.status = "Accepted";

    await request.save();

    console.log("Request accepted successfully");
    console.log("Accepted by:", req.user._id);

    const populatedRequest = await PeerLearning.findById(
      request._id
    )
      .populate(
        "requestedBy",
        "name email department year"
      )
      .populate(
        "acceptedBy",
        "name email department year"
      );

    return res.status(200).json({
      success: true,
      message: "Peer learning request accepted",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "ACCEPT PEER LEARNING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to accept request",
      error: error.message,
    });
  }
};

// CANCEL OWN REQUEST
export const cancelPeerLearningRequest = async (
  req,
  res
) => {
  try {
    const request =
      await PeerLearning.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Peer learning request not found",
      });
    }

    if (
      request.requestedBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can cancel only your own request",
      });
    }

    request.status =
      "Cancelled";

    await request.save();

    return res.status(200).json({
      success: true,
      message:
        "Peer learning request cancelled",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel request",
    });
  }
};