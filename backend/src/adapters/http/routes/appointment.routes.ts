import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  getAvailableSlots,
  getMyAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  getAdminAppointments,
  bookAppointment,
  cancelAppointment,
  changeAppointmentStatus,
} from "../controllers/appointment.controller";

const router = Router();

// Pública - cualquiera puede ver slots disponibles
router.get("/available", getAvailableSlots);

// Paciente
router.get("/mine", authenticate, authorize("PATIENT"), getMyAppointments);
router.post("/", authenticate, authorize("PATIENT"), bookAppointment);
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("PATIENT"),
  cancelAppointment,
);

// Médico
router.get("/doctor", authenticate, authorize("DOCTOR"), getDoctorAppointments);
router.get(
  "/patient/:dni",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  getPatientAppointments,
);

// Admin
router.get("/admin", authenticate, authorize("ADMIN"), getAdminAppointments);

// Médico o admin
router.patch(
  "/:id/status",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  changeAppointmentStatus,
);

export default router;
