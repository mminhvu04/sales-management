
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let mounted = true;
    let profileTimer;

    async function loadProfile(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setProfileError(error.message);
        setProfile(null);
      } else if (!data) {
        setProfileError("Không tìm thấy hồ sơ người dùng trong bảng profiles.");
        setProfile(null);
      } else {
        setProfileError("");
        setProfile(data);
      }

      setLoading(false);
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setProfileError(error.message);
        setLoading(false);
        return;
      }

      setSession(data.session);

      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (profileTimer) {
        clearTimeout(profileTimer);
      }

      if (newSession?.user) {
        // Trì hoãn truy vấn profile để tránh gọi Supabase
        // trực tiếp bên trong callback auth.
        profileTimer = setTimeout(() => {
          loadProfile(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setProfileError("");
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (profileTimer) clearTimeout(profileTimer);
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        profile,
        loading,
        profileError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }

  return context;
}
