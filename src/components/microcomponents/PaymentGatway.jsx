import React, { useState, useEffect } from "react";
import * as Lucide from "lucide-react";
import { toast } from "react-toastify";

const PaymentGatewayPage = ({
  amount,
  bookingId,
  currency = "₹",
  onPaymentSuccess,
  onPaymentFailure,
  customerDetails = {},
  description = "Ambulance Booking Payment",
  allowedMethods = ["card", "upi", "wallet", "netbanking"],
  theme = {
    primaryColor: "#0E1630",
    accentColor: "#01D48C",
    surfaceColor: "#FFFFFF",
  },
}) => {
  const [currentStep, setCurrentStep] = useState("method-selection");
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [upiForm, setUpiForm] = useState({ upiId: "", method: "qr" });
  const [walletForm, setWalletForm] = useState({
    provider: "paytm",
    mobile: "",
  });
  const [netbankingForm, setNetbankingForm] = useState({ bank: "" });
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          toast.error("Payment session expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: Lucide.CreditCard,
      description: "Visa, Mastercard, RuPay",
      color: "text-blue-600",
    },
    {
      id: "upi",
      name: "UPI Payment",
      icon: Lucide.Smartphone,
      description: "Google Pay, PhonePe, Paytm",
      color: "text-green-600",
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: Lucide.Wallet,
      description: "Paytm, Amazon Pay, Mobikwik",
      color: "text-purple-600",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Lucide.Building,
      description: "All major banks",
      color: "text-orange-600",
    },
  ].filter((method) => allowedMethods.includes(method.id));

  const banks = [
    { id: "sbi", name: "State Bank of India" },
    { id: "hdfc", name: "HDFC Bank" },
    { id: "icici", name: "ICICI Bank" },
    { id: "axis", name: "Axis Bank" },
    { id: "kotak", name: "Kotak Mahindra Bank" },
    { id: "pnb", name: "Punjab National Bank" },
  ];

  const walletProviders = [
    { id: "paytm", name: "Paytm" },
    { id: "amazonpay", name: "Amazon Pay" },
    { id: "mobikwik", name: "Mobikwik" },
  ];

  const handleMethodSelect = (methodId) => setSelectedMethod(methodId);
  const proceedToPayment = () => setCurrentStep("payment-form");

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(cardForm).every((field) => field)) {
      toast.error("Please fill all card details");
      return;
    }
    setLoading(true);
    setCurrentStep("processing");
    setTimeout(() => {
      setOtpStep(true);
      setLoading(false);
      toast.info("OTP sent to your registered mobile number");
    }, 2000);
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    setCurrentStep("confirm-payment");
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentStep("processing");
    setTimeout(() => {
      setOtpStep(true);
      setLoading(false);
      toast.info("OTP sent to your mobile number");
    }, 2000);
  };

  const handleNetbankingSubmit = (e) => {
    e.preventDefault();
    if (!netbankingForm.bank) {
      toast.error("Please select a bank");
      return;
    }
    setLoading(true);
    setCurrentStep("processing");
    setTimeout(() => {
      if (Math.random() > 0.2) {
        setCurrentStep("success");
        onPaymentSuccess({
          paymentId: `NB_${Date.now()}`,
          method: "Net Banking",
          amount,
          bookingId,
        });
      } else {
        setCurrentStep("failure");
        onPaymentFailure({ reason: "Net banking authentication failed" });
      }
      setLoading(false);
    }, 4000);
  };

  const handleOtpVerify = () => {
    if (!otp || otp.length !== 4) {
      toast.error("Please enter valid 4-digit OTP");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (otp === "1234") {
        setCurrentStep("success");
        onPaymentSuccess({
          paymentId: `${selectedMethod.toUpperCase()}_${Date.now()}`,
          method:
            selectedMethod === "card" ? "Credit/Debit Card" : "Digital Wallet",
          amount,
          bookingId,
        });
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
      setLoading(false);
    }, 2000);
  };

  const resetPayment = () => {
    setCurrentStep("method-selection");
    setSelectedMethod("card");
    setOtpStep(false);
    setOtp("");
    setCardForm({
      cardNumber: "",
      nameOnCard: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    });
    setUpiForm({ upiId: "", method: "qr" });
    setWalletForm({ provider: "paytm", mobile: "" });
    setNetbankingForm({ bank: "" });
  };

  const goBack = () => {
    setCurrentStep("method-selection");
    setOtpStep(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Lucide.CreditCard className="text-gray-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Payment Gateway</h2>
                <p className="text-sm text-gray-500">
                  Secure Payment Processing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-full overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-gray-800 text-sm">Amount to Pay</div>
                <div className="text-gray-800 text-2xl font-bold">
                  {currency}
                  {amount}
                </div>
              </div>
              <div className="text-gray-800 text-sm">
                ⏳ {formatTime(timeLeft)}
              </div>
            </div>
            {bookingId && (
              <div className="mt-2 text-sm text-gray-500">
                Booking ID: #{bookingId}
              </div>
            )}
          </div>
          <div className="p-6">
            {currentStep === "method-selection" && (
              <div className="space-y-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: theme.primaryColor }}
                >
                  Select Payment Method
                </h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <div
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedMethod === method.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.color} bg-opacity-10`}
                          >
                            <IconComponent className={method.color} size={24} />
                          </div>
                          <div className="flex-1">
                            <div
                              className="font-semibold"
                              style={{ color: theme.primaryColor }}
                            >
                              {method.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {method.description}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 ${
                              selectedMethod === method.id
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedMethod === method.id && (
                              <Lucide.Check className="text-white w-3 h-3 m-0.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={proceedToPayment}
                  className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  Proceed to Payment
                </button>
              </div>
            )}
            {currentStep === "payment-form" && !otpStep && (
              <div>
                {selectedMethod === "card" && (
                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    <h3
                      className="text-lg font-semibold flex items-center gap-2"
                      style={{ color: theme.primaryColor }}
                    >
                      <Lucide.CreditCard className="text-blue-600" size={20} />{" "}
                      Card Details
                    </h3>
                    {["Card Number", "Name on Card"].map((label, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {label}
                        </label>
                        <input
                          type={label === "Card Number" ? "text" : "text"}
                          placeholder={
                            label === "Card Number"
                              ? "1234 5678 9012 3456"
                              : "John Doe"
                          }
                          value={
                            label === "Card Number"
                              ? cardForm.cardNumber
                              : cardForm.nameOnCard
                          }
                          onChange={(e) =>
                            setCardForm({
                              ...cardForm,
                              [label === "Card Number"
                                ? "cardNumber"
                                : "nameOnCard"]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          maxLength={label === "Card Number" ? 19 : undefined}
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-3 gap-3">
                      {["Month", "Year", "CVV"].map((label, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {label}
                          </label>
                          <input
                            type={label === "CVV" ? "password" : "text"}
                            placeholder={
                              label === "Month"
                                ? "MM"
                                : label === "Year"
                                ? "YY"
                                : "123"
                            }
                            value={
                              label === "Month"
                                ? cardForm.expiryMonth
                                : label === "Year"
                                ? cardForm.expiryYear
                                : cardForm.cvv
                            }
                            onChange={(e) =>
                              setCardForm({
                                ...cardForm,
                                [label === "Month"
                                  ? "expiryMonth"
                                  : label === "Year"
                                  ? "expiryYear"
                                  : "cvv"]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            maxLength={label === "CVV" ? 4 : undefined}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lucide.Shield className="text-green-600" size={16} />{" "}
                      256-bit SSL Encrypted
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Lucide.Loader2 className="animate-spin" size={16} />{" "}
                          Processing...
                        </div>
                      ) : (
                        `Pay ${currency}${amount}`
                      )}
                    </button>
                  </form>
                )}
                {selectedMethod === "upi" && (
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold flex items-center gap-2"
                      style={{ color: theme.primaryColor }}
                    >
                      <Lucide.Smartphone className="text-green-600" size={20} />{" "}
                      UPI Payment
                    </h3>
                    <div className="space-y-3">
                      {["Scan QR Code", "Enter UPI ID"].map((method, index) => (
                        <label
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="upiMethod"
                            value={method === "Scan QR Code" ? "qr" : "id"}
                            checked={
                              upiForm.method ===
                              (method === "Scan QR Code" ? "qr" : "id")
                            }
                            onChange={(e) =>
                              setUpiForm({ ...upiForm, method: e.target.value })
                            }
                          />
                          <div>
                            <div className="font-medium">{method}</div>
                            <div className="text-sm text-gray-500">
                              Use any UPI app
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {upiForm.method === "qr" && (
                      <div className="text-center py-6">
                        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <Lucide.QrCode size={80} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Scan with any UPI app to pay {currency}
                          {amount}
                        </p>
                      </div>
                    )}
                    {upiForm.method === "id" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter UPI ID
                        </label>
                        <input
                          type="text"
                          placeholder="user@paytm"
                          value={upiForm.upiId}
                          onChange={(e) =>
                            setUpiForm({ ...upiForm, upiId: e.target.value })
                          }
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleUpiSubmit}
                      disabled={loading}
                      className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Lucide.Loader2 className="animate-spin" size={16} />{" "}
                          Waiting for payment...
                        </div>
                      ) : (
                        `Pay ${currency}${amount} via UPI`
                      )}
                    </button>
                  </div>
                )}
                {selectedMethod === "wallet" && (
                  <form onSubmit={handleWalletSubmit} className="space-y-4">
                    <h3
                      className="text-lg font-semibold flex items-center gap-2"
                      style={{ color: theme.primaryColor }}
                    >
                      <Lucide.Wallet className="text-purple-600" size={20} />{" "}
                      Digital Wallet
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Wallet
                      </label>
                      <select
                        value={walletForm.provider}
                        onChange={(e) =>
                          setWalletForm({
                            ...walletForm,
                            provider: e.target.value,
                          })
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        {walletProviders.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={walletForm.mobile}
                        onChange={(e) =>
                          setWalletForm({ ...walletForm, mobile: e.target.value })
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        maxLength={10}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Lucide.Loader2 className="animate-spin" size={16} />{" "}
                          Processing...
                        </div>
                      ) : (
                        `Pay ${currency}${amount}`
                      )}
                    </button>
                  </form>
                )}
                {selectedMethod === "netbanking" && (
                  <form onSubmit={handleNetbankingSubmit} className="space-y-4">
                    <h3
                      className="text-lg font-semibold flex items-center gap-2"
                      style={{ color: theme.primaryColor }}
                    >
                      <Lucide.Building className="text-orange-600" size={20} />{" "}
                      Net Banking
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Your Bank
                      </label>
                      <select
                        value={netbankingForm.bank}
                        onChange={(e) =>
                          setNetbankingForm({
                            ...netbankingForm,
                            bank: e.target.value,
                          })
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Choose your bank</option>
                        {banks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Lucide.AlertTriangle
                          className="text-yellow-600 mt-0.5"
                          size={16}
                        />
                        <div className="text-sm text-yellow-800">
                          You will be redirected to your bank's secure login page
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Lucide.Loader2 className="animate-spin" size={16} />{" "}
                          Redirecting...
                        </div>
                      ) : (
                        "Proceed to Bank"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
            {otpStep && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Lucide.Shield className="text-blue-600" size={32} />
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: theme.primaryColor }}
                >
                  Enter OTP
                </h3>
                <p className="text-sm text-gray-600">
                  We've sent a 4-digit code to your registered mobile number
                </p>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const newOtp = otp.split("");
                        newOtp[index] = e.target.value;
                        setOtp(newOtp.join(""));
                        if (e.target.value && index < 3) {
                          const nextInput =
                            e.target.parentElement.children[index + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-bold border-2 rounded-lg focus:border-blue-500 outline-none"
                    />
                  ))}
                </div>
                <button
                  onClick={handleOtpVerify}
                  disabled={loading || otp.length !== 4}
                  className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Lucide.Loader2 className="animate-spin" size={16} />{" "}
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Pay"
                  )}
                </button>
                <p className="text-xs text-gray-500">
                  Hint: Use OTP "1234" for demo
                </p>
              </div>
            )}
            {currentStep === "processing" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lucide.Loader2
                    className="text-blue-600 animate-spin"
                    size={32}
                  />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.primaryColor }}
                >
                  Processing Payment
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we process your payment...
                </p>
              </div>
            )}
            {currentStep === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lucide.CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-green-600">
                  Payment Successful!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your payment of {currency}
                  {amount} has been processed successfully
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-semibold">
                      {currency}
                      {amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-semibold">
                      {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-semibold">TXN{Date.now()}</span>
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full mt-4 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  Continue
                </button>
              </div>
            )}
            {currentStep === "failure" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lucide.XCircle className="text-red-600" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  Payment Failed
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your payment could not be processed. Please try again.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={resetPayment}
                    className="flex-1 py-3 border-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: theme.accentColor,
                      color: theme.accentColor,
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {currentStep === "confirm-payment" && selectedMethod === "upi" && (
              <div className="text-center space-y-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: theme.primaryColor }}
                >
                  Confirm UPI Payment
                </h3>
                <p className="text-sm text-gray-600">
                  Please confirm your payment of {currency}
                  {amount} using UPI.
                </p>
                <button
                  onClick={() => {
                    setCurrentStep("processing");
                    setLoading(true);
                    setTimeout(() => {
                      if (Math.random() > 0.3) {
                        setCurrentStep("success");
                        onPaymentSuccess({
                          paymentId: `UPI_${Date.now()}`,
                          method: "UPI",
                          amount,
                          bookingId,
                        });
                      } else {
                        setCurrentStep("failure");
                        onPaymentFailure({ reason: "UPI payment declined" });
                      }
                      setLoading(false);
                    }, 3000);
                  }}
                  className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  Confirm Payment
                </button>
              </div>
            )}
            {currentStep !== "method-selection" && (
              <button
                onClick={goBack}
                className="w-full py-3 mb-4 text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayPage;