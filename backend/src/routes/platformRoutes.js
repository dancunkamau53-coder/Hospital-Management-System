const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const controller = require("../controllers/platformController");

router.use(authMiddleware);

router.get("/organizations", controller.listOrganizations);
router.post("/organizations", authorizeRoles("ADMIN", "SUPER_ADMIN", "PLATFORM_ADMIN"), controller.createOrganization);

router.post("/laboratory/orders", authorizeRoles("DOCTOR", "ADMIN", "NURSE"), controller.createLaboratoryOrder);
router.get("/laboratory/orders", authorizeRoles("DOCTOR", "ADMIN", "NURSE", "LAB_TECHNICIAN", "PATIENT"), controller.listLaboratoryOrders);
router.post("/laboratory/orders/:orderId/results", authorizeRoles("LAB_TECHNICIAN", "ADMIN", "DOCTOR"), controller.addLaboratoryResult);

router.post("/referrals", authorizeRoles("DOCTOR", "ADMIN"), controller.createReferral);
router.get("/referrals", authorizeRoles("DOCTOR", "ADMIN", "PATIENT"), controller.listReferrals);
router.post("/consents", authorizeRoles("PATIENT", "DOCTOR", "ADMIN"), controller.createConsent);

router.post("/insurance/policies", authorizeRoles("PATIENT", "ADMIN", "INSURANCE_ADMIN"), controller.createPolicy);
router.post("/insurance/claims", authorizeRoles("ADMIN", "FINANCE_OFFICER", "INSURANCE_ADMIN"), controller.createClaim);

router.get("/notifications", controller.listNotifications);
router.patch("/notifications/:notificationId/read", controller.markNotificationRead);
router.post("/doctors/:doctorId/availability", authorizeRoles("DOCTOR", "ADMIN"), controller.setAvailability);

router.get("/wallet/:patientId", authorizeRoles("PATIENT", "ADMIN", "CASHIER", "FINANCE_OFFICER"), controller.getWallet);
router.post("/wallet/transactions", authorizeRoles("ADMIN", "CASHIER", "FINANCE_OFFICER"), controller.createWalletTransaction);
router.get("/analytics/summary", authorizeRoles("ADMIN", "SUPER_ADMIN", "PLATFORM_ADMIN", "GOVERNMENT", "AUDITOR"), controller.getAnalyticsSummary);

module.exports = router;
