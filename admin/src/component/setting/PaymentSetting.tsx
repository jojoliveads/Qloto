import Button from "@/extra/Button";
import { ExInput } from "@/extra/Input";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { getSetting, handleSetting, updateSetting } from "@/store/settingSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { isSkeleton } from "@/utils/allSelector";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface ErrorState {
  razorPaySecretKeyText: string;
  razorPayIdText: string;
  stripeSecretKeyText: string;
  stripePublishableKeyText: string;
  flutterWaveKeyText: string;
  upiTranzactMerchantIdText: string;
  upiTranzactPublicKeyText: string;
  upiTranzactSecretKeyText: string;
  payuMerchantKeyText: string;
  payuMerchantSaltText: string;
  ccavenueMerchantIdText: string;
  ccavenueAccessCodeText: string;
  ccavenueWorkingKeyText: string;
  phonePheMerchantIdText: string;
  phonePheApiKeyText: string;
  phonePheApiSecretText: string;
  googlePayMerchantIdText: string;
  smePayClientIdText: string;
  smePayClientSecretText: string;
  paytmMerchantIdText: string;
  paytmMerchantKeyText: string;
  paytmWebsiteCodeText: string;
  cashfreeAppIdText: string;
  cashfreeSecretKeyText: string;
  easebuzzKeyIdText: string;
  easebuzzKeySecretText: string;
}

const PaymentSetting = () => {
  const { setting }: any = useSelector((state: RootStore) => state?.setting);
  const roleSkeleton = useSelector(isSkeleton);

  // International gateways
  const [razorPaySecretKeyText, setrazorPaySecretKeyText] = useState<any>("");
  const [razorPayIdText, setRazorPayIdText] = useState<any>("");
  const [stripeSecretKeyText, setStripeSecretKeyText] = useState<any>("");
  const [stripePublishableKeyText, setstripePublishableKeyText] = useState<any>("");
  const [flutterWaveKeyText, setFlutterWaveKeyText] = useState<any>("");

  // UPI Tranzact
  const [upiTranzactMerchantIdText, setUpiTranzactMerchantIdText] = useState<any>("");
  const [upiTranzactPublicKeyText, setUpiTranzactPublicKeyText] = useState<any>("");
  const [upiTranzactSecretKeyText, setUpiTranzactSecretKeyText] = useState<any>("");

  // PayU
  const [payuMerchantKeyText, setPayuMerchantKeyText] = useState<any>("");
  const [payuMerchantSaltText, setPayuMerchantSaltText] = useState<any>("");

  // CCAvenue
  const [ccavenueMerchantIdText, setCcavenueMerchantIdText] = useState<any>("");
  const [ccavenueAccessCodeText, setCcavenueAccessCodeText] = useState<any>("");
  const [ccavenueWorkingKeyText, setCcavenueWorkingKeyText] = useState<any>("");

  // PhonePe
  const [phonePheMerchantIdText, setPhonePheMerchantIdText] = useState<any>("");
  const [phonePheApiKeyText, setPhonePheApiKeyText] = useState<any>("");
  const [phonePheApiSecretText, setPhonePheApiSecretText] = useState<any>("");

  // Google Pay
  const [googlePayMerchantIdText, setGooglePayMerchantIdText] = useState<any>("");

  // SMEPAAY (PhonePe)
  const [smePayClientIdText, setSmePayClientIdText] = useState<any>("");
  const [smePayClientSecretText, setSmePayClientSecretText] = useState<any>("");

  // PayTM
  const [paytmMerchantIdText, setPaytmMerchantIdText] = useState<any>("");
  const [paytmMerchantKeyText, setPaytmMerchantKeyText] = useState<any>("");
  const [paytmWebsiteCodeText, setPaytmWebsiteCodeText] = useState<any>("");

  // Cashfree
  const [cashfreeAppIdText, setCashfreeAppIdText] = useState<any>("");
  const [cashfreeSecretKeyText, setCashfreeSecretKeyText] = useState<any>("");

  // Easebuzz
  const [easebuzzKeyIdText, setEasebuzzKeyIdText] = useState<any>("");
  const [easebuzzKeySecretText, setEasebuzzKeySecretText] = useState<any>("");

  // Toggle states
  const [isRazorPay, setIsRazorPay] = useState<boolean>(false);
  const [isFlutterWave, setIsFlutterWave] = useState<boolean>(false);
  const [isStripePay, setIsStripe] = useState<boolean>(false);
  const [isUpiTranzact, setIsUpiTranzact] = useState<boolean>(false);
  const [isPayu, setIsPayu] = useState<boolean>(false);
  const [isCcavenue, setIsCcavenue] = useState<boolean>(false);
  const [isPhonePe, setIsPhonePe] = useState<boolean>(false);
  const [isGooglePay, setIsGooglePay] = useState<boolean>(false);
  const [isSmePay, setIsSmePay] = useState<boolean>(false);
  const [isPaytm, setIsPaytm] = useState<boolean>(false);
  const [isCashfree, setIsCashfree] = useState<boolean>(false);
  const [isEasebuzz, setIsEasebuzz] = useState<boolean>(false);
  const [googlePlayEnabled, setGooglePlayEnabled] = useState<boolean>(false);

  const [data, setData] = useState<any>();
  const [settingId, setSettingId] = useState<any>();
  const [error, setError] = useState<any>({});

  const dispatch = useAppDispatch();

  useEffect(() => {
    setData(setting);
  }, [setting]);

  useEffect(() => {
    if (setting && setting._id) {
      setSettingId(setting._id);
      
      // International
      setrazorPaySecretKeyText(setting?.razorpaySecretKey);
      setRazorPayIdText(setting?.razorpayId);
      setStripeSecretKeyText(setting?.stripeSecretKey);
      setstripePublishableKeyText(setting?.stripePublishableKey);
      setFlutterWaveKeyText(setting?.flutterwaveId);

      // UPI Tranzact
      setUpiTranzactMerchantIdText(setting?.upiTranzactMerchantId);
      setUpiTranzactPublicKeyText(setting?.upiTranzactPublicKey);
      setUpiTranzactSecretKeyText(setting?.upiTranzactSecretKey);

      // PayU
      setPayuMerchantKeyText(setting?.payuMerchantKey);
      setPayuMerchantSaltText(setting?.payuMerchantSalt);

      // CCAvenue
      setCcavenueMerchantIdText(setting?.ccavenueMerchantId);
      setCcavenueAccessCodeText(setting?.ccavenueAccessCode);
      setCcavenueWorkingKeyText(setting?.ccavenueWorkingKey);

      // PhonePe
      setPhonePheMerchantIdText(setting?.phonePheMerchantId);
      setPhonePheApiKeyText(setting?.phonePheApiKey);
      setPhonePheApiSecretText(setting?.phonePheApiSecret);

      // Google Pay
      setGooglePayMerchantIdText(setting?.googlePayMerchantId);

      // SMEPAAY
      setSmePayClientIdText(setting?.smePayClientId);
      setSmePayClientSecretText(setting?.smePayClientSecret);

      // PayTM
      setPaytmMerchantIdText(setting?.paytmMerchantId);
      setPaytmMerchantKeyText(setting?.paytmMerchantKey);
      setPaytmWebsiteCodeText(setting?.paytmWebsiteCode);

      // Cashfree
      setCashfreeAppIdText(setting?.cashfreeAppId);
      setCashfreeSecretKeyText(setting?.cashfreeSecretKey);

      // Easebuzz
      setEasebuzzKeyIdText(setting?.easebuzzKeyId);
      setEasebuzzKeySecretText(setting?.easebuzzKeySecret);

      // Toggles
      setIsRazorPay(setting?.razorpayEnabled);
      setIsFlutterWave(setting?.flutterwaveEnabled);
      setIsStripe(setting?.stripeEnabled);
      setIsUpiTranzact(setting?.upiTranzactEnabled);
      setIsPayu(setting?.payuEnabled);
      setIsCcavenue(setting?.ccavenueEnabled);
      setIsPhonePe(setting?.phonePeEnabled);
      setIsGooglePay(setting?.googlePayEnabled);
      setIsSmePay(setting?.smePayEnabled);
      setIsPaytm(setting?.paytmEnabled);
      setIsCashfree(setting?.cashfreeEnabled);
      setIsEasebuzz(setting?.easebuzzEnabled);
      setGooglePlayEnabled(setting?.googlePlayEnabled);
    }
  }, [setting]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let newErrors: any = {};

    // Validate required fields
    if (!razorPaySecretKeyText) newErrors.razorPaySecretKeyText = "RazorPay SecretKey is required!";
    if (!razorPayIdText) newErrors.razorPayIdText = "RazorPay ID is required!";
    if (!stripeSecretKeyText) newErrors.stripeSecretKeyText = "Stripe SecretKey is required!";
    if (!stripePublishableKeyText) newErrors.stripePublishableKeyText = "Stripe PublishableKey is required!";
    if (!flutterWaveKeyText) newErrors.flutterWaveKeyText = "FlutterWave Key is required!";
    if (!upiTranzactMerchantIdText) newErrors.upiTranzactMerchantIdText = "UPI Tranzact Merchant ID is required!";
    if (!upiTranzactPublicKeyText) newErrors.upiTranzactPublicKeyText = "UPI Tranzact Public Key is required!";
    if (!upiTranzactSecretKeyText) newErrors.upiTranzactSecretKeyText = "UPI Tranzact Secret Key is required!";
    if (!payuMerchantKeyText) newErrors.payuMerchantKeyText = "PayU Merchant Key is required!";
    if (!payuMerchantSaltText) newErrors.payuMerchantSaltText = "PayU Merchant Salt is required!";
    if (!ccavenueMerchantIdText) newErrors.ccavenueMerchantIdText = "CCAvenue Merchant ID is required!";
    if (!ccavenueAccessCodeText) newErrors.ccavenueAccessCodeText = "CCAvenue Access Code is required!";
    if (!ccavenueWorkingKeyText) newErrors.ccavenueWorkingKeyText = "CCAvenue Working Key is required!";
    if (!phonePheMerchantIdText) newErrors.phonePheMerchantIdText = "PhonePe Merchant ID is required!";
    if (!phonePheApiKeyText) newErrors.phonePheApiKeyText = "PhonePe API Key is required!";
    if (!phonePheApiSecretText) newErrors.phonePheApiSecretText = "PhonePe API Secret is required!";
    if (!googlePayMerchantIdText) newErrors.googlePayMerchantIdText = "Google Pay Merchant ID is required!";
    if (!smePayClientIdText) newErrors.smePayClientIdText = "SMEPAAY Client ID is required!";
    if (!smePayClientSecretText) newErrors.smePayClientSecretText = "SMEPAAY Client Secret is required!";
    if (!paytmMerchantIdText) newErrors.paytmMerchantIdText = "PayTM Merchant ID is required!";
    if (!paytmMerchantKeyText) newErrors.paytmMerchantKeyText = "PayTM Merchant Key is required!";
    if (!paytmWebsiteCodeText) newErrors.paytmWebsiteCodeText = "PayTM Website Code is required!";
    if (!cashfreeAppIdText) newErrors.cashfreeAppIdText = "Cashfree App ID is required!";
    if (!cashfreeSecretKeyText) newErrors.cashfreeSecretKeyText = "Cashfree Secret Key is required!";
    if (!easebuzzKeyIdText) newErrors.easebuzzKeyIdText = "Easebuzz Key ID is required!";
    if (!easebuzzKeySecretText) newErrors.easebuzzKeySecretText = "Easebuzz Key Secret is required!";

    if (Object.keys(newErrors).length > 0) {
      return setError(newErrors);
    }

    let settingDataSubmit = {
      // International
      razorpaySecretKey: razorPaySecretKeyText,
      razorpayId: razorPayIdText,
      stripeSecretKey: stripeSecretKeyText,
      stripePublishableKey: stripePublishableKeyText,
      flutterwaveId: flutterWaveKeyText,

      // UPI Tranzact
      upiTranzactMerchantId: upiTranzactMerchantIdText,
      upiTranzactPublicKey: upiTranzactPublicKeyText,
      upiTranzactSecretKey: upiTranzactSecretKeyText,

      // PayU
      payuMerchantKey: payuMerchantKeyText,
      payuMerchantSalt: payuMerchantSaltText,

      // CCAvenue
      ccavenueMerchantId: ccavenueMerchantIdText,
      ccavenueAccessCode: ccavenueAccessCodeText,
      ccavenueWorkingKey: ccavenueWorkingKeyText,

      // PhonePe
      phonePheMerchantId: phonePheMerchantIdText,
      phonePheApiKey: phonePheApiKeyText,
      phonePheApiSecret: phonePheApiSecretText,

      // Google Pay
      googlePayMerchantId: googlePayMerchantIdText,

      // SMEPAAY
      smePayClientId: smePayClientIdText,
      smePayClientSecret: smePayClientSecretText,

      // PayTM
      paytmMerchantId: paytmMerchantIdText,
      paytmMerchantKey: paytmMerchantKeyText,
      paytmWebsiteCode: paytmWebsiteCodeText,

      // Cashfree
      cashfreeAppId: cashfreeAppIdText,
      cashfreeSecretKey: cashfreeSecretKeyText,

      // Easebuzz
      easebuzzKeyId: easebuzzKeyIdText,
      easebuzzKeySecret: easebuzzKeySecretText,
    };

    const payload = {
      settingDataSubmit,
      settingId: data?._id,
    };

    dispatch(updateSetting(payload));
  };

  const handleSettingSwitch = (type: any) => {
    const payload = {
      settingId: settingId,
      type,
    };
    dispatch(handleSetting(payload));
  };

  const renderSkeletonBox = () => (
    <>
      {[{ type: "input" }, { type: "input" }, { type: "toggle" }].map((item, index) => (
        <div key={index} className="mb-4">
          <div className="skeleton mb-2" style={{ height: "16px", width: "30%", marginLeft: "15px" }} />
          <div
            className="skeleton"
            style={{
              height: item.type === "toggle" ? "24px" : "40px",
              width: item.type === "toggle" ? "50px" : "97%",
              borderRadius: item.type === "toggle" ? "12px" : "8px",
              marginLeft: "10px",
            }}
          />
        </div>
      ))}
    </>
  );

  const renderPaymentBox = (
    title: string,
    fields: Array<{
      label: string;
      id: string;
      value: string;
      onChange: (value: string) => void;
      errorKey: string;
    }>,
    toggleLabel: string,
    toggleValue: boolean,
    toggleType: string,
    isLoading: boolean = roleSkeleton
  ) => (
    <div className="col-12 col-md-6 mt-3">
      <div className="settingBoxOuter">
        <div className="settingBoxHeader">
          <h4 className="settingboxheader">{title}</h4>
          <hr style={{ width: "95%", margin: "5px 9px" }} />
        </div>
        {isLoading ? (
          renderSkeletonBox()
        ) : (
          <div style={{ padding: "0px 20px 10px" }}>
            {fields.map((field, index) => (
              <div key={index} className="col-12">
                <ExInput
                  type="text"
                  id={field.id}
                  name={field.id}
                  label={field.label}
                  placeholder={field.label}
                  errorMessage={error[field.errorKey] || ""}
                  value={field.value}
                  onChange={(e: any) => {
                    field.onChange(e.target.value);
                    if (!e.target.value) {
                      setError({ ...error, [field.errorKey]: `${field.label} is required!` });
                    } else {
                      setError({ ...error, [field.errorKey]: "" });
                    }
                  }}
                />
              </div>
            ))}
            <div className="inputData" style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <div>
                <label>{toggleLabel}</label>
              </div>
              <ToggleSwitch onClick={() => handleSettingSwitch(toggleType)} value={toggleValue} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mainSetting">
      <form onSubmit={handleSubmit} id="expertForm">
        <div className="d-flex justify-content-end">
          <div className="formFooter">
            <Button
              type="submit"
              className="text-light m10-left fw-bold"
              text="Submit"
              style={{ backgroundColor: "#9f5aff" }}
            />
          </div>
        </div>

        <div className="settingBox row">
          {/* International Gateways */}
          {renderPaymentBox(
            "Razorpay Setting",
            [
              {
                label: "Razorpay Secret Key",
                id: "razorSecretKey",
                value: razorPaySecretKeyText,
                onChange: setrazorPaySecretKeyText,
                errorKey: "razorPaySecretKeyText",
              },
              {
                label: "Razorpay ID",
                id: "razorPayId",
                value: razorPayIdText,
                onChange: setRazorPayIdText,
                errorKey: "razorPayIdText",
              },
            ],
            "Razorpay Active (Enable/Disable)",
            isRazorPay,
            "razorpayEnabled"
          )}

          {renderPaymentBox(
            "Stripe Payment Setting",
            [
              {
                label: "Stripe Secret Key",
                id: "stripeSecretKey",
                value: stripeSecretKeyText,
                onChange: setStripeSecretKeyText,
                errorKey: "stripeSecretKeyText",
              },
              {
                label: "Stripe Publishable Key",
                id: "stripePublishableKey",
                value: stripePublishableKeyText,
                onChange: setstripePublishableKeyText,
                errorKey: "stripePublishableKeyText",
              },
            ],
            "Stripe Active (Enable/Disable)",
            isStripePay,
            "stripeEnabled"
          )}

          {renderPaymentBox(
            "Flutterwave Setting",
            [
              {
                label: "Flutterwave ID",
                id: "flutterWaveId",
                value: flutterWaveKeyText,
                onChange: setFlutterWaveKeyText,
                errorKey: "flutterWaveKeyText",
              },
            ],
            "Flutterwave Active (Enable/Disable)",
            isFlutterWave,
            "flutterwaveEnabled"
          )}

          {/* Indian Payment Gateways */}
          {renderPaymentBox(
            "UPI Tranzact Setting",
            [
              {
                label: "UPI Tranzact Merchant ID",
                id: "upiTranzactMerchantId",
                value: upiTranzactMerchantIdText,
                onChange: setUpiTranzactMerchantIdText,
                errorKey: "upiTranzactMerchantIdText",
              },
              {
                label: "UPI Tranzact Public Key",
                id: "upiTranzactPublicKey",
                value: upiTranzactPublicKeyText,
                onChange: setUpiTranzactPublicKeyText,
                errorKey: "upiTranzactPublicKeyText",
              },
              {
                label: "UPI Tranzact Secret Key",
                id: "upiTranzactSecretKey",
                value: upiTranzactSecretKeyText,
                onChange: setUpiTranzactSecretKeyText,
                errorKey: "upiTranzactSecretKeyText",
              },
            ],
            "UPI Tranzact Active (Enable/Disable)",
            isUpiTranzact,
            "upiTranzactEnabled"
          )}

          {renderPaymentBox(
            "PayU Setting",
            [
              {
                label: "PayU Merchant Key",
                id: "payuMerchantKey",
                value: payuMerchantKeyText,
                onChange: setPayuMerchantKeyText,
                errorKey: "payuMerchantKeyText",
              },
              {
                label: "PayU Merchant Salt",
                id: "payuMerchantSalt",
                value: payuMerchantSaltText,
                onChange: setPayuMerchantSaltText,
                errorKey: "payuMerchantSaltText",
              },
            ],
            "PayU Active (Enable/Disable)",
            isPayu,
            "payuEnabled"
          )}

          {renderPaymentBox(
            "CCAvenue Setting",
            [
              {
                label: "CCAvenue Merchant ID",
                id: "ccavenueMerchantId",
                value: ccavenueMerchantIdText,
                onChange: setCcavenueMerchantIdText,
                errorKey: "ccavenueMerchantIdText",
              },
              {
                label: "CCAvenue Access Code",
                id: "ccavenueAccessCode",
                value: ccavenueAccessCodeText,
                onChange: setCcavenueAccessCodeText,
                errorKey: "ccavenueAccessCodeText",
              },
              {
                label: "CCAvenue Working Key",
                id: "ccavenueWorkingKey",
                value: ccavenueWorkingKeyText,
                onChange: setCcavenueWorkingKeyText,
                errorKey: "ccavenueWorkingKeyText",
              },
            ],
            "CCAvenue Active (Enable/Disable)",
            isCcavenue,
            "ccavenueEnabled"
          )}

          {renderPaymentBox(
            "PhonePe Setting",
            [
              {
                label: "PhonePe Merchant ID",
                id: "phonePheMerchantId",
                value: phonePheMerchantIdText,
                onChange: setPhonePheMerchantIdText,
                errorKey: "phonePheMerchantIdText",
              },
              {
                label: "PhonePe API Key",
                id: "phonePheApiKey",
                value: phonePheApiKeyText,
                onChange: setPhonePheApiKeyText,
                errorKey: "phonePheApiKeyText",
              },
              {
                label: "PhonePe API Secret",
                id: "phonePheApiSecret",
                value: phonePheApiSecretText,
                onChange: setPhonePheApiSecretText,
                errorKey: "phonePheApiSecretText",
              },
            ],
            "PhonePe Active (Enable/Disable)",
            isPhonePe,
            "phonePeEnabled"
          )}

          {renderPaymentBox(
            "Google Pay Setting",
            [
              {
                label: "Google Pay Merchant ID",
                id: "googlePayMerchantId",
                value: googlePayMerchantIdText,
                onChange: setGooglePayMerchantIdText,
                errorKey: "googlePayMerchantIdText",
              },
            ],
            "Google Pay Active (Enable/Disable)",
            isGooglePay,
            "googlePayEnabled"
          )}

          {renderPaymentBox(
            "SMEPAAY (PhonePe) Setting",
            [
              {
                label: "SMEPAAY Client ID",
                id: "smePayClientId",
                value: smePayClientIdText,
                onChange: setSmePayClientIdText,
                errorKey: "smePayClientIdText",
              },
              {
                label: "SMEPAAY Client Secret",
                id: "smePayClientSecret",
                value: smePayClientSecretText,
                onChange: setSmePayClientSecretText,
                errorKey: "smePayClientSecretText",
              },
            ],
            "SMEPAAY Active (Enable/Disable)",
            isSmePay,
            "smePayEnabled"
          )}

          {renderPaymentBox(
            "PayTM Setting",
            [
              {
                label: "PayTM Merchant ID",
                id: "paytmMerchantId",
                value: paytmMerchantIdText,
                onChange: setPaytmMerchantIdText,
                errorKey: "paytmMerchantIdText",
              },
              {
                label: "PayTM Merchant Key",
                id: "paytmMerchantKey",
                value: paytmMerchantKeyText,
                onChange: setPaytmMerchantKeyText,
                errorKey: "paytmMerchantKeyText",
              },
              {
                label: "PayTM Website Code",
                id: "paytmWebsiteCode",
                value: paytmWebsiteCodeText,
                onChange: setPaytmWebsiteCodeText,
                errorKey: "paytmWebsiteCodeText",
              },
            ],
            "PayTM Active (Enable/Disable)",
            isPaytm,
            "paytmEnabled"
          )}

          {renderPaymentBox(
            "Cashfree Setting",
            [
              {
                label: "Cashfree App ID",
                id: "cashfreeAppId",
                value: cashfreeAppIdText,
                onChange: setCashfreeAppIdText,
                errorKey: "cashfreeAppIdText",
              },
              {
                label: "Cashfree Secret Key",
                id: "cashfreeSecretKey",
                value: cashfreeSecretKeyText,
                onChange: setCashfreeSecretKeyText,
                errorKey: "cashfreeSecretKeyText",
              },
            ],
            "Cashfree Active (Enable/Disable)",
            isCashfree,
            "cashfreeEnabled"
          )}

          {renderPaymentBox(
            "Easebuzz Setting",
            [
              {
                label: "Easebuzz Key ID",
                id: "easebuzzKeyId",
                value: easebuzzKeyIdText,
                onChange: setEasebuzzKeyIdText,
                errorKey: "easebuzzKeyIdText",
              },
              {
                label: "Easebuzz Key Secret",
                id: "easebuzzKeySecret",
                value: easebuzzKeySecretText,
                onChange: setEasebuzzKeySecretText,
                errorKey: "easebuzzKeySecretText",
              },
            ],
            "Easebuzz Active (Enable/Disable)",
            isEasebuzz,
            "easebuzzEnabled"
          )}

          {/* Google Play Setting */}
          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4 className="settingboxheader">Google Play Setting</h4>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
              </div>
              <div className="d-flex justify-content-between align-items-start" style={{ paddingRight: "20px" }}>
                {roleSkeleton ? (
                  <>
                    <div className="skeleton mb-4" style={{ height: "24px", width: "60%", marginLeft: "15px" }} />
                    <div className="skeleton mb-4" style={{ height: "24px", width: "7%", borderRadius: "20px" }} />
                  </>
                ) : (
                  <>
                    <p className="isfake">Google Play (Enable/Disable)</p>
                    <div>
                      <ToggleSwitch onClick={() => handleSettingSwitch("googlePlayEnabled")} value={googlePlayEnabled} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentSetting;