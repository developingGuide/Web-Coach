import supabase from "../../config/supabaseClient";
import { useEffect } from "react";

const OnboardingPage = () => {
    useEffect(() => {
        const runOnboarding = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // 1. Check if user_state already exists (e.g., Warrior/Pro might already have it)
            const { data: state, error } = await supabase
            .from("user_state")
            .select("*")
            .eq("user_id", user.id)
            .single();

            // 2. If no record, it's probably a Starter user
            if (!state) {
            await supabase.from("user_state").upsert({
                user_id: user.id,
                display_name: user.user_metadata?.display_name || "anon",
                plan: "starter",
            });
            }

            // 3. Now you can redirect to dashboard, or let them set username, avatar, etc.
        };

        runOnboarding();
    }, []);


}

export default OnboardingPage