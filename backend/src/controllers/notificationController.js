import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import AdminBroadcast from "../models/AdminBroadcast.js";
import User from "../models/User.js";
import ClubMembership from "../models/ClubMembership.js";

// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

export const getMyNotifications = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("eventId", "name date venue")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          recipient: req.user._id,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

export const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result =
      await Notification.updateMany(
        {
          recipient: req.user._id,
          read: false,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notifications as read",
    });
  }
};

// =====================================================
// RESOLVE AUDIENCE -> LIST OF RECIPIENT USER IDS
// =====================================================

const resolveAudienceRecipients = async (audience) => {
  if (audience === "Club members") {
    const memberships = await ClubMembership.find({
      status: "joined",
    }).distinct("student");

    return memberships;
  }

  if (audience === "Final year") {
    const students = await User.find({
      role: "student",
      status: "active",
      year: /final|4th|fourth/i,
    }).select("_id");

    return students.map((student) => student._id);
  }

  if (audience === "Faculty") {
    // The schema only distinguishes "student" and "admin" roles,
    // so faculty are represented by admin accounts.
    const admins = await User.find({
      role: "admin",
    }).select("_id");

    return admins.map((admin) => admin._id);
  }

  // Default: "All students"
  const students = await User.find({
    role: "student",
    status: "active",
  }).select("_id");

  return students.map((student) => student._id);
};

// =====================================================
// FAN A BROADCAST OUT INTO PER-USER NOTIFICATIONS
// =====================================================

const dispatchBroadcast = async (broadcast, req) => {
  const recipientIds = await resolveAudienceRecipients(
    broadcast.audience
  );

  if (recipientIds.length > 0) {
    const notifications = recipientIds.map((recipientId) => ({
      recipient: recipientId,
      type: "system",
      title: broadcast.title,
      message: broadcast.message,
      broadcastId: broadcast._id,
      read: false,
    }));

    await Notification.insertMany(notifications);

    const io = req.app.get("io");

    if (io) {
      recipientIds.forEach((recipientId) => {
        io.to(`user-${recipientId}`).emit("new-notification", {
          _id: `${broadcast._id}-${recipientId}`,
          type: "system",
          title: broadcast.title,
          message: broadcast.message,
          broadcastId: broadcast._id,
          read: false,
          createdAt: new Date(),
        });
      });
    }
  }

  broadcast.recipientCount = recipientIds.length;
  broadcast.status = "Sent";
  broadcast.sentAt = new Date();
  await broadcast.save();

  return broadcast;
};

// =====================================================
// GET ALL ADMIN BROADCASTS (ADMIN ONLY)
// GET /api/notifications/admin
// =====================================================

export const getAdminBroadcasts = async (req, res) => {
  try {
    const broadcasts = await AdminBroadcast.find().sort({
      createdAt: -1,
    });

    const broadcastIds = broadcasts.map(
      (broadcast) => broadcast._id
    );

    const readCounts = await Notification.aggregate([
      {
        $match: {
          broadcastId: { $in: broadcastIds },
          read: true,
        },
      },
      {
        $group: {
          _id: "$broadcastId",
          count: { $sum: 1 },
        },
      },
    ]);

    const readCountMap = readCounts.reduce((map, entry) => {
      map[String(entry._id)] = entry.count;
      return map;
    }, {});

    const formatted = broadcasts.map((broadcast) => ({
      ...broadcast.toObject(),
      reads: readCountMap[String(broadcast._id)] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      notifications: formatted,
    });
  } catch (error) {
    console.error("Get admin broadcasts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// =====================================================
// CREATE ADMIN BROADCAST (ADMIN ONLY)
// POST /api/notifications/admin
// Body: { title, message, audience, channel, status }
// status "Sent" dispatches immediately; "Draft" (or
// "Scheduled") is saved without recipients.
// =====================================================

export const createAdminBroadcast = async (req, res) => {
  try {
    const { title, message, audience, channel, status } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    let broadcast = await AdminBroadcast.create({
      title: title.trim(),
      message: message.trim(),
      audience: audience || "All students",
      channel: channel || "push",
      status: status === "Sent" ? "Sent" : status || "Draft",
      sentBy: req.user?._id,
    });

    if (status === "Sent") {
      broadcast = await dispatchBroadcast(broadcast, req);
    }

    return res.status(201).json({
      success: true,
      message:
        status === "Sent"
          ? "Notification sent"
          : "Notification saved",
      notification: {
        ...broadcast.toObject(),
        reads: 0,
      },
    });
  } catch (error) {
    console.error("Create admin broadcast error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

// =====================================================
// SEND AN EXISTING (DRAFT/SCHEDULED) BROADCAST NOW
// PUT /api/notifications/admin/:id/send
// =====================================================

export const sendAdminBroadcast = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    let broadcast = await AdminBroadcast.findById(id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (broadcast.status === "Sent") {
      return res.status(400).json({
        success: false,
        message: "Notification has already been sent",
      });
    }

    broadcast = await dispatchBroadcast(broadcast, req);

    return res.status(200).json({
      success: true,
      message: "Notification sent",
      notification: {
        ...broadcast.toObject(),
        reads: 0,
      },
    });
  } catch (error) {
    console.error("Send admin broadcast error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
    });
  }
};

// =====================================================
// DELETE ADMIN BROADCAST (ADMIN ONLY)
// DELETE /api/notifications/admin/:id
// =====================================================

export const deleteAdminBroadcast = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const broadcast = await AdminBroadcast.findByIdAndDelete(id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await Notification.deleteMany({ broadcastId: id });

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete admin broadcast error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};