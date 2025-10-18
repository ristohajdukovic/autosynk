export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MaintenanceStatus = "upcoming" | "completed" | "overdue";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          nickname: string | null;
          make: string;
          model: string;
          year: number | null;
          vin: string | null;
          base_mileage: number | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nickname?: string | null;
          make: string;
          model: string;
          year?: number | null;
          vin?: string | null;
          base_mileage?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nickname?: string | null;
          make?: string;
          model?: string;
          year?: number | null;
          vin?: string | null;
          base_mileage?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      odometer_entries: {
        Row: {
          id: string;
          vehicle_id: string;
          mileage: number;
          confidence: number | null;
          photo_url: string | null;
          notes: string | null;
          recorded_at: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          mileage: number;
          confidence?: number | null;
          photo_url?: string | null;
          notes?: string | null;
          recorded_at?: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          mileage?: number;
          confidence?: number | null;
          photo_url?: string | null;
          notes?: string | null;
          recorded_at?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      service_records: {
        Row: {
          id: string;
          vehicle_id: string;
          title: string;
          service_date: string;
          mileage: number | null;
          cost: number | null;
          notes: string | null;
          attachments: Json[] | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          title: string;
          service_date: string;
          mileage?: number | null;
          cost?: number | null;
          notes?: string | null;
          attachments?: Json[] | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          title?: string;
          service_date?: string;
          mileage?: number | null;
          cost?: number | null;
          notes?: string | null;
          attachments?: Json[] | null;
          created_at?: string;
          created_by?: string;
        };
      };
      maintenance_tasks: {
        Row: {
          id: string;
          vehicle_id: string;
          title: string;
          description: string | null;
          interval_miles: number | null;
          interval_months: number | null;
          next_due_mileage: number | null;
          next_due_date: string | null;
          status: MaintenanceStatus;
          last_completed_mileage: number | null;
          last_completed_date: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          title: string;
          description?: string | null;
          interval_miles?: number | null;
          interval_months?: number | null;
          next_due_mileage?: number | null;
          next_due_date?: string | null;
          status?: MaintenanceStatus;
          last_completed_mileage?: number | null;
          last_completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          title?: string;
          description?: string | null;
          interval_miles?: number | null;
          interval_months?: number | null;
          next_due_mileage?: number | null;
          next_due_date?: string | null;
          status?: MaintenanceStatus;
          last_completed_mileage?: number | null;
          last_completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      mechanic_locations: {
        Row: {
          id: number;
          name: string;
          phone: string | null;
          address: string;
          rating: number | null;
          lat: number;
          lng: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          phone?: string | null;
          address: string;
          rating?: number | null;
          lat: number;
          lng: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          phone?: string | null;
          address?: string;
          rating?: number | null;
          lat?: number;
          lng?: number;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_timeline_events: {
        Args: {
          p_vehicle_id: string;
        };
        Returns: {
          id: string;
          label: string;
          type: "service" | "maintenance" | "odometer";
          occurred_at: string;
          mileage: number | null;
          status: MaintenanceStatus | null;
        }[];
      };
    };
    Enums: {
      maintenance_status: MaintenanceStatus;
    };
  };
}
