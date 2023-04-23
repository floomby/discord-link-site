import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useEffect, useState } from "react";
import { colorFromFeedbackLevel, FeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/lib/notifications";
import Router from "next/router";

function Siwe() {
  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { connect, isSuccess } = useConnect({
    connector: new InjectedConnector(),
  });
  const { data: session } = useSession();

  const notifications = useNotificationQueue();

  const [hasFired, setHasFired] = useState(false);

  const handleLogin = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    try {
      const callbackUrl = "/protected";
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });
      setHasFired(true);
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
      await signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });

      void Router.push("/");
    } catch (error) {
      if ((error as Error).message === "Connector not found") {
        console.warn("Suppressing missing connector");
        return;
      }

      const id = new Date().getTime().toString();
      notifications.add(id, {
        level: FeedbackLevel.Error,
        message: (error as Error).message,
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (isSuccess && !hasFired) {
      handleLogin();
    }
  }, [isSuccess, hasFired]);

  return (
    <main className="mt-20 flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
      <button
        className={
          "rounded px-4 py-2 font-bold" +
          colorFromFeedbackLevel(FeedbackLevel.Primary, true)
        }
        onClick={(e) => {
          handleLogin();
        }}
      >
        Sign In with Ethereum
      </button>
    </main>
  );
}

export default Siwe;
