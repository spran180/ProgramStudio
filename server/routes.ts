import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { authenticateToken, requireRole, hashPassword, comparePassword, generateToken, type AuthRequest } from "./services/auth.js";
import { generateQuestion, getCodeFeedback } from "./services/ai.js";
import { executeCode } from "./services/codeExecution.js";
import { loginSchema, signupSchema, insertEventSchema, insertQuestionSchema, insertSubmissionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const passwordValid = await comparePassword(validatedData.password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  });

  // Event routes
  app.post("/api/events", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      
      const event = await storage.createEvent({
        ...validatedData,
        createdBy: req.user!.id,
      });

      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });

  app.get("/api/events", authenticateToken, async (req: AuthRequest, res) => {
    if (req.user!.role === "organizer") {
      const events = await storage.getEventsByOrganizer(req.user!.id);
      res.json(events);
    } else {
      const events = await storage.getUserEvents(req.user!.id);
      res.json(events);
    }
  });

  app.get("/api/events/:id", authenticateToken, async (req: AuthRequest, res) => {
    const event = await storage.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user has access
    if (req.user!.role === "participant") {
      const hasAccess = await storage.isUserInEvent(event.id, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.user!.role === "organizer" && event.createdBy !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(event);
  });

  app.post("/api/events/join", authenticateToken, requireRole("participant"), async (req: AuthRequest, res) => {
    try {
      const { code } = req.body;
      
      const event = await storage.getEventByCode(code);
      if (!event) {
        return res.status(404).json({ message: "Invalid event code" });
      }

      // Check if already joined
      const alreadyJoined = await storage.isUserInEvent(event.id, req.user!.id);
      if (alreadyJoined) {
        return res.status(400).json({ message: "Already joined this event" });
      }

      await storage.joinEvent(event.id, req.user!.id);
      res.json({ message: "Successfully joined event", event });
    } catch (error) {
      res.status(400).json({ message: "Error joining event", error: error.message });
    }
  });

  // Question routes
  app.post("/api/questions/generate", authenticateToken, requireRole("organizer"), async (req: AuthRequest, res) => {
    try {
      const { eventId, difficulty, topic, requirements } = req.body;

      // Verify event ownership
      const event = await storage.getEvent(eventId);
      if (!event || event.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const generatedQuestion = await generateQuestion({
        difficulty,
        topic,
        requirements,
      });

      const question = await storage.createQuestion({
        eventId,
        title: generatedQuestion.title,
        description: generatedQuestion.description,
        difficulty,
        timeLimit: 3600,
        memoryLimit: 256,
        testCases: generatedQuestion.testCases,
        constraints: generatedQuestion.constraints,
        examples: generatedQuestion.examples,
      });

      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Error generating question", error: error.message });
    }
  });

  app.get("/api/events/:eventId/questions", authenticateToken, async (req: AuthRequest, res) => {
    const { eventId } = req.params;
    
    // Verify access
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.user!.role === "participant") {
      const hasAccess = await storage.isUserInEvent(eventId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.user!.role === "organizer" && event.createdBy !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const questions = await storage.getEventQuestions(eventId);
    res.json(questions);
  });

  app.get("/api/questions/:id", authenticateToken, async (req: AuthRequest, res) => {
    const question = await storage.getQuestion(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Verify access
    const event = await storage.getEvent(question.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.user!.role === "participant") {
      const hasAccess = await storage.isUserInEvent(question.eventId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.user!.role === "organizer" && event.createdBy !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(question);
  });

  // Submission routes
  app.post("/api/submissions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      
      // Verify question access
      const question = await storage.getQuestion(validatedData.questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const hasAccess = await storage.isUserInEvent(question.eventId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create initial submission
      const submission = await storage.createSubmission({
        ...validatedData,
        userId: req.user!.id,
        status: "pending",
      });

      // Execute code asynchronously
      executeCode(
        validatedData.code,
        validatedData.language,
        question.testCases,
        question.timeLimit * 1000
      ).then(async (result) => {
        let feedback = "";
        if (result.status !== "accepted") {
          feedback = await getCodeFeedback(
            validatedData.code,
            question.description,
            result.errorMessage || "Code did not pass all test cases"
          );
        }

        const score = result.status === "accepted" ? 100 : Math.floor((result.passedTests / result.totalTests) * 50);

        await storage.updateSubmission(submission.id, {
          status: result.status,
          score,
          executionTime: result.executionTime,
          feedback,
        });
      }).catch(console.error);

      res.json(submission);
    } catch (error) {
      res.status(400).json({ message: "Error creating submission", error: error.message });
    }
  });

  app.get("/api/submissions/:id", authenticateToken, async (req: AuthRequest, res) => {
    const submission = await storage.getSubmission(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Verify access
    if (submission.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(submission);
  });

  app.get("/api/users/:userId/submissions", authenticateToken, async (req: AuthRequest, res) => {
    const { userId } = req.params;
    const { questionId } = req.query;

    // Verify access
    if (userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const submissions = await storage.getUserSubmissions(userId, questionId as string);
    res.json(submissions);
  });

  // Leaderboard routes
  app.get("/api/events/:eventId/leaderboard", authenticateToken, async (req: AuthRequest, res) => {
    const { eventId } = req.params;
    
    // Verify access
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.user!.role === "participant") {
      const hasAccess = await storage.isUserInEvent(eventId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.user!.role === "organizer" && event.createdBy !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const leaderboard = await storage.getLeaderboard(eventId);
    res.json(leaderboard);
  });

  // Stats routes
  app.get("/api/stats", authenticateToken, requireRole("organizer"), async (req: AuthRequest, res) => {
    const events = await storage.getEventsByOrganizer(req.user!.id);
    
    let totalParticipants = 0;
    let totalQuestions = 0;
    let totalSubmissions = 0;

    for (const event of events) {
      const participants = await storage.getEventParticipants(event.id);
      const questions = await storage.getEventQuestions(event.id);
      
      totalParticipants += participants.length;
      totalQuestions += questions.length;
      
      // Count submissions for this event's questions
      for (const question of questions) {
        const submissions = await storage.getUserSubmissions("", question.id);
        totalSubmissions += submissions.length;
      }
    }

    res.json({
      totalEvents: events.length,
      activeParticipants: totalParticipants,
      questionsCreated: totalQuestions,
      totalSubmissions,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
