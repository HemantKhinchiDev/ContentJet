"use client";

import { CreateProjectCTA } from "@/components/projects/create-project-cta";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardHome() {
  return (
    <>
      {/* Dashboard Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">12</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Words Generated</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">48,200</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Plans</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">3</CardContent>
        </Card>
      </div>

      {/* Create Project CTA */}
      <div className="mt-6">
        <CreateProjectCTA />
      </div>
    </>
  );
}
