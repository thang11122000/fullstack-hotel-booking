import { Webhook } from "svix";
import { Request, Response } from "express";
import User from "../models/User";

const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    const webhook = new Webhook(webhookSecret);
    const headers = {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    };

    await webhook.verify(JSON.stringify(req.body), headers);

    const { data, type } = req.body;

    console.log(`Processing Clerk webhook: ${type}`, {
      userId: data?.id,
      hasEmailAddresses: !!data?.email_addresses,
      emailCount: data?.email_addresses?.length || 0,
    });

    // Validate required data fields
    if (!data || !data.id) {
      return res.status(400).json({
        success: false,
        error: "Invalid webhook data: missing user ID",
      });
    }

    // Safely extract email with null checks
    const primaryEmail =
      data.email_addresses && data.email_addresses.length > 0
        ? data.email_addresses[0].email_address ||
          data.email_addresses[0].address
        : null;

    if (!primaryEmail && (type === "user.created" || type === "user.updated")) {
      return res.status(400).json({
        success: false,
        error: "Invalid webhook data: missing email address",
      });
    }

    const userData = {
      id: data.id,
      email: primaryEmail,
      username:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        data.username ||
        "Unknown User",
      image: data.image_url || data.profile_image_url || null,
    };

    switch (type) {
      case "user.created": {
        const newUser = await User.create(userData);
        console.log(`User created successfully: ${newUser.id}`);
        break;
      }
      case "user.updated": {
        const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });
        if (!updatedUser) {
          console.warn(`User not found for update: ${data.id}`);
          return res.status(404).json({
            success: false,
            error: "User not found for update",
          });
        }
        console.log(`User updated successfully: ${updatedUser.id}`);
        break;
      }
      case "user.deleted": {
        const deletedUser = await User.findByIdAndDelete(data.id);
        if (!deletedUser) {
          console.warn(`User not found for deletion: ${data.id}`);
          return res.status(404).json({
            success: false,
            error: "User not found for deletion",
          });
        }
        console.log(`User deleted successfully: ${data.id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
        break;
    }

    return res.json({ success: true, message: "Webhook Received!" });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);

    return res.json({
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export default clerkWebhooks;
