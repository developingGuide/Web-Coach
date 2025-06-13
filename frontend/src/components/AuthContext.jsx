// contexts/AuthContext.js
import { createContext, useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user || null;
      setUser(sessionUser);

      if (sessionUser) {
        const { data: existing, error } = await supabase
          .from("user_state")
          .select("user_id")
          .eq("user_id", sessionUser.id)
          .single();

        if (!existing && !error) {
          await supabase
            .from("user_state")
            .insert({ user_id: sessionUser.id, exp: 0 });
        }
      }
    };

    setupAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user || null;
      setUser(newUser);

      if (newUser) {
        // Fire and forget — but still handle the response
        supabase
          .from("user_state")
          .select("user_id")
          .eq("user_id", newUser.id)
          .maybeSingle()
          .then(async ({ data: existing, error }) => {
            if (!existing && !error) {
              const { error: insertError } = await supabase
                .from("user_state")
                .insert({ user_id: newUser.id, exp: 0, level: 0 });
              if (insertError) console.error("Insert error:", insertError.message);
            }
          });


        supabase
          .from("task_completion_log")
          .select("user_id")
          .eq("user_id", newUser.id)
          .maybeSingle()
          .then(async ({ data: existing, error }) => {
            if (!existing && !error) {
              const { error: insertError } = await supabase
                .from("task_completion_log")
                .insert({ user_id: newUser.id, daily_log: {} });

              if (insertError) {
                console.error("Task log insert error:", insertError.message);
              }
            }
          });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
