import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

type UpdateVehicleBody = {
  nickname?: string | null;
  make?: string;
  model?: string;
  year?: number | null;
  vin?: string | null;
  base_mileage?: number | null;
};

export async function PATCH(
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

  const body = (await request.json()) as UpdateVehicleBody;

  const { error } = await supabase
    .from("vehicles")
    .update({
      nickname: body.nickname ?? null,
      make: body.make,
      model: body.model,
      year: body.year ?? null,
      vin: body.vin ? body.vin.toUpperCase() : null,
      base_mileage: body.base_mileage ?? null
    })
    .eq("id", params.vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { vehicleId: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", params.vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
