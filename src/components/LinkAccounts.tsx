import { AnimatePresence, motion } from "framer-motion";
import LinkAccount from "./LinkAccount";
import {
  faGithub,
  faGoogle,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import VerifyAddress from "./VerifyAddress";

type LinkAccountsProps = {
  show: boolean;
  linkedProviders: {
    id: string;
    name: string;
    image: string;
    revokedAt: Date | null;
  }[];
  showProfiles: boolean;
  refetch: () => Promise<any>;
};
const LinkAccounts: React.FC<LinkAccountsProps> = ({
  show,
  linkedProviders,
  showProfiles,
  refetch,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-row items-center justify-center gap-4"
        >
          <VerifyAddress
            refetch={refetch}
            linkedAddress={linkedProviders.find((p) => p.id === "ethereum")?.name}
          />
          <LinkAccount
            id="twitter"
            name="Twitter"
            iconDefinition={faTwitter}
            linked={linkedProviders.map((p) => p.id).includes("twitter")}
            profileData={{
              ...(linkedProviders.find((p) => p.id === "twitter") || {
                name: undefined,
                image: undefined,
                revokedAt: null,
              }),
              show: showProfiles,
            }}
          />
          <LinkAccount
            id="google"
            name="Google"
            iconDefinition={faGoogle}
            linked={linkedProviders.map((p) => p.id).includes("google")}
            profileData={{
              ...(linkedProviders.find((p) => p.id === "google") || {
                name: undefined,
                image: undefined,
                revokedAt: null,
              }),
              show: showProfiles,
            }}
          />
          <LinkAccount
            id="github"
            name="GitHub"
            iconDefinition={faGithub}
            linked={linkedProviders.map((p) => p.id).includes("github")}
            profileData={{
              ...(linkedProviders.find((p) => p.id === "github") || {
                name: undefined,
                image: undefined,
                revokedAt: null,
              }),
              show: showProfiles,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkAccounts;
