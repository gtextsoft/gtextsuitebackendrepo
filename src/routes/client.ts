import express from "express";
import {
  getClientDashboard,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getClientProperties,
  getClientPayments,
  getClientInvoices,
  getClientInvoiceById,
  getClientSettings,
  updateClientPreferences,
} from "../controllers/client.controller";
import { authenticate, requireVerified } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate, requireVerified);

router.get("/dashboard", getClientDashboard);
router.get("/bookmarks", getBookmarks);
router.post("/bookmarks", addBookmark);
router.delete("/bookmarks/:id", removeBookmark);
router.get("/properties", getClientProperties);
router.get("/payments", getClientPayments);
router.get("/invoices", getClientInvoices);
router.get("/invoices/:id", getClientInvoiceById);
router.get("/settings", getClientSettings);
router.patch("/preferences", updateClientPreferences);

export default router;
