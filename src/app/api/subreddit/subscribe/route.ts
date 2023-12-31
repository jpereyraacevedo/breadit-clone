import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSuscriptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }
    const body = await req.json()

    const { subredditId } = SubredditSuscriptionValidator.parse(body)

    const subsCriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })


    if (subsCriptionExists) {
      return new Response("You are already subscribe to this subreddit.", { status: 400 })
    }

    await db.subscription.create({
      data: {
        subredditId,
        userId: session.user.id,
      },
    })

    return new Response(subredditId)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid POST request data passed", { status: 422 })
    }

    return new Response("Could not subscribe at the moment, please try again later", { status: 500 })
  }
}