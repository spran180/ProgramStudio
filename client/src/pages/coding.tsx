import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import CodeEditor from "@/components/code-editor";
import Header from "@/components/layout/header";
import type { Question, Submission } from "@shared/schema";

export default function Coding() {
  const [, params] = useRoute("/coding/:questionId");
  const questionId = params?.questionId;
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const { toast } = useToast();

  const { data: question, isLoading: questionLoading } = useQuery<Question>({
    queryKey: ["/api/questions", questionId],
    enabled: !!questionId,
  });

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/users", "me", "submissions"],
    enabled: !!questionId,
  });

  const submitCodeMutation = useMutation({
    mutationFn: async (submissionData: { code: string; language: string; questionId: string }) => {
      const response = await apiRequest("POST", "/api/submissions", submissionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", "me", "submissions"] });
      toast({
        title: "Code submitted",
        description: "Your solution is being evaluated...",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (language === "python") {
      setCode(`def solution():
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`);
    } else if (language === "javascript") {
      setCode(`function solution() {
    // Write your solution here
    return null;
}

// Test your solution
console.log(solution());`);
    }
  }, [language]);

  const handleSubmit = () => {
    if (!questionId || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive",
      });
      return;
    }

    submitCodeMutation.mutate({
      code,
      language,
      questionId,
    });
  };

  const lastSubmission = submissions?.filter(s => s.questionId === questionId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

  if (questionLoading) {
    return (
      <div className="space-y-6">
        <Header title="Loading..." subtitle="Please wait" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="space-y-6">
        <Header title="Question Not Found" subtitle="The requested question could not be found" />
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <i className="fas fa-question-circle text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">Question Not Found</h3>
            <p className="text-sm">The question you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title={question.title} subtitle="Solve this coding challenge" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Problem Description */}
        <Card className="flex flex-col">
          <CardContent className="p-0">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-problem-title">
                  {question.title}
                </h2>
                <span className={`submission-status ${
                  question.difficulty === 'easy' ? 'status-accepted' :
                  question.difficulty === 'medium' ? 'status-error' : 'status-wrong'
                }`}>
                  <i className="fas fa-circle"></i>
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>
                  <i className="fas fa-clock mr-1"></i>
                  Time: <span data-testid="text-time-limit">{question.timeLimit}s</span>
                </span>
                <span>
                  <i className="fas fa-memory mr-1"></i>
                  Memory: <span data-testid="text-memory-limit">{question.memoryLimit} MB</span>
                </span>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div className="space-y-4">
                  <div className="text-foreground" data-testid="text-problem-description">
                    {question.description}
                  </div>
                  
                  {question.examples && question.examples.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Examples:</h4>
                      {question.examples.map((example, index) => (
                        <div key={index} className="mb-4" data-testid={`example-${index}`}>
                          <div className="bg-muted p-3 rounded-md font-mono text-sm">
                            <div><strong>Input:</strong> {example.input}</div>
                            <div><strong>Output:</strong> {example.output}</div>
                            {example.explanation && (
                              <div><strong>Explanation:</strong> {example.explanation}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.constraints && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Constraints:</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-constraints">
                        {question.constraints}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Editor and Submission */}
        <Card className="flex flex-col">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" data-testid="button-run-code">
                    <i className="fas fa-play mr-1"></i>
                    Run
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitCodeMutation.isPending}
                    data-testid="button-submit-code"
                  >
                    <i className="fas fa-paper-plane mr-1"></i>
                    {submitCodeMutation.isPending ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Code Editor */}
            <div className="flex-1 p-4">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="400px"
              />
            </div>

            {/* Submission Results */}
            {lastSubmission && (
              <div className="p-4 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Last Submission</h4>
                    <span className={`submission-status status-${lastSubmission.status.replace('_', '-')}`}>
                      <i className="fas fa-circle"></i>
                      {lastSubmission.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {lastSubmission.status !== "accepted" && lastSubmission.feedback && (
                    <div className="p-3 bg-muted/20 rounded-md">
                      <p className="text-sm text-foreground" data-testid="text-submission-feedback">
                        <strong>Feedback:</strong> {lastSubmission.feedback}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span data-testid="text-submission-time">
                      Submitted: {new Date(lastSubmission.submittedAt).toLocaleString()}
                    </span>
                    {lastSubmission.executionTime && (
                      <span data-testid="text-execution-time">
                        Execution: {lastSubmission.executionTime}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
