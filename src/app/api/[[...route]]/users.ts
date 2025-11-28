import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createClient } from "@/lib/supabase/server";

const app = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(3).max(20),
      })
    ),
    async (c) => {
      const { name, email, password } = c.req.valid("json");

      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash(password, 12);

      const supabase = await createClient();
      
      // Check if email already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .single();

      // If there's an error other than 'not found', return error
      if (fetchError && fetchError.code !== 'PGRST116') {  // PGRST116 is 'Record not found'
        console.error('Database error:', fetchError);
        return c.json({ error: "Database error" }, 500);
      }

      if (existingUser) {
        return c.json({ error: "Email already in use" }, 400);
      }

      // Insert new user
      const { error: insertError } = await supabase
        .from('user')
        .insert({
          id: crypto.randomUUID(), // Generate UUID for the user
          email,
          name,
          password: hashedPassword,
        });
      
      if (insertError) {
        console.error('Failed to create user:', insertError);
        return c.json({ error: "Failed to create user", details: insertError.message }, 500);
      }
      
      return c.json(null, 200);
    },
  );

export default app;
