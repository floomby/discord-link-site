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
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        <h1 className="mb-4 text-6xl font-bold">Link Socials</h1>
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
        <div className="relative flex w-full items-center">
          <div className="mx-4 mt-2 flex-grow border-2 border-t border-black dark:border-white"></div>
          <span className="flex-shrink text-4xl font-semibold">Privacy</span>
          <div className="mx-4 mt-2 flex-grow border-2 border-t border-black dark:border-white"></div>
        </div>
        <p className="break-normal">
          All account details are kept private. Only the information about if
          the requisite accounts have been linked is available.
        </p>
        <Link
          href="https://github.com/floomby/discord-link-site"
          className="cursor-pointer rounded-md bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-800 hover:dark:bg-gray-700"
        >
          <div className="flex flex-row items-center justify-center gap-2 font-semibold">
            <FontAwesomeIcon className="h-6" icon={faGithub} />
            View on GitHub
          </div>
        </Link>
      </main>
    </>
  );
};

export default Home;
