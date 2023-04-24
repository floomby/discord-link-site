import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import LinkAccount from "./LinkAccount";

type LinkAccountsProps = {
  show: boolean;
  linkedProviders: {
    id: string;
    name: string;
    image: string;
  }[];
};
const LinkAccounts: React.FC<LinkAccountsProps> = ({
  show,
  linkedProviders,
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
            linked={linkedProviders.map((p) => p.id).includes("discord")}
            profileData={linkedProviders.find((p) => p.id === "discord") || {
              name: undefined,
              image: undefined,
            }}
          />
          <LinkAccount
            id="twitter"
            name="Twitter (TODO)"
            linked={false}
            profileData={linkedProviders.find((p) => p.id === "twitter") || {
              name: undefined,
              image: undefined,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkAccounts;
