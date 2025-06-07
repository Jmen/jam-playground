"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { ErrorCode, isError, Result } from "../result";

export async function getJamsCommand(
  supabase?: SupabaseClient,
): Promise<
  Result<
    { id: string; name: string; description: string; created_at: string }[]
  >
> {
  if (!supabase) {
    supabase = await createClient();
  }
  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error }, "Failed to get jams");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to get jams",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data:
      jams.map((jam) => ({
        id: jam.human_readable_id,
        name: jam.name,
        description: jam.description,
        created_at: jam.created_at,
      })) || [],
  };
}

export async function getJamCommand(
  id: string,
): Promise<
  Result<{ id: string; name: string; description: string; created_at: string }>
> {
  const supabase = await createClient();

  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("human_readable_id", id)
    .limit(1);

  if (error) {
    logger.error({ error }, "Failed to get jam");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to get jam",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  if (jams?.length > 0) {
    return {
      data: {
        id: jams[0].human_readable_id,
        name: jams[0].name,
        description: jams[0].description,
        created_at: jams[0].created_at,
      },
    };
  }

  logger.warn({ id }, "Jam not found");

  return {
    error: {
      code: "not_found",
      message: "Jam not found",
      type: ErrorCode.CLIENT_ERROR,
    },
  };
}

export async function createJamCommand(
  { name, description }: { name: string; description: string },
  supabase?: SupabaseClient,
): Promise<
  Result<{ id: string; name: string; description: string; created_at: string }>
> {
  if (!supabase) {
    supabase = await createClient();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!name) {
    logger.warn({ name }, "Name is required");
    return {
      error: {
        code: "name_required",
        message: "Name is required",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  if (!description) {
    logger.warn({ description }, "Description is required");
    return {
      error: {
        code: "description_required",
        message: "Description is required",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const idResult = await generateUniqueJamId(supabase);

  if (isError(idResult)) {
    logger.error(
      { error: idResult.error, name, description, user },
      "Failed to generate unique jam ID",
    );
    return idResult;
  }

  const humanReadableId = idResult.data;

  const { data, error } = await supabase
    .from("jams")
    .insert({
      human_readable_id: humanReadableId,
      name,
      description,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error || !data) {
    logger.error(
      { error, data, humanReadableId, name, description, user },
      "Failed to create jam",
    );
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to create jam",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: {
      id: data.human_readable_id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
    },
  };
}

async function generateUniqueJamId(
  supabase: SupabaseClient,
): Promise<Result<string>> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateId = uniqueNamesGenerator({
      dictionaries: [adjectives, adjectives, colors, animals],
      separator: "_",
    });

    const { data: existingJam, error } = await supabase
      .from("jams")
      .select("human_readable_id")
      .eq("human_readable_id", candidateId)
      .limit(1);

    if (error) {
      logger.error({ error, candidateId }, "Failed to check ID uniqueness");
      return {
        error: {
          code: "internal_server_error",
          message: "Failed to check ID uniqueness",
          type: ErrorCode.SERVER_ERROR,
        },
      };
    }

    if (!existingJam || existingJam.length === 0) {
      return { data: candidateId };
    }
  }

  logger.error({ maxAttempts }, "Failed to generate unique ID");

  return {
    error: {
      code: "internal_server_error",
      message: "Failed to generate unique ID",
      type: ErrorCode.SERVER_ERROR,
    },
  };
}
