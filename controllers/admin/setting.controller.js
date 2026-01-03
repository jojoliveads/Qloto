const Setting = require("../../models/setting.model");
const Host = require("../../models/host.model");

//update setting
exports.updateSetting = async (req, res) => {
  try {
    if (!req.query.settingId) {
      return res.status(200).json({ status: false, message: "SettingId must be required." });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    // Agora settings
    setting.agoraAppId = req.body.agoraAppId?.trim() ?? setting.agoraAppId;
    setting.agoraAppCertificate = req.body.agoraAppCertificate?.trim() ?? setting.agoraAppCertificate;

    // Policy links
    setting.privacyPolicyLink = req.body.privacyPolicyLink?.trim() ?? setting.privacyPolicyLink;
    setting.termsOfUsePolicyLink = req.body.termsOfUsePolicyLink?.trim() ?? setting.termsOfUsePolicyLink;

    // Stripe
    setting.stripePublishableKey = req.body.stripePublishableKey?.trim() ?? setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey?.trim() ?? setting.stripeSecretKey;

    // Razorpay
    setting.razorpayId = req.body.razorpayId?.trim() ?? setting.razorpayId;
    setting.razorpaySecretKey = req.body.razorpaySecretKey?.trim() ?? setting.razorpaySecretKey;

    // Flutterwave
    setting.flutterwaveId = req.body.flutterwaveId?.trim() ?? setting.flutterwaveId;

    // UPI Tranzact
    setting.upiTranzactMerchantId = req.body.upiTranzactMerchantId?.trim() ?? setting.upiTranzactMerchantId;
    setting.upiTranzactPublicKey = req.body.upiTranzactPublicKey?.trim() ?? setting.upiTranzactPublicKey;
    setting.upiTranzactSecretKey = req.body.upiTranzactSecretKey?.trim() ?? setting.upiTranzactSecretKey;

    // PayU
    setting.payuMerchantKey = req.body.payuMerchantKey?.trim() ?? setting.payuMerchantKey;
    setting.payuMerchantSalt = req.body.payuMerchantSalt?.trim() ?? setting.payuMerchantSalt;

    // CCAvenue
    setting.ccavenueMerchantId = req.body.ccavenueMerchantId?.trim() ?? setting.ccavenueMerchantId;
    setting.ccavenueAccessCode = req.body.ccavenueAccessCode?.trim() ?? setting.ccavenueAccessCode;
    setting.ccavenueWorkingKey = req.body.ccavenueWorkingKey?.trim() ?? setting.ccavenueWorkingKey;

    // PhonePe
    setting.phonePheMerchantId = req.body.phonePheMerchantId?.trim() ?? setting.phonePheMerchantId;
    setting.phonePheApiKey = req.body.phonePheApiKey?.trim() ?? setting.phonePheApiKey;
    setting.phonePheApiSecret = req.body.phonePheApiSecret?.trim() ?? setting.phonePheApiSecret;

    // Google Pay
    setting.googlePayMerchantId = req.body.googlePayMerchantId?.trim() ?? setting.googlePayMerchantId;

    // SMEPAAY (PhonePe)
    setting.smePayClientId = req.body.smePayClientId?.trim() ?? setting.smePayClientId;
    setting.smePayClientSecret = req.body.smePayClientSecret?.trim() ?? setting.smePayClientSecret;

    // PayTM
    setting.paytmMerchantId = req.body.paytmMerchantId?.trim() ?? setting.paytmMerchantId;
    setting.paytmMerchantKey = req.body.paytmMerchantKey?.trim() ?? setting.paytmMerchantKey;
    setting.paytmWebsiteCode = req.body.paytmWebsiteCode?.trim() ?? setting.paytmWebsiteCode;

    // Cashfree
    setting.cashfreeAppId = req.body.cashfreeAppId?.trim() ?? setting.cashfreeAppId;
    setting.cashfreeSecretKey = req.body.cashfreeSecretKey?.trim() ?? setting.cashfreeSecretKey;

    // Easebuzz
    setting.easebuzzKeyId = req.body.easebuzzKeyId?.trim() ?? setting.easebuzzKeyId;
    setting.easebuzzKeySecret = req.body.easebuzzKeySecret?.trim() ?? setting.easebuzzKeySecret;

    // Numeric fields
    setting.loginBonus = req.body.loginBonus ? Number(req.body.loginBonus) : setting.loginBonus;
    setting.adminCommissionRate = req.body.adminCommissionRate ? Number(req.body.adminCommissionRate) : setting.adminCommissionRate;
    setting.minCoinsToConvert = req.body.minCoinsToConvert ? Number(req.body.minCoinsToConvert) : setting.minCoinsToConvert;
    setting.minCoinsForHostPayout = req.body.minCoinsForHostPayout ? Number(req.body.minCoinsForHostPayout) : setting.minCoinsForHostPayout;
    setting.minCoinsForAgencyPayout = req.body.minCoinsForAgencyPayout ? Number(req.body.minCoinsForAgencyPayout) : setting.minCoinsForAgencyPayout;
    setting.maxFreeChatMessages = req.body.maxFreeChatMessages ? Number(req.body.maxFreeChatMessages) : setting.maxFreeChatMessages;

    // Rate settings
    setting.generalRandomCallRate = req.body.generalRandomCallRate !== undefined ? Number(req.body.generalRandomCallRate) : setting.generalRandomCallRate;
    setting.femaleRandomCallRate = req.body.femaleRandomCallRate !== undefined ? Number(req.body.femaleRandomCallRate) : setting.femaleRandomCallRate;
    setting.maleRandomCallRate = req.body.maleRandomCallRate !== undefined ? Number(req.body.maleRandomCallRate) : setting.maleRandomCallRate;
    setting.videoPrivateCallRate = req.body.videoPrivateCallRate !== undefined ? Number(req.body.videoPrivateCallRate) : setting.videoPrivateCallRate;
    setting.audioPrivateCallRate = req.body.audioPrivateCallRate !== undefined ? Number(req.body.audioPrivateCallRate) : setting.audioPrivateCallRate;
    setting.chatInteractionRate = req.body.chatInteractionRate !== undefined ? Number(req.body.chatInteractionRate) : setting.chatInteractionRate;

    // Firebase private key
    if (req.body.privateKey) {
      setting.privateKey = typeof req.body.privateKey === "string" ? JSON.parse(req.body.privateKey.trim()) : req.body.privateKey;
    }

    await setting.save();

    res.status(200).json({
      status: true,
      message: "Setting has been updated.",
      data: setting,
    });

    // Update Host collection
    await Host.updateMany(
      {},
      {
        $set: {
          randomCallRate: setting.generalRandomCallRate,
          randomCallFemaleRate: setting.femaleRandomCallRate,
          randomCallMaleRate: setting.maleRandomCallRate,
          privateCallRate: setting.videoPrivateCallRate,
          audioCallRate: setting.audioPrivateCallRate,
          chatRate: setting.chatInteractionRate,
        },
      }
    );

    // updateSettingFile(setting); // uncomment if you have this function
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update setting switch/toggle
exports.updateSettingToggle = async (req, res) => {
  try {
    if (!req.query.settingId || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    const type = req.query.type.trim();
    const validToggleTypes = [
      "googlePlayEnabled",
      "stripeEnabled",
      "razorpayEnabled",
      "flutterwaveEnabled",
      "upiTranzactEnabled",
      "payuEnabled",
      "ccavenueEnabled",
      "phonePeEnabled",
      "googlePayEnabled",
      "smePayEnabled",
      "paytmEnabled",
      "cashfreeEnabled",
      "easebuzzEnabled",
      "isDemoData",
      "isAppEnabled",
      "isAutoRefreshEnabled",
    ];

    if (!validToggleTypes.includes(type)) {
      return res.status(200).json({ status: false, message: "type passed must be valid." });
    }

    setting[type] = !setting[type];
    await setting.save();

    res.status(200).json({ status: true, message: "Success", data: setting });

    // updateSettingFile(setting); // uncomment if you have this function
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get setting
exports.fetchSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    return res.status(200).json({ status: true, message: "Success", data: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};