import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useRouter } from "next/router";
import LinkAccounts from "~/components/LinkAccounts";
import { useEffect, useState } from "react";
import { useNotificationQueue } from "~/lib/notifications";
import VerifyAddress from "~/components/VerifyAddress";
import AddressDisplay from "~/components/AddressDisplay";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  // const router = useRouter();

  const notifications = useNotificationQueue();

  const { mutate: linkDiscord } = api.link.linkDiscord.useMutation({
    onSuccess: () => {
      void refetch();
      const id = new Date().getTime().toString();
      notifications.add(id, {
        level: FeedbackLevel.Success,
        message: "Successfully linked discord account",
        duration: 6000,
      });
    },
    onError: (error) => {
      const id = new Date().getTime().toString();
      notifications.add(id, {
        level: FeedbackLevel.Error,
        message: error.message,
        duration: 6000,
      });
    },
  });

  const [suppressedDiscordLink, setSuppressedDiscordLink] = useState(true);

  useEffect(() => {
    (async () => {
      // console.log("Session", session);
      if (!!session?.user?.email && !suppressedDiscordLink) {
        setSuppressedDiscordLink(true);
        void linkDiscord({
          csrfToken: (await getCsrfToken()) || "",
        });
      } else {
        setSuppressedDiscordLink(false);
      }
    })();
  }, [status]);

  const [csrfToken, setCsrfToken] = useState<string | undefined>();

  const { data: linkData, refetch } = api.link.linkData.useQuery(csrfToken, {
    enabled: true,
    onError: (error) => {
      const id = new Date().getTime().toString();
      notifications.add(id, {
        level: FeedbackLevel.Error,
        message: error.message,
        duration: 6000,
      });
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    (async () => {
      // Technically a race condition, but it should be fine in practice
      setCsrfToken(await getCsrfToken());
      refetch();
    })();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 py-2">
      <h1 className="mb-8 text-6xl font-bold">Link Socials</h1>
      {/* <button
        className={
          "rounded px-4 py-2 font-semibold" +
          colorFromFeedbackLevel(FeedbackLevel.Success, true)
        }
        onClick={() => void router.push("/siwe")}
      >
        Verify Address
      </button> */}
      <div className="flex flex-row items-center justify-center gap-4">
        <AddressDisplay address={linkData?.address} />
        <VerifyAddress refetch={refetch} linked={!!linkData?.linked} />
      </div>
      {/* {status === "authenticated" && (
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
      )} */}
      <LinkAccounts
        show={!!linkData?.linkable && status === "authenticated"}
        linkedProviders={linkData?.linked ?? []}
      />
    </main>
  );
};

export default Home;
