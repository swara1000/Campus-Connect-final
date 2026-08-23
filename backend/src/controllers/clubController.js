import mongoose from "mongoose";

import Club from "../models/Club.js";
import ClubMembership from "../models/ClubMembership.js";

/* =====================================================
   GET ALL CLUBS
===================================================== */

export const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      clubs,
    });
  } catch (error) {
    console.error("Get clubs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clubs",
    });
  }
};

/* =====================================================
   GET MY CLUBS - STUDENT
===================================================== */

export const getMyClubs = async (req, res) => {
  try {
    const memberships = await ClubMembership.find({
      student: req.user._id,
      status: "joined",
    })
      .populate("club")
      .sort({ createdAt: -1 });

    const clubs = memberships
      .filter((membership) => membership.club)
      .map((membership) => membership.club);

    return res.status(200).json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error) {
    console.error("Get my clubs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your clubs",
    });
  }
};

/* =====================================================
   GET ONE CLUB
===================================================== */

export const getClubById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    const club = await Club.findById(id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    return res.status(200).json({
      success: true,
      club,
    });
  } catch (error) {
    console.error("Get club by ID error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch club",
    });
  }
};

/* =====================================================
   CREATE CLUB - ADMIN
===================================================== */

export const createClub = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      president,
      status,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Club name is required",
      });
    }

    const club = await Club.create({
      name: name.trim(),

      category:
        category || "General",

      description:
        description || "",

      president:
        president || "",

      status:
        status || "Active",

      membersCount: 0,

      createdBy:
        req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
      club,
    });
  } catch (error) {
    console.error("Create club error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create club",
    });
  }
};

/* =====================================================
   UPDATE CLUB - ADMIN
===================================================== */

export const updateClub = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    const club = await Club.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Club updated successfully",
      club,
    });
  } catch (error) {
    console.error("Update club error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update club",
    });
  }
};

/* =====================================================
   DELETE CLUB - ADMIN
===================================================== */

export const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    const club = await Club.findByIdAndDelete(id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    await ClubMembership.deleteMany({
      club: id,
    });

    return res.status(200).json({
      success: true,
      message: "Club deleted successfully",
    });
  } catch (error) {
    console.error("Delete club error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete club",
    });
  }
};

/* =====================================================
   JOIN CLUB - STUDENT
===================================================== */

export const joinClub = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    const club = await Club.findById(id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    const existing = await ClubMembership.findOne({
      club: club._id,
      student: req.user._id,
    });

    if (
      existing &&
      existing.status === "joined"
    ) {
      return res.status(409).json({
        success: false,
        message: "Already joined this club",
      });
    }

    if (existing) {
      existing.status = "joined";
      await existing.save();
    } else {
      await ClubMembership.create({
        club: club._id,
        student: req.user._id,
        status: "joined",
      });
    }

    club.membersCount =
      (club.membersCount || 0) + 1;

    await club.save();

    return res.status(201).json({
      success: true,
      message: "Club joined successfully",
      membersCount: club.membersCount,
    });
  } catch (error) {
    console.error("Join club error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to join club",
    });
  }
};

/* =====================================================
   LEAVE CLUB - STUDENT
===================================================== */

export const leaveClub = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    const membership =
      await ClubMembership.findOne({
        club: id,
        student: req.user._id,
        status: "joined",
      });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    membership.status = "left";

    await membership.save();

    const club = await Club.findById(id);

    if (club) {
      club.membersCount = Math.max(
        0,
        (club.membersCount || 0) - 1
      );

      await club.save();
    }

    return res.status(200).json({
      success: true,
      message: "Left club successfully",
      membersCount:
        club?.membersCount ?? 0,
    });
  } catch (error) {
    console.error("Leave club error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to leave club",
    });
  }
};

/* =====================================================
   CHECK MEMBERSHIP STATUS
===================================================== */

export const getClubMembershipStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    const membership =
      await ClubMembership.findOne({
        club: id,
        student: req.user._id,
        status: "joined",
      });

    return res.status(200).json({
      success: true,
      joined: Boolean(membership),
    });
  } catch (error) {
    console.error(
      "Membership status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to check membership",
    });
  }
};

export const getClubMembers = async (req, res) => {
  try {
    const memberships = await ClubMembership.find({
      club: req.params.id,
      status: "joined",
    })
      .populate(
        "student",
        "name email major year initials avatar"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: memberships.length,
      memberships,
    });
  } catch (error) {
    console.error("Get club members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch club members",
    });
  }
};