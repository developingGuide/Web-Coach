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
        await supabase
          .from("user_state")
          .upsert({ user_id: sessionUser.id, exp: 0 }, { onConflict: ['user_id'] });
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
          .upsert({ user_id: newUser.id, exp: 0, level: 0 }, { onConflict: ['user_id'] })
          .then(({ error }) => {
            if (error) console.error("User state upsert error:", error.message);
          });

        supabase
          .from("task_completion_log")
          .upsert({ user_id: newUser.id, daily_log: {} }, { onConflict: ['user_id'] })
          .then(({ error }) => {
            if (error) console.error("Task log upsert error:", error.message);
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
