import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

export async function GET(
  request: Request,
  { params }: { params: { vehicleId: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const url = new URL(request.url);
  const country = (url.searchParams.get("country") ?? "DE").toUpperCase();
  const months = Number(url.searchParams.get("months") ?? 12);
  const format = url.searchParams.get("format") ?? "json";

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("forecast_budget", {
    p_vehicle_id: params.vehicleId,
    p_country: country,
    p_months: Number.isFinite(months) && months > 0 ? months : 12
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const items = data ?? [];

  if (format === "csv") {
    const header = "month,estimated_eur,breakdown\n";
    const body = items
      .map((item) =>
        [
          item.month,
          item.estimated_eur?.toString() ?? "",
          JSON.stringify(item.breakdown ?? {})
        ].join(",")
      )
      .join("\n");
    const csv = header + body;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="forecast-${country}-${months}.csv"`
      }
    });
  }

  return NextResponse.json({
    country,
    months,
    items
  });
}
