"use client";
import { signinWithGoogle } from "@/lib/actions";
import React from "react";

const AuthForm = () => {
  return (
    <div>
      <form>
        <button className="btn btn-primary" formAction={signinWithGoogle}>
          Sign in With Google
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
