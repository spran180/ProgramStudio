import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GenerateQuestionModal from "@/components/modals/generate-question-modal";
import Header from "@/components/layout/header";
import type { Question, Event } from "@shared/schema";

export default function Questions() {
  const [showGenerateQuestion, setShowGenerateQuestion] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    enabled: !!events?.length,
  });

  const filteredQuestions = questions?.filter((question) => {
    if (selectedEvent !== "all" && question.eventId !== selectedEvent) return false;
    if (selectedDifficulty !== "all" && question.difficulty !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Questions</h2>
          <p className="text-muted-foreground">AI-generated DSA problems for your events</p>
        </div>
        <Button onClick={() => setShowGenerateQuestion(true)} data-testid="button-generate-question">
          <i className="fas fa-robot mr-2"></i>
          Generate Question
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Event:</label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-48" data-testid="select-filter-event">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Difficulty:</label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-32" data-testid="select-filter-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuestions?.map((question) => (
            <Card key={question.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-question-title-${question.id}`}>
                    {question.title}
                  </h4>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`submission-status ${
                      question.difficulty === 'easy' ? 'status-accepted' :
                      question.difficulty === 'medium' ? 'status-error' : 'status-wrong'
                    }`}>
                      <i className="fas fa-circle"></i>
                      {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground" data-testid={`text-question-event-${question.id}`}>
                      {events?.find(e => e.id === question.eventId)?.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" data-testid={`button-edit-question-${question.id}`}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button variant="ghost" size="sm" data-testid={`button-delete-question-${question.id}`}>
                    <i className="fas fa-trash text-destructive"></i>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-question-description-${question.id}`}>
                {question.description.slice(0, 150)}...
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground">
                    <i className="fas fa-vial mr-1"></i>
                    <span data-testid={`text-test-cases-${question.id}`}>{question.testCases.length}</span> test cases
                  </span>
                  <span className="text-muted-foreground">
                    <i className="fas fa-clock mr-1"></i>
                    <span data-testid={`text-time-limit-${question.id}`}>{question.timeLimit}s</span>
                  </span>
                </div>
                <Button variant="ghost" size="sm" data-testid={`button-view-question-${question.id}`}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
          
          {(!filteredQuestions || filteredQuestions.length === 0) && (
            <Card className="col-span-full p-12 text-center">
              <div className="text-muted-foreground">
                <i className="fas fa-lightbulb text-4xl mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Questions Found</h3>
                <p className="text-sm mb-4">
                  {selectedEvent !== "all" || selectedDifficulty !== "all" 
                    ? "No questions match your current filters" 
                    : "Start by generating your first AI-powered question"
                  }
                </p>
                <Button onClick={() => setShowGenerateQuestion(true)}>
                  <i className="fas fa-robot mr-2"></i>
                  Generate Question
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      <GenerateQuestionModal 
        isOpen={showGenerateQuestion} 
        onClose={() => setShowGenerateQuestion(false)} 
      />
    </div>
  );
}
