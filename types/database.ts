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
          provenance: string;
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
          provenance?: string;
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
          provenance?: string;
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
          provenance: string;
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
          provenance?: string;
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
          provenance?: string;
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
      maintenance_templates: {
        Row: {
          id: number;
          make: string;
          model: string;
          fuel: string;
          task: string;
          interval_km: number | null;
          interval_months: number | null;
          notes: string | null;
        };
        Insert: {
          id?: number;
          make: string;
          model: string;
          fuel: string;
          task: string;
          interval_km?: number | null;
          interval_months?: number | null;
          notes?: string | null;
        };
        Update: {
          id?: number;
          make?: string;
          model?: string;
          fuel?: string;
          task?: string;
          interval_km?: number | null;
          interval_months?: number | null;
          notes?: string | null;
        };
      };
      eu_countries: {
        Row: {
          code: string;
          name: string;
        };
        Insert: {
          code: string;
          name: string;
        };
        Update: {
          code?: string;
          name?: string;
        };
      };
      inspection_rules: {
        Row: {
          id: number;
          country_code: string;
          vehicle_class: string;
          first_interval_months: number;
          repeat_interval_months: number;
          notes: string | null;
        };
        Insert: {
          id?: number;
          country_code: string;
          vehicle_class: string;
          first_interval_months: number;
          repeat_interval_months: number;
          notes?: string | null;
        };
        Update: {
          id?: number;
          country_code?: string;
          vehicle_class?: string;
          first_interval_months?: number;
          repeat_interval_months?: number;
          notes?: string | null;
        };
      };
      vehicle_inspections: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string | null;
          country_code: string;
          first_registration_date: string;
          last_completed_date: string | null;
          next_due_date: string;
          rule_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_id?: string | null;
          country_code: string;
          first_registration_date: string;
          last_completed_date?: string | null;
          next_due_date: string;
          rule_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vehicle_id?: string | null;
          country_code?: string;
          first_registration_date?: string;
          last_completed_date?: string | null;
          next_due_date?: string;
          rule_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cost_baselines: {
        Row: {
          id: number;
          country_code: string;
          labour_index: number;
          parts_index: number;
          currency: string;
          effective_from: string;
          notes: string | null;
        };
        Insert: {
          id?: number;
          country_code: string;
          labour_index?: number;
          parts_index?: number;
          currency?: string;
          effective_from?: string;
          notes?: string | null;
        };
        Update: {
          id?: number;
          country_code?: string;
          labour_index?: number;
          parts_index?: number;
          currency?: string;
          effective_from?: string;
          notes?: string | null;
        };
      };
      budget_forecasts: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string | null;
          country_code: string;
          labour_cost_estimate: number | null;
          parts_cost_estimate: number | null;
          total_cost_estimate: number | null;
          horizon_months: number;
          valid_until: string | null;
          generated_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_id?: string | null;
          country_code: string;
          labour_cost_estimate?: number | null;
          parts_cost_estimate?: number | null;
          total_cost_estimate?: number | null;
          horizon_months?: number;
          valid_until?: string | null;
          generated_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          vehicle_id?: string | null;
          country_code?: string;
          labour_cost_estimate?: number | null;
          parts_cost_estimate?: number | null;
          total_cost_estimate?: number | null;
          horizon_months?: number;
          valid_until?: string | null;
          generated_at?: string;
          notes?: string | null;
        };
      };
      quote_requests: {
        Row: {
          id: string;
          vehicle_id: string | null;
          task_title: string;
          details: string | null;
          country_code: string | null;
          city: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id?: string | null;
          task_title: string;
          details?: string | null;
          country_code?: string | null;
          city?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string | null;
          task_title?: string;
          details?: string | null;
          country_code?: string | null;
          city?: string | null;
          created_by?: string;
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
      seed_tasks_from_template: {
        Args: {
          p_vehicle_id: string;
          p_make: string;
          p_model: string;
          p_fuel?: string;
        };
        Returns: number;
      };
      compute_next_inspection: {
        Args: {
          p_country: string;
          p_first_registration: string;
          p_last_passed: string;
        };
        Returns: string;
      };
      upsert_vehicle_inspection: {
        Args: {
          p_vehicle_id: string;
          p_country: string;
          p_first_registration: string;
          p_last_passed?: string;
        };
        Returns: string;
      };
      forecast_budget: {
        Args: {
          p_vehicle_id: string;
          p_country: string;
          p_months?: number;
        };
        Returns: {
          month: string;
          estimated_eur: number;
          breakdown: Json;
        }[];
      };
    };
    Enums: {
      maintenance_status: MaintenanceStatus;
    };
  };
}
