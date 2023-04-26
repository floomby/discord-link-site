import { AnimatePresence, motion } from "framer-motion";
import LinkAccount from "./LinkAccount";
import { faDiscord, faGoogle, faTwitter } from "@fortawesome/free-brands-svg-icons";

type LinkAccountsProps = {
  show: boolean;
  linkedProviders: {
    id: string;
    name: string;
    image: string;
  }[];
  showProfiles: boolean;
};
const LinkAccounts: React.FC<LinkAccountsProps> = ({
  show,
  linkedProviders,
  showProfiles,
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
          <LinkAccount
            id="discord"
            name="Discord"
            iconDefinition={faDiscord}
            linked={linkedProviders.map((p) => p.id).includes("discord")}
            profileData={{
              ...(linkedProviders.find((p) => p.id === "discord") || {
                name: undefined,
                image: undefined,
              }),
              show: showProfiles,
            }}
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
