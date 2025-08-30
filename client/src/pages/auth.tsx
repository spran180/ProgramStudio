import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, signupSchema, type LoginData, type SignupData } from "@shared/schema";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, isLoginPending, isSignupPending } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "participant",
    },
  });

  const handleLogin = (data: LoginData) => {
    login(data, {
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleSignup = (data: SignupData) => {
    signup(data, {
      onError: (error) => {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <i className="fas fa-code text-primary mr-3"></i>CodeCompete
            </h1>
            <p className="text-muted-foreground">In-house coding competition platform</p>
          </div>

          {isLogin ? (
            <Card>
              <CardContent className="pt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              data-testid="input-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label htmlFor="remember" className="text-sm text-muted-foreground">
                          Remember me
                        </label>
                      </div>
                      <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                        Forgot your password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoginPending}
                      data-testid="button-login"
                    >
                      {isLoginPending ? "Signing in..." : "Sign in"}
                    </Button>

                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="text-sm font-medium text-primary hover:text-primary/80"
                        data-testid="link-signup"
                      >
                        Sign up
                      </button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              data-testid="input-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              data-testid="input-username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              data-testid="input-signup-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              data-testid="input-signup-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              data-testid="input-confirm-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="participant">Participant</SelectItem>
                              <SelectItem value="organizer">Organizer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSignupPending}
                      data-testid="button-signup"
                    >
                      {isSignupPending ? "Creating account..." : "Create Account"}
                    </Button>

                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className="text-sm font-medium text-primary hover:text-primary/80"
                        data-testid="link-login"
                      >
                        Sign in
                      </button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <div className="mb-8">
                <i className="fas fa-trophy text-6xl mb-4 opacity-90"></i>
              </div>
              <h2 className="text-3xl font-bold mb-4">Compete & Learn</h2>
              <p className="text-xl opacity-90 mb-8">Join coding competitions, solve algorithms, and climb the leaderboard</p>
              <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
                <div className="flex items-center">
                  <i className="fas fa-brain mr-2"></i>
                  <span>AI-Generated Problems</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock mr-2"></i>
                  <span>Real-time Evaluation</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-users mr-2"></i>
                  <span>Team Competitions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
