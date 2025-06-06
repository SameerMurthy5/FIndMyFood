import { signOut } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const ProtectedPage = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    redirect("/"); // if there is an error, redirect to home
  }

  return (
    <div>
      Hello {data.user.email}
      <p> here is your id: {data.user.id}</p>
      <button className="btn btn-primary" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};

export default ProtectedPage;
