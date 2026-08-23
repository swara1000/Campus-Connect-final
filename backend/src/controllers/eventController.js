import Event from "../models/Event.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

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
      events,
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
      status,
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
    // 2. Prevent past event dates
    // -----------------------------------------------

    const today = new Date();

    // Remove current time
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(date);

    // Check invalid date
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date",
      });
    }

    // Remove event time
    eventDate.setHours(0, 0, 0, 0);

    // Reject dates before today
    if (eventDate < today) {
      return res.status(400).json({
        success: false,
        message: "Event date cannot be in the past.",
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
      status: status || "Upcoming",
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

      event,
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
    // -----------------------------------------------
    // 1. Validate date if date is being updated
    // -----------------------------------------------

    if (req.body.date) {
      const today = new Date();

      // Remove current time
      today.setHours(0, 0, 0, 0);

      const eventDate = new Date(req.body.date);

      // Check invalid date
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid event date",
        });
      }

      // Remove event time
      eventDate.setHours(0, 0, 0, 0);

      // Reject past date
      if (eventDate < today) {
        return res.status(400).json({
          success: false,
          message: "Event date cannot be in the past.",
        });
      }
    }

    // -----------------------------------------------
    // 2. Update event
    // -----------------------------------------------

    const event =
      await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
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
      event,
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