import { NextPage } from "next";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

const SignIn: NextPage = () => {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div className="flex h-80 w-full flex-col items-center justify-center gap-2 text-black dark:text-gray-100">
      <h1 className="text-2xl font-semibold text-red-600 dark:text-red-500">
        Auth Error
      </h1>
      <p className="text-lg">Error: {error as string}</p>
      <button
        className={
          "rounded-lg px-4 py-2" + colorFromFeedbackLevel(FeedbackLevel.Warning)
        }
        onClick={() => {
          void signOut({ callbackUrl: "/" });
        }}
      >
        Back
      </button>
    </div>
  );
};

export default SignIn;
