import mongoose from "mongoose";
import Placement from "../models/Placement.js";
import PlacementApplication from "../models/PlacementApplication.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// =====================================================
// GET ALL PLACEMENTS
// =====================================================

export const getPlacements = async (req, res) => {
  try {
    const placements = await Placement.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      placements,
    });
  } catch (error) {
    console.error("Get placements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch placements",
    });
  }
};

// =====================================================
// GET SINGLE PLACEMENT
// =====================================================

export const getPlacementById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const placement = await Placement.findById(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    return res.status(200).json({
      success: true,
      placement,
    });
  } catch (error) {
    console.error("Get placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch placement",
    });
  }
};

// =====================================================
// CREATE PLACEMENT - ADMIN
// =====================================================

export const createPlacement = async (req, res) => {
  try {
    const {
      role,
      company,
      type,
      location,
      stipend,
      eligibility,
      deadline,
      description,
      skills,
      logo,
      status,
    } = req.body;

    if (!role || !company || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Role, company and deadline are required",
      });
    }

    const deadlineDate = new Date(deadline);

    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid deadline date",
      });
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : String(skills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

    const placement = await Placement.create({
      role,
      company,
      type: type || "Internship",
      location: location || "",
      stipend: stipend || "",
      eligibility: eligibility || "",
      deadline: deadlineDate,
      description: description || "",
      skills: parsedSkills,
      logo: logo || "💼",
      status: status || "Active",
      applicantCount: 0,
      createdBy: req.user?._id,
    });

    // -----------------------------------------------
    // Notify all active students
    // -----------------------------------------------

    const students = await User.find({
      role: "student",
      status: "active",
    }).select("_id");

    if (students.length > 0) {
      const notifications = students.map((student) => ({
        recipient: student._id,
        type: "placement",
        title: "New Placement Opportunity",
        message: `${placement.role} at ${placement.company} has been posted.`,
        placementId: placement._id,
        read: false,
      }));

      await Notification.insertMany(notifications);

      const io = req.app.get("io");

      if (io) {
        students.forEach((student) => {
          io.to(`user-${student._id}`).emit("new-notification", {
            _id: `${placement._id}-${student._id}`,
            type: "placement",
            title: "New Placement Opportunity",
            message: `${placement.role} at ${placement.company} has been posted.`,
            placementId: placement._id,
            read: false,
            createdAt: new Date(),
          });
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Placement created and notifications sent",
      placement,
    });
  } catch (error) {
    console.error("Create placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create placement",
    });
  }
};

// =====================================================
// UPDATE PLACEMENT - ADMIN
// =====================================================

export const updatePlacement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const updates = { ...req.body };

    if (updates.deadline) {
      const deadlineDate = new Date(updates.deadline);

      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline date",
        });
      }

      updates.deadline = deadlineDate;
    }

    if (updates.skills !== undefined && !Array.isArray(updates.skills)) {
      updates.skills = String(updates.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    const placement = await Placement.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Placement updated successfully",
      placement,
    });
  } catch (error) {
    console.error("Update placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update placement",
    });
  }
};

// =====================================================
// DELETE PLACEMENT - ADMIN
// =====================================================

export const deletePlacement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const placement = await Placement.findByIdAndDelete(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    try {
      await PlacementApplication.deleteMany({
        placement: placement._id,
      });

      await Notification.deleteMany({
        placementId: placement._id,
      });
    } catch (cleanupError) {
      console.error(
        "Delete placement cleanup error:",
        cleanupError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Placement deleted successfully",
    });
  } catch (error) {
    console.error("Delete placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete placement",
    });
  }
};

// =====================================================
// APPLY TO PLACEMENT - STUDENT
// =====================================================

export const applyToPlacement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const placement = await Placement.findById(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    if (placement.status === "Closed") {
      return res.status(409).json({
        success: false,
        message: "This opportunity is closed",
      });
    }

    if (new Date(placement.deadline) < new Date()) {
      return res.status(409).json({
        success: false,
        message: "The application deadline has passed",
      });
    }

    let application = await PlacementApplication.findOne({
      placement: placement._id,
      student: req.user._id,
    });

    if (application && application.applied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this opportunity",
      });
    }

    if (application) {
      application.applied = true;
      application.appliedAt = new Date();
      await application.save();
    } else {
      application = await PlacementApplication.create({
        placement: placement._id,
        student: req.user._id,
        applied: true,
        appliedAt: new Date(),
      });
    }

    placement.applicantCount = (placement.applicantCount || 0) + 1;
    await placement.save();

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicantCount: placement.applicantCount,
    });
  } catch (error) {
    console.error("Apply to placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
};

// =====================================================
// WITHDRAW APPLICATION - STUDENT
// =====================================================

export const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const application = await PlacementApplication.findOne({
      placement: id,
      student: req.user._id,
      applied: true,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found to withdraw",
      });
    }

    application.applied = false;
    await application.save();

    const placement = await Placement.findById(id);

    let applicantCount = 0;

    if (placement) {
      placement.applicantCount = Math.max(
        0,
        (placement.applicantCount || 0) - 1
      );

      await placement.save();

      applicantCount = placement.applicantCount;
    }

    return res.status(200).json({
      success: true,
      message: "Application withdrawn",
      applicantCount,
    });
  } catch (error) {
    console.error("Withdraw application error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to withdraw application",
    });
  }
};

// =====================================================
// SAVE PLACEMENT - STUDENT
// =====================================================

export const savePlacement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const placement = await Placement.findById(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    let application = await PlacementApplication.findOne({
      placement: id,
      student: req.user._id,
    });

    if (application) {
      application.saved = true;
      await application.save();
    } else {
      application = await PlacementApplication.create({
        placement: id,
        student: req.user._id,
        saved: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Placement saved",
    });
  } catch (error) {
    console.error("Save placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save placement",
    });
  }
};

// =====================================================
// UNSAVE PLACEMENT - STUDENT
// =====================================================

export const unsavePlacement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const application = await PlacementApplication.findOne({
      placement: id,
      student: req.user._id,
    });

    if (application) {
      application.saved = false;
      await application.save();
    }

    return res.status(200).json({
      success: true,
      message: "Placement removed from saved",
    });
  } catch (error) {
    console.error("Unsave placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unsave placement",
    });
  }
};

// =====================================================
// GET MY APPLICATION STATUS FOR ONE PLACEMENT - STUDENT
// =====================================================

export const getPlacementStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement ID",
      });
    }

    const application = await PlacementApplication.findOne({
      placement: id,
      student: req.user._id,
    });

    return res.status(200).json({
      success: true,
      applied: Boolean(application?.applied),
      saved: Boolean(application?.saved),
    });
  } catch (error) {
    console.error("Get placement status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application status",
    });
  }
};

// =====================================================
// GET MY APPLICATIONS - STUDENT
// =====================================================

export const getMyApplications = async (req, res) => {
  try {
    const applications = await PlacementApplication.find({
      student: req.user._id,
      applied: true,
    })
      .populate("placement")
      .sort({ appliedAt: -1 });

    const placements = applications
      .filter((application) => application.placement)
      .map((application) => application.placement);

    return res.status(200).json({
      success: true,
      count: placements.length,
      placements,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your applications",
    });
  }
};

// =====================================================
// GET MY SAVED PLACEMENTS - STUDENT
// =====================================================

export const getMySavedPlacements = async (req, res) => {
  try {
    const saves = await PlacementApplication.find({
      student: req.user._id,
      saved: true,
    })
      .populate("placement")
      .sort({ updatedAt: -1 });

    const placements = saves
      .filter((save) => save.placement)
      .map((save) => save.placement);

    return res.status(200).json({
      success: true,
      count: placements.length,
      placements,
    });
  } catch (error) {
    console.error("Get my saved placements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your saved placements",
    });
  }
};
