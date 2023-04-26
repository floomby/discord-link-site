import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useEffect, useState } from "react";
import { colorFromFeedbackLevel, FeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/lib/notifications";

type VerifyAddressProps = {
  refetch: () => Promise<any>;
  linked: boolean;
};
const VerifyAddress: React.FC<VerifyAddressProps> = ({ refetch, linked }) => {
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
      void refetch();
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
      void handleLogin();
    }
  }, [isSuccess, hasFired]);

  return (
    <button
      className={
        "rounded px-4 py-2 font-semibold" +
        colorFromFeedbackLevel(FeedbackLevel.Success, true)
      }
      onClick={(e) => {
        void handleLogin();
      }}
    >
      {linked ? "Switch Accounts" : "Verify Address"}
    </button>
  );
};

export default VerifyAddress;
