import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = user?.role === "organizer" ? [
    { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
    { path: "/events", label: "Events", icon: "fas fa-calendar-alt" },
    { path: "/questions", label: "Questions", icon: "fas fa-lightbulb" },
    { path: "/leaderboard", label: "Leaderboard", icon: "fas fa-medal" },
  ] : [
    { path: "/", label: "My Events", icon: "fas fa-trophy" },
    { path: "/join-event", label: "Join Event", icon: "fas fa-plus-circle" },
    { path: "/leaderboard", label: "Leaderboard", icon: "fas fa-medal" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center">
              <i className="fas fa-code text-primary text-xl mr-3"></i>
              <span className="text-xl font-bold text-foreground">CodeCompete</span>
            </div>
            <button 
              onClick={toggleSidebar} 
              className="md:hidden text-muted-foreground hover:text-foreground"
              data-testid="button-close-sidebar"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                <span data-testid="text-user-initial">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground" data-testid="text-user-name">{user?.name}</p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-role">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  location === item.path 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}>
                  <i className={`${item.icon} mr-3 text-muted-foreground`}></i>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={logout}
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt mr-3"></i>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md shadow-sm"
        data-testid="button-open-sidebar"
      >
        <i className="fas fa-bars text-foreground"></i>
      </button>
    </>
  );
}
