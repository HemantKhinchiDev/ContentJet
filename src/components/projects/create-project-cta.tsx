"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fakeAuth } from "../../lib/auth/fakeAuth";
import { AuthGateModal } from "../auth/AuthGateModal";
import { CreateProjectModal } from "../dashboard/CreateProjectModal";


export function CreateProjectCTA() {
  const [openAuth, setOpenAuth] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const handleClick = () => {
    if (fakeAuth.isLoggedIn) {
      setOpenCreate(true);
    } else {
      setOpenAuth(true);
    }
  };

  return (
    <>
      <Button onClick={handleClick}>Create Project</Button>

      <AuthGateModal open={openAuth} onClose={() => setOpenAuth(false)} />

      <CreateProjectModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </>
  );
}
