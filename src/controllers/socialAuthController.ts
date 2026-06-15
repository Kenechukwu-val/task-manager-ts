import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";

export const supabaseCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.redirect("/test-socket.html?error=no-code");
  }

  // Exchange the auth code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return res.redirect("/test-socket.html?error=auth-failed");
  }

  const { user, session } = data;

  // Upsert profile ( creates one if first-time social login )
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      name:
        user.user_metadata?.fullname || user.user_metadata?.name || user.email,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return res.redirect("/test-socket.html?error=profile-failed");
  }

  res.redirect(
    `/test-socket.html?token=${encodeURIComponent(session.access_token)}&name=${encodeURIComponent(user.email || "User")}`,
  );
};
