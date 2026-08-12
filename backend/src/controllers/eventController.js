import Event from "../models/Event.js";

// GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// CREATE EVENT - ADMIN
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

    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: "Event name and date are required",
      });
    }

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

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// UPDATE EVENT - ADMIN
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// DELETE EVENT - ADMIN
export const deleteEvent = async (req, res) => {
  try {
    const event =
      await Event.findByIdAndDelete(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};