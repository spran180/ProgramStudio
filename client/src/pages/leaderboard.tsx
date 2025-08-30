import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import Header from "@/components/layout/header";
import type { Event } from "@shared/schema";

interface LeaderboardEntry {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  score: number;
  solved: number;
  lastSubmission: string | null;
}

export default function Leaderboard() {
  const [, params] = useRoute("/leaderboard/:eventId?");
  const [selectedEventId, setSelectedEventId] = useState<string>(params?.eventId || "");

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/events", selectedEventId, "leaderboard"],
    enabled: !!selectedEventId,
  });

  // Use first event if no event is selected and events are available
  const eventToUse = selectedEventId || events?.[0]?.id || "";

  const selectedEvent = events?.find(e => e.id === eventToUse);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <i className="fas fa-trophy text-yellow-500"></i>;
      case 1:
        return <i className="fas fa-medal text-gray-400"></i>;
      case 2:
        return <i className="fas fa-medal text-orange-400"></i>;
      default:
        return <span className="font-bold text-foreground">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Leaderboard</h2>
          <p className="text-muted-foreground">Competition rankings and performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select 
            value={eventToUse} 
            onValueChange={setSelectedEventId}
          >
            <SelectTrigger className="w-64" data-testid="select-event">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" data-testid="button-refresh">
            <i className="fas fa-sync-alt"></i>
          </Button>
        </div>
      </div>

      {!eventToUse && events?.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <i className="fas fa-calendar-alt text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">No Events Available</h3>
            <p className="text-sm">There are no events to display leaderboards for.</p>
          </div>
        </Card>
      )}

      {eventToUse && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Rankings - {selectedEvent?.name}
                </h3>
                <span className="text-sm text-muted-foreground">
                  Last updated: <span data-testid="text-last-updated">Just now</span>
                </span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/6"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-4 bg-muted rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Solved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Submission
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaderboard?.map((entry, index) => (
                      <tr key={entry.user.id} className="hover:bg-muted/10">
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center">
                            {getRankIcon(index)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm mr-3">
                              <span data-testid={`text-user-initial-${entry.user.id}`}>
                                {entry.user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground" data-testid={`text-user-name-${entry.user.id}`}>
                                {entry.user.name}
                              </p>
                              <p className="text-xs text-muted-foreground" data-testid={`text-user-email-${entry.user.id}`}>
                                {entry.user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground" data-testid={`text-score-${entry.user.id}`}>
                          {entry.score}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground" data-testid={`text-solved-${entry.user.id}`}>
                          {entry.solved}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground" data-testid={`text-last-submission-${entry.user.id}`}>
                          {entry.lastSubmission 
                            ? new Date(entry.lastSubmission).toLocaleString()
                            : "No submissions"
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!leaderboard || leaderboard.length === 0) && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">
                      <i className="fas fa-medal text-4xl mb-4"></i>
                      <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
                      <p className="text-sm">
                        {selectedEvent ? `No one has joined "${selectedEvent.name}" yet.` : "Select an event to view the leaderboard."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
