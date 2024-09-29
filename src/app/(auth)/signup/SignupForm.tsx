"use client";

import AuthWithGitHub from "@/components/GithubAuthButton";
import AuthWithGoogle from "@/components/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { auth } from "../actions";
import { useFormStatus } from "react-dom";
import { Loader2, Mail } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";

interface StepProps {
  formData: {
    name: string;
    email: string;
  };
  setFormData: (data: any) => void;
  setCurrentStep: (step: number) => void;
}

export default function SignupForm() {
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
    <Step3
      key={3}
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
          Already have an account?{" "}
          <Link className="underline" href={"/signin"}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

const Step1: React.FC<StepProps> = ({
  formData,
  setFormData,
  setCurrentStep,
}) => {
  const nameSchema = z
    .string()
    .min(2, "Name must contain at least 2 characters");

  const nameRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);
  return (
    <>
      <h1 className="text-2xl font-bold text-center">Sign Up</h1>
      {errorMessage && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md space-y-2 text-sm">
          {errorMessage}
        </div>
      )}
      <form className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          ref={nameRef}
          value={formData.name}
          onChange={(e) => {
            setErrorMessage("");
            setFormData({ ...formData, name: e.target.value });
          }}
        />
        <Button
          disabled={!formData.name}
          onClick={() => {
            const validatedname = nameSchema.safeParse(formData.name);
            validatedname.success
              ? setCurrentStep(1)
              : setErrorMessage(validatedname.error.flatten().formErrors[0]);
          }}
          className="w-full"
        >
          Continue
        </Button>
      </form>
    </>
  );
};

const Step2: React.FC<StepProps> = ({ formData, setCurrentStep }) => {
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <h1 className="text-2xl font-bold text-center">
        Choose your
        <br /> Signup provider
      </h1>
      {error && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md space-y-2 text-sm">
          {error}
        </div>
      )}
      <AuthWithGitHub
        setError={setError}
        authIntent={"signup"}
        name={formData.name}
      />
      <AuthWithGoogle
        setError={setError}
        authIntent={"signup"}
        name={formData.name}
      />
      <Button
        variant={"link"}
        className="w-full"
        onClick={() => setCurrentStep(2)}
      >
        Continue With Email →
      </Button>
    </>
  );
};

const Step3: React.FC<StepProps> = ({
  formData,
  setFormData,
  setCurrentStep,
}) => {
  const emailRef = useRef<HTMLInputElement>(null);
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
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

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
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <p>
          If you don&apos;t have an account yet, we have sent a magic link to{" "}
          <u>{state.email}</u> use it to finish signing up.
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
      <h1 className="text-2xl font-bold text-center">Sign Up</h1>
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
          id="name"
          name="name"
          value={formData.name}
          readOnly
        />
        <input
          hidden
          type="text"
          id="authIntent"
          name="authIntent"
          value={"signup"}
          readOnly
        />
        <Input
          type="email"
          name="email"
          ref={emailRef}
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
          setCurrentStep(1);
        }}
      >
        ← Back
      </Button>
    </>
  );
};
