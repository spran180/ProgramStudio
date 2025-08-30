import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import CreateEventModal from "@/components/modals/create-event-modal";
import Header from "@/components/layout/header";
import type { Event } from "@shared/schema";

export default function Events() {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="Events" subtitle="Create and manage coding competitions" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Events</h2>
          <p className="text-muted-foreground">Create and manage coding competitions</p>
        </div>
        <Button onClick={() => setShowCreateEvent(true)} data-testid="button-create-event">
          <i className="fas fa-plus mr-2"></i>
          Create Event
        </Button>
      </div>

      {/* Events List */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h3 className="text-lg font-medium text-foreground">All Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events?.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground" data-testid={`text-table-event-name-${event.id}`}>
                          {event.name}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-table-event-description-${event.id}`}>
                          {event.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded" data-testid={`text-event-code-${event.id}`}>
                        {event.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`submission-status ${event.isActive ? 'status-accepted' : 'status-pending'}`}>
                        <i className="fas fa-circle"></i>
                        {event.isActive ? "Active" : "Scheduled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div data-testid={`text-event-schedule-${event.id}`}>
                        <div>Start: {new Date(event.startTime).toLocaleString()}</div>
                        <div>End: {new Date(event.endTime).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-event-${event.id}`}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-view-event-${event.id}`}>
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          disabled={deleteEventMutation.isPending}
                          data-testid={`button-delete-event-${event.id}`}
                        >
                          <i className="fas fa-trash text-destructive"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!events || events.length === 0) && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <i className="fas fa-calendar-alt text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">No Events Created</h3>
                  <p className="text-sm mb-4">Start by creating your first coding competition</p>
                  <Button onClick={() => setShowCreateEvent(true)}>
                    <i className="fas fa-plus mr-2"></i>
                    Create Event
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateEventModal 
        isOpen={showCreateEvent} 
        onClose={() => setShowCreateEvent(false)} 
      />
    </div>
  );
}
