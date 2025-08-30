import { 
  type User, 
  type InsertUser, 
  type Event, 
  type InsertEvent,
  type Question,
  type InsertQuestion,
  type Submission,
  type InsertSubmission,
  type EventParticipant
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getEventByCode(code: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Event Participants
  joinEvent(eventId: string, userId: string): Promise<EventParticipant>;
  getEventParticipants(eventId: string): Promise<User[]>;
  getUserEvents(userId: string): Promise<Event[]>;
  isUserInEvent(eventId: string, userId: string): Promise<boolean>;

  // Questions
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getEventQuestions(eventId: string): Promise<Question[]>;
  updateQuestion(id: string, updates: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;

  // Submissions
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getUserSubmissions(userId: string, questionId?: string): Promise<Submission[]>;
  updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined>;
  getLeaderboard(eventId: string): Promise<Array<{
    user: User;
    score: number;
    solved: number;
    lastSubmission: Date | null;
  }>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private eventParticipants: Map<string, EventParticipant>;
  private questions: Map<string, Question>;
  private submissions: Map<string, Submission>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventParticipants = new Map();
    this.questions = new Map();
    this.submissions = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Events
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventByCode(code: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(event => event.code === code);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const event: Event = {
      ...insertEvent,
      id,
      code,
      isActive: false,
      createdAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.createdBy === organizerId);
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Event Participants
  async joinEvent(eventId: string, userId: string): Promise<EventParticipant> {
    const id = randomUUID();
    const participant: EventParticipant = {
      id,
      eventId,
      userId,
      joinedAt: new Date()
    };
    this.eventParticipants.set(id, participant);
    return participant;
  }

  async getEventParticipants(eventId: string): Promise<User[]> {
    const participantRelations = Array.from(this.eventParticipants.values())
      .filter(ep => ep.eventId === eventId);
    
    const participants: User[] = [];
    for (const relation of participantRelations) {
      const user = await this.getUser(relation.userId);
      if (user) participants.push(user);
    }
    return participants;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    const userEventRelations = Array.from(this.eventParticipants.values())
      .filter(ep => ep.userId === userId);
    
    const events: Event[] = [];
    for (const relation of userEventRelations) {
      const event = await this.getEvent(relation.eventId);
      if (event) events.push(event);
    }
    return events;
  }

  async isUserInEvent(eventId: string, userId: string): Promise<boolean> {
    return Array.from(this.eventParticipants.values())
      .some(ep => ep.eventId === eventId && ep.userId === userId);
  }

  // Questions
  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = {
      ...insertQuestion,
      id,
      createdAt: new Date()
    };
    this.questions.set(id, question);
    return question;
  }

  async getEventQuestions(eventId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.eventId === eventId);
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    const updatedQuestion = { ...question, ...updates };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return this.questions.delete(id);
  }

  // Submissions
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const submission: Submission = {
      ...insertSubmission,
      id,
      score: 0,
      executionTime: null,
      feedback: null,
      submittedAt: new Date()
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getUserSubmissions(userId: string, questionId?: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(s => 
      s.userId === userId && (!questionId || s.questionId === questionId)
    );
  }

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;
    const updatedSubmission = { ...submission, ...updates };
    this.submissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async getLeaderboard(eventId: string): Promise<Array<{
    user: User;
    score: number;
    solved: number;
    lastSubmission: Date | null;
  }>> {
    const participants = await this.getEventParticipants(eventId);
    const questions = await this.getEventQuestions(eventId);
    
    const leaderboardData = await Promise.all(
      participants.map(async (user) => {
        const userSubmissions = Array.from(this.submissions.values())
          .filter(s => s.userId === user.id && 
            questions.some(q => q.id === s.questionId));
        
        const acceptedSubmissions = userSubmissions.filter(s => s.status === "accepted");
        const solved = new Set(acceptedSubmissions.map(s => s.questionId)).size;
        const totalScore = acceptedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
        const lastSubmission = userSubmissions.length > 0 
          ? new Date(Math.max(...userSubmissions.map(s => s.submittedAt!.getTime())))
          : null;

        return {
          user,
          score: totalScore,
          solved,
          lastSubmission,
        };
      })
    );

    return leaderboardData.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (a.solved !== b.solved) return b.solved - a.solved;
      if (a.lastSubmission && b.lastSubmission) {
        return a.lastSubmission.getTime() - b.lastSubmission.getTime();
      }
      return 0;
    });
  }
}

export const storage = new MemStorage();

