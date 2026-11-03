import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ConnectionTest() {
  const [status, setStatus] = useState("Đang kiểm tra...");

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          setStatus("Lỗi: " + error.message);
          return;
        }

        setStatus("Đã khởi tạo Supabase Client thành công!");
      } catch (error) {
        setStatus("Lỗi kết nối: " + error.message);
      }
    }

    checkConnection();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Kiểm tra kết nối Supabase</h1>
      <p>{status}</p>
    </div>
  );
}

export default ConnectionTest;