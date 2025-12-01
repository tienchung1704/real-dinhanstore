"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export function UserSync() {
  const { isSignedIn, user, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once when user is loaded and signed in
    if (isLoaded && isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;
      syncUser();
    }

    // Reset sync flag when user signs out
    if (isLoaded && !isSignedIn) {
      hasSynced.current = false;
    }
  }, [isLoaded, isSignedIn, user]);

  const syncUser = async () => {
    try {
      const userData = {
        clerkId: user?.id,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        phone: user?.primaryPhoneNumber?.phoneNumber || "",
        avatar: user?.imageUrl || "",
      };

      console.log("Syncing user to database:", userData.email);

      const response = await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User synced successfully:", data.user?.id);
      } else {
        const error = await response.json();
        console.error("Failed to sync user:", error);
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  };

  return null;
}
