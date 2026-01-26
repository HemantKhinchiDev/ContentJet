"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AuthGateModalProps {
  open: boolean;
  onClose?: () => void;
}

export function AuthGateModal({ open, onClose }: AuthGateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            🔒
          </div>
          <h2 className="text-xl font-semibold">
            Create an account to continue
          </h2>
          <p className="text-sm text-muted-foreground">
            You’ll need an account to start your first project.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button className="w-full">
            Sign up
          </Button>

          {/* 🔧 FIX HERE: ghost → outline */}
          <Button variant="outline" className="w-full">
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
