import express from "express";

import jobController from "@/controllers/job.controller";
import auth from "@/middlewares/auth";
import upload from "@/middlewares/upload";
import validate from "@/middlewares/validate";
import jobValidation from "@/validations/job.validation";

const router = express.Router();

router.post("/import", auth(), upload(), jobController.importJobs);
router.get("/:id", auth(), validate(jobValidation.getJob), jobController.getJob);

export default router;

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management and import transactions
 */

/**
 * @swagger
 * /jobs/import:
 *   post:
 *     summary: Import transactions from a CSV file
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: uuid
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the job
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
