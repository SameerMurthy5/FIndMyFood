import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <>
      <div>Hello World</div>
      <Link className="btn btn-primary" href="/auth/login">
        Sign in
      </Link>
    </>
  );
};

export default page;
