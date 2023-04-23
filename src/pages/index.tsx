import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useRouter } from "next/router";
import LinkAccounts from "~/components/LinkAccounts";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 py-2">
      <h1 className="text-4xl font-bold">Log in with Ethereum</h1>
      <div className="flex flex-row items-center justify-center gap-4">
        <button
          className={
            "rounded px-4 py-2 font-semibold" +
            colorFromFeedbackLevel(FeedbackLevel.Success, true)
          }
          onClick={() => void router.push("/siwe")}
        >
          Sign In
        </button>
        {session && (
          <button
            className={
              "rounded px-4 py-2 font-semibold" +
              colorFromFeedbackLevel(FeedbackLevel.Primary, true)
            }
            onClick={(e) => {
              void signOut();
            }}
          >
            Sign Out
          </button>
        )}
      </div>
      <LinkAccounts />
    </main>
  );
};

export default Home;
