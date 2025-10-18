import { NextResponse } from "next/server";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf
} from "@react-pdf/renderer";
import { createRouteClient } from "@/lib/supabase/server";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    color: "#111827"
  },
  heading: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8
  },
  section: {
    marginBottom: 16
  },
  listItem: {
    marginBottom: 6
  },
  label: {
    fontWeight: 700
  },
  subheading: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 4
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 8
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    padding: 8
  },
  col: {
    flex: 1,
    fontSize: 10
  }
});

export async function GET(
  request: Request,
  { params }: { params: { vehicleId: string } }
) {
  const supabase = createRouteClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(
      `
      id,
      user_id,
      nickname,
      make,
      model,
      year,
      vin,
      base_mileage,
      odometer_entries (*),
      maintenance_tasks (*),
      service_records (*)
    `
    )
    .eq("id", params.vehicleId)
    .single();

  if (error || !vehicle || vehicle.user_id !== session.user.id) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>AutoSync Digital Service Book</Text>
          <Text>
            {vehicle.nickname ??
              `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim()}
          </Text>
          <Text>VIN: {vehicle.vin ?? "Not set"}</Text>
          <Text>
            Baseline mileage:{" "}
            {vehicle.base_mileage
              ? `${vehicle.base_mileage.toLocaleString()} mi`
              : "Not recorded"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>Odometer Entries</Text>
          {vehicle.odometer_entries?.length ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.col, { flex: 1.2 }]}>Mileage</Text>
                <Text style={styles.col}>Recorded</Text>
                <Text style={styles.col}>Confidence</Text>
              </View>
              {vehicle.odometer_entries
                .sort(
                  (a, b) =>
                    new Date(b.recorded_at).getTime() -
                    new Date(a.recorded_at).getTime()
                )
                .map((entry) => (
                  <View key={entry.id} style={styles.tableRow}>
                    <Text style={[styles.col, { flex: 1.2 }]}>
                      {entry.mileage.toLocaleString()} mi
                    </Text>
                    <Text style={styles.col}>
                      {new Date(entry.recorded_at).toLocaleDateString()}
                    </Text>
                    <Text style={styles.col}>
                      {entry.confidence
                        ? `${Math.round(entry.confidence * 100)}%`
                        : "-"}
                    </Text>
                  </View>
                ))}
            </>
          ) : (
            <Text style={{ fontSize: 10 }}>
              No odometer entries recorded yet.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>Maintenance Plan</Text>
          {vehicle.maintenance_tasks?.length ? (
            vehicle.maintenance_tasks.map((task) => (
              <View key={task.id} style={styles.listItem}>
                <Text>
                  <Text style={styles.label}>{task.title}</Text> - Status:{" "}
                  {task.status} - Next due mileage:{" "}
                  {task.next_due_mileage
                    ? `${task.next_due_mileage.toLocaleString()} mi`
                    : "-"}{" "}
                  - Next due date:{" "}
                  {task.next_due_date
                    ? new Date(task.next_due_date).toLocaleDateString()
                    : "-"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 10 }}>
              No maintenance reminders set up yet.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>Service Records</Text>
          {vehicle.service_records?.length ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.col, { flex: 1.4 }]}>Service</Text>
                <Text style={styles.col}>Date</Text>
                <Text style={styles.col}>Mileage</Text>
                <Text style={styles.col}>Cost</Text>
              </View>
              {vehicle.service_records
                .sort(
                  (a, b) =>
                    new Date(b.service_date).getTime() -
                    new Date(a.service_date).getTime()
                )
                .map((record) => (
                  <View key={record.id} style={styles.tableRow}>
                    <Text style={[styles.col, { flex: 1.4 }]}>
                      {record.title}
                    </Text>
                    <Text style={styles.col}>
                      {new Date(record.service_date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.col}>
                      {record.mileage
                        ? `${record.mileage.toLocaleString()} mi`
                        : "-"}
                    </Text>
                    <Text style={styles.col}>
                      {record.cost ? `$${record.cost.toFixed(2)}` : "-"}
                    </Text>
                  </View>
                ))}
            </>
          ) : (
            <Text style={{ fontSize: 10 }}>
              No service records recorded yet.
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBuffer();
  const response = new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="autosync-${vehicle.id}.pdf"`
    }
  });

  return response;
}
