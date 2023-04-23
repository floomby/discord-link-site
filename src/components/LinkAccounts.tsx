import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import LinkAccount from "./LinkAccount";

type LinkAccountsProps = {
  show: boolean;
};
const LinkAccounts: React.FC<LinkAccountsProps> = ({ show }) => {
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
          <LinkAccount id="discord" name="Discord" />
          <LinkAccount id="twitter" name="Twitter (Not Implemented)" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkAccounts;
