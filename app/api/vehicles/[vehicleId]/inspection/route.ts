import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

type InspectionBody = {
  countryCode: string;
  firstRegDate: string;
  lastPassDate?: string | null;
};

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

  const body = (await request.json()) as InspectionBody;

  if (!body.countryCode || !body.firstRegDate) {
    return NextResponse.json(
      { error: "countryCode and firstRegDate are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("upsert_vehicle_inspection", {
    p_vehicle_id: params.vehicleId,
    p_country: body.countryCode,
    p_first_registration: body.firstRegDate,
    p_last_passed: body.lastPassDate ?? null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ nextDueDate: data });
}
