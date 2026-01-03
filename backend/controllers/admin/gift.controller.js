const Gift = require("../../models/gift.model");
const GiftCategory = require("../../models/giftCategory.model");
const { uploadToR2, deleteFromR2, extractKeyFromUrl } = require("../../util/r2Upload");

exports.addGift = async (req, res, next) => {
  try {
    const { type, giftCategoryId, coin } = req.body;

    if (!type || !giftCategoryId || !coin) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const [giftCategory] = await Promise.all([GiftCategory.findById(giftCategoryId).select("_id name")]);

    if (!giftCategory) {
      return res.status(200).json({ status: false, message: "GiftCategory does not exist." });
    }

    let imageUrl = "";
    let svgaImageUrl = "";

    if (req.files?.image) {
      const imageUpload = await uploadToR2(req.files.image[0], "gifts");
      if (imageUpload.success) {
        imageUrl = imageUpload.url;
      }
    }

    if (type == 3 && req.files?.svgaImage) {
      const svgaUpload = await uploadToR2(req.files.svgaImage[0], "gifts/svga");
      if (svgaUpload.success) {
        svgaImageUrl = svgaUpload.url;
      }
    }

    const giftData = {
      type,
      giftCategoryId,
      coin: coin,
      image: imageUrl,
      svgaImage: svgaImageUrl,
      filename: req.files?.image ? req.files.image[0].originalname : "",
    };

    const gift = new Gift(giftData);
    await gift.save();

    return res.status(200).json({ status: true, message: "Gift has been created by the admin.", data: { ...gift.toObject(), giftCategory } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.modifyGift = async (req, res, next) => {
  try {
    const { giftId } = req.query;
    const { giftCategoryId } = req.body;

    if (!giftId) {
      return res.status(200).json({ status: false, message: "giftId must be required." });
    }

    const [gift, giftCategory] = await Promise.all([
      Gift.findById(giftId).select("_id giftCategoryId type coin image svgaImage"),
      giftCategoryId ? GiftCategory.findById(giftCategoryId).select("_id name") : null,
    ]);

    if (!gift) {
      return res.status(200).json({ status: false, message: "gift does not found." });
    }

    if (giftCategoryId && !giftCategory) {
      return res.status(200).json({ status: false, message: "GiftCategory does not found." });
    }

    gift.type = req.body.type ? req.body.type : gift.type;
    gift.coin = req.body.coin ? req.body.coin : gift.coin;
    gift.giftCategoryId = req.body.giftCategoryId ? req.body.giftCategoryId : gift.giftCategoryId;

    if (req.files?.image) {
      if (gift.image) {
        const oldKey = extractKeyFromUrl(gift.image);
        if (oldKey) {
          await deleteFromR2(oldKey);
        }
      }

      const imageUpload = await uploadToR2(req.files.image[0], "gifts");
      if (imageUpload.success) {
        gift.image = imageUpload.url;
      }
    }

    if (req.body.type == 3 && req.files?.svgaImage) {
      if (gift.svgaImage) {
        const oldKey = extractKeyFromUrl(gift.svgaImage);
        if (oldKey) {
          await deleteFromR2(oldKey);
        }
      }

      const svgaUpload = await uploadToR2(req.files.svgaImage[0], "gifts/svga");
      if (svgaUpload.success) {
        gift.svgaImage = svgaUpload.url;
      }
    }

    await gift.save();

    return res.status(200).json({ status: true, message: "Gift has been updated by the admin.", data: { ...gift.toObject(), giftCategory } });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.retrieveGifts = async (req, res, next) => {
  try {
    const gift = await Gift.aggregate([
      {
        $match: { isDelete: false },
      },
      {
        $lookup: {
          from: "giftcategories",
          localField: "giftCategoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$giftCategoryId",
          categoryName: { $first: "$category.name" },
          gifts: {
            $push: {
              _id: "$_id",
              type: "$type",
              image: "$image",
              svgaImage: "$svgaImage",
              coin: "$coin",
              createdAt: "$createdAt",
            },
          },
        },
      },
      { $sort: { "gifts.createdAt": -1 } },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive gifts for the admin.",
      data: gift,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.discardGift = async (req, res, next) => {
  try {
    const { giftId } = req.query;

    if (!giftId) {
      return res.status(200).json({ status: false, message: "giftId must be required." });
    }

    const gift = await Gift.findById(giftId).select("_id image svgaImage").lean();
    if (!gift) {
      return res.status(200).json({ status: false, message: "Gift does not exist." });
    }

    if (gift.image) {
      const imageKey = extractKeyFromUrl(gift.image);
      if (imageKey) {
        await deleteFromR2(imageKey);
      }
    }

    if (gift.svgaImage) {
      const svgaKey = extractKeyFromUrl(gift.svgaImage);
      if (svgaKey) {
        await deleteFromR2(svgaKey);
      }
    }

    await Gift.findByIdAndDelete(giftId);

    res.status(200).json({ status: true, message: "Gift has been marked as deleted by the admin." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};