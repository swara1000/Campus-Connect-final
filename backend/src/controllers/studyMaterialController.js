import StudyMaterial from "../models/StudyMaterial.js";

export const getStudyMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      materials,
    });
  } catch (error) {
    console.error("Get study materials error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch study materials",
    });
  }
};

export const createStudyMaterial = async (req, res) => {
  try {
    const {
      title,
      subject,
      semester,
      type,
      summary,
      fileName,
      fileUrl,
    } = req.body;

    if (!title || !subject || !semester) {
      return res.status(400).json({
        success: false,
        message: "Title, subject and semester are required",
      });
    }

    const material = await StudyMaterial.create({
      title,
      subject,
      semester,
      type: type || "Notes",
      summary: summary || "",
      fileName: fileName || "",
      fileUrl: fileUrl || "",
      uploadedBy: "Admin",
    });

    res.status(201).json({
      success: true,
      message: "Study material created successfully",
      material,
    });
  } catch (error) {
    console.error("Create study material error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create study material",
    });
  }
};

export const updateStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Study material updated successfully",
      material,
    });
  } catch (error) {
    console.error("Update study material error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update study material",
    });
  }
};

export const deleteStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(
      req.params.id
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Study material deleted successfully",
    });
  } catch (error) {
    console.error("Delete study material error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete study material",
    });
  }
};