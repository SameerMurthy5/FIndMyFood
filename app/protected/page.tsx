import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const ProtectedPage = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    redirect("/");
  }

  return (
    <div>
      Hello {data.user.email}
      <p> here is your id: {data.user.id}</p>
    </div>
  );
};

export default ProtectedPage;
