const Host = require("../../models/host.model");
const User = require("../../models/user.model");
const Agency = require("../../models/agency.model");
const { uploadToR2, uploadMultipleToR2, deleteFromR2, extractKeyFromUrl } = require("../../util/r2Upload");

//private key
const admin = require("../../util/privateKey");

//mongoose
const mongoose = require("mongoose");

//fs
const fs = require("fs");

//deletefile
const { deleteFiles } = require("../../util/deletefile");

//generateUniqueId
const generateUniqueId = require("../../util/generateUniqueId");

//retrive host requests
exports.fetchHostRequest = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let matchQuery = { isFake: false };

    if (req.query.status !== "All") {
      const statusInt = parseInt(req.query.status);
      matchQuery.status = statusInt;

      if (statusInt === 1) {
        matchQuery.agencyId = null;
      }
    }

    const [total, request] = await Promise.all([
      Host.countDocuments(matchQuery),
      Host.find(matchQuery)
        .populate("userId", "name image uniqueId")
        .populate("agencyId", "name image agencyCode")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieve host's request for admin.",
      total: total || 0,
      data: request,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//accept Or decline host request
exports.handleHostRequest = async (req, res) => {
  try {
    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    const { requestId, userId, status, reason } = req.query;

    if (!requestId || !status) {
      return res.status(200).json({ status: false, message: "Invalid details provided." });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(200).json({ status: false, message: "Invalid requestId format." });
    }

    const hostObjectId = new mongoose.Types.ObjectId(requestId);
    const statusNumber = Number(status);

    const host = await Host.findOne({ _id: hostObjectId });

    if (!host) {
      return res.status(200).json({ status: false, message: "Host request not found." });
    }

    if (host.status === 2) {
      return res.status(200).json({
        status: false,
        message: "Host request has already been accepted.",
      });
    }

    if (host.status === 3) {
      return res.status(200).json({
        status: false,
        message: "Host request has already been rejected.",
      });
    }

    if (statusNumber === 2) {
      if (host.agencyId === null) {
        return res.status(200).json({
          status: false,
          message: "Please assign this host to an agency before accepting the request.",
        });
      }

      host.status = 2;
      host.randomCallRate = settingJSON.generalRandomCallRate;
      host.randomCallFemaleRate = settingJSON.femaleRandomCallRate;
      host.randomCallMaleRate = settingJSON.maleRandomCallRate;
      host.privateCallRate = settingJSON.videoPrivateCallRate;
      host.audioCallRate = settingJSON.audioPrivateCallRate;
      host.chatRate = settingJSON.chatInteractionRate;
      await host.save();

      res.status(200).json({
        status: true,
        message: "Host request accepted successfully.",
        data: host,
      });

      // Update user if userId is provided or exists on host
      const userIdToUpdate = userId || host.userId;
      if (userIdToUpdate && mongoose.Types.ObjectId.isValid(userIdToUpdate)) {
        const userObjectId = new mongoose.Types.ObjectId(userIdToUpdate);
        const user = await User.findOne({ _id: userObjectId }).select("isHost hostId");
        if (user) {
          user.isHost = true;
          user.hostId = host._id;
          await user.save();
        }
      }

      if (host.fcmToken) {
        const payload = {
          token: host.fcmToken,
          data: {
            title: "🎉 Host Verification Successful!",
            body: "Congratulations! Your host request has been approved. You’re now ready to go live! 🚀",
          },
        };

        try {
          const adminInstance = await admin;
          await adminInstance.messaging().send(payload);
          console.log("Notification sent successfully.");
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
    } else if (statusNumber === 3) {
      if (!reason || reason.trim() === "") {
        return res.status(200).json({
          status: false,
          message: "Please provide a reason for rejection.",
        });
      }

      host.status = 3;
      host.reason = reason.trim();
      await host.save();

      res.status(200).json({
        status: true,
        message: "Host request rejected successfully.",
        data: host,
      });

      if (host.fcmToken) {
        const payload = {
          token: host.fcmToken,
          data: {
            title: "❌ Host Request Declined",
            body: "Unfortunately, your host request was declined. Please check your details or contact support for assistance. 📩",
          },
        };

        try {
          const adminInstance = await admin;
          await adminInstance.messaging().send(payload);
          console.log("Notification sent successfully.");
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
    } else {
      return res.status(200).json({ status: false, message: "Invalid status value provided." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//assign host under agency
exports.assignHostToAgency = async (req, res) => {
  try {
    const { requestId, agencyId, userId } = req.query;

    if (!requestId || !agencyId) {
      return res.status(200).json({
        status: false,
        message: "Required parameters missing: requestId or agencyId.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(200).json({
        status: false,
        message: "Invalid requestId or agencyId format. Must be a valid ObjectId.",
      });
    }

    const requestObjectId = new mongoose.Types.ObjectId(requestId);

    const [hostRequest, agency] = await Promise.all([
      Host.findOne({ _id: requestObjectId, status: 1 }),
      Agency.findById(agencyId).select("_id name agencyCode").lean(),
    ]);

    if (!hostRequest) {
      return res.status(200).json({ status: false, message: "Host request not found." });
    }

    if (hostRequest.agencyId !== null) {
      return res.status(200).json({ status: false, message: "This host request is already assigned to an agency." });
    }

    if (!agency) {
      return res.status(200).json({ status: false, message: "Agency not found." });
    }

    if (hostRequest.status === 2) {
      return res.status(200).json({ status: false, message: "This host request has already been accepted." });
    }

    if (hostRequest.status === 3) {
      return res.status(200).json({ status: false, message: "This host request has already been rejected." });
    }

    hostRequest.agencyId = agency._id;
    hostRequest.status = 2;
    hostRequest.randomCallRate = settingJSON.generalRandomCallRate;
    hostRequest.randomCallFemaleRate = settingJSON.femaleRandomCallRate;
    hostRequest.randomCallMaleRate = settingJSON.maleRandomCallRate;
    hostRequest.privateCallRate = settingJSON.videoPrivateCallRate;
    hostRequest.audioCallRate = settingJSON.audioPrivateCallRate;
    hostRequest.chatRate = settingJSON.chatInteractionRate;

    res.status(200).json({
      status: true,
      message: "Host successfully assigned to the agency.",
      request: { ...hostRequest.toObject(), agency },
    });

    // Get userId from request or from host record
    const userIdToUpdate = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : hostRequest.userId;

    const savePromises = [hostRequest.save()];

    if (userIdToUpdate && mongoose.Types.ObjectId.isValid(userIdToUpdate)) {
      const userObjectId = new mongoose.Types.ObjectId(userIdToUpdate);
      savePromises.push(
        User.updateOne(
          { _id: userObjectId },
          {
            $set: {
              isHost: true,
              hostId: hostRequest._id,
            },
          }
        )
      );
    }

    await Promise.all(savePromises);

    if (hostRequest.fcmToken) {
      const payload = {
        token: hostRequest.fcmToken,
        data: {
          title: "🎉 Host Verification Successful!",
          body: "Congratulations! Your host request has been approved. You’re now ready to go live! 🚀",
        },
      };

      try {
        const adminInstance = await admin;
        await adminInstance.messaging().send(payload);
        console.log("Notification sent successfully.");
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  } catch (error) {
    console.error("Error in assignHostToAgency:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
  }
};

//get agency's hosts
exports.listAgencyHosts = async (req, res) => {
  try {
    if (!req.query.agencyId) {
      return res.status(200).json({ status: false, message: "agencyId must be needed." });
    }

    const agencyId = new mongoose.Types.ObjectId(req.query.agencyId);
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const searchString = req.query.search || "";
    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      };
    }

    let searchQuery = {};
    if (searchString !== "All" && searchString !== "") {
      searchQuery = {
        $or: [{ name: { $regex: searchString, $options: "i" } }, { email: { $regex: searchString, $options: "i" } }, { uniqueId: { $regex: searchString, $options: "i" } }],
      };
    }

    const baseQuery = {
      ...dateFilterQuery,
      ...searchQuery,
      agencyId: agencyId,
      status: 2,
      isFake: false,
    };

    const [agency, hosts] = await Promise.all([
      Agency.findOne({ _id: agencyId, isBlock: false }).lean(),
      Host.aggregate([
        { $match: baseQuery },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "followerfollowings",
            localField: "_id",
            foreignField: "followingId",
            as: "followers",
          },
        },
        {
          $addFields: {
            totalFollowers: { $size: "$followers" },
          },
        },
        {
          $project: {
            name: 1,
            gender: 1,
            image: 1,
            impression: 1,
            identityProofType: 1,
            uniqueId: 1,
            isOnline: 1,
            isBusy: 1,
            isLive: 1,
            countryFlagImage: 1,
            country: 1,
            totalFollowers: 1,
          },
        },
      ]),
    ]);

    if (!agency) {
      return res.status(200).json({ status: false, message: "Agency not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Agency wise hosts fetched successfully!",
      hosts,
    });
  } catch (error) {
    console.error("Error fetching agency wise hosts:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//create host
exports.createHost = async (req, res) => {
  try {
    const { name, bio, dob, gender, countryFlagImage, country, language, impression, email } = req.body;

    if (
      !name ||
      !bio ||
      !dob ||
      !gender ||
      !countryFlagImage ||
      !country ||
      !impression ||
      !language ||
      !req.files ||
      !Array.isArray(req.files.image) ||
      req.files.image.length === 0 ||
      !Array.isArray(req.files.video) ||
      req.files.video.length === 0 ||
      !Array.isArray(req.files.liveVideo) ||
      req.files.liveVideo.length === 0 ||
      !Array.isArray(req.files.profileVideo) ||
      req.files.profileVideo.length === 0
    ) {
      return res.status(200).json({
        status: false,
        message: "Missing or invalid host details or required media files (image, video, liveVideo, profileVideo).",
      });
    }

    const hasInvalidFile = (arr) => arr?.some((file) => !file?.path && !file?.buffer);

    if (hasInvalidFile(req.files.image) || hasInvalidFile(req.files.video) || hasInvalidFile(req.files.liveVideo) || (req.files.photoGallery && hasInvalidFile(req.files.photoGallery))) {
      return res.status(200).json({
        status: false,
        message: "Invalid file(s) uploaded. Ensure files are uploaded properly without 'url' fields.",
      });
    }

    const [uniqueId, existingHost] = await Promise.all([generateUniqueId(), Host.findOne({ email: email?.trim() }).select("_id").lean()]);

    if (existingHost) {
      return res.status(200).json({
        status: false,
        message: "A host profile with this email already exists.",
      });
    }

    let imageUrl = "";
    let photoGalleryUrls = [];
    let videoUrls = [];
    let profileVideoUrls = [];
    let liveVideoUrls = [];

    if (req.files.image) {
      const imageUpload = await uploadToR2(req.files.image[0], "hosts/profiles");
      if (imageUpload.success) {
        imageUrl = imageUpload.url;
      }
    }

    if (req.files.photoGallery) {
      const uploads = await uploadMultipleToR2(req.files.photoGallery, "hosts/gallery");
      photoGalleryUrls = uploads.filter(u => u.success).map(u => u.url);
    }

    if (req.files.video) {
      const uploads = await uploadMultipleToR2(req.files.video, "hosts/videos");
      videoUrls = uploads.filter(u => u.success).map(u => u.url);
    }

    if (req.files.profileVideo) {
      const uploads = await uploadMultipleToR2(req.files.profileVideo, "hosts/profile-videos");
      profileVideoUrls = uploads.filter(u => u.success).map(u => u.url);
    }

    if (req.files.liveVideo) {
      const uploads = await uploadMultipleToR2(req.files.liveVideo, "hosts/live-videos");
      liveVideoUrls = uploads.filter(u => u.success).map(u => u.url);
    }

    const newHost = new Host({
      name,
      email,
      bio,
      dob,
      gender,
      countryFlagImage,
      country,
      language,
      impression,
      image: imageUrl,
      photoGallery: photoGalleryUrls,
      video: videoUrls,
      profileVideo: profileVideoUrls,
      liveVideo: liveVideoUrls,
      uniqueId,
      status: 2,
      isFake: true,
      randomCallRate: settingJSON.generalRandomCallRate,
      randomCallFemaleRate: settingJSON.femaleRandomCallRate,
      randomCallMaleRate: settingJSON.maleRandomCallRate,
      privateCallRate: settingJSON.videoPrivateCallRate,
      audioCallRate: settingJSON.audioPrivateCallRate,
      chatRate: settingJSON.chatInteractionRate,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    await newHost.save();

    return res.status(200).json({
      status: true,
      message: "Host created successfully.",
      host: newHost,
    });
  } catch (error) {
    console.error("Create Host Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to create host profile due to server error.",
    });
  }
};

//update host
exports.updateHost = async (req, res) => {
  try {
    console.log("📥 req.body updateHost:", req.body);
    console.log("📁 req.files updateHost:", req.files);

    const {
      hostId,
      name,
      bio,
      dob,
      gender,
      countryFlagImage,
      country,
      language,
      impression,
      email,
      randomCallRate,
      randomCallFemaleRate,
      randomCallMaleRate,
      privateCallRate,
      audioCallRate,
      chatRate,
      removeProfileVideoIndex,
      removeLiveVideoIndex,
      removePhotoGalleryIndex,
      removeVideoIndexes,
    } = req.body;

    const arrayFields = ["removeProfileVideoIndex", "removeLiveVideoIndex", "removePhotoGalleryIndex", "removeVideoIndexes"];

    for (const key of arrayFields) {
      if (req.body[key]) {
        if (typeof req.body[key] === "string") {
          try {
            req.body[key] = JSON.parse(req.body[key]);
          } catch (e) {
            return res.status(200).json({
              status: false,
              message: `Invalid format for '${key}'. It must be a valid JSON array.`,
            });
          }
        }

        if (!Array.isArray(req.body[key])) {
          return res.status(200).json({
            status: false,
            message: `'${key}' must be an array.`,
          });
        }
      }
    }

    if (!hostId) {
      return res.status(200).json({ status: false, message: "Missing hostId." });
    }

    const [host, existingHost] = await Promise.all([
      Host.findById(hostId),
      email
        ? Host.findOne({ email: email.trim(), _id: { $ne: hostId } })
          .select("_id")
          .lean()
        : null,
    ]);

    if (!host) {
      return res.status(200).json({ status: false, message: "Host not found." });
    }

    if (existingHost) {
      return res.status(200).json({ status: false, message: "Email already in use." });
    }

    host.name = name || host.name;
    host.email = email || host.email;
    host.bio = bio || host.bio;
    host.dob = dob || host.dob;
    host.gender = gender || host.gender;
    host.countryFlagImage = countryFlagImage || host.countryFlagImage;
    host.country = country || host.country;
    host.impression = typeof impression === "string" ? impression.split(",") : Array.isArray(impression) ? impression : host.impression;
    host.language = typeof language === "string" ? language.split(",") : Array.isArray(language) ? language : host.language;
    host.randomCallRate = randomCallRate || host.randomCallRate;
    host.randomCallFemaleRate = randomCallFemaleRate || host.randomCallFemaleRate;
    host.randomCallMaleRate = randomCallMaleRate || host.randomCallMaleRate;
    host.privateCallRate = privateCallRate || host.privateCallRate;
    host.audioCallRate = audioCallRate || host.audioCallRate;
    host.chatRate = chatRate || host.chatRate;

    if (req.files?.image?.[0]) {
      const imageUpload = await uploadToR2(req.files.image[0], "hosts/profiles");
      if (imageUpload.success) {
        if (host.image) {
          const oldKey = extractKeyFromUrl(host.image);
          if (oldKey) {
            await deleteFromR2(oldKey);
          }
        }
        host.image = imageUpload.url;
        console.log("🆕 Updated image:", host.image);
      }
    }

    if (Array.isArray(req.body.removePhotoGalleryIndex)) {
      const sorted = req.body.removePhotoGalleryIndex
        .map(Number)
        .filter((i) => !isNaN(i))
        .sort((a, b) => b - a);
      for (const i of sorted) {
        const fileUrl = host.photoGallery?.[i];
        if (fileUrl) {
          const oldKey = extractKeyFromUrl(fileUrl);
          if (oldKey) {
            await deleteFromR2(oldKey);
            console.log(`🗑️ Deleted photoGallery[${i}]: ${fileUrl}`);
          }
        }
        host.photoGallery.splice(i, 1);
      }
    }

    if (req.files?.photoGallery) {
      const uploads = await uploadMultipleToR2(req.files.photoGallery, "hosts/gallery");
      const newPhotos = uploads.filter(u => u.success).map(u => u.url);
      host.photoGallery = [...(host.photoGallery || []), ...newPhotos];
      newPhotos.forEach((path, idx) => console.log(`🆕 Added photoGallery[${host.photoGallery.length - newPhotos.length + idx}]: ${path}`));
    }

    if (Array.isArray(req.body.removeVideoIndexes)) {
      const sorted = req.body.removeVideoIndexes
        .map(Number)
        .filter((i) => !isNaN(i))
        .sort((a, b) => b - a);
      for (const i of sorted) {
        const videoUrl = host.video?.[i];
        if (videoUrl) {
          const oldKey = extractKeyFromUrl(videoUrl);
          if (oldKey) {
            await deleteFromR2(oldKey);
            console.log(`🗑️ Deleted video[${i}]: ${videoUrl}`);
          }
        }
        host.video.splice(i, 1);
      }
    }

    if (req.files?.video?.length) {
      const uploads = await uploadMultipleToR2(req.files.video, "hosts/videos");
      const newVideos = uploads.filter(u => u.success).map(u => u.url);
      host.video = host.video.concat(newVideos);
      newVideos.forEach((path, idx) => console.log(`🆕 Added video[${host.video.length - newVideos.length + idx}]: ${path}`));
    }

    if (Array.isArray(req.body.removeLiveVideoIndex)) {
      const sorted = req.body.removeLiveVideoIndex
        .map(Number)
        .filter((i) => !isNaN(i))
        .sort((a, b) => b - a);
      for (const i of sorted) {
        const fileUrl = host.liveVideo?.[i];
        if (fileUrl) {
          const oldKey = extractKeyFromUrl(fileUrl);
          if (oldKey) {
            await deleteFromR2(oldKey);
            console.log(`🗑️ Deleted liveVideo[${i}]: ${fileUrl}`);
          }
        }
        host.liveVideo.splice(i, 1);
      }
    }

    if (req.files?.liveVideo) {
      const uploads = await uploadMultipleToR2(req.files.liveVideo, "hosts/live-videos");
      const newVideos = uploads.filter(u => u.success).map(u => u.url);
      host.liveVideo = [...(host.liveVideo || []), ...newVideos];
      newVideos.forEach((path, idx) => console.log(`🆕 Added liveVideo[${host.liveVideo.length - newVideos.length + idx}]: ${path}`));
    }

    if (Array.isArray(req.body.removeProfileVideoIndex)) {
      const sorted = req.body.removeProfileVideoIndex
        .map(Number)
        .filter((i) => !isNaN(i))
        .sort((a, b) => b - a);
      for (const i of sorted) {
        const fileUrl = host.profileVideo?.[i];
        if (fileUrl) {
          const oldKey = extractKeyFromUrl(fileUrl);
          if (oldKey) {
            await deleteFromR2(oldKey);
            console.log(`🗑️ Deleted profileVideo[${i}]: ${fileUrl}`);
          }
        }
        host.profileVideo.splice(i, 1);
      }
    }

    if (req.files?.profileVideo) {
      const uploads = await uploadMultipleToR2(req.files.profileVideo, "hosts/profile-videos");
      const newVideos = uploads.filter(u => u.success).map(u => u.url);
      host.profileVideo = [...(host.profileVideo || []), ...newVideos];
      newVideos.forEach((path, idx) => console.log(`🆕 Added profileVideo[${host.profileVideo.length - newVideos.length + idx}]: ${path}`));
    }

    await host.save();

    console.log("✅ Final image:", host.image);
    console.log("✅ Final photoGallery:", host.photoGallery);
    console.log("✅ Final video:", host.video);
    console.log("✅ Final liveVideo:", host.liveVideo);
    console.log("✅ Final profileVideo:", host.profileVideo);

    return res.status(200).json({
      status: true,
      message: "Host profile updated successfully.",
      host,
    });
  } catch (error) {
    console.error("❌ Update Host Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to update host profile due to server error.",
    });
  }
};

//toggle host status
exports.toggleHostStatusByType = async (req, res) => {
  try {
    const { hostId, type } = req.query;

    if (!hostId || !type) {
      return res.status(200).json({ status: false, message: "Host ID and type are required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      return res.status(200).json({ status: false, message: "Invalid hostId format." });
    }

    const validTypes = ["isBlock", "isBusy", "isLive"];
    if (!validTypes.includes(type)) {
      return res.status(200).json({
        status: false,
        message: `Invalid type. Valid types: ${validTypes.join(", ")}`,
      });
    }

    const host = await Host.findOne({ _id: hostId });
    if (!host) {
      return res.status(200).json({ status: false, message: "Host not found." });
    }

    host[type] = !host[type];
    await host.save();

    return res.status(200).json({
      status: true,
      message: `Host ${type} status has been ${host[type] ? "enabled" : "disabled"} successfully.`,
      data: host,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//get host's profile
exports.fetchHostProfile = async (req, res) => {
  try {
    const { hostId } = req.query;

    if (!hostId) {
      return res.status(200).json({ status: false, message: "Host ID must be required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      return res.status(200).json({ status: false, message: "Invalid hostId format." });
    }

    const [host] = await Promise.all([Host.findOne({ _id: hostId }).populate("agencyId", "name image agencyCode")]);

    if (!host) {
      return res.status(200).json({ status: false, message: "Host not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Host profile retrieved successfully.",
      host: host,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get hosts
exports.fetchHostList = async (req, res) => {
  try {
    if (!req.query.type) {
      return res.status(200).json({ status: false, message: "Host type is required!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const searchString = req.query.search || "";
    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";
    const hostType = parseInt(req.query.type);

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      };
    }

    let searchQuery = {};
    if (searchString !== "All" && searchString !== "") {
      searchQuery = {
        $or: [{ name: { $regex: searchString, $options: "i" } }, { email: { $regex: searchString, $options: "i" } }, { uniqueId: { $regex: searchString, $options: "i" } }],
      };
    }

    const filter = {
      ...dateFilterQuery,
      ...searchQuery,
      status: 2,
      isFake: hostType === 1 ? false : true,
    };

    const [totalHosts, hostList] = await Promise.all([
      Host.countDocuments(filter),
      Host.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "followerfollowings",
            localField: "_id",
            foreignField: "followingId",
            as: "followers",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "agencies",
            localField: "agencyId",
            foreignField: "_id",
            as: "agencyId",
          },
        },
        { $unwind: { path: "$agencyId", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            totalFollowers: { $size: "$followers" },
          },
        },
        {
          $project: {
            name: 1,
            gender: 1,
            bio: 1,
            age: 1,
            dob: 1,
            email: 1,
            image: 1,
            video: 1,
            liveVideo: 1,
            profileVideo: 1,
            impression: 1,
            identityProofType: 1,
            identityProof: 1,
            photoGallery: 1,
            uniqueId: 1,
            isBlock: 1,
            isOnline: 1,
            isBusy: 1,
            isLive: 1,
            countryFlagImage: 1,
            country: 1,
            photoGallery: 1,
            randomCallRate: 1,
            randomCallFemaleRate: 1,
            randomCallMaleRate: 1,
            privateCallRate: 1,
            audioCallRate: 1,
            chatRate: 1,
            coin: 1,
            totalGifts: 1,
            language: 1,
            totalFollowers: 1,
            createdAt: 1,
            "userId._id": 1,
            "userId.name": 1,
            "userId.image": 1,
            "userId.uniqueId": 1,
            "agencyId._id": 1,
            "agencyId.name": 1,
            "agencyId.image": 1,
            "agencyId.agencyCode": 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Hosts retrieved successfully!",
      totalHosts,
      hostList,
    });
  } catch (error) {
    console.error("Error fetching hosts:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete host
exports.deleteHost = async (req, res) => {
  try {
    const { hostId } = req.query;

    if (!hostId) {
      return res.status(200).json({
        status: false,
        message: "Missing or invalid host details. Please check and try again.",
      });
    }

    const host = await Host.findOne({ _id: hostId }).select("_id image photoGallery video liveVideo profileVideo").lean();

    if (!host) {
      return res.status(200).json({ status: false, message: "Host not found." });
    }

    res.status(200).json({
      status: true,
      message: "Host deleted successfully.",
    });

    if (host.image) {
      const oldKey = extractKeyFromUrl(host.image);
      if (oldKey) {
        await deleteFromR2(oldKey);
      }
    }

    if (Array.isArray(host.photoGallery) && host.photoGallery.length > 0) {
      for (const photoUrl of host.photoGallery) {
        if (photoUrl) {
          const oldKey = extractKeyFromUrl(photoUrl);
          if (oldKey) {
            await deleteFromR2(oldKey);
          }
        }
      }
    }

    if (Array.isArray(host.video) && host.video.length > 0) {
      for (const videoUrl of host.video) {
        if (videoUrl) {
          const oldKey = extractKeyFromUrl(videoUrl);
          if (oldKey) {
            await deleteFromR2(oldKey);
          }
        }
      }
    }

    if (Array.isArray(host.liveVideo) && host.liveVideo.length > 0) {
      for (const liveVideo of host.liveVideo) {
        if (liveVideo) {
          const oldKey = extractKeyFromUrl(liveVideo);
          if (oldKey) {
            await deleteFromR2(oldKey);
          }
        }
      }
    }

    if (Array.isArray(host.profileVideo) && host.profileVideo.length > 0) {
      for (const profileVideo of host.profileVideo) {
        if (profileVideo) {
          const oldKey = extractKeyFromUrl(profileVideo);
          if (oldKey) {
            await deleteFromR2(oldKey);
          }
        }
      }
    }

    await Host.deleteOne({ _id: hostId });
  } catch (error) {
    console.error("Delete Host Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to delete host due to server error.",
    });
  }
};
