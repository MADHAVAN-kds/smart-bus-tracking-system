import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req, ctx) => {
      try {
        const body = await req.json();

        const {
          parent_id,
          full_name,
          email,
          phone,
          relationship,
          student_id,
          address,
        } = body;

        // ============================================
        // VALIDATION
        // ============================================

        if (
          !parent_id ||
          !full_name ||
          !email ||
          !phone ||
          !relationship ||
          !student_id
        ) {
          return Response.json(
            {
              error: "Please fill all required fields",
            },
            { status: 400 }
          );
        }

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

        // ============================================
        // GET EXISTING PARENT
        // ============================================

        const { data: parent, error: parentError } =
          await ctx.supabaseAdmin
            .from("parents")
            .select(
              "id, profile_id, student_id, relationship"
            )
            .eq("id", parent_id)
            .maybeSingle();

        if (parentError) {
          return Response.json(
            {
              error: parentError.message,
            },
            { status: 400 }
          );
        }

        if (!parent) {
          return Response.json(
            {
              error: "Parent record not found",
            },
            { status: 404 }
          );
        }

        // ============================================
        // VERIFY STUDENT
        // ============================================

        const { data: student, error: studentError } =
          await ctx.supabaseAdmin
            .from("students")
            .select("id")
            .eq("id", student_id)
            .maybeSingle();

        if (studentError) {
          return Response.json(
            {
              error: studentError.message,
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

        // ============================================
        // CHECK DUPLICATE RELATIONSHIP
        // ============================================

        const { data: duplicateParent, error: duplicateError } =
          await ctx.supabaseAdmin
            .from("parents")
            .select("id")
            .eq("student_id", student_id)
            .eq("relationship", relationship)
            .neq("id", parent_id)
            .maybeSingle();

        if (duplicateError) {
          return Response.json(
            {
              error: duplicateError.message,
            },
            { status: 400 }
          );
        }

        if (duplicateParent) {
          return Response.json(
            {
              error: `A ${relationship} is already linked to this student`,
            },
            { status: 409 }
          );
        }

        // ============================================
        // UPDATE AUTH EMAIL
        // ============================================

        const { error: authError } =
          await ctx.supabaseAdmin.auth.admin.updateUserById(
            parent.profile_id,
            {
              email: email.trim(),
            }
          );

        if (authError) {
          return Response.json(
            {
              error: authError.message,
            },
            { status: 400 }
          );
        }

        // ============================================
        // UPDATE PROFILE
        // ============================================

        const { error: profileError } =
          await ctx.supabaseAdmin
            .from("profiles")
            .update({
              full_name: full_name.trim(),
              email: email.trim(),
              phone: phone.trim(),
            })
            .eq("id", parent.profile_id);

        if (profileError) {
          return Response.json(
            {
              error: profileError.message,
            },
            { status: 400 }
          );
        }

        // ============================================
        // UPDATE PARENT
        // ============================================

        const { error: updateParentError } =
          await ctx.supabaseAdmin
            .from("parents")
            .update({
              relationship,
              student_id,
              address: address?.trim() || null,
            })
            .eq("id", parent_id);

        if (updateParentError) {
          return Response.json(
            {
              error: updateParentError.message,
            },
            { status: 400 }
          );
        }

        // ============================================
        // SUCCESS
        // ============================================

        return Response.json({
          success: true,
          message: "Parent updated successfully!",
          parent_id,
          profile_id: parent.profile_id,
        });
      } catch (error) {
        console.error("Update parent error:", error);

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