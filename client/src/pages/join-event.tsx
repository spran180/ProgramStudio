import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { z } from "zod";
import type { Event } from "@shared/schema";

const joinEventSchema = z.object({
  code: z.string().min(1, "Event code is required").toUpperCase(),
});

type JoinEventData = z.infer<typeof joinEventSchema>;

export default function JoinEvent() {
  const { toast } = useToast();

  const form = useForm<JoinEventData>({
    resolver: zodResolver(joinEventSchema),
    defaultValues: {
      code: "",
    },
  });

  const { data: availableEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/public"],
    queryFn: async () => {
      // For now, return empty array since we don't have a public events endpoint
      // In a real implementation, this would fetch public events
      return [];
    },
  });

  const joinEventMutation = useMutation({
    mutationFn: async (data: JoinEventData) => {
      const response = await apiRequest("POST", "/api/events/join", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success!",
        description: `Successfully joined "${data.event.name}"`,
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to join event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoinEvent = (data: JoinEventData) => {
    joinEventMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Header title="Join Event" subtitle="Enter an event code to join a competition" />

      <div className="max-w-md">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Enter Event Code</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleJoinEvent)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ABC123"
                        className="font-mono uppercase"
                        data-testid="input-event-code"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={joinEventMutation.isPending}
                data-testid="button-join-event"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                {joinEventMutation.isPending ? "Joining..." : "Join Event"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>

      {/* Available Public Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Events</h3>
        
        {(!availableEvents || availableEvents.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-calendar-alt text-4xl mb-4"></i>
            <h4 className="font-medium mb-2">No Public Events</h4>
            <p className="text-sm">There are currently no public events available to join.</p>
            <p className="text-sm mt-2">Ask your organizer for an event code to join a private competition.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-code text-primary"></i>
                  </div>
                  <div>
                    <p className="font-medium text-foreground" data-testid={`text-available-event-name-${event.id}`}>
                      {event.name}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-available-event-description-${event.id}`}>
                      {event.description}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Code: <span className="font-mono">{event.code}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Duration: {Math.ceil((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60))} hours
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => form.setValue("code", event.code)}
                  variant="outline"
                  data-testid={`button-use-code-${event.id}`}
                >
                  Use Code
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-muted/20">
        <h4 className="font-semibold text-foreground mb-2">
          <i className="fas fa-info-circle text-primary mr-2"></i>
          How to Join
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Get the event code from your organizer</li>
          <li>• Enter the code in the form above</li>
          <li>• Click "Join Event" to participate</li>
          <li>• You'll be able to access the event questions once joined</li>
        </ul>
      </Card>
    </div>
  );
}
