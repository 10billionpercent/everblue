import { runSankarsanaTest } from "../jagannatha/sankarsana/test";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405 });
    }

    const command = await request.text();

    try {
      const result = await runSankarsanaTest(command);

      return Response.json(result);
    } catch (error) {
      console.error(error);

      return Response.json(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  },
};
