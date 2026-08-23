import PeerLearning from "../models/PeerLearning.js";

/* =====================================================
   ADMIN CHECK
===================================================== */

const ensureAdmin = (req, res) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return false;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message:
        "Only administrators can perform this action",
    });

    return false;
  }

  return true;
};

/* =====================================================
   GET ALL PEER LEARNING REQUESTS
===================================================== */

export const getPeerLearningRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await PeerLearning.find()
        .populate(
          "requestedBy",
          "name email department year studentId"
        )
        .populate(
          "acceptedBy",
          "name email department year studentId"
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

/* =====================================================
   GET ONE REQUEST
===================================================== */

export const getPeerLearningRequestById =
  async (req, res) => {
    try {
      const request =
        await PeerLearning.findById(
          req.params.id
        )
          .populate(
            "requestedBy",
            "name email department year studentId"
          )
          .populate(
            "acceptedBy",
            "name email department year studentId"
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
      console.error(
        "Get peer learning request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch peer learning request",
      });
    }
  };

/* =====================================================
   CREATE REQUEST - STUDENT
===================================================== */

export const createPeerLearningRequest =
  async (req, res) => {
    try {
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
          message:
            "Title and subject are required",
        });
      }

      const request =
        await PeerLearning.create({
          title: title.trim(),

          subject:
            subject.trim(),

          description:
            description?.trim() ||
            "",

          skillLevel:
            skillLevel ||
            "Beginner",

          preferredMode:
            preferredMode ||
            "Either",

          preferredTime:
            preferredTime ||
            "Flexible",

          requestedBy:
            req.user._id,

          status: "Open",
        });

      const populatedRequest =
        await PeerLearning.findById(
          request._id
        ).populate(
          "requestedBy",
          "name email department year studentId"
        );

      return res.status(201).json({
        success: true,
        message:
          "Peer learning request created",
        request:
          populatedRequest,
      });
    } catch (error) {
      console.error(
        "Create peer learning request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create peer learning request",
      });
    }
  };

/* =====================================================
   ACCEPT REQUEST - STUDENT
===================================================== */

/*
  This endpoint is for a STUDENT accepting
  another student's peer-learning request.

  Do not use this endpoint from the admin module.
*/

export const acceptPeerLearningRequest =
  async (req, res) => {
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

      if (request.status !== "Open") {
        return res.status(400).json({
          success: false,
          message:
            `Request is already ${request.status}`,
        });
      }

      if (
        request.requestedBy.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot accept your own request",
        });
      }

      request.acceptedBy =
        req.user._id;

      request.status =
        "Accepted";

      await request.save();

      const populatedRequest =
        await PeerLearning.findById(
          request._id
        )
          .populate(
            "requestedBy",
            "name email department year studentId"
          )
          .populate(
            "acceptedBy",
            "name email department year studentId"
          );

      return res.status(200).json({
        success: true,
        message:
          "Peer learning request accepted",
        request:
          populatedRequest,
      });
    } catch (error) {
      console.error(
        "Accept peer learning request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to accept request",
      });
    }
  };

/* =====================================================
   ADMIN APPROVE REQUEST
===================================================== */

export const adminApprovePeerLearningRequest =
  async (req, res) => {
    try {
      if (!ensureAdmin(req, res)) {
        return;
      }

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
        request.status !== "Open"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Only open requests can be approved. Current status: ${request.status}`,
        });
      }

      /*
        IMPORTANT:

        The administrator is approving the request,
        not becoming the peer-learning partner.

        Therefore we DO NOT set:

          acceptedBy = req.user._id

        acceptedBy stays null until a student
        actually accepts the peer-learning request.
      */

      request.status =
        "Accepted";

      await request.save();

      const populatedRequest =
        await PeerLearning.findById(
          request._id
        )
          .populate(
            "requestedBy",
            "name email department year studentId"
          )
          .populate(
            "acceptedBy",
            "name email department year studentId"
          );

      console.log(
        "========================================"
      );

      console.log(
        "ADMIN APPROVED PEER LEARNING REQUEST"
      );

      console.log(
        "Request ID:",
        request._id.toString()
      );

      console.log(
        "Student:",
        populatedRequest
          ?.requestedBy
          ?.name
      );

      console.log(
        "Admin:",
        req.user.name ||
          req.user.email
      );

      console.log(
        "========================================"
      );

      return res.status(200).json({
        success: true,
        message:
          "Learning request approved",
        request:
          populatedRequest,
      });
    } catch (error) {
      console.error(
        "Admin approve peer learning request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to approve learning request",
      });
    }
  };

/* =====================================================
   ADMIN REJECT REQUEST
===================================================== */

export const adminRejectPeerLearningRequest =
  async (req, res) => {
    try {
      if (!ensureAdmin(req, res)) {
        return;
      }

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
        request.status !==
        "Open"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Only open requests can be rejected. Current status: ${request.status}`,
        });
      }

      /*
        There is no separate "Rejected" enum
        in the current schema.

        Therefore we use the existing
        "Cancelled" status to represent an
        admin rejection.
      */

      request.status =
        "Cancelled";

      /*
        A request rejected by admin should
        never have an acceptedBy student.
      */

      request.acceptedBy =
        null;

      await request.save();

      const populatedRequest =
        await PeerLearning.findById(
          request._id
        )
          .populate(
            "requestedBy",
            "name email department year studentId"
          )
          .populate(
            "acceptedBy",
            "name email department year studentId"
          );

      console.log(
        "========================================"
      );

      console.log(
        "ADMIN REJECTED PEER LEARNING REQUEST"
      );

      console.log(
        "Request ID:",
        request._id.toString()
      );

      console.log(
        "Student:",
        populatedRequest
          ?.requestedBy
          ?.name
      );

      console.log(
        "Admin:",
        req.user.name ||
          req.user.email
      );

      console.log(
        "========================================"
      );

      return res.status(200).json({
        success: true,
        message:
          "Learning request rejected",
        request:
          populatedRequest,
      });
    } catch (error) {
      console.error(
        "Admin reject peer learning request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to reject learning request",
      });
    }
  };

/* =====================================================
   CANCEL OWN REQUEST - STUDENT
===================================================== */

export const cancelPeerLearningRequest =
  async (req, res) => {
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

      if (
        request.status !==
        "Open"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Only open requests can be cancelled. Current status: ${request.status}`,
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
      console.error(
        "Cancel peer learning request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel request",
      });
    }
  };