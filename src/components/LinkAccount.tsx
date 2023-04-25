import { getCsrfToken, signIn } from "next-auth/react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import ProfileDisplay, { type ProfileDisplayProps } from "./ProfileDisplay";

type LinkAccountProps = {
  id: string;
  name: string;
  linked: boolean;
  profileData: ProfileDisplayProps;
};
const LinkAccount: React.FC<LinkAccountProps> = ({
  id,
  name,
  linked,
  profileData,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        onClick={async () => {
          void signIn(id, undefined, {
            csrfToken: (await getCsrfToken()) || "",
          });
        }}
        key={name}
        className={
          "w-full rounded-lg px-2 py-2 font-semibold" +
          colorFromFeedbackLevel(FeedbackLevel.Secondary, true) +
          (linked ? " cursor-not-allowed opacity-50" : "")
        }
      >
        Link {name}
      </button>
      <ProfileDisplay {...profileData} />
    </div>
  );
};

export default LinkAccount;
