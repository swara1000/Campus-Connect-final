import mongoose from "mongoose";

import Event from "../models/Event.js";
import User from "../models/User.js";
import {
  getEventStatus,
  withDerivedEventStatus,
  withDerivedEventStatuses,
} from "../utils/eventStatus.js";
import Notification from "../models/Notification.js";
import EventRegistration from "../models/EventRegistration.js";

// =====================================================
// GET ALL EVENTS
// =====================================================

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      events: withDerivedEventStatuses(events),
    });
  } catch (error) {
    console.error("Get events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// =====================================================
// GET SINGLE EVENT
// =====================================================

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event: withDerivedEventStatus(event),
    });
  } catch (error) {
    console.error("Get event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

// =====================================================
// CREATE EVENT - ADMIN
// =====================================================

export const createEvent = async (req, res) => {
  try {
    const {
      name,
      club,
      desc,
      date,
      venue,
      regCap,
    } = req.body;

    // -----------------------------------------------
    // 1. Validate required fields
    // -----------------------------------------------

    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: "Event name and date are required",
      });
    }

    // -----------------------------------------------
    // 2. Validate the calendar date
    // -----------------------------------------------

    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date",
      });
    }

    // -----------------------------------------------
    // 3. Create event
    // -----------------------------------------------

    const event = await Event.create({
      name,
      club,
      desc,
      date,
      venue,
      regCap: Number(regCap) || 100,
      regCount: 0,
      createdBy: req.user?._id,
    });

    // -----------------------------------------------
    // 4. Find all active students
    // -----------------------------------------------

    const students = await User.find({
      role: "student",
      status: "active",
    }).select("_id");

    // -----------------------------------------------
    // 5. Create database notifications
    // -----------------------------------------------

    if (students.length > 0) {
      const notifications = students.map((student) => ({
        recipient: student._id,

        type: "event",

        title: "New Event Added",

        message:
          `${event.name} has been added to CampusConnect.`,

        eventId: event._id,

        read: false,
      }));

      await Notification.insertMany(notifications);

      console.log(
        `Created ${notifications.length} notifications`
      );
    }

    // -----------------------------------------------
    // 6. Send REAL-TIME notifications
    // -----------------------------------------------

    const io = req.app.get("io");

    if (io && students.length > 0) {
      students.forEach((student) => {
        io.to(`user-${student._id}`).emit(
          "new-notification",
          {
            _id: `${event._id}-${student._id}`,

            type: "event",

            title: "New Event Added",

            message:
              `${event.name} has been added to CampusConnect.`,

            eventId: event._id,

            read: false,

            createdAt: new Date(),
          }
        );
      });

      console.log(
        "Real-time notifications sent"
      );
    }

    // -----------------------------------------------
    // 7. Response
    // -----------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Event created and notifications sent",

      event: withDerivedEventStatus(event),
    });

  } catch (error) {
    console.error(
      "Create event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// =====================================================
// UPDATE EVENT - ADMIN
// =====================================================

export const updateEvent = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Status is derived from the event date and cannot be set manually.
    delete updates.status;

    // -----------------------------------------------
    // 1. Validate date if date is being updated
    // -----------------------------------------------

    if (updates.date && isNaN(new Date(updates.date).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date",
      });
    }

    // -----------------------------------------------
    // 2. Update event
    // -----------------------------------------------

    const event =
      await Event.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    // -----------------------------------------------
    // 3. Check event
    // -----------------------------------------------

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // -----------------------------------------------
    // 4. Response
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: withDerivedEventStatus(event),
    });

  } catch (error) {
    console.error(
      "Update event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// =====================================================
// DELETE EVENT - ADMIN
// =====================================================

export const deleteEvent = async (req, res) => {
  try {
    const event =
      await Event.findByIdAndDelete(
        req.params.id
      );

    // -----------------------------------------------
    // Event not found
    // -----------------------------------------------

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // -----------------------------------------------
    // Delete related notifications
    // -----------------------------------------------

    try {
      await Notification.deleteMany({
        eventId: event._id,
      });
    } catch (notificationError) {
      console.error(
        "Delete event notifications error:",
        notificationError
      );
    }

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};

// =====================================================
// REGISTER FOR EVENT - STUDENT
// =====================================================

export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (getEventStatus(event.date) === "Completed") {
      return res.status(400).json({
        success: false,
        message: "This event has already ended",
      });
    }

    const existing = await EventRegistration.findOne({
      event: event._id,
      student: req.user._id,
    });

    if (existing && existing.status === "registered") {
      return res.status(409).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    if (
      (event.regCount || 0) >= (event.regCap || 0) &&
      !existing
    ) {
      return res.status(409).json({
        success: false,
        message: "This event is fully booked",
      });
    }

    if (existing) {
      existing.status = "registered";
      await existing.save();
    } else {
      await EventRegistration.create({
        event: event._id,
        student: req.user._id,
        status: "registered",
      });
    }

    event.regCount = (event.regCount || 0) + 1;

    await event.save();

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      regCount: event.regCount,
    });
  } catch (error) {
    console.error("Register for event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register for event",
    });
  }
};

// =====================================================
// CANCEL EVENT REGISTRATION - STUDENT
// =====================================================

export const cancelEventRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const registration = await EventRegistration.findOne({
      event: id,
      student: req.user._id,
      status: "registered",
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    registration.status = "cancelled";

    await registration.save();

    const event = await Event.findById(id);

    if (event) {
      event.regCount = Math.max(0, (event.regCount || 0) - 1);

      await event.save();
    }

    return res.status(200).json({
      success: true,
      message: "Registration cancelled",
      regCount: event?.regCount ?? 0,
    });
  } catch (error) {
    console.error("Cancel event registration error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to cancel registration",
    });
  }
};

// =====================================================
// CHECK REGISTRATION STATUS - STUDENT
// =====================================================

export const getEventRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const registration = await EventRegistration.findOne({
      event: id,
      student: req.user._id,
      status: "registered",
    });

    return res.status(200).json({
      success: true,
      registered: Boolean(registration),
    });
  } catch (error) {
    console.error("Event registration status error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to check registration",
    });
  }
};

// =====================================================
// GET MY REGISTERED EVENTS - STUDENT
// =====================================================

export const getMyRegisteredEvents = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      student: req.user._id,
      status: "registered",
    })
      .populate("event")
      .sort({ createdAt: -1 });

    const events = withDerivedEventStatuses(
      registrations
        .filter((registration) => registration.event)
        .map((registration) => registration.event)
    );

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get my registered events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registered events",
    });
  }
};