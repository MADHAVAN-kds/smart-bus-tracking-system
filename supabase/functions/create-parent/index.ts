import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req, ctx) => {
      try {
        const body = await req.json();

        const {
          full_name,
          email,
          phone,
          relationship,
          student_id,
          address,
          password,
        } = body;

        // Validate required fields
        if (
          !full_name ||
          !email ||
          !phone ||
          !relationship ||
          !student_id ||
          !password
        ) {
          return Response.json(
            {
              error: "Please fill all required fields",
            },
            { status: 400 }
          );
        }

        // Validate password
        if (password.length < 6) {
          return Response.json(
            {
              error: "Password must contain at least 6 characters",
            },
            { status: 400 }
          );
        }

        // Validate relationship
        const allowedRelationships = [
          "father",
          "mother",
          "guardian",
        ];

        if (!allowedRelationships.includes(relationship)) {
          return Response.json(
            {
              error: "Invalid parent relationship",
            },
            { status: 400 }
          );
        }

        // Check whether student exists
        const { data: student, error: studentCheckError } =
          await ctx.supabaseAdmin
            .from("students")
            .select("id")
            .eq("id", student_id)
            .maybeSingle();

        if (studentCheckError) {
          return Response.json(
            {
              error: studentCheckError.message,
            },
            { status: 400 }
          );
        }

        if (!student) {
          return Response.json(
            {
              error: "Selected student does not exist",
            },
            { status: 400 }
          );
        }

        // Check whether this relationship already exists
        const { data: existingParent, error: existingParentError } =
          await ctx.supabaseAdmin
            .from("parents")
            .select("id")
            .eq("student_id", student_id)
            .eq("relationship", relationship)
            .maybeSingle();

        if (existingParentError) {
          return Response.json(
            {
              error: existingParentError.message,
            },
            { status: 400 }
          );
        }

        if (existingParent) {
          return Response.json(
            {
              error: `A ${relationship} is already linked to this student`,
            },
            { status: 409 }
          );
        }

        // Create Supabase Auth user
        const { data: authData, error: authError } =
          await ctx.supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name,
              role: "parent",
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
            full_name,
            email,
            phone: phone || null,
            role: "parent",
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

        // Create parent
        const { data: parentData, error: parentError } =
          await ctx.supabaseAdmin
            .from("parents")
            .insert({
              profile_id: userId,
              student_id: student_id,
              relationship,
              address: address || null,
            })
            .select("id")
            .single();

        if (parentError) {
          // Rollback profile
          await ctx.supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", userId);

          // Rollback Auth user
          await ctx.supabaseAdmin.auth.admin.deleteUser(userId);

          return Response.json(
            {
              error: parentError.message,
            },
            { status: 400 }
          );
        }

        // Success
        return Response.json({
          success: true,
          message: "Parent added successfully!",
          parent_id: parentData.id,
          profile_id: userId,
        });
      } catch (error) {
        console.error("Create parent error:", error);

        return Response.json(
          {
            error: "Internal server error",
          },
          { status: 500 }
        );
      }
    }
  ),
};