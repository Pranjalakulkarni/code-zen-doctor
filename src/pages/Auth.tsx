import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bug, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isValidResetEmail, setIsValidResetEmail] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    // Validate password (minimum 6 characters)
    setIsValidPassword(password.length >= 6);
  }, [password]);

  useEffect(() => {
    // Validate reset email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidResetEmail(emailRegex.test(resetEmail));
  }, [resetEmail]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidResetEmail) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email sent!",
        description: "Check your email for a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || !isValidPassword) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid email and password (min 6 characters)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully. You can now log in.",
      });
      navigate("/");
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || !isValidPassword) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      navigate("/");
    }
    setLoading(false);
  };

  const isFormValid = isValidEmail && isValidPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg">
              <Bug className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bug Classifier & Corrector
            </CardTitle>
            <CardDescription className="text-base mt-2">
              AI-powered code analysis and fixing
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {showForgotPassword ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                className="mb-2 -ml-2"
                aria-label="Back to login"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">Reset Password</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your email to receive a password reset link
                </p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className={!isValidResetEmail && resetEmail ? "border-destructive" : ""}
                    aria-describedby="reset-email-error"
                  />
                  {!isValidResetEmail && resetEmail && (
                    <p id="reset-email-error" className="text-xs text-destructive" role="alert">
                      Please enter a valid email address
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={!isValidResetEmail || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </div>
          ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={!isValidEmail && email ? "border-destructive" : ""}
                  />
                  {!isValidEmail && email && (
                    <p className="text-xs text-destructive">Please enter a valid email</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <div className="relative">
                    <Input
                      id="password-login"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={!isValidPassword && password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isValidPassword && password && (
                    <p className="text-xs text-destructive">Password must be at least 6 characters</p>
                  )}
                </div>
                
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
                  >
                    Forgot Password?
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={!isValidEmail && email ? "border-destructive" : ""}
                  />
                  {!isValidEmail && email && (
                    <p className="text-xs text-destructive">Please enter a valid email</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <div className="relative">
                    <Input
                      id="password-signup"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={!isValidPassword && password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isValidPassword && password && (
                    <p className="text-xs text-destructive">Password must be at least 6 characters</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>🔒 Secure SSL Connection</p>
          <p>Your data is encrypted and protected</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
