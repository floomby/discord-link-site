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
import DiscordSignIn from "~/components/DiscordSignIn";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  // const router = useRouter();

  const notifications = useNotificationQueue();

  const { mutate: link } = api.link.link.useMutation({
    onSuccess: async (provider: string) => {
      const id = new Date().getTime().toString();
      notifications.add(id, {
        level: FeedbackLevel.Success,
        message: `Successfully linked ${provider} account`,
        duration: 6000,
      });
      await refetch();
      await signOut();
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

  const [suppressedLink, setSuppressedLink] = useState(true);

  useEffect(() => {
    void (async () => {
      console.log("Session", session, suppressedLink);
      if (!!session?.user?.name && !suppressedLink) {
        setSuppressedLink(true);
        console.log("Linking");
        void link({
          csrfToken: (await getCsrfToken()) || "",
        });
      } else {
        setSuppressedLink(false);
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
    void (async () => {
      // Technically a race condition, but it should be fine in practice
      setCsrfToken(await getCsrfToken());
      void refetch();
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Link Socials</title>
        <meta name="description" content="Link Socials" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 py-2">
        <h1 className="mb-8 text-6xl font-bold">Link Socials</h1>
        <div className="flex flex-row items-center justify-center gap-4">
          <DiscordSignIn
            profileData={{
              ...(linkData?.linked?.find((p) => p.id === "discord") || {
                name: undefined,
                image: undefined,
                revokedAt: null,
              }),
              show: status === "unauthenticated" || !session?.user?.name,
            }}
            linked={!!linkData?.linked?.map((p) => p.id).includes("discord")}
          />
          {/* <AddressDisplay address={linkData?.address} />
          <VerifyAddress refetch={refetch} linked={!!linkData?.linked} /> */}
        </div>
        <LinkAccounts
          show={!!linkData?.linkable}
          linkedProviders={linkData?.linked ?? []}
          showProfiles={status === "unauthenticated" || !session?.user?.name}
          refetch={refetch}
        />
      </main>
    </>
  );
};

export default Home;
