import { NextPage } from "next";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

const Error: NextPage = () => {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div className="dark:text-grey-100 flex h-80 w-full flex-col items-center justify-center text-black">
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

export default Error;
