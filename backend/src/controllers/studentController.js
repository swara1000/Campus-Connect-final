import User from "../models/User.js";

// =====================================================
// GET ALL STUDENTS
// =====================================================

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    })
      .select(
        "_id name email studentId department year bio status createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

// =====================================================
// GET SINGLE STUDENT
// =====================================================

export const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    }).select(
      "_id name email studentId department year bio status createdAt updatedAt"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};