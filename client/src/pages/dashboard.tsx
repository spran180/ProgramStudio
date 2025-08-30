import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CreateEventModal from "@/components/modals/create-event-modal";
import GenerateQuestionModal from "@/components/modals/generate-question-modal";
import Header from "@/components/layout/header";
import type { Event } from "@shared/schema";

interface Stats {
  totalEvents: number;
  activeParticipants: number;
  questionsCreated: number;
  totalSubmissions: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showGenerateQuestion, setShowGenerateQuestion] = useState(false);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: user?.role === "organizer",
  });

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  if (user?.role === "participant") {
    return (
      <div className="space-y-6">
        <Header title="My Events" subtitle="Competitions you're participating in" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events?.map((event) => (
            <Card key={event.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-event-name-${event.id}`}>
                    {event.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3" data-testid={`text-event-description-${event.id}`}>
                    {event.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`submission-status ${event.isActive ? 'status-accepted' : 'status-pending'}`}>
                      <i className="fas fa-circle"></i>
                      {event.isActive ? "Active" : "Scheduled"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/20 rounded-md">
                  <p className="text-lg font-bold text-foreground" data-testid={`text-solved-${event.id}`}>0</p>
                  <p className="text-xs text-muted-foreground">Solved</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-md">
                  <p className="text-lg font-bold text-foreground" data-testid={`text-rank-${event.id}`}>-</p>
                  <p className="text-xs text-muted-foreground">Rank</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" data-testid={`button-continue-${event.id}`}>
                  <i className="fas fa-play mr-2"></i>
                  Continue
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-leaderboard-${event.id}`}>
                  <i className="fas fa-chart-bar"></i>
                </Button>
              </div>
            </Card>
          ))}
          
          {(!events || events.length === 0) && (
            <Card className="col-span-full p-8 text-center">
              <div className="text-muted-foreground">
                <i className="fas fa-calendar-alt text-4xl mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                <p className="text-sm mb-4">You haven't joined any events yet.</p>
                <Button>
                  <i className="fas fa-plus mr-2"></i>
                  Join Event
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Dashboard" subtitle="Manage your coding competitions" />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-events">
                {stats?.totalEvents || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-calendar-alt text-primary text-lg"></i>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Participants</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-active-participants">
                {stats?.activeParticipants || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-accent-foreground text-lg"></i>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Questions Created</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-questions-created">
                {stats?.questionsCreated || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
              <i className="fas fa-lightbulb text-secondary-foreground text-lg"></i>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submissions</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-submissions">
                {stats?.totalSubmissions || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
              <i className="fas fa-code text-muted-foreground text-lg"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => setShowCreateEvent(true)}
            className="flex items-center p-4 h-auto justify-start"
            data-testid="button-create-event"
          >
            <i className="fas fa-plus-circle text-primary mr-3 text-lg"></i>
            <div className="text-left">
              <p className="font-medium">Create Event</p>
              <p className="text-sm text-muted-foreground">Start a new competition</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowGenerateQuestion(true)}
            className="flex items-center p-4 h-auto justify-start"
            data-testid="button-generate-question"
          >
            <i className="fas fa-robot text-primary mr-3 text-lg"></i>
            <div className="text-left">
              <p className="font-medium">Generate Question</p>
              <p className="text-sm text-muted-foreground">AI-powered DSA problems</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center p-4 h-auto justify-start"
            data-testid="button-view-analytics"
          >
            <i className="fas fa-chart-bar text-primary mr-3 text-lg"></i>
            <div className="text-left">
              <p className="font-medium">View Analytics</p>
              <p className="text-sm text-muted-foreground">Track performance</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Events */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Events</h3>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </div>
        <div className="space-y-3">
          {events?.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-code text-primary"></i>
                </div>
                <div>
                  <p className="font-medium text-foreground" data-testid={`text-recent-event-name-${event.id}`}>
                    {event.name}
                  </p>
                  <p className="text-sm text-muted-foreground">Event code: {event.code}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`submission-status ${event.isActive ? 'status-accepted' : 'status-pending'}`}>
                  <i className="fas fa-circle"></i>
                  {event.isActive ? "Active" : "Scheduled"}
                </span>
              </div>
            </div>
          ))}
          
          {(!events || events.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-calendar-alt text-4xl mb-4"></i>
              <p>No events created yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateEventModal 
        isOpen={showCreateEvent} 
        onClose={() => setShowCreateEvent(false)} 
      />
      <GenerateQuestionModal 
        isOpen={showGenerateQuestion} 
        onClose={() => setShowGenerateQuestion(false)} 
      />
    </div>
  );
}
