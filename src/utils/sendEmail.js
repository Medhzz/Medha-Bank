import emailjs from "emailjs-com";

export const sendAccountStatusEmail = async (customerEmail, customerName, action, remarks = "") => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS not configured — skipping email notification.");
    return;
  }

  const actionMessages = {
    approved: "Your Medha Bank account has been approved! You can now log in and start using your account.",
    rejected: "Unfortunately, your Medha Bank account application has been rejected. Please contact support for more information.",
    hold: "Your Medha Bank account has been placed on hold. Our team will review it shortly.",
  };

  const templateParams = {
    to_email: customerEmail,
    to_name: customerName,
    action: action.charAt(0).toUpperCase() + action.slice(1),
    message: actionMessages[action] || "Your account status has been updated.",
    remarks: remarks || "No additional remarks.",
    bank_name: "Medha Bank",
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};
