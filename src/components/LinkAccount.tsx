import { signIn } from "next-auth/react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import ProfileDisplay, { type ProfileDisplayProps } from "./ProfileDisplay";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type LinkAccountProps = {
  id: string;
  name: string;
  iconDefinition: IconDefinition;
  linked: boolean;
  profileData: ProfileDisplayProps;
};
const LinkAccount: React.FC<LinkAccountProps> = ({
  id,
  name,
  iconDefinition,
  linked,
  profileData,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        onClick={() => void signIn(id)}
        key={name}
        className={
          "w-full rounded-lg px-2 py-2 font-semibold" +
          colorFromFeedbackLevel(FeedbackLevel.Secondary, true) +
          (linked && !profileData.revokedAt ? " opacity-80" : "")
        }
      >
        <div className="flex flex-row items-center justify-center">
          {linked ? "Change" : "Link"} {name} {profileData.revokedAt && "(Revoked)"}
          <FontAwesomeIcon icon={iconDefinition} className="ml-2 h-6" />
        </div>
      </button>
      <ProfileDisplay {...profileData} />
    </div>
  );
};

export default LinkAccount;
