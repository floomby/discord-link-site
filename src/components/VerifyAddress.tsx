import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useEffect, useState } from "react";
import { colorFromFeedbackLevel, FeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/lib/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import AddressDisplay from "./AddressDisplay";

type VerifyAddressProps = {
  refetch: () => Promise<any>;
  linkedAddress: string | undefined;
};
const VerifyAddress: React.FC<VerifyAddressProps> = ({
  refetch,
  linkedAddress,
}) => {
  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { connect, isSuccess } = useConnect({
    connector: new InjectedConnector(),
  });

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
        // domain: window.location.host,
        domain: "www.social-link.xyz",
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
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        className={
          "rounded px-4 py-2 font-semibold" +
          colorFromFeedbackLevel(FeedbackLevel.Secondary, true) +
          (!linkedAddress || address !== linkedAddress ? " opacity-80" : "")
        }
        onClick={(e) => {
          void handleLogin();
        }}
      >
        <div className="flex flex-row items-center justify-center">
          {!linkedAddress ? "Verify Address" : (address !== linkedAddress ? "Switch Accounts" : "Verified")}
          <FontAwesomeIcon icon={faEthereum} className="ml-2 h-6" />
        </div>
      </button>
      <AddressDisplay address={linkedAddress} />
    </div>
  );
};

export default VerifyAddress;
