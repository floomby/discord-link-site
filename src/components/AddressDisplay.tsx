import { AnimatePresence, motion } from "framer-motion";

type AddressDisplayProps = {
  address: string | undefined;
};
const AddressDisplay: React.FC<AddressDisplayProps> = ({ address }) => {
  return (
    <AnimatePresence>
      {address && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-row items-center justify-center gap-4 text-2xl font-semibold text-black dark:text-white"
        >{
          address.slice(0, 6) + "..." + address.slice(address.length - 4, address.length)
        }</motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressDisplay;
