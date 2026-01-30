"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import Header from "@/components/dashboard/header";
import { useAuth } from "@/auth/auth.context";
import { cn } from "@/lib/utils";