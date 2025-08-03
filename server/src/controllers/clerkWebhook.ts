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

    const userData = {
      id: data.id,
      email: data.email_addresses[0].address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url,
    };

    switch (type) {
      case "user.created": {
        await User.create(userData);
        break;
      }
      case "user.updated": {
        await User.findByIdAndUpdate(data.id, userData);
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }

      default:
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
