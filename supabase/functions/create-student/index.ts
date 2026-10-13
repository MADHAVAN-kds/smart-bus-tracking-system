import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req, ctx) => {
      try {
        const body = await req.json();

        const {
          name,
          email,
          phone,
          registerNumber,
          department,
          year,
          section,
          emergencyContact,
          busId,
        } = body;

        // Validate required fields
        if (
          !name ||
          !email ||
          !registerNumber ||
          !department ||
          !year
        ) {
          return Response.json(
            {
              error: "Please fill all required fields",
            },
            { status: 400 }
          );
        }

        // Create Supabase Auth user
        const { data: authData, error: authError } =
          await ctx.supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              full_name: name,
              role: "student",
            },
          });

        if (authError) {
          return Response.json(
            {
              error: authError.message,
            },
            { status: 400 }
          );
        }

        const userId = authData.user.id;

        // Create profile
        const { error: profileError } = await ctx.supabaseAdmin
          .from("profiles")
          .insert({
            id: userId,
            full_name: name,
            email,
            phone: phone || null,
            role: "student",
            status: "active",
          });

        if (profileError) {
          // Rollback Auth user if profile creation fails
          await ctx.supabaseAdmin.auth.admin.deleteUser(userId);

          return Response.json(
            {
              error: profileError.message,
            },
            { status: 400 }
          );
        }

        // Create student
        const { error: studentError } = await ctx.supabaseAdmin
          .from("students")
          .insert({
            profile_id: userId,
            register_number: registerNumber,
            department,
            year: Number(year),
            section: section || null,
            bus_id: busId || null,
            emergency_contact: emergencyContact || null,
          });

        if (studentError) {
          // Rollback profile and Auth user
          await ctx.supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", userId);

          await ctx.supabaseAdmin.auth.admin.deleteUser(userId);

          return Response.json(
            {
              error: studentError.message,
            },
            { status: 400 }
          );
        }

        return Response.json({
          success: true,
          message: "Student added successfully!",
          student_id: userId,
        });
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            error: "Internal server error",
          },
          { status: 500 }
        );
      }
    },
  ),
};