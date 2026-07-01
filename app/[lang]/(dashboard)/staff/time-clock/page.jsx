"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clockIn, clockOut, startBreak, endBreak } from "@/action/time-clock-action";
import toast from "react-hot-toast";
import { Loader2, LogIn, LogOut, Coffee } from "lucide-react";

const TimeClockPage = () => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNumberClick = (num) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleClear = () => {
    setPin("");
  };

  const handleBackspace = () => {
     setPin((prev) => prev.slice(0, -1));
  }

  const handleAction = async (actionFn, successMessage) => {
    if (!pin) return;
    setIsLoading(true);
    const response = await actionFn(pin);
    if (response.status === "success") {
      toast.success(response.message);
      setPin("");
    } else {
      toast.error(response.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-sm shadow-xl border-2">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-primary">Time Clock</CardTitle>
          <div className="text-4xl font-mono font-bold tracking-widest text-foreground py-2">
            {currentTime.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="text-xl font-medium text-muted-foreground pb-2 uppercase tracking-widest">
            {currentTime.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })}
          </div>          
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <CardDescription className="text-center text-lg pb-2">Enter PIN code</CardDescription>
          <div className="flex justify-center">
            <Input
              type="password"
              readOnly
              value={pin}
              className="text-center text-3xl tracking-[0.5em] h-12 w-64 font-mono shadow-inner bg-background/50 border-2 focus-visible:ring-0"
              placeholder="••••"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="h-12 text-xl font-medium rounded-xl border-muted-foreground/20"
                onClick={() => handleNumberClick(num.toString())}
              >
                {num}
              </Button>
            ))}
             <Button
                variant="ghost"
                className="h-12 text-lg font-medium rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleClear}
              >
                CLR
              </Button>
              <Button
                variant="outline"
                className="h-12 text-xl font-medium rounded-xl border-muted-foreground/20"
                onClick={() => handleNumberClick("0")}
              >
                0
              </Button>
              <Button
                variant="ghost"
                className="h-12 text-xl font-medium rounded-xl border-muted-foreground/20"
                onClick={handleBackspace}
              >
               ⌫
              </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              className="h-10 bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
              onClick={() => handleAction(clockIn)}
              disabled={isLoading || !pin}
            >
              <LogIn className="mr-2 h-4 w-4" />
              In
            </Button>
            <Button
              className="h-10"
              variant="destructive"
              onClick={() => handleAction(clockOut)}
              disabled={isLoading || !pin}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Out
            </Button>
            <Button
              className="h-10 bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => handleAction(startBreak)}
              disabled={isLoading || !pin}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Break
            </Button>
             <Button
              className="h-10 bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
              onClick={() => handleAction(endBreak)}
              disabled={isLoading || !pin}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Returm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default TimeClockPage;
