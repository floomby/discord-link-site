import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

export type ProfileDisplayProps = {
  name: string | undefined;
  image: string | undefined;
  revokedAt: Date | null;
  show: boolean;
};
const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
  name,
  image,
  revokedAt,
  show,
}) => {
  const shown = (name || image || revokedAt) && show;

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-row items-center justify-center gap-4 text-2xl font-semibold text-black dark:text-white"
        >
          {name && <span>{name}</span>}
          {image && (
            <div className="relative h-8 w-8 shrink-0 p-0">
              <div className="absolute left-0 top-0 h-full w-full rounded-full shadow-inner shadow-gray-600 dark:shadow-gray-800"></div>
              <Image
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-full"
                src={image}
                alt="SSO Picture"
                width={32}
                height={32}
              />
            </div>
          )}
          {revokedAt && (
            <span>(Revoked - {revokedAt.toLocaleDateString("en-US", {})})</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDisplay;
