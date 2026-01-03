const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    privacyPolicyLink: { type: String, default: "PRIVACY POLICY LINK" },
    termsOfUsePolicyLink: { type: String, default: "TERMS OF USE POLICY LINK" },
    googlePlayEnabled: { type: Boolean, default: false },

    // International Payment Gateways
    stripeEnabled: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: "STRIPE PUBLISHABLE KEY" },
    stripeSecretKey: { type: String, default: "STRIPE SECRET KEY" },
    flutterwaveEnabled: { type: Boolean, default: false },
    flutterwaveId: { type: String, default: "FLUTTER WAVE ID" },

    // Indian Payment Gateways
    // Razorpay
    razorpayEnabled: { type: Boolean, default: false },
    razorpayId: { type: String, default: "RAZOR PAY ID" },
    razorpaySecretKey: { type: String, default: "RAZOR SECRET KEY" },

    // UPI Tranzact
    upiTranzactEnabled: { type: Boolean, default: false },
    upiTranzactMerchantId: { type: String, default: "UPI TRANZACT MERCHANT ID" },
    upiTranzactPublicKey: { type: String, default: "UPI TRANZACT PUBLIC KEY" },
    upiTranzactSecretKey: { type: String, default: "UPI TRANZACT SECRET KEY" },

    // PayU
    payuEnabled: { type: Boolean, default: false },
    payuMerchantKey: { type: String, default: "PAYU MERCHANT KEY" },
    payuMerchantSalt: { type: String, default: "PAYU MERCHANT SALT" },

    // CCAvenue
    ccavenueEnabled: { type: Boolean, default: false },
    ccavenueMerchantId: { type: String, default: "CCAVENUE MERCHANT ID" },
    ccavenueAccessCode: { type: String, default: "CCAVENUE ACCESS CODE" },
    ccavenueWorkingKey: { type: String, default: "CCAVENUE WORKING KEY" },

    // PhonePe
    phonePeEnabled: { type: Boolean, default: false },
    phonePheMerchantId: { type: String, default: "PHONEPE MERCHANT ID" },
    phonePheApiKey: { type: String, default: "PHONEPE API KEY" },
    phonePheApiSecret: { type: String, default: "PHONEPE API SECRET" },

    // Google Pay
    googlePayEnabled: { type: Boolean, default: false },
    googlePayMerchantId: { type: String, default: "GOOGLE PAY MERCHANT ID" },

    // SMEPAAY (PhonePe)
    smePayEnabled: { type: Boolean, default: false },
    smePayClientId: { type: String, default: "SMEPAAY CLIENT ID" },
    smePayClientSecret: { type: String, default: "SMEPAAY CLIENT SECRET" },

    // PayTM
    paytmEnabled: { type: Boolean, default: false },
    paytmMerchantId: { type: String, default: "PAYTM MERCHANT ID" },
    paytmMerchantKey: { type: String, default: "PAYTM MERCHANT KEY" },
    paytmWebsiteCode: { type: String, default: "PAYTM WEBSITE CODE" },

    // Cashfree
    cashfreeEnabled: { type: Boolean, default: false },
    cashfreeAppId: { type: String, default: "CASHFREE APP ID" },
    cashfreeSecretKey: { type: String, default: "CASHFREE SECRET KEY" },

    // Easebuzz
    easebuzzEnabled: { type: Boolean, default: false },
    easebuzzKeyId: { type: String, default: "EASEBUZZ KEY ID" },
    easebuzzKeySecret: { type: String, default: "EASEBUZZ KEY SECRET" },

    // Agora
    agoraAppId: { type: String, default: "AGORA APP ID" },
    agoraAppCertificate: { type: String, default: "AGORA APP CERTIFICATE" },

    loginBonus: { type: Number, default: 0 },
    isDemoData: { type: Boolean, default: false },
    isAppEnabled: { type: Boolean, default: true },
    isAutoRefreshEnabled: { type: Boolean, default: false },
    
    currency: {
      name: { type: String, default: "" },
      symbol: { type: String, default: "" },
      countryCode: { type: String, default: "" },
      currencyCode: { type: String, default: "" },
      isDefault: { type: Boolean, default: false },
    },

    privateKey: { type: Object, default: {} },

    generalRandomCallRate: { type: Number, default: 0 },
    femaleRandomCallRate: { type: Number, default: 0 },
    maleRandomCallRate: { type: Number, default: 0 },
    videoPrivateCallRate: { type: Number, default: 0 },
    audioPrivateCallRate: { type: Number, default: 0 },
    maxFreeChatMessages: { type: Number, default: 0 },
    chatInteractionRate: { type: Number, default: 0 },
    adminCommissionRate: { type: Number, default: 0 },
    minCoinsToConvert: { type: Number, default: 0 },
    minCoinsForHostPayout: { type: Number, default: 0 },
    minCoinsForAgencyPayout: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// settingSchema.index({ _id: -1 });

module.exports = mongoose.model("Setting", settingSchema);