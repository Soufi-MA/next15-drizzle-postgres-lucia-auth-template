"use client";

import AuthWithGitHub from "@/components/GithubAuthButton";
import AuthWithGoogle from "@/components/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect, useState } from "react";
import { auth } from "../actions";
import { useFormStatus } from "react-dom";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

interface StepProps {
  formData: {
    name: string;
    email: string;
  };
  setFormData: (data: any) => void;
  setCurrentStep: (step: number) => void;
}

export default function SigninForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const steps = [
    <Step1
      key={1}
      formData={formData}
      setFormData={setFormData}
      setCurrentStep={setCurrentStep}
    />,
    <Step2
      key={2}
      formData={formData}
      setFormData={setFormData}
      setCurrentStep={setCurrentStep}
    />,
  ];

  return (
    <div className="flex justify-center items-center min-h-[calc(100svh-4rem)]">
      <div className="flex flex-col gap-4 bg-card p-6 rounded-lg border shadow-lg w-full max-w-md">
        <div className="space-y-4">{steps[currentStep]}</div>
        <div className="w-full border-t"></div>
        <p className="text-center">
          Don&apos;t have an account?{" "}
          <Link className="underline" href={"/signup"}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

const Step1: React.FC<StepProps> = ({ setCurrentStep }) => {
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <h1 className="text-2xl font-bold text-center">
        Choose your
        <br /> Signin provider
      </h1>
      {error && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md space-y-2 text-sm">
          {error}
        </div>
      )}
      <AuthWithGitHub setError={setError} authIntent={"signin"} />
      <AuthWithGoogle setError={setError} authIntent={"signin"} />
      <Button
        variant={"link"}
        className="w-full"
        onClick={() => setCurrentStep(1)}
      >
        Continue With Email →
      </Button>
    </>
  );
};

const Step2: React.FC<StepProps> = ({
  formData,
  setFormData,
  setCurrentStep,
}) => {
  const [success, setSuccess] = useState<boolean>(false);
  const [state, formAction] = useActionState(auth, {
    message: "",
    email: "",
    errors: {
      authIntent: [],
      name: [],
      email: [],
      limited: "",
    },
  });

  useEffect(() => {
    if (state.message === "check email") {
      setSuccess(true);
    }
  }, [state.message]);

  function SubmitButton() {
    const { pending } = useFormStatus();

    return (
      <Button disabled={!formData.email} type="submit" className="w-full">
        {pending ? (
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}{" "}
        Continue with Email
      </Button>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p>
          If you have an account, we have sent a magic link to{" "}
          <u>{state.email}</u> use it to sign in.
        </p>
        <Button
          variant={"link"}
          className="w-full"
          onClick={() => {
            state.message = "";
            state.errors = {
              authIntent: [],
              email: [],
              name: [],
              limited: "",
            };
            setFormData({ ...formData, email: state.email });
            setSuccess(false);
          }}
        >
          ← Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center">Sign In</h1>
      {(state.errors?.email?.length ||
        state.errors?.name?.length ||
        state.errors?.limited) && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md space-y-2 text-sm">
          {state.errors.email && <p>{state.errors.email}</p>}
          {state.errors.name && <p>{state.errors.name}</p>}
          {state.errors.limited && <p>{state.errors.limited}</p>}
        </div>
      )}
      <form className="space-y-4" action={formAction}>
        <input
          hidden
          type="text"
          id="authIntent"
          name="authIntent"
          value={"signin"}
          readOnly
        />
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => {
            state.message = "";
            setFormData({ ...formData, email: e.target.value });
          }}
        />
        <SubmitButton />
      </form>
      <Button
        variant={"link"}
        className="w-full"
        onClick={() => {
          state.message = "";
          state.errors = {
            authIntent: [],
            email: [],
            name: [],
            limited: "",
          };
          setCurrentStep(0);
        }}
      >
        ← Back
      </Button>
    </>
  );
};
