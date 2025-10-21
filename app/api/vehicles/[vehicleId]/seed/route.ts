import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

interface SeedBody {
  make: string;
  model: string;
  fuel?: string | null;
}

export async function POST(
  request: Request,
  { params }: { params: { vehicleId: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await request.json()) as SeedBody;

  if (!body.make || !body.model) {
    return NextResponse.json(
      { error: "make and model are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("seed_tasks_from_template", {
    p_vehicle_id: params.vehicleId,
    p_make: body.make,
    p_model: body.model,
    p_fuel: body.fuel ?? "ICE/HEV"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ inserted: data ?? 0 });
}
