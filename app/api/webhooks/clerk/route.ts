import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;

  try {
    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data;

      const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);
      const primaryPhone = phone_numbers?.find((p) => p.id === evt.data.primary_phone_number_id);

      // Check if user exists
      let user = await userRepo.findOne({ where: { clerkId: id } });

      if (user) {
        // Update existing user
        user.firstName = first_name || "";
        user.lastName = last_name || "";
        user.email = primaryEmail?.email_address || "";
        user.phone = primaryPhone?.phone_number || "";
        user.avatar = image_url || "";
      } else {
        // Create new user
        user = userRepo.create({
          clerkId: id,
          firstName: first_name || "",
          lastName: last_name || "",
          email: primaryEmail?.email_address || "",
          phone: primaryPhone?.phone_number || "",
          avatar: image_url || "",
          role: "customer",
          isActive: true,
        });
      }

      await userRepo.save(user);
      console.log(`User ${eventType === "user.created" ? "created" : "updated"}:`, user.email);
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      
      const user = await userRepo.findOne({ where: { clerkId: id } });
      if (user) {
        user.isActive = false;
        await userRepo.save(user);
        console.log("User deactivated:", user.email);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
