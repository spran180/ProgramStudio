import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import type { Event } from "@shared/schema";

const generateQuestionSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  topic: z.string().min(1, "Please select a topic"),
  requirements: z.string().optional(),
});

type GenerateQuestionData = z.infer<typeof generateQuestionSchema>;

interface GenerateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const topics = [
  "Arrays & Hashing",
  "Two Pointers",
  "Binary Search",
  "Sliding Window",
  "Stack",
  "Binary Tree",
  "Dynamic Programming",
  "Graph",
  "Backtracking",
  "Heap / Priority Queue",
  "Intervals",
  "Greedy",
  "Math & Geometry",
  "Bit Manipulation",
  "Trie",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
];

export default function GenerateQuestionModal({ isOpen, onClose }: GenerateQuestionModalProps) {
  const { toast } = useToast();

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const form = useForm<GenerateQuestionData>({
    resolver: zodResolver(generateQuestionSchema),
    defaultValues: {
      eventId: "",
      difficulty: "medium",
      topic: "",
      requirements: "",
    },
  });

  const generateQuestionMutation = useMutation({
    mutationFn: async (data: GenerateQuestionData) => {
      const response = await apiRequest("POST", "/api/questions/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Question generated successfully",
        description: `"${data.title}" has been added to the event`,
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to generate question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: GenerateQuestionData) => {
    generateQuestionMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="modal-generate-question">
        <DialogHeader>
          <DialogTitle>
            <i className="fas fa-robot text-primary mr-2"></i>
            Generate Question
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-event">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events?.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-difficulty">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic/Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-topic">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Focus on optimization, include edge cases..."
                      rows={3}
                      data-testid="textarea-requirements"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel-generate"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={generateQuestionMutation.isPending}
                data-testid="button-generate-question-submit"
              >
                <i className="fas fa-magic mr-2"></i>
                {generateQuestionMutation.isPending ? "Generating..." : "Generate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
