{"use server"};

import { env } from "cloudflare:workers";

import type {
  Painting,
  CreatePaintingInput,
  UpdatePaintingInput,
  PaintingStatus,
} from "@/types";

import {
  validatePainting,
  validateStatus,
} from "./validation";

function mapPainting(row: any): Painting {
  return {
    id: row.id,
    userId: row.userId,

    title: row.title,

    description: JSON.parse(row.description_json),
    characters: JSON.parse(row.characters_json),

    pinterestBoard: row.pinterestBoard,

    finalImageKey: row.finalImageKey,
    finalImageMime: row.finalImageMime,

    type: row.type,
    hostInstagram: row.hostInstagram,

    status: row.status,

    dueDate: row.dueDate,
    completedAt: row.completedAt,

    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createPainting(
  userId: string,
  input: CreatePaintingInput,
): Promise<Painting> {
  validatePainting(input);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `
      INSERT INTO paintings (
        id,
        user_id,
        title,
        description_json,
        characters_json,
        pinterest_board,
        final_image_key,
        final_image_mime,
        type,
        host_instagram,
        status,
        due_date,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      userId,
      input.title,
      JSON.stringify(input.description),
      JSON.stringify(input.characters),
      input.pinterestBoard ?? null,
      null,
      null,
      input.type,
      input.hostInstagram ?? null,
      "IDEA",
      input.dueDate ?? null,
      now,
      now,
    )
    .run();

  const painting = await getPainting(id);

  if (!painting) {
    throw new Error("Painting was created but could not be retrieved.");
  }

  return painting;
}

export async function getPainting(
  id: string,
): Promise<Painting | null> {
  const row = await env.DB.prepare(
    `
      SELECT
        id,
        user_id AS userId,
        title,

        description_json,
        characters_json,

        pinterest_board AS pinterestBoard,

        final_image_key AS finalImageKey,
        final_image_mime AS finalImageMime,

        type,
        host_instagram AS hostInstagram,

        status,

        due_date AS dueDate,
        completed_at AS completedAt,

        created_at AS createdAt,
        updated_at AS updatedAt
      FROM paintings
      WHERE id = ?
    `,
  )
    .bind(id)
    .first<any>();

  if (!row) return null;

  return mapPainting(row);
}

export async function getPaintings(
  userId: string,
): Promise<Painting[]> {
  const result = await env.DB.prepare(
    `
      SELECT
        id,
        user_id AS userId,
        title,

        description_json,
        characters_json,

        pinterest_board AS pinterestBoard,

        final_image_key AS finalImageKey,
        final_image_mime AS finalImageMime,

        type,
        host_instagram AS hostInstagram,

        status,

        due_date AS dueDate,
        completed_at AS completedAt,

        created_at AS createdAt,
        updated_at AS updatedAt
      FROM paintings
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
  )
    .bind(userId)
    .all<any>();

  return result.results.map(mapPainting);
}

export async function updatePainting(
  id: string,
  input: UpdatePaintingInput,
): Promise<Painting | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    values.push(input.title);
  }

  if (input.description !== undefined) {
    updates.push("description_json = ?");
    values.push(JSON.stringify(input.description));
  }

  if (input.characters !== undefined) {
    updates.push("characters_json = ?");
    values.push(JSON.stringify(input.characters));
  }

  if (input.pinterestBoard !== undefined) {
    updates.push("pinterest_board = ?");
    values.push(input.pinterestBoard);
  }

  if (input.finalImageKey !== undefined) {
    updates.push("final_image_key = ?");
    values.push(input.finalImageKey);
  }

  if (input.finalImageMime !== undefined) {
    updates.push("final_image_mime = ?");
    values.push(input.finalImageMime);
  }

  if (input.type !== undefined) {
    updates.push("type = ?");
    values.push(input.type);
  }

  if (input.hostInstagram !== undefined) {
    updates.push("host_instagram = ?");
    values.push(input.hostInstagram);
  }

  if (input.dueDate !== undefined) {
    updates.push("due_date = ?");
    values.push(input.dueDate);
  }

  if (input.status !== undefined) {
    validateStatus(input.status);

    updates.push("status = ?");
    values.push(input.status);

    if (input.status === "DONE") {
      updates.push("completed_at = ?");
      values.push(new Date().toISOString());
    }
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());

  await env.DB.prepare(
    `
      UPDATE paintings
      SET ${updates.join(", ")}
      WHERE id = ?
    `,
  )
    .bind(...values, id)
    .run();

  return getPainting(id);
}

export async function deletePainting(
  id: string,
): Promise<boolean> {
  const result = await env.DB.prepare(
    `
      DELETE FROM paintings
      WHERE id = ?
    `,
  )
    .bind(id)
    .run();

  return result.meta.changes > 0;
}

export async function changePaintingStatus(
  id: string,
  status: PaintingStatus,
) {
  return updatePainting(id, { status });
}

export async function getPaintingsByStatus(
  userId: string,
  status: PaintingStatus,
): Promise<Painting[]> {
  const result = await env.DB.prepare(
    `
      SELECT
        id,
        user_id AS userId,
        title,

        description_json,
        characters_json,

        pinterest_board AS pinterestBoard,

        final_image_key AS finalImageKey,
        final_image_mime AS finalImageMime,

        type,
        host_instagram AS hostInstagram,

        status,

        due_date AS dueDate,
        completed_at AS completedAt,

        created_at AS createdAt,
        updated_at AS updatedAt
      FROM paintings
      WHERE user_id = ?
        AND status = ?
      ORDER BY updated_at DESC
    `,
  )
    .bind(userId, status)
    .all<any>();

  return result.results.map(mapPainting);
}